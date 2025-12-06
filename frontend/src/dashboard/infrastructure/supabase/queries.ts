import { createClient } from "@/shared/infrastructure/supabase/client";

// Tipos para las respuestas
export interface StaffProgressData {
  assignmentId: string;
  roundName: string;
  totalLocations: number;
  completedCheckins: number;
  progressPercentage: number;
  locationsPending: LocationInfo[];
  locationsCompleted: CompletedLocationInfo[];
}

export interface LocationInfo {
  id: string;
  name: string;
  floor: number | null;
}

export interface CompletedLocationInfo extends LocationInfo {
  checkedAt: string;
  hasIncident: boolean;
}

export interface NightlyStatsData {
  staffId: string;
  staffName: string;
  roundName: string;
  totalLocations: number;
  completedCheckins: number;
  compliancePercentage: number;
  incidentsCount: number;
  assignmentStatus: string;
  startedAt: string | null;
  completedAt: string | null;
}

export interface IncidentData {
  incidentId: string;
  staffName: string;
  locationName: string;
  locationFloor: number;
  damageDescription: string;
  damagePhotoUrl: string;
  reportedAt: string;
}

interface QueryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Obtiene el progreso del staff para una asignación específica
 */
export async function getStaffProgress(
  assignmentId: string
): Promise<QueryResult<StaffProgressData>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc("get_staff_progress", {
      assignment_uuid: assignmentId,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data || data.length === 0) {
      return { success: false, error: "Asignación no encontrada" };
    }

    const row = data[0];
    return {
      success: true,
      data: {
        assignmentId: row.assignment_id,
        roundName: row.round_name,
        totalLocations: row.total_locations,
        completedCheckins: Number(row.completed_checkins),
        progressPercentage: Number(row.progress_percentage),
        locationsPending: row.locations_pending || [],
        locationsCompleted: row.locations_completed || [],
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Obtiene las asignaciones del día actual para el usuario
 */
export async function getTodayAssignments(): Promise<
  QueryResult<Array<{ id: string; roundName: string; status: string }>>
> {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_assignments")
      .select(`
        id,
        status,
        rounds (name)
      `)
      .eq("assigned_date", today);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map((item) => {
        const rounds = item.rounds as { name: string } | { name: string }[] | null;
        const roundName = Array.isArray(rounds) 
          ? rounds[0]?.name 
          : rounds?.name;
        return {
          id: item.id,
          roundName: roundName || "Ronda",
          status: item.status,
        };
      }),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * [ADMIN] Obtiene estadísticas nocturnas para todos los staff
 */
export async function getNightlyStats(
  targetDate?: string
): Promise<QueryResult<NightlyStatsData[]>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc("get_nightly_stats", {
      target_date: targetDate || new Date().toISOString().split("T")[0],
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map((row: Record<string, unknown>) => ({
        staffId: row.staff_id as string,
        staffName: row.staff_name as string,
        roundName: row.round_name as string,
        totalLocations: row.total_locations as number,
        completedCheckins: Number(row.completed_checkins),
        compliancePercentage: Number(row.compliance_percentage),
        incidentsCount: Number(row.incidents_count),
        assignmentStatus: row.assignment_status as string,
        startedAt: row.started_at as string | null,
        completedAt: row.completed_at as string | null,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * [ADMIN] Obtiene resumen de incidencias recientes
 */
export async function getIncidentsSummary(
  startDate?: string,
  endDate?: string
): Promise<QueryResult<IncidentData[]>> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase.rpc("get_incidents_summary", {
      start_date: startDate,
      end_date: endDate,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map((row: Record<string, unknown>) => ({
        incidentId: row.incident_id as string,
        staffName: row.staff_name as string,
        locationName: row.location_name as string,
        locationFloor: row.location_floor as number,
        damageDescription: row.damage_description as string,
        damagePhotoUrl: row.damage_photo_url as string,
        reportedAt: row.reported_at as string,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * [ADMIN] Obtiene lista de usuarios staff
 */
export async function getStaffUsers(): Promise<
  QueryResult<Array<{ id: string; fullName: string; email: string; createdAt: string }>>
> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map((item) => ({
        id: item.id,
        fullName: item.full_name,
        email: "", // Email no está en profiles por privacidad
        createdAt: item.created_at,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
