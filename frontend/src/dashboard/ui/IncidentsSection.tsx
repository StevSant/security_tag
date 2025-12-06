"use client";

import { useState, useEffect } from "react";
import { AlertTriangleIcon } from "@/shared/ui/icons";
import { getIncidentsSummary, type IncidentData } from "../infrastructure/supabase/queries";

interface IncidentsSectionProps {
  selectedDate?: string;
}

export function IncidentsSection({ selectedDate }: IncidentsSectionProps) {
  const [incidents, setIncidents] = useState<IncidentData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadIncidents() {
      setIsLoading(true);
      const result = await getIncidentsSummary(selectedDate, selectedDate);
      
      if (result.success && result.data) {
        setIncidents(result.data);
      }
      
      setIsLoading(false);
    }

    loadIncidents();
  }, [selectedDate]);

  const getSeverityColor = (index: number) => {
    // Simular severidad basada en tiempo - más recientes son más urgentes
    if (index === 0) return "var(--color-danger)";
    if (index < 3) return "var(--color-warning)";
    return "var(--text-muted)";
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="incidents-section">
      <style jsx>{`
        .incidents-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }

        .header-icon {
          width: 24px;
          height: 24px;
          color: var(--color-warning);
        }

        .header-icon :global(svg) {
          width: 100%;
          height: 100%;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .section-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0 0 24px 0;
        }

        .incidents-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .incident-card {
          display: flex;
          gap: 16px;
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 10px;
          border-left: 4px solid var(--color-warning);
        }

        .incident-photo {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
          background: var(--bg-secondary);
        }

        .incident-content {
          flex: 1;
          min-width: 0;
        }

        .incident-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 4px;
        }

        .incident-location {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .incident-time {
          font-size: 12px;
          color: var(--text-muted);
          white-space: nowrap;
        }

        .incident-description {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 0 8px 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .incident-meta {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .staff-badge {
          font-size: 11px;
          color: var(--text-muted);
          background: var(--bg-secondary);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .floor-badge {
          font-size: 11px;
          color: var(--color-info);
          background: rgba(59, 130, 246, 0.1);
          padding: 4px 8px;
          border-radius: 4px;
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

        .empty-text {
          margin: 0;
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

      <div className="section-header">
        <div className="header-icon">
          <AlertTriangleIcon />
        </div>
        <h3 className="section-title">Incidencias Recientes</h3>
      </div>
      <p className="section-subtitle">Problemas reportados durante las rondas</p>

      {isLoading ? (
        <div className="loading-state">
          <div className="spinner" />
        </div>
      ) : incidents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <p className="empty-text">No hay incidencias reportadas hoy</p>
        </div>
      ) : (
        <div className="incidents-list">
          {incidents.slice(0, 5).map((incident, index) => (
            <div 
              key={incident.incidentId} 
              className="incident-card"
              style={{ borderLeftColor: getSeverityColor(index) }}
            >
              {incident.damagePhotoUrl && (
                <img 
                  src={incident.damagePhotoUrl} 
                  alt="Foto del incidente"
                  className="incident-photo"
                />
              )}
              <div className="incident-content">
                <div className="incident-header">
                  <p className="incident-location">{incident.locationName}</p>
                  <span className="incident-time">{formatTime(incident.reportedAt)}</span>
                </div>
                <p className="incident-description">{incident.damageDescription}</p>
                <div className="incident-meta">
                  <span className="staff-badge">👤 {incident.staffName}</span>
                  <span className="floor-badge">
                    {incident.locationFloor === 0 
                      ? "Planta Baja" 
                      : incident.locationFloor < 0 
                        ? `Sótano ${Math.abs(incident.locationFloor)}`
                        : `Piso ${incident.locationFloor}`
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

