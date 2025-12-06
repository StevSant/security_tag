"use client";

type StatusType = "active" | "monitoring" | "investigating" | "resolved" | "inactive";

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
}

const statusConfig: Record<StatusType, { color: string; bg: string; defaultLabel: string }> = {
  active: {
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    defaultLabel: "En Progreso",
  },
  monitoring: {
    color: "#3B82F6",
    bg: "rgba(59, 130, 246, 0.1)",
    defaultLabel: "Monitoreando",
  },
  investigating: {
    color: "#F59E0B",
    bg: "rgba(245, 158, 11, 0.1)",
    defaultLabel: "Investigando",
  },
  resolved: {
    color: "#10B981",
    bg: "rgba(16, 185, 129, 0.1)",
    defaultLabel: "Completado",
  },
  inactive: {
    color: "#6B7280",
    bg: "rgba(107, 114, 128, 0.1)",
    defaultLabel: "Pendiente",
  },
};

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const config = statusConfig[status];
  const displayLabel = label || config.defaultLabel;

  return (
    <span className="status-badge">
      <style jsx>{`
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          background: ${config.bg};
          color: ${config.color};
          border: 1px solid ${config.color}20;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: ${config.color};
        }
      `}</style>
      <span className="status-dot" />
      <span>{displayLabel}</span>
    </span>
  );
}

// System Status Badge (for operational status in header)
interface SystemStatusBadgeProps {
  operational: boolean;
}

export function SystemStatusBadge({ operational }: SystemStatusBadgeProps) {
  const color = operational ? "#10B981" : "#EF4444";
  const label = operational ? "Sistema Operativo" : "Sistema con Problemas";

  return (
    <span className="system-badge">
      <style jsx>{`
        .system-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: 24px;
          font-size: 13px;
          font-weight: 500;
          background: transparent;
          color: ${color};
          border: 1px solid ${color};
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: ${color};
        }
      `}</style>
      <span className="status-dot" />
      <span>{label}</span>
    </span>
  );
}
