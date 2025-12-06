-- ============================================
-- NightGuard - Advanced Database Schema
-- Auditoría Hotelera con Check-ins NFC
-- ============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLES
-- ============================================

-- Profiles: Sincronizado con auth.users
-- Almacena información adicional del usuario
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Locations: Puntos NFC de auditoría
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  nfc_tag_id TEXT UNIQUE NOT NULL,
  floor INTEGER,
  building TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Rounds: Rondas de auditoría (conjunto de ubicaciones)
CREATE TABLE IF NOT EXISTS rounds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location_ids UUID[] NOT NULL,
  estimated_duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Daily Assignments: Asignaciones diarias de rondas a staff
CREATE TABLE IF NOT EXISTS daily_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  round_id UUID REFERENCES rounds(id) ON DELETE CASCADE NOT NULL,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  shift TEXT CHECK (shift IN ('morning', 'afternoon', 'night')) DEFAULT 'night',
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'incomplete')) DEFAULT 'pending',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  -- Evitar asignaciones duplicadas
  UNIQUE(user_id, round_id, assigned_date, shift)
);

-- Checkins: Registros de check-in con evidencia fotográfica
CREATE TABLE IF NOT EXISTS checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE NOT NULL,
  assignment_id UUID REFERENCES daily_assignments(id) ON DELETE CASCADE NOT NULL,
  -- Foto de prueba de presencia (OBLIGATORIA)
  proof_photo_url TEXT NOT NULL,
  -- Incidencia
  has_incident BOOLEAN DEFAULT false,
  -- Foto de daño (OBLIGATORIA si hay incidencia)
  damage_photo_url TEXT,
  damage_description TEXT,
  -- Metadatos
  nfc_scan_verified BOOLEAN DEFAULT false,
  device_info JSONB,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  -- Constraint: Si hay incidencia, debe haber foto de daño
  CONSTRAINT damage_photo_required CHECK (
    (has_incident = false) OR 
    (has_incident = true AND damage_photo_url IS NOT NULL)
  ),
  -- Constraint: Si hay incidencia, debe haber descripción
  CONSTRAINT damage_description_required CHECK (
    (has_incident = false) OR 
    (has_incident = true AND damage_description IS NOT NULL AND damage_description != '')
  )
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_checkins_user_id ON checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_checkins_assignment_id ON checkins(assignment_id);
CREATE INDEX IF NOT EXISTS idx_checkins_created_at ON checkins(created_at);
CREATE INDEX IF NOT EXISTS idx_daily_assignments_user_date ON daily_assignments(user_id, assigned_date);
CREATE INDEX IF NOT EXISTS idx_daily_assignments_date ON daily_assignments(assigned_date);

-- ============================================
-- TRIGGERS
-- ============================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rounds_updated_at
  BEFORE UPDATE ON rounds
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_assignments_updated_at
  BEFORE UPDATE ON daily_assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil en nuevo usuario
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POLÍTICAS RLS: PROFILES
-- ============================================

-- Staff puede ver su propio perfil
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Staff puede actualizar su propio perfil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin puede ver todos los perfiles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- POLÍTICAS RLS: LOCATIONS
-- ============================================

-- Todos los usuarios autenticados pueden ver ubicaciones activas
CREATE POLICY "Authenticated users can view active locations"
  ON locations FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Admin puede ver todas las ubicaciones
CREATE POLICY "Admins can view all locations"
  ON locations FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Solo Admin puede crear/editar ubicaciones
CREATE POLICY "Admins can insert locations"
  ON locations FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update locations"
  ON locations FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- POLÍTICAS RLS: ROUNDS
-- ============================================

-- Usuarios autenticados pueden ver rondas activas
CREATE POLICY "Authenticated users can view active rounds"
  ON rounds FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Admin puede ver todas las rondas
CREATE POLICY "Admins can view all rounds"
  ON rounds FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Solo Admin puede gestionar rondas
CREATE POLICY "Admins can insert rounds"
  ON rounds FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

CREATE POLICY "Admins can update rounds"
  ON rounds FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- POLÍTICAS RLS: DAILY_ASSIGNMENTS
-- ============================================

-- Staff puede ver SOLO sus propias asignaciones
CREATE POLICY "Staff can view own assignments"
  ON daily_assignments FOR SELECT
  USING (auth.uid() = user_id);

-- Staff puede actualizar SOLO sus propias asignaciones (estado, started_at, etc.)
CREATE POLICY "Staff can update own assignments"
  ON daily_assignments FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin puede ver TODAS las asignaciones
CREATE POLICY "Admins can view all assignments"
  ON daily_assignments FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Solo Admin puede crear asignaciones
CREATE POLICY "Admins can insert assignments"
  ON daily_assignments FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin puede actualizar cualquier asignación
CREATE POLICY "Admins can update all assignments"
  ON daily_assignments FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- POLÍTICAS RLS: CHECKINS
-- ============================================

-- Staff puede ver SOLO sus propios check-ins
CREATE POLICY "Staff can view own checkins"
  ON checkins FOR SELECT
  USING (auth.uid() = user_id);

-- Staff puede crear check-ins SOLO para sí mismo
CREATE POLICY "Staff can insert own checkins"
  ON checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admin puede ver TODOS los check-ins
CREATE POLICY "Admins can view all checkins"
  ON checkins FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin puede crear check-ins (para correcciones manuales)
CREATE POLICY "Admins can insert checkins"
  ON checkins FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- DATOS INICIALES (SEEDS)
-- ============================================

-- Insertar algunas ubicaciones de ejemplo
INSERT INTO locations (name, description, nfc_tag_id, floor, building) VALUES
  ('Recepción Principal', 'Lobby del hotel', 'NFC-001-LOBBY', 0, 'Principal'),
  ('Pasillo Piso 1', 'Corredor principal primer piso', 'NFC-002-P1', 1, 'Principal'),
  ('Pasillo Piso 2', 'Corredor principal segundo piso', 'NFC-003-P2', 2, 'Principal'),
  ('Sala de Máquinas', 'Cuarto de equipos técnicos', 'NFC-004-MACH', -1, 'Principal'),
  ('Estacionamiento', 'Área de estacionamiento subterráneo', 'NFC-005-PARK', -1, 'Anexo'),
  ('Terraza', 'Área común de terraza', 'NFC-006-ROOF', 3, 'Principal'),
  ('Piscina', 'Área de piscina y spa', 'NFC-007-POOL', 0, 'Anexo'),
  ('Restaurante', 'Área de comedor principal', 'NFC-008-REST', 0, 'Principal')
ON CONFLICT (nfc_tag_id) DO NOTHING;

-- Insertar rondas de ejemplo
INSERT INTO rounds (name, description, location_ids, estimated_duration_minutes) 
SELECT 
  'Ronda Nocturna Completa',
  'Recorrido completo de todas las áreas durante turno nocturno',
  ARRAY(SELECT id FROM locations WHERE is_active = true ORDER BY floor, name),
  60
WHERE NOT EXISTS (SELECT 1 FROM rounds WHERE name = 'Ronda Nocturna Completa');

INSERT INTO rounds (name, description, location_ids, estimated_duration_minutes)
SELECT
  'Ronda Áreas Comunes',
  'Recorrido de áreas de acceso público',
  ARRAY(SELECT id FROM locations WHERE name IN ('Recepción Principal', 'Restaurante', 'Piscina', 'Terraza')),
  30
WHERE NOT EXISTS (SELECT 1 FROM rounds WHERE name = 'Ronda Áreas Comunes');

