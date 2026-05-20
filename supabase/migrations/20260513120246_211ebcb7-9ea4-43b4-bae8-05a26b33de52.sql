-- Ajouter les nouvelles colonnes au profil
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS gender text,
  ADD COLUMN IF NOT EXISTS national_id text;

-- Index unique souple sur national_id (si renseigné)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_national_id_unique
  ON public.profiles (national_id)
  WHERE national_id IS NOT NULL;

-- Mettre à jour le trigger pour stocker phone, date_of_birth, gender, national_id à l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _role app_role;
  _dob date;
BEGIN
  BEGIN
    _dob := NULLIF(NEW.raw_user_meta_data->>'date_of_birth','')::date;
  EXCEPTION WHEN others THEN
    _dob := NULL;
  END;

  INSERT INTO public.profiles (id, full_name, phone, date_of_birth, gender, national_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone',''),
    _dob,
    NULLIF(NEW.raw_user_meta_data->>'gender',''),
    NULLIF(NEW.raw_user_meta_data->>'national_id','')
  );

  _role := COALESCE((NEW.raw_user_meta_data->>'role')::app_role, 'patient');
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, _role);
  RETURN NEW;
END;
$function$;

-- S'assurer que le trigger existe sur auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();