-- ============================================
-- NightGuard - RPC Functions
-- Funciones para Dashboard Admin
-- ============================================

-- ============================================
-- FUNCIÓN: get_nightly_stats
-- Retorna estadísticas de cumplimiento por noche
-- Solo ejecutable por administradores
-- ============================================

CREATE OR REPLACE FUNCTION get_nightly_stats(target_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE (
  staff_id UUID,
  staff_name TEXT,
  round_name TEXT,
  total_locations INTEGER,
  completed_checkins BIGINT,
  compliance_percentage NUMERIC,
  incidents_count BIGINT,
  assignment_status TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario es admin
  IF (auth.jwt() -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access this function';
  END IF;
  
  RETURN QUERY
  SELECT 
    da.user_id AS staff_id,
    p.full_name AS staff_name,
    r.name AS round_name,
    COALESCE(ARRAY_LENGTH(r.location_ids, 1), 0) AS total_locations,
    COUNT(c.id) AS completed_checkins,
    CASE 
      WHEN ARRAY_LENGTH(r.location_ids, 1) IS NULL OR ARRAY_LENGTH(r.location_ids, 1) = 0 
      THEN 0
      ELSE ROUND((COUNT(c.id)::NUMERIC / ARRAY_LENGTH(r.location_ids, 1)) * 100, 1)
    END AS compliance_percentage,
    COUNT(c.id) FILTER (WHERE c.has_incident = true) AS incidents_count,
    da.status AS assignment_status,
    da.started_at,
    da.completed_at
  FROM daily_assignments da
  INNER JOIN profiles p ON da.user_id = p.id
  INNER JOIN rounds r ON da.round_id = r.id
  LEFT JOIN checkins c ON c.assignment_id = da.id
  WHERE da.assigned_date = target_date
  GROUP BY 
    da.user_id, 
    p.full_name, 
    r.name, 
    r.location_ids, 
    da.status,
    da.started_at,
    da.completed_at
  ORDER BY compliance_percentage DESC, p.full_name;
END;
$$;

-- Comentario descriptivo
COMMENT ON FUNCTION get_nightly_stats IS 
'Retorna estadísticas de cumplimiento de rondas para una fecha específica. Solo accesible por administradores.';

-- ============================================
-- FUNCIÓN: get_staff_progress
-- Retorna el progreso del staff actual en su ronda
-- Ejecutable por cualquier usuario autenticado
-- ============================================

CREATE OR REPLACE FUNCTION get_staff_progress(assignment_uuid UUID)
RETURNS TABLE (
  assignment_id UUID,
  round_name TEXT,
  total_locations INTEGER,
  completed_checkins BIGINT,
  progress_percentage NUMERIC,
  locations_pending JSONB,
  locations_completed JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_round_location_ids UUID[];
BEGIN
  -- Obtener el user_id actual
  v_user_id := auth.uid();
  
  -- Verificar que la asignación pertenece al usuario o es admin
  IF NOT EXISTS (
    SELECT 1 FROM daily_assignments 
    WHERE id = assignment_uuid 
    AND (user_id = v_user_id OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Cannot access this assignment';
  END IF;
  
  RETURN QUERY
  WITH assignment_data AS (
    SELECT 
      da.id,
      r.name,
      r.location_ids
    FROM daily_assignments da
    INNER JOIN rounds r ON da.round_id = r.id
    WHERE da.id = assignment_uuid
  ),
  completed_locations AS (
    SELECT c.location_id
    FROM checkins c
    WHERE c.assignment_id = assignment_uuid
  )
  SELECT 
    ad.id AS assignment_id,
    ad.name AS round_name,
    COALESCE(ARRAY_LENGTH(ad.location_ids, 1), 0) AS total_locations,
    (SELECT COUNT(*) FROM completed_locations) AS completed_checkins,
    CASE 
      WHEN ARRAY_LENGTH(ad.location_ids, 1) IS NULL OR ARRAY_LENGTH(ad.location_ids, 1) = 0 
      THEN 0
      ELSE ROUND(((SELECT COUNT(*) FROM completed_locations)::NUMERIC / ARRAY_LENGTH(ad.location_ids, 1)) * 100, 1)
    END AS progress_percentage,
    -- Ubicaciones pendientes
    (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', l.id,
        'name', l.name,
        'floor', l.floor
      )), '[]'::jsonb)
      FROM locations l
      WHERE l.id = ANY(ad.location_ids)
      AND l.id NOT IN (SELECT location_id FROM completed_locations)
    ) AS locations_pending,
    -- Ubicaciones completadas
    (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id', l.id,
        'name', l.name,
        'floor', l.floor,
        'checked_at', c.created_at,
        'has_incident', c.has_incident
      )), '[]'::jsonb)
      FROM locations l
      INNER JOIN checkins c ON c.location_id = l.id AND c.assignment_id = assignment_uuid
      WHERE l.id = ANY(ad.location_ids)
    ) AS locations_completed
  FROM assignment_data ad;
END;
$$;

COMMENT ON FUNCTION get_staff_progress IS 
'Retorna el progreso detallado de una asignación específica. Accesible por el staff asignado o admins.';

-- ============================================
-- FUNCIÓN: get_incidents_summary
-- Retorna resumen de incidencias para un período
-- Solo ejecutable por administradores
-- ============================================

CREATE OR REPLACE FUNCTION get_incidents_summary(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  incident_id UUID,
  staff_name TEXT,
  location_name TEXT,
  location_floor INTEGER,
  damage_description TEXT,
  damage_photo_url TEXT,
  reported_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar que el usuario es admin
  IF (auth.jwt() -> 'app_metadata' ->> 'role') IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can access this function';
  END IF;
  
  RETURN QUERY
  SELECT 
    c.id AS incident_id,
    p.full_name AS staff_name,
    l.name AS location_name,
    l.floor AS location_floor,
    c.damage_description,
    c.damage_photo_url,
    c.created_at AS reported_at
  FROM checkins c
  INNER JOIN profiles p ON c.user_id = p.id
  INNER JOIN locations l ON c.location_id = l.id
  WHERE c.has_incident = true
  AND c.created_at::DATE BETWEEN start_date AND end_date
  ORDER BY c.created_at DESC;
END;
$$;

COMMENT ON FUNCTION get_incidents_summary IS 
'Retorna resumen de incidencias reportadas en un período. Solo accesible por administradores.';

