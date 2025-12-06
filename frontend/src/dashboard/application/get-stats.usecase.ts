import {
  getStaffProgress,
  getNightlyStats,
  getIncidentsSummary,
  getTodayAssignments,
  type StaffProgressData,
  type NightlyStatsData,
  type IncidentData,
} from "../infrastructure/supabase/queries";

/**
 * Caso de uso: Obtener progreso del staff actual
 */
export async function fetchStaffProgress(assignmentId: string): Promise<{
  success: boolean;
  data?: StaffProgressData;
  error?: string;
}> {
  return getStaffProgress(assignmentId);
}

/**
 * Caso de uso: Obtener asignaciones del día
 */
export async function fetchTodayAssignments(): Promise<{
  success: boolean;
  data?: Array<{ id: string; roundName: string; status: string }>;
  error?: string;
}> {
  return getTodayAssignments();
}

/**
 * Caso de uso: [ADMIN] Obtener estadísticas nocturnas
 */
export async function fetchNightlyStats(targetDate?: string): Promise<{
  success: boolean;
  data?: NightlyStatsData[];
  error?: string;
}> {
  return getNightlyStats(targetDate);
}

/**
 * Caso de uso: [ADMIN] Obtener resumen de incidencias
 */
export async function fetchIncidentsSummary(
  startDate?: string,
  endDate?: string
): Promise<{
  success: boolean;
  data?: IncidentData[];
  error?: string;
}> {
  return getIncidentsSummary(startDate, endDate);
}

/**
 * Calcula estadísticas agregadas del dashboard
 */
export function calculateDashboardSummary(stats: NightlyStatsData[]) {
  if (stats.length === 0) {
    return {
      totalStaff: 0,
      avgCompliance: 0,
      totalIncidents: 0,
      completedAssignments: 0,
      inProgressAssignments: 0,
    };
  }

  const totalStaff = stats.length;
  const avgCompliance = stats.reduce((sum, s) => sum + s.compliancePercentage, 0) / totalStaff;
  const totalIncidents = stats.reduce((sum, s) => sum + s.incidentsCount, 0);
  const completedAssignments = stats.filter((s) => s.assignmentStatus === "completed").length;
  const inProgressAssignments = stats.filter((s) => s.assignmentStatus === "in_progress").length;

  return {
    totalStaff,
    avgCompliance: Math.round(avgCompliance * 10) / 10,
    totalIncidents,
    completedAssignments,
    inProgressAssignments,
  };
}
