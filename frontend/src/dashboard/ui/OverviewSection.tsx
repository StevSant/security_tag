"use client";

import { useState, useEffect } from "react";
import { MetricCard } from "@/shared/ui/MetricCard";
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  UsersIcon,
  ClockIcon,
  ActivityIcon,
} from "@/shared/ui/icons";
import { getNightlyStats, getIncidentsSummary, type NightlyStatsData } from "../infrastructure/supabase/queries";

interface HotelMetrics {
  activeStaff: number;
  completedRounds: number;
  pendingCheckpoints: number;
  incidents: number;
  averageCompliance: number;
  totalAssignments: number;
}

interface OverviewSectionProps {
  selectedDate?: string;
}

export function OverviewSection({ selectedDate }: OverviewSectionProps) {
  const [metrics, setMetrics] = useState<HotelMetrics | null>(null);
  const [staffProgress, setStaffProgress] = useState<NightlyStatsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);

      const [statsResult, incidentsResult] = await Promise.all([
        getNightlyStats(selectedDate),
        getIncidentsSummary(selectedDate, selectedDate),
      ]);

      if (statsResult.success && statsResult.data) {
        const stats = statsResult.data;
        setStaffProgress(stats);

        // Calcular métricas agregadas
        const activeStaff = stats.filter(s => s.assignmentStatus === "in_progress").length;
        const completedRounds = stats.filter(s => s.assignmentStatus === "completed").length;
        const totalCheckpoints = stats.reduce((sum, s) => sum + s.totalLocations, 0);
        const completedCheckpoints = stats.reduce((sum, s) => sum + s.completedCheckins, 0);
        const pendingCheckpoints = totalCheckpoints - completedCheckpoints;
        const averageCompliance = stats.length > 0
          ? Math.round(stats.reduce((sum, s) => sum + s.compliancePercentage, 0) / stats.length)
          : 0;

        setMetrics({
          activeStaff,
          completedRounds,
          pendingCheckpoints,
          incidents: incidentsResult.success ? incidentsResult.data?.length || 0 : 0,
          averageCompliance,
          totalAssignments: stats.length,
        });
      }

      setIsLoading(false);
    }

    loadMetrics();
  }, [selectedDate]);

  if (isLoading) {
    return (
      <div className="overview-section">
        <style jsx>{`
          .overview-section {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          .loading-card {
            background: var(--bg-card);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 24px;
            height: 120px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-spinner {
            width: 24px;
            height: 24px;
            border: 2px solid var(--border-color);
            border-top-color: var(--color-primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (max-width: 1200px) {
            .overview-section {
              grid-template-columns: repeat(2, 1fr);
            }
          }
          @media (max-width: 768px) {
            .overview-section {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="loading-card">
            <div className="loading-spinner" />
          </div>
        ))}
      </div>
    );
  }

  const data = metrics || {
    activeStaff: 0,
    completedRounds: 0,
    pendingCheckpoints: 0,
    incidents: 0,
    averageCompliance: 0,
    totalAssignments: 0,
  };

  return (
    <div className="overview-section">
      <style jsx>{`
        .overview-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .overview-section {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .overview-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <MetricCard
        title="Cumplimiento Promedio"
        value={`${data.averageCompliance}%`}
        subtitle="Rondas de hoy"
        icon={<ShieldCheckIcon />}
        iconColor="var(--color-primary)"
      />

      <MetricCard
        title="Botones Activos"
        value={data.activeStaff}
        subtitle="En ronda actualmente"
        icon={<ActivityIcon />}
        iconColor="var(--color-warning)"
      />

      <MetricCard
        title="Rondas Completadas"
        value={data.completedRounds}
        subtitle={`de ${data.totalAssignments} asignadas`}
        icon={<CheckCircleIcon />}
        iconColor="var(--color-success)"
      />

      <MetricCard
        title="Incidencias"
        value={data.incidents}
        subtitle="Reportadas hoy"
        icon={<AlertTriangleIcon />}
        iconColor="var(--color-danger)"
      />

      <MetricCard
        title="Checkpoints Pendientes"
        value={data.pendingCheckpoints}
        subtitle="Por completar"
        icon={<ClockIcon />}
        iconColor="var(--text-muted)"
      />

      <MetricCard
        title="Total Asignaciones"
        value={data.totalAssignments}
        subtitle="Rutinas de hoy"
        icon={<UsersIcon />}
        iconColor="var(--color-info)"
      />
    </div>
  );
}
