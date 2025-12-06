"use client";

type SeverityLevel = "critical" | "high" | "medium" | "low";

interface SeverityBadgeProps {
  severity: SeverityLevel;
}

const severityConfig: Record<SeverityLevel, { color: string; bg: string; label: string }> = {
  critical: {
    color: "#DC2626",
    bg: "rgba(220, 38, 38, 0.1)",
    label: "CRITICAL",
  },
  high: {
    color: "#F97316",
    bg: "rgba(249, 115, 22, 0.1)",
    label: "HIGH",
  },
  medium: {
    color: "#EAB308",
    bg: "rgba(234, 179, 8, 0.1)",
    label: "MEDIUM",
  },
  low: {
    color: "#22C55E",
    bg: "rgba(34, 197, 94, 0.1)",
    label: "LOW",
  },
};

export function SeverityBadge({ severity }: SeverityBadgeProps) {
  const config = severityConfig[severity];

  return (
    <span className="severity-badge">
      <style jsx>{`
        .severity-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
          background: ${config.bg};
          color: ${config.color};
          border: 1px solid ${config.color}30;
        }
      `}</style>
      <span>{config.label}</span>
    </span>
  );
}

