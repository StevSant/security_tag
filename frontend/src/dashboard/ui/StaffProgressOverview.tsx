"use client";

import { useState, useEffect } from "react";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { UsersIcon } from "@/shared/ui/icons";
import { getNightlyStats, type NightlyStatsData } from "../infrastructure/supabase/queries";

interface StaffProgressOverviewProps {
  selectedDate?: string;
}

export function StaffProgressOverview({ selectedDate }: StaffProgressOverviewProps) {
  const [staffProgress, setStaffProgress] = useState<NightlyStatsData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      setIsLoading(true);
      const result = await getNightlyStats(selectedDate);
      
      if (result.success && result.data) {
        setStaffProgress(result.data);
      }
      
      setIsLoading(false);
    }

    loadProgress();
  }, [selectedDate]);

  const getStatusBadge = (status: string): "active" | "resolved" | "inactive" => {
    switch (status) {
      case "completed": return "resolved";
      case "in_progress": return "active";
      default: return "inactive";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "completed": return "Completado";
      case "in_progress": return "En Progreso";
      case "pending": return "Pendiente";
      default: return status;
    }
  };

  const formatTime = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="staff-progress-card">
      <style jsx>{`
        .staff-progress-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .header-icon {
          width: 24px;
          height: 24px;
          color: var(--color-primary);
        }

        .header-icon :global(svg) {
          width: 100%;
          height: 100%;
        }

        .card-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .card-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0 0 24px 0;
        }

        .staff-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .staff-item {
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 10px;
        }

        .staff-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .staff-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .staff-avatar {
          width: 36px;
          height: 36px;
          background: var(--color-primary);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 600;
        }

        .staff-details {
          display: flex;
          flex-direction: column;
        }

        .staff-name {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .staff-round {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
        }

        .staff-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: 12px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          color: var(--text-muted);
        }

        .meta-value {
          font-weight: 600;
          color: var(--text-secondary);
        }

        .incidents-badge {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .loading-state {
          display: flex;
          justify-content: center;
          padding: 40px;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="card-header">
        <div className="header-icon">
          <UsersIcon />
        </div>
        <h3 className="card-title">Progreso de Botones</h3>
      </div>
      <p className="card-subtitle">Estado de las rondas en tiempo real</p>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner" />
        </div>
      ) : staffProgress.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <p>No hay asignaciones para hoy</p>
        </div>
      ) : (
        <div className="staff-list">
          {staffProgress.map((staff) => {
            const initials = staff.staffName
              .split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);
            
            return (
              <div key={staff.staffId} className="staff-item">
                <div className="staff-header">
                  <div className="staff-info">
                    <div className="staff-avatar">{initials}</div>
                    <div className="staff-details">
                      <p className="staff-name">{staff.staffName}</p>
                      <p className="staff-round">{staff.roundName}</p>
                    </div>
                  </div>
                  <StatusBadge status={getStatusBadge(staff.assignmentStatus)} />
                </div>
                
                <ProgressBar
                  label={`${staff.completedCheckins}/${staff.totalLocations} checkpoints`}
                  value={staff.compliancePercentage}
                  color={staff.compliancePercentage === 100 ? "var(--color-success)" : "var(--color-primary)"}
                />
                
                <div className="staff-meta">
                  <div className="meta-item">
                    <span>🕐 Inicio:</span>
                    <span className="meta-value">{formatTime(staff.startedAt)}</span>
                  </div>
                  {staff.completedAt && (
                    <div className="meta-item">
                      <span>✅ Fin:</span>
                      <span className="meta-value">{formatTime(staff.completedAt)}</span>
                    </div>
                  )}
                  {staff.incidentsCount > 0 && (
                    <span className="incidents-badge">
                      ⚠️ {staff.incidentsCount} incidencia{staff.incidentsCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

