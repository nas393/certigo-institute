-- Payments backbone: server-side prices, orders, entitlements, promo codes, exam access.
-- Live payment processing is NOT active: payments_mode starts as 'test' (staging only).
-- In 'test' mode an order can be confirmed by its owner without a provider (for testing).
-- Before launch an admin must switch payments_mode to 'live' (provider webhooks only) or 'off'.

CREATE TABLE IF NOT EXISTS public.pricing_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id),
  single_cents integer NOT NULL DEFAULT 5000 CHECK (single_cents >= 0),
  pass_cents integer NOT NULL DEFAULT 10000 CHECK (pass_cents >= 0),
  pass_days integer NOT NULL DEFAULT 30 CHECK (pass_days BETWEEN 1 AND 366),
  currency text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD', 'EUR')),
  payments_mode text NOT NULL DEFAULT 'test' CHECK (payments_mode IN ('off', 'test', 'live')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.pricing_settings (id) VALUES (true) ON CONFLICT DO NOTHING;
ALTER TABLE public.pricing_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.pricing_settings FROM anon, authenticated;
GRANT SELECT ON public.pricing_settings TO anon, authenticated;
GRANT UPDATE (single_cents, pass_cents, pass_days, currency, payments_mode, updated_at) ON public.pricing_settings TO authenticated;
CREATE POLICY "pricing read" ON public.pricing_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "pricing admin update" ON public.pricing_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- Promo codes can target single certificates, the monthly pass, or both.
ALTER TABLE public.discount_codes ADD COLUMN IF NOT EXISTS applies_to text NOT NULL DEFAULT 'any'
  CHECK (applies_to IN ('any', 'single', 'pass'));

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('single', 'pass')),
  certification_id uuid REFERENCES public.certifications(id) ON DELETE SET NULL,
  list_cents integer NOT NULL,
  discount_code_id uuid REFERENCES public.discount_codes(id) ON DELETE SET NULL,
  discount_cents integer NOT NULL DEFAULT 0,
  total_cents integer NOT NULL,
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled')),
  provider text,
  provider_ref text,
  created_at timestamptz NOT NULL DEFAULT now(),
  paid_at timestamptz,
  CHECK (kind = 'pass' OR certification_id IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS orders_provider_ref_uq ON public.orders (provider, provider_ref) WHERE provider_ref IS NOT NULL;
CREATE INDEX IF NOT EXISTS orders_user_idx ON public.orders (user_id, created_at DESC);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.orders FROM anon, authenticated;
GRANT SELECT ON public.orders TO authenticated;
CREATE POLICY "orders own or admin read" ON public.orders FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TABLE IF NOT EXISTS public.entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('single', 'pass')),
  certification_id uuid REFERENCES public.certifications(id) ON DELETE CASCADE,
  valid_from timestamptz NOT NULL DEFAULT now(),
  valid_until timestamptz,             -- pass only; single stays valid until the course is passed
  order_id uuid UNIQUE REFERENCES public.orders(id) ON DELETE SET NULL,  -- one entitlement per order
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS entitlements_user_idx ON public.entitlements (user_id, kind);
ALTER TABLE public.entitlements ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.entitlements FROM anon, authenticated;
GRANT SELECT ON public.entitlements TO authenticated;
CREATE POLICY "entitlements own or admin read" ON public.entitlements FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

-- Provider webhook events, stored once each (duplicate deliveries are ignored).
CREATE TABLE IF NOT EXISTS public.payment_events (
  provider text NOT NULL,
  event_id text NOT NULL,
  order_id uuid,
  payload jsonb,
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, event_id)
);
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.payment_events FROM anon, authenticated;

-- Does this user have paid access to this course's exam right now?
CREATE OR REPLACE FUNCTION public.exam_access(_uid uuid, _cert uuid)
RETURNS jsonb LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE
    WHEN public.has_role(_uid, 'admin'::public.app_role) THEN jsonb_build_object('access', true, 'via', 'admin')
    WHEN EXISTS (SELECT 1 FROM entitlements WHERE user_id = _uid AND kind = 'pass' AND valid_until > now())
      THEN jsonb_build_object('access', true, 'via', 'pass',
        'until', (SELECT max(valid_until) FROM entitlements WHERE user_id = _uid AND kind = 'pass'))
    WHEN EXISTS (SELECT 1 FROM entitlements WHERE user_id = _uid AND kind = 'single' AND certification_id = _cert)
      THEN jsonb_build_object('access', true, 'via', 'single')
    ELSE jsonb_build_object('access', false) END
$$;

-- Prices and access for the course page / pricing page.
CREATE OR REPLACE FUNCTION public.checkout_info(_certification_id uuid DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE s pricing_settings%ROWTYPE; _uid uuid := auth.uid(); _single integer;
BEGIN
  SELECT * INTO s FROM pricing_settings LIMIT 1;
  SELECT price_cents INTO _single FROM certifications WHERE id = _certification_id;
  RETURN jsonb_build_object(
    'currency', s.currency, 'single_cents', coalesce(_single, s.single_cents), 'pass_cents', s.pass_cents,
    'pass_days', s.pass_days, 'mode', s.payments_mode,
    'access', CASE WHEN _uid IS NULL THEN jsonb_build_object('access', false)
                   ELSE public.exam_access(_uid, _certification_id) END);
END $$;

-- Grants the entitlement for a paid order. Idempotent; never callable by clients directly.
CREATE OR REPLACE FUNCTION public.fulfil_order(_order_id uuid, _provider text, _provider_ref text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE o orders%ROWTYPE; s pricing_settings%ROWTYPE; _start timestamptz;
BEGIN
  SELECT * INTO o FROM orders WHERE id = _order_id FOR UPDATE;
  IF o.id IS NULL THEN RAISE EXCEPTION 'Order not found'; END IF;
  IF o.status = 'paid' THEN RETURN; END IF;
  IF o.status <> 'pending' THEN RAISE EXCEPTION 'Order is %', o.status; END IF;
  UPDATE orders SET status = 'paid', paid_at = now(), provider = _provider, provider_ref = _provider_ref WHERE id = o.id;
  IF o.discount_code_id IS NOT NULL THEN
    INSERT INTO discount_redemptions (code_id, user_id) VALUES (o.discount_code_id, o.user_id) ON CONFLICT DO NOTHING;
    UPDATE discount_codes SET redemptions = redemptions + 1 WHERE id = o.discount_code_id;
  END IF;
  IF o.kind = 'single' THEN
    INSERT INTO entitlements (user_id, kind, certification_id, order_id) VALUES (o.user_id, 'single', o.certification_id, o.id)
      ON CONFLICT (order_id) DO NOTHING;
  ELSE
    SELECT * INTO s FROM pricing_settings LIMIT 1;
    SELECT greatest(now(), coalesce(max(valid_until), now())) INTO _start FROM entitlements WHERE user_id = o.user_id AND kind = 'pass';
    INSERT INTO entitlements (user_id, kind, valid_from, valid_until, order_id)
      VALUES (o.user_id, 'pass', _start, _start + make_interval(days => s.pass_days), o.id)
      ON CONFLICT (order_id) DO NOTHING;
  END IF;
END $$;

-- Creates an order at the server-side price, applying a promo code. A 100% code completes it immediately.
CREATE OR REPLACE FUNCTION public.create_order(_kind text, _certification_id uuid, _code text DEFAULT NULL)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid(); s pricing_settings%ROWTYPE; c certifications%ROWTYPE; d discount_codes%ROWTYPE;
        _list integer; _disc integer := 0; _total integer; _id uuid; _acc jsonb;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Sign in to continue'; END IF;
  IF _kind NOT IN ('single', 'pass') THEN RAISE EXCEPTION 'Unknown purchase type'; END IF;
  SELECT * INTO s FROM pricing_settings LIMIT 1;
  IF s.payments_mode = 'off' THEN RAISE EXCEPTION 'Purchases are not open yet'; END IF;
  IF (SELECT count(*) FROM orders WHERE user_id = _uid AND created_at > now() - interval '10 minutes') >= 10 THEN
    RAISE EXCEPTION 'Too many attempts. Try again in a few minutes.';
  END IF;

  IF _kind = 'single' THEN
    SELECT * INTO c FROM certifications WHERE id = _certification_id AND published;
    IF c.id IS NULL THEN RAISE EXCEPTION 'Course not found'; END IF;
    _acc := public.exam_access(_uid, c.id);
    IF (_acc->>'access')::boolean THEN RAISE EXCEPTION 'You already have access to this exam'; END IF;
    IF EXISTS (SELECT 1 FROM certificates WHERE user_id = _uid AND certification_id = c.id AND NOT revoked) THEN
      RAISE EXCEPTION 'You already hold this certificate';
    END IF;
    _list := coalesce(c.price_cents, s.single_cents);
  ELSE
    _certification_id := NULL;
    _list := s.pass_cents;
  END IF;

  IF nullif(trim(coalesce(_code, '')), '') IS NOT NULL THEN
    IF (SELECT count(*) FROM discount_checks WHERE user_id = _uid AND created_at > now() - interval '10 minutes') >= 10 THEN
      RAISE EXCEPTION 'Too many code attempts. Try again in a few minutes.';
    END IF;
    INSERT INTO discount_checks (user_id) VALUES (_uid);
    SELECT * INTO d FROM discount_codes WHERE code = upper(trim(_code)) LIMIT 1;
    IF d.id IS NULL OR NOT d.active THEN RAISE EXCEPTION 'That code is not valid'; END IF;
    IF d.expires_at IS NOT NULL AND d.expires_at < now() THEN RAISE EXCEPTION 'That code has expired'; END IF;
    IF d.max_redemptions IS NOT NULL AND d.redemptions >= d.max_redemptions THEN RAISE EXCEPTION 'That code has been fully used'; END IF;
    IF d.applies_to <> 'any' AND d.applies_to <> _kind THEN RAISE EXCEPTION 'That code does not apply to this purchase'; END IF;
    IF d.certification_id IS NOT NULL AND d.certification_id IS DISTINCT FROM _certification_id THEN
      RAISE EXCEPTION 'That code does not apply to this course';
    END IF;
    IF EXISTS (SELECT 1 FROM discount_redemptions WHERE code_id = d.id AND user_id = _uid) THEN
      RAISE EXCEPTION 'You have already used this code';
    END IF;
    _disc := least(_list, round(_list * d.percent_off / 100.0)::int);
  END IF;
  _total := _list - _disc;

  INSERT INTO orders (user_id, kind, certification_id, list_cents, discount_code_id, discount_cents, total_cents, currency)
    VALUES (_uid, _kind, _certification_id, _list, d.id, _disc, _total, s.currency) RETURNING id INTO _id;
  IF _total = 0 THEN PERFORM public.fulfil_order(_id, 'promo', NULL); END IF;
  RETURN jsonb_build_object('order_id', _id, 'list_cents', _list, 'discount_cents', _disc, 'total_cents', _total,
    'currency', s.currency, 'status', CASE WHEN _total = 0 THEN 'paid' ELSE 'pending' END, 'mode', s.payments_mode);
END $$;

-- STAGING ONLY: lets the order owner complete a pending order while payments_mode = 'test'.
CREATE OR REPLACE FUNCTION public.test_pay_order(_order_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _uid uuid := auth.uid();
BEGIN
  IF (SELECT payments_mode FROM pricing_settings LIMIT 1) <> 'test' THEN
    RAISE EXCEPTION 'Test payments are disabled';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM orders WHERE id = _order_id AND user_id = _uid AND status = 'pending') THEN
    RAISE EXCEPTION 'Order not found';
  END IF;
  PERFORM public.fulfil_order(_order_id, 'test', 'test-' || _order_id::text);
  RETURN jsonb_build_object('status', 'paid');
END $$;

-- The exam now requires paid access (certificate holders still see their certificate).
CREATE OR REPLACE FUNCTION public.start_exam(_certification_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid(); _cert public.certifications%ROWTYPE; _st jsonb;
  _s public.exam_sessions%ROWTYPE; _n int; _order int[]; _opts jsonb := '[]'::jsonb;
  _qi int; _len int; _items jsonb := '[]'::jsonb; _k int; _perm jsonb; _o jsonb; _draw int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT * INTO _cert FROM public.certifications WHERE id = _certification_id;
  IF _cert.id IS NULL OR NOT (_cert.published OR public.has_role(_uid, 'admin'::public.app_role)
      OR EXISTS (SELECT 1 FROM public.enrollments WHERE user_id = _uid AND certification_id = _cert.id)) THEN
    RAISE EXCEPTION 'Certification not found';
  END IF;
  _st := public.exam_status(_certification_id);
  IF (_st->>'certified')::boolean THEN
    RETURN jsonb_build_object('status', 'certified', 'serial', _st->>'serial');
  END IF;
  IF NOT (public.exam_access(_uid, _cert.id)->>'access')::boolean THEN
    RETURN jsonb_build_object('status', 'payment_required');
  END IF;
  IF _st->>'next_allowed_at' IS NOT NULL THEN
    RETURN jsonb_build_object('status', 'wait', 'next_allowed_at', _st->>'next_allowed_at', 'attempts', _st->'attempts');
  END IF;

  SELECT * INTO _s FROM public.exam_sessions
   WHERE user_id = _uid AND certification_id = _cert.id AND submitted_at IS NULL AND expires_at > now()
   ORDER BY created_at DESC LIMIT 1;
  IF _s.id IS NULL THEN
    _n := coalesce(jsonb_array_length(_cert.questions), 0);
    IF _n = 0 THEN RAISE EXCEPTION 'Certification has no exam questions'; END IF;
    -- Draw question_count questions at random from the pool (all of them if the pool is smaller).
    _draw := least(_n, greatest(1, coalesce(_cert.question_count, _n)));
    SELECT array_agg(i) INTO _order FROM (SELECT i FROM generate_series(0, _n - 1) i ORDER BY random() LIMIT _draw) x;
    FOREACH _qi IN ARRAY _order LOOP
      _len := coalesce(jsonb_array_length(_cert.questions->_qi->'options'), 0);
      SELECT coalesce(jsonb_agg(j ORDER BY random()), '[]'::jsonb) INTO _perm FROM generate_series(0, _len - 1) j;
      _opts := _opts || jsonb_build_array(_perm);
    END LOOP;
    INSERT INTO public.exam_sessions (user_id, certification_id, q_order, opt_orders)
      VALUES (_uid, _cert.id, _order, _opts) RETURNING * INTO _s;
  END IF;

  FOR _k IN 1 .. array_length(_s.q_order, 1) LOOP
    _qi := _s.q_order[_k];
    SELECT coalesce(jsonb_agg(jsonb_build_object('j', (p.v)::int, 'text', _cert.questions->_qi->'options'->((p.v)::int)) ORDER BY p.ord), '[]'::jsonb)
      INTO _o FROM jsonb_array_elements_text(_s.opt_orders->(_k - 1)) WITH ORDINALITY AS p(v, ord);
    _items := _items || jsonb_build_array(jsonb_build_object('i', _qi, 'q', _cert.questions->_qi->'q', 'options', _o));
  END LOOP;
  RETURN jsonb_build_object('status', 'ok', 'session_id', _s.id, 'expires_at', _s.expires_at, 'items', _items);
END $$;

REVOKE EXECUTE ON FUNCTION public.exam_access(uuid, uuid), public.fulfil_order(uuid, text, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.create_order(text, uuid, text), public.test_pay_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_order(text, uuid, text), public.test_pay_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.checkout_info(uuid) TO anon, authenticated;
