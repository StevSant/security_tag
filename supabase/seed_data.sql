-- ============================================
-- NightGuard - Datos de Prueba
-- Ejecutar después de advanced_schema.sql y tasks_schema.sql
-- ============================================

-- ============================================
-- 1. UBICACIONES (Puntos NFC)
-- ============================================
INSERT INTO locations (id, name, description, nfc_tag_id, floor, building) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Recepción Principal', 'Lobby del hotel - Entrada principal', 'NFC-001-LOBBY', 0, 'Principal'),
  ('22222222-2222-2222-2222-222222222222', 'Pasillo Piso 1', 'Corredor principal primer piso', 'NFC-002-P1', 1, 'Principal'),
  ('33333333-3333-3333-3333-333333333333', 'Pasillo Piso 2', 'Corredor principal segundo piso', 'NFC-003-P2', 2, 'Principal'),
  ('44444444-4444-4444-4444-444444444444', 'Sala de Máquinas', 'Cuarto de equipos técnicos', 'NFC-004-MACH', -1, 'Principal'),
  ('55555555-5555-5555-5555-555555555555', 'Estacionamiento', 'Área de estacionamiento subterráneo', 'NFC-005-PARK', -1, 'Anexo')
ON CONFLICT (nfc_tag_id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- ============================================
-- 2. RONDAS
-- ============================================
INSERT INTO rounds (id, name, description, location_ids, estimated_duration_minutes) VALUES
  ('aaaa1111-1111-1111-1111-111111111111', 
   'Ronda Nocturna Completa', 
   'Recorrido completo de todas las áreas durante turno nocturno',
   ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, '55555555-5555-5555-5555-555555555555'::uuid],
   60),
  ('aaaa2222-2222-2222-2222-222222222222', 
   'Ronda Áreas Comunes', 
   'Recorrido rápido de áreas públicas',
   ARRAY['11111111-1111-1111-1111-111111111111'::uuid, '22222222-2222-2222-2222-222222222222'::uuid, '33333333-3333-3333-3333-333333333333'::uuid],
   30)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. PLANTILLAS DE TAREAS PREDETERMINADAS
-- ============================================
DELETE FROM task_templates;
INSERT INTO task_templates (id, name, description, instructions, category, priority, requires_photo, estimated_minutes, is_active) VALUES
  -- Tareas de Inspección
  ('tttt1111-1111-1111-1111-111111111111',
   'Verificar Cerraduras', 
   'Revisar que todas las cerraduras de puertas de emergencia funcionen',
   '1. Probar cada cerradura de emergencia\n2. Verificar que abran correctamente\n3. Si alguna falla, reportar como incidencia',
   'inspection', 4, true, 10, true),
   
  ('tttt2222-2222-2222-2222-222222222222',
   'Revisar Extintores', 
   'Verificar estado de extintores en todas las áreas',
   '1. Verificar fecha de vencimiento\n2. Revisar presión del manómetro (zona verde)\n3. Confirmar que el sello esté intacto\n4. Tomar foto de cada extintor',
   'inspection', 5, true, 15, true),
   
  ('tttt3333-3333-3333-3333-333333333333',
   'Inspección de Iluminación', 
   'Verificar funcionamiento de todas las luces',
   '1. Recorrer todas las áreas\n2. Identificar luces fundidas o con parpadeo\n3. Fotografiar cualquier falla encontrada',
   'inspection', 3, true, 10, true),

  -- Tareas de Seguridad
  ('tttt4444-4444-4444-4444-444444444444',
   'Control de Accesos', 
   'Verificar puntos de acceso y control de entradas',
   '1. Revisar bitácora de entradas\n2. Verificar credenciales del personal\n3. Asegurar que puertas estén cerradas',
   'security', 5, true, 20, true),
   
  ('tttt5555-5555-5555-5555-555555555555',
   'Ronda de Vigilancia', 
   'Recorrido de vigilancia por todas las áreas',
   '1. Caminar por todas las zonas asignadas\n2. Verificar que no haya personas no autorizadas\n3. Reportar cualquier actividad sospechosa',
   'security', 4, true, 30, true),
   
  ('tttt6666-6666-6666-6666-666666666666',
   'Verificar Cámaras', 
   'Revisar funcionamiento del sistema de CCTV',
   '1. Verificar que todas las cámaras muestren imagen\n2. Comprobar grabación activa\n3. Reportar cualquier cámara sin señal',
   'security', 4, false, 10, true),

  -- Tareas de Mantenimiento
  ('tttt7777-7777-7777-7777-777777777777',
   'Revisar Aire Acondicionado', 
   'Verificar funcionamiento de sistemas HVAC',
   '1. Comprobar temperatura en cada zona\n2. Verificar filtros\n3. Escuchar ruidos anormales',
   'maintenance', 3, true, 15, true),
   
  ('tttt8888-8888-8888-8888-888888888888',
   'Inspección de Plomería', 
   'Revisar que no haya fugas de agua',
   '1. Verificar baños públicos\n2. Revisar áreas de servicio\n3. Reportar cualquier fuga o humedad',
   'maintenance', 4, true, 20, true),

  -- Tareas de Limpieza
  ('tttt9999-9999-9999-9999-999999999999',
   'Verificar Limpieza Áreas Comunes', 
   'Revisar estado de limpieza en lobby y pasillos',
   '1. Verificar lobby principal\n2. Revisar pasillos de cada piso\n3. Reportar si necesitan atención',
   'cleaning', 2, true, 10, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- NOTA: Los usuarios de prueba se crean desde:
-- 1. /register (para botones/staff)
-- 2. /dashboard/admin/users (admin crea botones)
-- 3. Supabase Dashboard (para crear admin inicial)
--
-- Para crear un ADMIN inicial, ejecuta en Supabase:
-- 1. Crear usuario desde Authentication > Users
-- 2. Luego ejecutar:
--    UPDATE auth.users 
--    SET raw_app_meta_data = '{"role": "admin"}'
--    WHERE email = 'admin@tuhotel.com';
-- ============================================

-- ============================================
-- FUNCIÓN HELPER: Asignar tareas a un botón
-- ============================================
-- Uso: SELECT assign_all_tasks_to_user('user-uuid', '2024-01-15', 'night');

CREATE OR REPLACE FUNCTION assign_all_tasks_to_user(
  p_user_id UUID,
  p_date DATE DEFAULT CURRENT_DATE,
  p_shift TEXT DEFAULT 'night'
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_template RECORD;
BEGIN
  FOR v_template IN 
    SELECT * FROM task_templates WHERE is_active = true
  LOOP
    INSERT INTO staff_tasks (
      user_id, template_id, assigned_date, shift,
      name, description, instructions, category,
      priority, requires_photo, is_custom
    ) VALUES (
      p_user_id, v_template.id, p_date, p_shift,
      v_template.name, v_template.description, v_template.instructions,
      v_template.category, v_template.priority, v_template.requires_photo, false
    )
    ON CONFLICT DO NOTHING;
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FUNCIÓN: Crear datos de prueba completos
-- Ejecutar después de tener al menos un usuario staff
-- ============================================
-- Uso: SELECT create_demo_data();

CREATE OR REPLACE FUNCTION create_demo_data()
RETURNS TEXT AS $$
DECLARE
  v_staff_user RECORD;
  v_count INTEGER := 0;
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - 1;
BEGIN
  -- Asignar tareas a todos los usuarios staff
  FOR v_staff_user IN 
    SELECT p.id, p.full_name 
    FROM profiles p
    JOIN auth.users u ON u.id = p.id
    WHERE (u.raw_app_meta_data->>'role') IS DISTINCT FROM 'admin'
       OR (u.raw_app_meta_data->>'role') IS NULL
  LOOP
    -- Asignar tareas de hoy
    PERFORM assign_all_tasks_to_user(v_staff_user.id, v_today, 'night');
    
    -- Asignar tareas de ayer (para historial)
    PERFORM assign_all_tasks_to_user(v_staff_user.id, v_yesterday, 'night');
    
    v_count := v_count + 1;
  END LOOP;
  
  -- Simular algunas tareas completadas de ayer
  UPDATE staff_tasks 
  SET 
    status = 'completed',
    started_at = (assigned_date + TIME '22:00:00')::TIMESTAMP,
    completed_at = (assigned_date + TIME '22:30:00')::TIMESTAMP,
    completion_notes = 'Completado sin novedad'
  WHERE assigned_date = v_yesterday
    AND random() < 0.7; -- 70% completadas
  
  -- Simular algunas tareas en progreso de hoy
  UPDATE staff_tasks 
  SET 
    status = 'in_progress',
    started_at = NOW() - INTERVAL '15 minutes'
  WHERE assigned_date = v_today
    AND status = 'pending'
    AND random() < 0.2; -- 20% en progreso
  
  RETURN 'Datos de prueba creados para ' || v_count || ' usuarios';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMENTARIO: Cómo usar los datos de prueba
-- ============================================
-- 
-- PASO 1: Ejecutar este script en Supabase SQL Editor
--
-- PASO 2: Crear usuarios de prueba
--   A) Crear Admin:
--      - Ir a Authentication > Users > Add user
--      - Email: admin@hotel.com, Password: admin123
--      - Ejecutar: UPDATE auth.users SET raw_app_meta_data = '{"role": "admin"}' WHERE email = 'admin@hotel.com';
--
--   B) Crear Botones (2 opciones):
--      - Desde /register (se registran solos)
--      - Desde /dashboard/admin/users (admin los crea)
--
-- PASO 3: Generar datos de prueba
--   - Ejecutar: SELECT create_demo_data();
--
-- ============================================

