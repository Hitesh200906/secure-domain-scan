CREATE TABLE public.credit_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description text NOT NULL,
  credits integer NOT NULL,
  balance_after integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'completed',
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;

ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own credit transactions"
ON public.credit_transactions FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own credit transactions"
ON public.credit_transactions FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE INDEX credit_transactions_user_created_idx ON public.credit_transactions (user_id, created_at DESC);

CREATE OR REPLACE FUNCTION public.purchase_credits(_credits integer)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_balance integer;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _credits IS NULL OR _credits < 1 OR _credits > 100000 THEN
    RAISE EXCEPTION 'Invalid credit amount';
  END IF;
  IF public.is_banned(v_user) THEN RAISE EXCEPTION 'Account restricted'; END IF;

  UPDATE public.profiles SET credits = credits + _credits
  WHERE id = v_user
  RETURNING credits INTO v_balance;

  INSERT INTO public.credit_transactions (user_id, description, credits, balance_after, status)
  VALUES (v_user, 'Credits Purchased', _credits, v_balance, 'completed');

  RETURN v_balance;
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_credits(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.purchase_credits(integer) TO authenticated;