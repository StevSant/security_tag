"use client";

import { AlertCard } from "@/shared/ui/AlertCard";
import { AlertTriangleIcon } from "@/shared/ui/icons";

type SeverityLevel = "critical" | "high" | "medium" | "low";
type StatusType = "active" | "monitoring" | "investigating" | "resolved" | "inactive";

interface Alert {
  id: string;
  title: string;
  severity: SeverityLevel;
  status: StatusType;
  source: string;
  timeAgo: string;
}

interface SecurityAlertsSectionProps {
  alerts?: Alert[];
}

const defaultAlerts: Alert[] = [
  {
    id: "1",
    title: "Suspicious Login Attempt",
    severity: "high",
    status: "investigating",
    source: "192.168.1.45",
    timeAgo: "15m ago",
  },
  {
    id: "2",
    title: "Malware Detected",
    severity: "critical",
    status: "active",
    source: "Endpoint-007",
    timeAgo: "45m ago",
  },
  {
    id: "3",
    title: "Unusual Network Traffic",
    severity: "medium",
    status: "resolved",
    source: "Network Monitor",
    timeAgo: "2h ago",
  },
  {
    id: "4",
    title: "Failed Admin Access",
    severity: "high",
    status: "resolved",
    source: "10.0.0.100",
    timeAgo: "4h ago",
  },
];

export function SecurityAlertsSection({ alerts = defaultAlerts }: SecurityAlertsSectionProps) {
  return (
    <div className="alerts-section">
      <style jsx>{`
        .alerts-section {
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
          color: var(--text-primary);
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

        .alerts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
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
      `}</style>

      <div className="section-header">
        <div className="header-icon">
          <AlertTriangleIcon />
        </div>
        <h3 className="section-title">Recent Security Alerts</h3>
      </div>
      <p className="section-subtitle">Latest security incidents and threats</p>

      {alerts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✓</div>
          <p>No active security alerts</p>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              title={alert.title}
              severity={alert.severity}
              status={alert.status}
              source={alert.source}
              timeAgo={alert.timeAgo}
            />
          ))}
        </div>
      )}
    </div>
  );
}

