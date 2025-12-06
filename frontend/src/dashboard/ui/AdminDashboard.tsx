"use client";

import { useEffect, useState } from "react";
import {
  fetchNightlyStats,
  fetchIncidentsSummary,
  calculateDashboardSummary,
} from "../application/get-stats.usecase";
import type { NightlyStatsData, IncidentData } from "../infrastructure/supabase/queries";

export function AdminDashboard() {
  const [stats, setStats] = useState<NightlyStatsData[]>([]);
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      
      const [statsResult, incidentsResult] = await Promise.all([
        fetchNightlyStats(selectedDate),
        fetchIncidentsSummary(),
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      } else {
        setError(statsResult.error || "Error cargando estadísticas");
      }

      if (incidentsResult.success && incidentsResult.data) {
        setIncidents(incidentsResult.data);
      }

      setLoading(false);
    }
    loadData();
  }, [selectedDate]);

  const summary = calculateDashboardSummary(stats);

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return "#10b981";
    if (percentage >= 70) return "#f59e0b";
    return "#ef4444";
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      completed: { bg: "rgba(16, 185, 129, 0.15)", text: "#10b981", label: "Completado" },
      in_progress: { bg: "rgba(59, 130, 246, 0.15)", text: "#3b82f6", label: "En Progreso" },
      pending: { bg: "rgba(148, 163, 184, 0.15)", text: "#94a3b8", label: "Pendiente" },
      incomplete: { bg: "rgba(239, 68, 68, 0.15)", text: "#ef4444", label: "Incompleto" },
    };
    return badges[status] || badges.pending;
  };

  return (
    <div className="admin-dashboard">
      <style jsx>{`
        .admin-dashboard {
          font-family: 'JetBrains Mono', 'Fira Code', monospace;
          background: linear-gradient(180deg, #0a0a0f 0%, #12121a 100%);
          min-height: 100vh;
          padding: 24px;
          color: #f1f5f9;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .header-left h1 {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 4px 0;
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .header-left p {
          color: #64748b;
          margin: 0;
          font-size: 14px;
        }

        .date-picker {
          padding: 10px 16px;
          background: #1e1e2e;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #f1f5f9;
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
        }

        .date-picker:focus {
          outline: none;
          border-color: #8b5cf6;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 32px;
        }

        .summary-card {
          background: linear-gradient(135deg, #1e1e2e 0%, #252536 100%);
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
        }

        .summary-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .summary-value {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .summary-label {
          font-size: 12px;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .section {
          margin-bottom: 32px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }

        .section-badge {
          background: rgba(139, 92, 246, 0.15);
          color: #a855f7;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 500;
        }

        .leaderboard {
          background: #1e1e2e;
          border: 1px solid #334155;
          border-radius: 12px;
          overflow: hidden;
        }

        .leaderboard-header {
          display: grid;
          grid-template-columns: 60px 1fr 120px 100px 100px 120px;
          padding: 14px 20px;
          background: #252536;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .leaderboard-row {
          display: grid;
          grid-template-columns: 60px 1fr 120px 100px 100px 120px;
          padding: 16px 20px;
          border-bottom: 1px solid #334155;
          align-items: center;
          transition: background 0.2s;
        }

        .leaderboard-row:last-child {
          border-bottom: none;
        }

        .leaderboard-row:hover {
          background: rgba(139, 92, 246, 0.05);
        }

        .rank {
          font-size: 20px;
          font-weight: 700;
        }

        .rank-1 { color: #fbbf24; }
        .rank-2 { color: #94a3b8; }
        .rank-3 { color: #cd7c32; }

        .staff-name {
          font-weight: 500;
        }

        .round-name {
          font-size: 13px;
          color: #64748b;
        }

        .compliance-bar {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .compliance-track {
          flex: 1;
          height: 8px;
          background: #0f172a;
          border-radius: 4px;
          overflow: hidden;
        }

        .compliance-fill {
          height: 100%;
          border-radius: 4px;
        }

        .compliance-value {
          font-size: 13px;
          font-weight: 600;
          min-width: 45px;
          text-align: right;
        }

        .incidents-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 13px;
        }

        .incidents-zero {
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
        }

        .incidents-some {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 16px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .incidents-list {
          display: grid;
          gap: 12px;
        }

        .incident-card {
          background: linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(239, 68, 68, 0.02) 100%);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 16px;
        }

        .incident-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .incident-location {
          font-weight: 600;
          margin-bottom: 4px;
        }

        .incident-meta {
          font-size: 12px;
          color: #64748b;
        }

        .incident-time {
          font-size: 12px;
          color: #94a3b8;
        }

        .incident-description {
          font-size: 14px;
          color: #cbd5e1;
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 8px;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 80px 20px;
        }

        .loading-spinner {
          width: 48px;
          height: 48px;
          border: 3px solid #334155;
          border-top-color: #8b5cf6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        @media (max-width: 900px) {
          .leaderboard-header,
          .leaderboard-row {
            grid-template-columns: 50px 1fr 80px 80px;
          }
          
          .leaderboard-header > *:nth-child(3),
          .leaderboard-row > *:nth-child(3),
          .leaderboard-header > *:nth-child(6),
          .leaderboard-row > *:nth-child(6) {
            display: none;
          }
        }
      `}</style>

      <div className="header">
        <div className="header-left">
          <h1>👁️ Panel de Control</h1>
          <p>Monitoreo de auditorías nocturnas</p>
        </div>
        <input
          type="date"
          className="date-picker"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loading-spinner" />
          <p>Cargando estadísticas...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <p>⚠️ {error}</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="summary-grid">
            <div className="summary-card">
              <div className="summary-icon">👥</div>
              <div className="summary-value">{summary.totalStaff}</div>
              <div className="summary-label">Staff Activo</div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">📊</div>
              <div className="summary-value" style={{ color: getComplianceColor(summary.avgCompliance) }}>
                {summary.avgCompliance}%
              </div>
              <div className="summary-label">Cumplimiento Prom.</div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">✅</div>
              <div className="summary-value" style={{ color: "#10b981" }}>
                {summary.completedAssignments}
              </div>
              <div className="summary-label">Completados</div>
            </div>
            <div className="summary-card">
              <div className="summary-icon">🚨</div>
              <div className="summary-value" style={{ color: summary.totalIncidents > 0 ? "#ef4444" : "#10b981" }}>
                {summary.totalIncidents}
              </div>
              <div className="summary-label">Incidencias</div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">🏆 Clasificación del Turno</h2>
              <span className="section-badge">{stats.length} registros</span>
            </div>
            
            {stats.length === 0 ? (
              <div className="empty-state">
                <p>No hay datos para esta fecha</p>
              </div>
            ) : (
              <div className="leaderboard">
                <div className="leaderboard-header">
                  <span>#</span>
                  <span>Staff</span>
                  <span>Ronda</span>
                  <span>Cumplimiento</span>
                  <span>Incidencias</span>
                  <span>Estado</span>
                </div>
                {stats.map((staff, index) => {
                  const badge = getStatusBadge(staff.assignmentStatus);
                  return (
                    <div key={staff.staffId} className="leaderboard-row">
                      <span className={`rank rank-${index + 1}`}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                      </span>
                      <span className="staff-name">{staff.staffName}</span>
                      <span className="round-name">{staff.roundName}</span>
                      <div className="compliance-bar">
                        <div className="compliance-track">
                          <div
                            className="compliance-fill"
                            style={{
                              width: `${staff.compliancePercentage}%`,
                              background: getComplianceColor(staff.compliancePercentage),
                            }}
                          />
                        </div>
                        <span
                          className="compliance-value"
                          style={{ color: getComplianceColor(staff.compliancePercentage) }}
                        >
                          {staff.compliancePercentage}%
                        </span>
                      </div>
                      <span className={`incidents-badge ${staff.incidentsCount > 0 ? "incidents-some" : "incidents-zero"}`}>
                        {staff.incidentsCount > 0 ? `⚠️ ${staff.incidentsCount}` : "✓ 0"}
                      </span>
                      <span
                        className="status-badge"
                        style={{ background: badge.bg, color: badge.text }}
                      >
                        {badge.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Incidencias Recientes */}
          {incidents.length > 0 && (
            <div className="section">
              <div className="section-header">
                <h2 className="section-title">🚨 Incidencias Recientes</h2>
                <span className="section-badge">{incidents.length} reportes</span>
              </div>
              <div className="incidents-list">
                {incidents.slice(0, 5).map((incident) => (
                  <div key={incident.incidentId} className="incident-card">
                    <div className="incident-header">
                      <div>
                        <div className="incident-location">{incident.locationName}</div>
                        <div className="incident-meta">
                          Piso {incident.locationFloor} • Reportado por {incident.staffName}
                        </div>
                      </div>
                      <div className="incident-time">
                        {new Date(incident.reportedAt).toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <div className="incident-description">
                      {incident.damageDescription}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

