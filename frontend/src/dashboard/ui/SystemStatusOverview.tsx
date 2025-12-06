"use client";

import { ProgressBar } from "@/shared/ui/ProgressBar";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import { ActivityIcon, LockIcon, EyeIcon } from "@/shared/ui/icons";

interface SystemStatus {
  name: string;
  status: "active" | "monitoring" | "inactive";
  icon: React.ReactNode;
}

interface SystemMetric {
  label: string;
  value: number;
}

interface SystemStatusOverviewProps {
  systems?: SystemStatus[];
  metrics?: SystemMetric[];
}

const defaultSystems: SystemStatus[] = [
  { name: "Firewall", status: "active", icon: <LockIcon /> },
  { name: "Intrusion Detection", status: "monitoring", icon: <EyeIcon /> },
];

const defaultMetrics: SystemMetric[] = [
  { label: "CPU Usage", value: 23 },
  { label: "Memory Usage", value: 67 },
];

export function SystemStatusOverview({
  systems = defaultSystems,
  metrics = defaultMetrics,
}: SystemStatusOverviewProps) {
  return (
    <div className="system-status-card">
      <style jsx>{`
        .system-status-card {
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
          color: var(--text-primary);
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

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 32px;
        }

        .systems-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .system-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .system-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .system-icon {
          width: 20px;
          height: 20px;
          color: var(--text-secondary);
        }

        .system-icon :global(svg) {
          width: 100%;
          height: 100%;
        }

        .system-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
        }

        .metrics-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        @media (max-width: 768px) {
          .content-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }
        }
      `}</style>

      <div className="card-header">
        <div className="header-icon">
          <ActivityIcon />
        </div>
        <h3 className="card-title">System Status Overview</h3>
      </div>
      <p className="card-subtitle">Real-time status of critical security systems</p>

      <div className="content-grid">
        <div className="systems-list">
          {systems.map((system, index) => (
            <div key={index} className="system-item">
              <div className="system-info">
                <div className="system-icon">{system.icon}</div>
                <p className="system-name">{system.name}</p>
              </div>
              <StatusBadge status={system.status} />
            </div>
          ))}
        </div>

        <div className="metrics-list">
          {metrics.map((metric, index) => (
            <ProgressBar
              key={index}
              label={metric.label}
              value={metric.value}
              color="var(--text-primary)"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

