import {
  getStaffProgress,
  getStaffProgressMock,
  getNightlyStats,
  getNightlyStatsMock,
  getIncidentsSummary,
  getTodayAssignments,
  type StaffProgressData,
  type NightlyStatsData,
  type IncidentData,
} from "../infrastructure/supabase/queries";

// Usar mocks en desarrollo
const USE_MOCKS = process.env.NODE_ENV === "development" && !process.env.NEXT_PUBLIC_SUPABASE_URL;

/**
 * Caso de uso: Obtener progreso del staff actual
 */
export async function fetchStaffProgress(assignmentId: string): Promise<{
  success: boolean;
  data?: StaffProgressData;
  error?: string;
}> {
  const queryFn = USE_MOCKS ? getStaffProgressMock : getStaffProgress;
  return queryFn(assignmentId);
}

/**
 * Caso de uso: Obtener asignaciones del día
 */
export async function fetchTodayAssignments(): Promise<{
  success: boolean;
  data?: Array<{ id: string; roundName: string; status: string }>;
  error?: string;
}> {
  if (USE_MOCKS) {
    return {
      success: true,
      data: [
        { id: "mock-1", roundName: "Ronda Nocturna Completa", status: "in_progress" },
        { id: "mock-2", roundName: "Ronda Áreas Comunes", status: "pending" },
      ],
    };
  }
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
  const queryFn = USE_MOCKS ? getNightlyStatsMock : () => getNightlyStats(targetDate);
  return queryFn();
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
  if (USE_MOCKS) {
    return {
      success: true,
      data: [
        {
          incidentId: "inc-1",
          staffName: "Carlos Rodríguez",
          locationName: "Pasillo Piso 2",
          locationFloor: 2,
          damageDescription: "Lámpara fundida en el pasillo principal",
          damagePhotoUrl: "https://example.com/photo1.jpg",
          reportedAt: new Date().toISOString(),
        },
        {
          incidentId: "inc-2",
          staffName: "Juan Pérez",
          locationName: "Estacionamiento",
          locationFloor: -1,
          damageDescription: "Fuga de agua cerca de la entrada",
          damagePhotoUrl: "https://example.com/photo2.jpg",
          reportedAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
    };
  }
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

