"use client";

import { useEffect, useState } from "react";
import { fetchStaffProgress, fetchTodayAssignments } from "../application/get-stats.usecase";
import type { StaffProgressData } from "../infrastructure/supabase/queries";

interface StaffProgressProps {
  onSelectLocation?: (locationId: string, locationName: string) => void;
}

export function StaffProgress({ onSelectLocation }: StaffProgressProps) {
  const [assignments, setAssignments] = useState<Array<{ id: string; roundName: string; status: string }>>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const [progress, setProgress] = useState<StaffProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar asignaciones del día
  useEffect(() => {
    async function loadAssignments() {
      const result = await fetchTodayAssignments();
      if (result.success && result.data) {
        setAssignments(result.data);
        // Seleccionar la primera asignación activa
        const active = result.data.find((a) => a.status === "in_progress") || result.data[0];
        if (active) {
          setSelectedAssignment(active.id);
        }
      } else {
        setError(result.error || "Error cargando asignaciones");
      }
      setLoading(false);
    }
    loadAssignments();
  }, []);

  // Cargar progreso cuando cambia la asignación
  useEffect(() => {
    if (!selectedAssignment) return;
    
    async function loadProgress() {
      setLoading(true);
      const result = await fetchStaffProgress(selectedAssignment!);
      if (result.success && result.data) {
        setProgress(result.data);
      } else {
        setError(result.error || "Error cargando progreso");
      }
      setLoading(false);
    }
    loadProgress();
  }, [selectedAssignment]);

  const getStatusColor = (percentage: number) => {
    if (percentage >= 80) return "#10b981";
    if (percentage >= 50) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="staff-progress">
      <style jsx>{`
        .staff-progress {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          min-height: 100vh;
          padding: 20px;
          color: #f1f5f9;
        }

        .header {
          text-align: center;
          margin-bottom: 32px;
        }

        .header-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0 0 8px 0;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-subtitle {
          color: #64748b;
          font-size: 14px;
          margin: 0;
        }

        .assignment-selector {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 8px;
        }

        .assignment-tab {
          flex-shrink: 0;
          padding: 12px 20px;
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 10px;
          color: #94a3b8;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .assignment-tab:hover {
          border-color: #059669;
        }

        .assignment-tab.active {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border-color: transparent;
          color: white;
        }

        .progress-card {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .round-name {
          font-size: 18px;
          font-weight: 600;
        }

        .progress-stats {
          font-size: 28px;
          font-weight: 700;
        }

        .progress-bar-container {
          height: 12px;
          background: #0f172a;
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 12px;
        }

        .progress-bar {
          height: 100%;
          border-radius: 6px;
          transition: width 0.5s ease;
        }

        .progress-label {
          text-align: center;
          color: #64748b;
          font-size: 13px;
        }

        .locations-section {
          margin-top: 32px;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 14px;
          font-weight: 600;
          color: #94a3b8;
          margin-bottom: 16px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .locations-grid {
          display: grid;
          gap: 12px;
        }

        .location-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 10px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .location-item:hover {
          border-color: #059669;
          transform: translateX(4px);
        }

        .location-item.completed {
          border-color: #10b981;
          opacity: 0.7;
        }

        .location-item.has-incident {
          border-color: #ef4444;
        }

        .location-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .location-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #1e293b;
          border-radius: 8px;
          font-size: 20px;
        }

        .location-name {
          font-weight: 500;
          margin-bottom: 4px;
        }

        .location-floor {
          font-size: 12px;
          color: #64748b;
        }

        .location-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 20px;
        }

        .status-pending {
          background: rgba(148, 163, 184, 0.1);
          color: #94a3b8;
        }

        .status-completed {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .status-incident {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .loading-state, .error-state {
          text-align: center;
          padding: 60px 20px;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #334155;
          border-top-color: #059669;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="header">
        <h1 className="header-title">🌙 NightGuard</h1>
        <p className="header-subtitle">Tu progreso de auditoría</p>
      </div>

      {loading && !progress ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Cargando...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>⚠️ {error}</p>
        </div>
      ) : assignments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No tienes rondas asignadas para hoy</p>
        </div>
      ) : (
        <>
          {/* Selector de asignación */}
          <div className="assignment-selector">
            {assignments.map((a) => (
              <button
                key={a.id}
                className={`assignment-tab ${selectedAssignment === a.id ? "active" : ""}`}
                onClick={() => setSelectedAssignment(a.id)}
              >
                {a.roundName}
              </button>
            ))}
          </div>

          {/* Card de progreso */}
          {progress && (
            <>
              <div className="progress-card">
                <div className="progress-header">
                  <span className="round-name">{progress.roundName}</span>
                  <span
                    className="progress-stats"
                    style={{ color: getStatusColor(progress.progressPercentage) }}
                  >
                    {progress.completedCheckins}/{progress.totalLocations}
                  </span>
                </div>
                <div className="progress-bar-container">
                  <div
                    className="progress-bar"
                    style={{
                      width: `${progress.progressPercentage}%`,
                      background: `linear-gradient(90deg, ${getStatusColor(progress.progressPercentage)} 0%, ${getStatusColor(progress.progressPercentage)}88 100%)`,
                    }}
                  />
                </div>
                <p className="progress-label">
                  {progress.progressPercentage}% completado
                </p>
              </div>

              {/* Ubicaciones pendientes */}
              {progress.locationsPending.length > 0 && (
                <div className="locations-section">
                  <h3 className="section-title">
                    <span>📍</span>
                    <span>Pendientes ({progress.locationsPending.length})</span>
                  </h3>
                  <div className="locations-grid">
                    {progress.locationsPending.map((loc) => (
                      <div
                        key={loc.id}
                        className="location-item"
                        onClick={() => onSelectLocation?.(loc.id, loc.name)}
                      >
                        <div className="location-info">
                          <div className="location-icon">🏨</div>
                          <div>
                            <div className="location-name">{loc.name}</div>
                            <div className="location-floor">
                              {loc.floor !== null ? `Piso ${loc.floor}` : "Sin piso"}
                            </div>
                          </div>
                        </div>
                        <div className="location-status status-pending">
                          <span>⏳</span>
                          <span>Pendiente</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ubicaciones completadas */}
              {progress.locationsCompleted.length > 0 && (
                <div className="locations-section">
                  <h3 className="section-title">
                    <span>✅</span>
                    <span>Completados ({progress.locationsCompleted.length})</span>
                  </h3>
                  <div className="locations-grid">
                    {progress.locationsCompleted.map((loc) => (
                      <div
                        key={loc.id}
                        className={`location-item completed ${loc.hasIncident ? "has-incident" : ""}`}
                      >
                        <div className="location-info">
                          <div className="location-icon">
                            {loc.hasIncident ? "⚠️" : "✅"}
                          </div>
                          <div>
                            <div className="location-name">{loc.name}</div>
                            <div className="location-floor">
                              {loc.floor !== null ? `Piso ${loc.floor}` : "Sin piso"}
                            </div>
                          </div>
                        </div>
                        <div
                          className={`location-status ${loc.hasIncident ? "status-incident" : "status-completed"}`}
                        >
                          <span>{loc.hasIncident ? "🚨" : "✓"}</span>
                          <span>{loc.hasIncident ? "Incidencia" : "Listo"}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

