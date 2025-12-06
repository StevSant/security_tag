"use client";

import { useState } from "react";
import { DashboardLayout } from "@/shared/ui/DashboardLayout";
import { TabNavigation } from "@/shared/ui/TabNavigation";
import { OverviewSection } from "./OverviewSection";
import { StaffProgressOverview } from "./StaffProgressOverview";
import { IncidentsSection } from "./IncidentsSection";

const tabs = [
  { id: "overview", label: "Resumen" },
  { id: "staff", label: "Botones" },
  { id: "incidents", label: "Incidencias" },
  { id: "history", label: "Historial" },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (dateStr === today.toISOString().split("T")[0]) {
      return "Hoy";
    }
    if (dateStr === yesterday.toISOString().split("T")[0]) {
      return "Ayer";
    }
    return date.toLocaleDateString('es-ES', { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'long' 
    });
  };

  return (
    <DashboardLayout title="Panel de Control" subtitle="Gestión de rondas del hotel">
      <style jsx>{`
        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .header-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .tab-container {
          flex: 1;
        }

        .date-selector {
          display: flex;
          align-items: center;
          gap: 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 8px 16px;
        }

        .date-label {
          font-size: 13px;
          color: var(--text-muted);
        }

        .date-input {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 6px;
          padding: 8px 12px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
          cursor: pointer;
        }

        .date-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .date-display {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .section-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .two-column-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .placeholder-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 60px 40px;
          text-align: center;
          color: var(--text-muted);
        }

        .placeholder-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-secondary);
          margin: 0 0 8px 0;
        }

        .placeholder-text {
          font-size: 14px;
          margin: 0;
        }

        @media (max-width: 1024px) {
          .two-column-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="dashboard-content">
        <div className="header-row">
          <div className="tab-container">
            <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
          </div>
          
          <div className="date-selector">
            <span className="date-label">📅</span>
            <input
              type="date"
              className="date-input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
            />
            <span className="date-display">{formatDateDisplay(selectedDate)}</span>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="section-grid">
            <OverviewSection selectedDate={selectedDate} />
            <div className="two-column-grid">
              <StaffProgressOverview selectedDate={selectedDate} />
              <IncidentsSection selectedDate={selectedDate} />
            </div>
          </div>
        )}

        {activeTab === "staff" && (
          <div className="section-grid">
            <StaffProgressOverview selectedDate={selectedDate} />
          </div>
        )}

        {activeTab === "incidents" && (
          <div className="section-grid">
            <IncidentsSection selectedDate={selectedDate} />
          </div>
        )}

        {activeTab === "history" && (
          <div className="placeholder-section">
            <h3 className="placeholder-title">Historial de Rondas</h3>
            <p className="placeholder-text">
              Aquí se mostrará el historial completo de rondas y reportes.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
