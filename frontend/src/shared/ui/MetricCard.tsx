"use client";

import { TrendingUpIcon, TrendingDownIcon } from "./icons";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  trend?: {
    value: number | string;
    direction: "up" | "down";
  };
  iconColor?: string;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  iconColor = "var(--color-primary)",
}: MetricCardProps) {
  return (
    <div className="metric-card">
      <style jsx>{`
        .metric-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .card-title {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-secondary);
          margin: 0;
        }

        .card-icon {
          width: 24px;
          height: 24px;
          color: ${iconColor};
        }

        .card-icon :global(svg) {
          width: 100%;
          height: 100%;
        }

        .card-body {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .card-content {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .card-value {
          font-size: 32px;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1;
          margin: 0;
        }

        .card-subtitle {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .card-trend {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          font-weight: 500;
        }

        .trend-up {
          color: var(--color-success);
        }

        .trend-down {
          color: var(--color-danger);
        }

        .trend-icon {
          width: 16px;
          height: 16px;
        }
      `}</style>

      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <div className="card-icon">{icon}</div>
      </div>

      <div className="card-body">
        <div className="card-content">
          <p className="card-value">{value}</p>
          <p className="card-subtitle">{subtitle}</p>
        </div>
        {trend && (
          <div className={`card-trend ${trend.direction === "up" ? "trend-up" : "trend-down"}`}>
            {trend.direction === "up" ? (
              <TrendingUpIcon className="trend-icon" />
            ) : (
              <TrendingDownIcon className="trend-icon" />
            )}
            <span>{trend.value}</span>
          </div>
        )}
      </div>
    </div>
  );
}

