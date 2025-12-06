"use client";

import { useState } from "react";
import { DashboardLayout } from "@/shared/ui/DashboardLayout";
import { TabNavigation } from "@/shared/ui/TabNavigation";
import { OverviewSection } from "./OverviewSection";
import { SystemStatusOverview } from "./SystemStatusOverview";
import { SecurityAlertsSection } from "./SecurityAlertsSection";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "security", label: "Security Details" },
  { id: "time", label: "Time Tracking" },
  { id: "analytics", label: "Analytics" },
];

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <DashboardLayout title="Dashboard">
      <style jsx>{`
        .dashboard-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .tab-container {
          margin-bottom: 8px;
        }

        .section-grid {
          display: flex;
          flex-direction: column;
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
      `}</style>

      <div className="dashboard-content">
        <div className="tab-container">
          <TabNavigation tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === "overview" && (
          <div className="section-grid">
            <OverviewSection />
            <SystemStatusOverview />
            <SecurityAlertsSection />
          </div>
        )}

        {activeTab === "security" && (
          <div className="placeholder-section">
            <h3 className="placeholder-title">Security Details</h3>
            <p className="placeholder-text">
              Detailed security analysis and threat intelligence will be displayed here.
            </p>
          </div>
        )}

        {activeTab === "time" && (
          <div className="placeholder-section">
            <h3 className="placeholder-title">Time Tracking</h3>
            <p className="placeholder-text">
              Time-based security metrics and historical data will be displayed here.
            </p>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="placeholder-section">
            <h3 className="placeholder-title">Analytics</h3>
            <p className="placeholder-text">
              Security analytics and trend reports will be displayed here.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
