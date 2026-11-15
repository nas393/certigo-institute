-- Test payments are for the owner's own QA only.
-- Before: any signed-in user could mark their own pending order paid while payments_mode = 'test'
-- (free certificates). After: only admins can. Learners get the same "not allowed" error.
CREATE OR REPLACE FUNCTION public.test_pay_order(_order_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF _uid IS NULL OR NOT public.has_role(_uid, 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Test payments are restricted to admins';
  END IF;
  IF (SELECT payments_mode FROM pricing_settings LIMIT 1) <> 'test' THEN
    RAISE EXCEPTION 'Test payments are disabled';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = _order_id AND user_id = _uid AND status = 'pending') THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  PERFORM public.fulfil_order(_order_id, 'test', 'test-' || _order_id::text);
  RETURN jsonb_build_object('status', 'paid');
END $function$;
