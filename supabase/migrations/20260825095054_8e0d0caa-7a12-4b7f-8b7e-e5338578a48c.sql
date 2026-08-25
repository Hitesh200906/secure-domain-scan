CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name, plan, credits, password_set)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'starter',
    1,
    COALESCE(NEW.encrypted_password, '') <> ''
  );
  RETURN NEW;
END;
$function$;

UPDATE public.profiles p
SET password_set = true
FROM auth.users u
WHERE u.id = p.id
  AND COALESCE(u.encrypted_password, '') <> ''
  AND p.password_set = false;