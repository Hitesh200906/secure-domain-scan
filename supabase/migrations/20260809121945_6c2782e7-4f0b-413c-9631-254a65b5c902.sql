CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'razorpay',
  order_id text NOT NULL UNIQUE,
  payment_id text,
  amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  credits integer NOT NULL,
  bonus_credits integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'created',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own payments"
ON public.payments FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER payments_touch BEFORE UPDATE ON public.payments
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE OR REPLACE FUNCTION public.settle_payment(_order_id text, _payment_id text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p public.payments%ROWTYPE;
  v_total integer;
  v_balance integer;
BEGIN
  SELECT * INTO p FROM public.payments WHERE order_id = _order_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Payment not found'; END IF;

  IF p.status = 'paid' THEN
    SELECT credits INTO v_balance FROM public.profiles WHERE id = p.user_id;
    RETURN v_balance;
  END IF;

  v_total := p.credits + p.bonus_credits;

  UPDATE public.profiles SET credits = credits + v_total
  WHERE id = p.user_id
  RETURNING credits INTO v_balance;

  INSERT INTO public.credit_transactions (user_id, description, credits, balance_after, status)
  VALUES (p.user_id, 'Credits Purchased', v_total, v_balance, 'completed');

  UPDATE public.payments
     SET status = 'paid', payment_id = _payment_id
   WHERE id = p.id;

  RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.settle_payment(text, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_payment(text, text) TO service_role;