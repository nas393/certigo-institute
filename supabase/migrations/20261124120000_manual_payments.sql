-- Manual payments: buyers pay by bank transfer or Multicaixa reference, and an admin confirms each order with the
-- payment reference from the statement. Additive only: nothing is removed, and no payment provider is connected.

-- Instructions shown to buyers at checkout (bank account or Multicaixa reference details). Empty until the owner writes them.
ALTER TABLE public.pricing_settings ADD COLUMN IF NOT EXISTS payment_instructions text NOT NULL DEFAULT ''
  CHECK (char_length(payment_instructions) <= 1000);
GRANT UPDATE (payment_instructions) ON public.pricing_settings TO authenticated;

-- checkout_info: same as before, plus the instructions.
CREATE OR REPLACE FUNCTION public.checkout_info(_certification_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE s pricing_settings%ROWTYPE; _uid uuid := auth.uid(); _single integer;
BEGIN
  SELECT * INTO s FROM pricing_settings LIMIT 1;
  SELECT price_cents INTO _single FROM certifications WHERE id = _certification_id;
  RETURN jsonb_build_object(
    'currency', s.currency, 'single_cents', coalesce(_single, s.single_cents), 'pass_cents', s.pass_cents,
    'pass_days', s.pass_days, 'mode', s.payments_mode, 'instructions', s.payment_instructions,
    'access', CASE WHEN _uid IS NULL THEN jsonb_build_object('access', false)
                   ELSE public.exam_access(_uid, _certification_id) END);
END $$;

-- An admin confirms a manual payment. The reference must be new, so one bank payment cannot pay two orders.
CREATE OR REPLACE FUNCTION public.admin_confirm_order(_order_id uuid, _reference text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); _ref text := btrim(coalesce(_reference, ''));
BEGIN
  IF _uid IS NULL OR NOT public.has_role(_uid, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Only admins can confirm payments';
  END IF;
  IF char_length(_ref) < 3 THEN
    RAISE EXCEPTION 'Enter the payment reference from the bank or Multicaixa statement';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = _order_id AND status = 'pending') THEN
    RAISE EXCEPTION 'Order not found or already decided';
  END IF;
  IF EXISTS (SELECT 1 FROM orders WHERE provider = 'manual' AND provider_ref = _ref) THEN
    RAISE EXCEPTION 'That reference is already used for another order';
  END IF;
  PERFORM public.fulfil_order(_order_id, 'manual', _ref);
  RETURN jsonb_build_object('status', 'paid');
END $$;
REVOKE EXECUTE ON FUNCTION public.admin_confirm_order(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_confirm_order(uuid, text) TO authenticated;
