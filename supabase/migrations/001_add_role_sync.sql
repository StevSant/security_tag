-- ============================================
-- Migración: Sincronizar rol de usuario a app_metadata
-- Fecha: 2024-12-06
-- ============================================

-- 1. Agregar columna role a profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff'));

-- 2. Agregar columna employee_id a profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS employee_id TEXT;

-- Índice para buscar por employee_id
CREATE INDEX IF NOT EXISTS idx_profiles_employee_id ON profiles(employee_id);

-- 3. Actualizar la función handle_new_user para:
--    - Guardar el rol en profiles
--    - Sincronizar el rol a app_metadata (para políticas RLS)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Obtener el rol del user_metadata, default 'staff'
  user_role := COALESCE(NEW.raw_user_meta_data->>'role', 'staff');

  -- Validar que el rol sea válido
  IF user_role NOT IN ('admin', 'staff') THEN
    user_role := 'staff';
  END IF;

  -- Crear perfil con el rol
  INSERT INTO public.profiles (id, full_name, role, employee_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    user_role,
    NEW.raw_user_meta_data->>'employee_id'
  );

  -- Sincronizar rol a app_metadata para que las políticas RLS funcionen
  UPDATE auth.users
  SET raw_app_meta_data =
    COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('role', user_role)
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Si el trigger existe, eliminarlo y recrearlo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 5. Migrar usuarios existentes que no tienen rol en app_metadata
-- Esto sincroniza el rol desde user_metadata a app_metadata
DO $$
DECLARE
  user_record RECORD;
  user_role TEXT;
BEGIN
  FOR user_record IN
    SELECT id, raw_user_meta_data, raw_app_meta_data
    FROM auth.users
    WHERE raw_app_meta_data->>'role' IS NULL
  LOOP
    -- Obtener rol desde user_metadata o default 'staff'
    user_role := COALESCE(user_record.raw_user_meta_data->>'role', 'staff');

    -- Actualizar app_metadata
    UPDATE auth.users
    SET raw_app_meta_data =
      COALESCE(user_record.raw_app_meta_data, '{}'::jsonb) ||
      jsonb_build_object('role', user_role)
    WHERE id = user_record.id;

    -- También actualizar la tabla profiles
    UPDATE public.profiles
    SET role = user_role
    WHERE id = user_record.id;
  END LOOP;
END;
$$;

-- Comentario: Las políticas RLS existentes ya usan app_metadata->>'role'
-- Ahora que sincronizamos correctamente, funcionarán bien.

