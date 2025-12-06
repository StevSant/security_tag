"use client";

import { SeverityBadge } from "./SeverityBadge";
import { StatusBadge } from "./StatusBadge";

type SeverityLevel = "critical" | "high" | "medium" | "low";
type StatusType = "active" | "monitoring" | "investigating" | "resolved" | "inactive";

interface AlertCardProps {
  title: string;
  severity: SeverityLevel;
  status: StatusType;
  source: string;
  timeAgo: string;
}

export function AlertCard({ title, severity, status, source, timeAgo }: AlertCardProps) {
  return (
    <div className="alert-card">
      <style jsx>{`
        .alert-card {
          background: var(--bg-tertiary);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
        }

        .alert-content {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .alert-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .alert-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .alert-meta {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .alert-source {
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0;
        }

        .alert-time {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
        }

        .alert-status {
          flex-shrink: 0;
        }

        @media (max-width: 640px) {
          .alert-card {
            flex-direction: column;
            align-items: flex-start;
          }

          .alert-status {
            align-self: flex-end;
          }
        }
      `}</style>

      <div className="alert-content">
        <div className="alert-header">
          <h4 className="alert-title">{title}</h4>
          <SeverityBadge severity={severity} />
        </div>
        <div className="alert-meta">
          <p className="alert-source">Source: {source}</p>
          <p className="alert-time">{timeAgo}</p>
        </div>
      </div>

      <div className="alert-status">
        <StatusBadge status={status} />
      </div>
    </div>
  );
}

