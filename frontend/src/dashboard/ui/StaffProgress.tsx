"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/shared/ui/DashboardLayout";
import { MetricCard } from "@/shared/ui/MetricCard";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  CheckCircleIcon,
  ClockIcon,
  ActivityIcon,
  LockIcon,
} from "@/shared/ui/icons";
import {
  getTodayAssignments,
  getStaffProgress,
  type StaffProgressData,
} from "../infrastructure/supabase/queries";

interface StaffProgressProps {
  onSelectLocation?: (locationId: string, locationName: string, assignmentId: string) => void;
}

interface Checkpoint {
  id: string;
  name: string;
  floor: number | null;
  status: "completed" | "pending" | "in_progress" | "locked";
  time?: string;
  hasIncident?: boolean;
}

interface Assignment {
  id: string;
  roundName: string;
  status: string;
}

export function StaffProgress({ onSelectLocation }: StaffProgressProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [progressData, setProgressData] = useState<StaffProgressData | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar asignaciones del día
  useEffect(() => {
    async function loadAssignments() {
      setIsLoading(true);
      const result = await getTodayAssignments();

      if (result.success && result.data) {
        setAssignments(result.data);
        // Seleccionar la primera asignación por defecto
        if (result.data.length > 0) {
          setSelectedAssignment(result.data[0].id);
        }
      } else {
        setError(result.error || "Error cargando asignaciones");
      }
      setIsLoading(false);
    }

    loadAssignments();
  }, []);

  // Cargar progreso cuando se selecciona una asignación
  useEffect(() => {
    async function loadProgress() {
      if (!selectedAssignment) return;

      const result = await getStaffProgress(selectedAssignment);

      if (result.success && result.data) {
        setProgressData(result.data);

        // Construir lista de checkpoints con estado
        const completedIds = new Set(
          result.data.locationsCompleted.map(loc => loc.id)
        );

        const allCheckpoints: Checkpoint[] = [];

        // Primero agregar los completados (en orden de completado)
        result.data.locationsCompleted.forEach(loc => {
          allCheckpoints.push({
            id: loc.id,
            name: loc.name,
            floor: loc.floor,
            status: "completed",
            time: new Date(loc.checkedAt).toLocaleTimeString('es-ES', {
              hour: '2-digit',
              minute: '2-digit'
            }),
            hasIncident: loc.hasIncident,
          });
        });

        // Luego agregar los pendientes
        let nextPendingFound = false;
        result.data.locationsPending.forEach(loc => {
          if (!completedIds.has(loc.id)) {
            let status: Checkpoint["status"] = "locked";

            // El primer pendiente es "in_progress" (siguiente a completar)
            if (!nextPendingFound) {
              status = "in_progress";
              nextPendingFound = true;
            }

            allCheckpoints.push({
              id: loc.id,
              name: loc.name,
              floor: loc.floor,
              status,
            });
          }
        });

        setCheckpoints(allCheckpoints);
      } else {
        setError(result.error || "Error cargando progreso");
      }
    }

    loadProgress();
  }, [selectedAssignment]);

  const completedCount = checkpoints.filter(c => c.status === "completed").length;
  const totalCount = checkpoints.length;
  const progressPercentage = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  const getStatusConfig = (status: Checkpoint["status"]) => {
    switch (status) {
      case "completed":
        return { badge: "resolved" as const, icon: <CheckCircleIcon />, color: "var(--color-success)" };
      case "in_progress":
        return { badge: "active" as const, icon: <ActivityIcon />, color: "var(--color-warning)" };
      case "pending":
        return { badge: "inactive" as const, icon: <ClockIcon />, color: "var(--text-muted)" };
      case "locked":
        return { badge: "inactive" as const, icon: <LockIcon />, color: "var(--text-muted)" };
    }
  };

  const getFloorText = (floor: number | null) => {
    if (floor === null) return "";
    if (floor === 0) return "Planta Baja";
    if (floor < 0) return `Sótano ${Math.abs(floor)}`;
    return `Piso ${floor}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Mis Checkpoints" subtitle="Cargando...">
        <div style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "300px"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "3px solid var(--border-color)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Mis Checkpoints" subtitle="Error">
        <div style={{
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "12px",
          padding: "24px",
          textAlign: "center",
          color: "var(--color-danger)",
        }}>
          {error}
        </div>
      </DashboardLayout>
    );
  }

  if (assignments.length === 0) {
    return (
      <DashboardLayout title="Mis Checkpoints" subtitle="Sin asignaciones">
        <div style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "60px 24px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: "48px", marginBottom: "16px" }}>📋</div>
          <h3 style={{
            color: "var(--text-primary)",
            margin: "0 0 8px 0",
            fontSize: "18px",
          }}>
            No hay rutinas asignadas
          </h3>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>
            No tienes rutinas asignadas para hoy. Contacta al administrador.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Mis Checkpoints"
      subtitle={progressData?.roundName || "Ronda de Supervisión"}
    >
      <style jsx>{`
        .staff-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .assignment-selector {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
        }

        .selector-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .selector-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .selector-btn {
          padding: 10px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .selector-btn:hover {
          background: var(--bg-hover);
        }

        .selector-btn.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .progress-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .progress-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .progress-stats {
          font-size: 14px;
          color: var(--text-muted);
        }

        .checkpoints-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 20px 0;
        }

        .checkpoints-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .checkpoint-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
          border: 2px solid transparent;
        }

        .checkpoint-item.next {
          border-color: var(--color-primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .checkpoint-item.locked {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .checkpoint-item.completed {
          opacity: 0.8;
        }

        .checkpoint-item:not(.locked):not(.completed):hover {
          background: var(--bg-hover);
          transform: translateX(4px);
        }

        .checkpoint-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .checkpoint-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border-radius: 50%;
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .checkpoint-number.next {
          background: var(--color-primary);
          color: white;
        }

        .checkpoint-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border-radius: 10px;
        }

        .checkpoint-icon :global(svg) {
          width: 20px;
          height: 20px;
        }

        .checkpoint-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .checkpoint-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
        }

        .checkpoint-floor {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .checkpoint-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .checkpoint-time {
          font-size: 12px;
          color: var(--text-muted);
        }

        .incident-badge {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
        }

        .next-badge {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-primary);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="staff-content">
        {/* Selector de rutina si hay múltiples */}
        {assignments.length > 1 && (
          <div className="assignment-selector">
            <div className="selector-label">Seleccionar Rutina</div>
            <div className="selector-buttons">
              {assignments.map((assignment) => (
                <button
                  key={assignment.id}
                  className={`selector-btn ${selectedAssignment === assignment.id ? 'active' : ''}`}
                  onClick={() => setSelectedAssignment(assignment.id)}
                >
                  {assignment.roundName}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Métricas */}
        <div className="metrics-grid">
          <MetricCard
            title="Completados"
            value={completedCount}
            subtitle={`de ${totalCount} checkpoints`}
            icon={<CheckCircleIcon />}
            iconColor="var(--color-success)"
          />
          <MetricCard
            title="Siguiente"
            value={checkpoints.filter(c => c.status === "in_progress").length}
            subtitle="Por completar"
            icon={<ActivityIcon />}
            iconColor="var(--color-warning)"
          />
          <MetricCard
            title="Pendientes"
            value={checkpoints.filter(c => c.status === "locked" || c.status === "pending").length}
            subtitle="En espera"
            icon={<ClockIcon />}
            iconColor="var(--text-muted)"
          />
        </div>

        {/* Barra de progreso */}
        <div className="progress-card">
          <div className="progress-header">
            <h3 className="progress-title">Progreso de la Ronda</h3>
            <span className="progress-stats">
              {completedCount}/{totalCount} checkpoints
            </span>
          </div>
          <ProgressBar
            label="Completado"
            value={progressPercentage}
            color="var(--color-primary)"
          />
        </div>

        {/* Lista de checkpoints */}
        <div className="checkpoints-section">
          <h3 className="section-title">Checkpoints de Hoy</h3>
          <div className="checkpoints-list">
            {checkpoints.map((checkpoint, index) => {
              const config = getStatusConfig(checkpoint.status);
              const isNext = checkpoint.status === "in_progress";
              const isLocked = checkpoint.status === "locked";
              const isCompleted = checkpoint.status === "completed";

              return (
                <div
                  key={checkpoint.id}
                  className={`checkpoint-item ${isNext ? 'next' : ''} ${isLocked ? 'locked' : ''} ${isCompleted ? 'completed' : ''}`}
                  onClick={() => {
                    if (isNext && selectedAssignment) {
                      onSelectLocation?.(checkpoint.id, checkpoint.name, selectedAssignment);
                    }
                  }}
                >
                  <div className="checkpoint-info">
                    <div className={`checkpoint-number ${isNext ? 'next' : ''}`}>
                      {index + 1}
                    </div>
                    <div className="checkpoint-icon" style={{ color: config.color }}>
                      {config.icon}
                    </div>
                    <div className="checkpoint-details">
                      <p className="checkpoint-name">{checkpoint.name}</p>
                      <p className="checkpoint-floor">{getFloorText(checkpoint.floor)}</p>
                    </div>
                  </div>
                  <div className="checkpoint-meta">
                    {checkpoint.time && (
                      <span className="checkpoint-time">{checkpoint.time}</span>
                    )}
                    {checkpoint.hasIncident && (
                      <span className="incident-badge">⚠️ Incidencia</span>
                    )}
                    {isNext && <span className="next-badge">Siguiente</span>}
                    {!isNext && <StatusBadge status={config.badge} />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
