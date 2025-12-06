-- ============================================
-- NightGuard - Sistema de Tareas
-- Tareas Predeterminadas y Personalizadas
-- ============================================

-- ============================================
-- TABLAS DE TAREAS
-- ============================================

-- Task Templates: Plantillas de tareas predeterminadas
-- Son las tareas base que el admin puede asignar
CREATE TABLE IF NOT EXISTS task_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT CHECK (category IN ('inspection', 'security', 'maintenance', 'cleaning', 'emergency')) DEFAULT 'inspection',
  -- Instrucciones para el botón
  instructions TEXT,
  -- Si requiere foto obligatoria
  requires_photo BOOLEAN DEFAULT true,
  -- Duración estimada en minutos
  estimated_minutes INTEGER DEFAULT 5,
  -- Prioridad (1 = baja, 5 = urgente)
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  -- Si está activa para ser asignada
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Staff Tasks: Tareas asignadas a cada botón
-- Pueden ser predeterminadas (de template) o personalizadas
CREATE TABLE IF NOT EXISTS staff_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- A quién se asigna
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  -- Si viene de una plantilla predeterminada (opcional)
  template_id UUID REFERENCES task_templates(id) ON DELETE SET NULL,
  -- Fecha de asignación
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Turno
  shift TEXT CHECK (shift IN ('morning', 'afternoon', 'night')) DEFAULT 'night',
  -- Datos de la tarea (pueden sobrescribir el template)
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  category TEXT CHECK (category IN ('inspection', 'security', 'maintenance', 'cleaning', 'emergency')) DEFAULT 'inspection',
  priority INTEGER DEFAULT 3 CHECK (priority >= 1 AND priority <= 5),
  requires_photo BOOLEAN DEFAULT true,
  -- Si es tarea personalizada (no viene de template)
  is_custom BOOLEAN DEFAULT false,
  -- Ubicación específica (opcional)
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  -- Estado de la tarea
  status TEXT CHECK (status IN ('pending', 'in_progress', 'completed', 'skipped', 'blocked')) DEFAULT 'pending',
  -- Timestamps de ejecución
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  -- Notas del botón al completar
  completion_notes TEXT,
  -- Foto de evidencia (si la tomó)
  evidence_photo_url TEXT,
  -- Asignado por (admin)
  assigned_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  -- Evitar tareas duplicadas del mismo template en el mismo día
  UNIQUE NULLS NOT DISTINCT (user_id, template_id, assigned_date, shift)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_task_templates_category ON task_templates(category);
CREATE INDEX IF NOT EXISTS idx_task_templates_active ON task_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_user_date ON staff_tasks(user_id, assigned_date);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_status ON staff_tasks(status);
CREATE INDEX IF NOT EXISTS idx_staff_tasks_assigned_date ON staff_tasks(assigned_date);

-- Trigger updated_at
CREATE TRIGGER update_task_templates_updated_at
  BEFORE UPDATE ON task_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_tasks_updated_at
  BEFORE UPDATE ON staff_tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS POLICIES: TASK_TEMPLATES
-- ============================================

ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;

-- Todos los autenticados pueden ver templates activos
CREATE POLICY "Authenticated can view active templates"
  ON task_templates FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- Admin puede ver todos los templates
CREATE POLICY "Admins can view all templates"
  ON task_templates FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Solo Admin puede crear templates
CREATE POLICY "Admins can insert templates"
  ON task_templates FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Solo Admin puede actualizar templates
CREATE POLICY "Admins can update templates"
  ON task_templates FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Solo Admin puede eliminar templates
CREATE POLICY "Admins can delete templates"
  ON task_templates FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- RLS POLICIES: STAFF_TASKS
-- ============================================

ALTER TABLE staff_tasks ENABLE ROW LEVEL SECURITY;

-- Staff puede ver SOLO sus propias tareas
CREATE POLICY "Staff can view own tasks"
  ON staff_tasks FOR SELECT
  USING (auth.uid() = user_id);

-- Staff puede actualizar SOLO sus propias tareas (estado, notas, foto)
CREATE POLICY "Staff can update own tasks"
  ON staff_tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Admin puede ver TODAS las tareas
CREATE POLICY "Admins can view all tasks"
  ON staff_tasks FOR SELECT
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Solo Admin puede crear tareas (asignar)
CREATE POLICY "Admins can insert tasks"
  ON staff_tasks FOR INSERT
  WITH CHECK ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin puede actualizar cualquier tarea
CREATE POLICY "Admins can update all tasks"
  ON staff_tasks FOR UPDATE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- Admin puede eliminar tareas
CREATE POLICY "Admins can delete tasks"
  ON staff_tasks FOR DELETE
  USING ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ============================================
-- FUNCIONES ÚTILES
-- ============================================

-- Función para asignar tareas predeterminadas a un botón
CREATE OR REPLACE FUNCTION assign_default_tasks(
  p_user_id UUID,
  p_assigned_date DATE DEFAULT CURRENT_DATE,
  p_shift TEXT DEFAULT 'night'
)
RETURNS SETOF staff_tasks AS $$
BEGIN
  -- Insertar todas las tareas de templates activos
  RETURN QUERY
  INSERT INTO staff_tasks (
    user_id, template_id, assigned_date, shift,
    name, description, instructions, category,
    priority, requires_photo, is_custom, assigned_by
  )
  SELECT 
    p_user_id,
    t.id,
    p_assigned_date,
    p_shift,
    t.name,
    t.description,
    t.instructions,
    t.category,
    t.priority,
    t.requires_photo,
    false,
    auth.uid()
  FROM task_templates t
  WHERE t.is_active = true
  ON CONFLICT (user_id, template_id, assigned_date, shift) DO NOTHING
  RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener resumen de tareas del día
CREATE OR REPLACE FUNCTION get_daily_task_summary(
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  total_tasks BIGINT,
  completed_tasks BIGINT,
  pending_tasks BIGINT,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.user_id,
    p.full_name as user_name,
    COUNT(*) as total_tasks,
    COUNT(*) FILTER (WHERE st.status = 'completed') as completed_tasks,
    COUNT(*) FILTER (WHERE st.status IN ('pending', 'in_progress')) as pending_tasks,
    ROUND(
      (COUNT(*) FILTER (WHERE st.status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) as completion_rate
  FROM staff_tasks st
  JOIN profiles p ON p.id = st.user_id
  WHERE st.assigned_date = p_date
  GROUP BY st.user_id, p.full_name
  ORDER BY completion_rate DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- DATOS INICIALES: TAREAS PREDETERMINADAS
-- ============================================

INSERT INTO task_templates (name, description, instructions, category, priority, requires_photo, estimated_minutes) VALUES
  -- Inspección
  ('Verificar Cerraduras', 'Revisar que todas las cerraduras de puertas de emergencia estén funcionando', 
   'Probar cada cerradura. Si alguna falla, reportar como incidencia.', 'inspection', 4, true, 10),
  
  ('Revisar Extintores', 'Verificar estado de extintores en el área asignada',
   'Verificar fecha de vencimiento, presión del manómetro y que el sello esté intacto.', 'inspection', 5, true, 15),
  
  ('Inspección de Iluminación', 'Verificar que toda la iluminación funcione correctamente',
   'Reportar cualquier luz fundida o con parpadeo. Fotografiar el área.', 'inspection', 3, true, 10),

  -- Seguridad
  ('Control de Accesos', 'Verificar puntos de acceso y control de entradas',
   'Revisar bitácora, verificar credenciales y asegurar puertas.', 'security', 5, true, 20),
  
  ('Ronda de Vigilancia', 'Realizar recorrido de vigilancia por todas las áreas',
   'Caminar por todas las zonas, verificar que no haya personas no autorizadas.', 'security', 4, true, 30),
  
  ('Verificar Cámaras', 'Revisar que el sistema de cámaras esté funcionando',
   'Verificar que todas las cámaras muestren imagen. Reportar cualquier falla.', 'security', 4, false, 10),

  -- Mantenimiento
  ('Revisar Aire Acondicionado', 'Verificar funcionamiento de sistemas HVAC',
   'Comprobar temperatura, verificar filtros y ruidos anormales.', 'maintenance', 3, true, 15),
  
  ('Inspección de Plomería', 'Revisar que no haya fugas o problemas de agua',
   'Verificar baños, cocinas y áreas de servicio. Reportar cualquier fuga.', 'maintenance', 4, true, 20),

  -- Limpieza
  ('Verificar Áreas Comunes', 'Revisar estado de limpieza de áreas públicas',
   'Verificar lobby, pasillos y áreas de descanso. Reportar si necesitan atención.', 'cleaning', 2, true, 10),

  -- Emergencia (no asignada por defecto, pero disponible)
  ('Respuesta a Alarma', 'Protocolo de respuesta ante activación de alarma',
   'Verificar origen de la alarma, evaluar situación y reportar hallazgos.', 'emergency', 5, true, 15)
ON CONFLICT DO NOTHING;

