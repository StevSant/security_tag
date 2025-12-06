"use client";

import { MetricCard } from "@/shared/ui/MetricCard";
import {
  ShieldCheckIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  UsersIcon,
  MonitorIcon,
} from "@/shared/ui/icons";

interface MetricData {
  securityScore: number;
  activeThreats: number;
  blockedAttacks: number;
  failedLogins: number;
  activeSessions: number;
  systemUptime: number;
}

interface OverviewSectionProps {
  data?: MetricData;
}

const defaultData: MetricData = {
  securityScore: 87,
  activeThreats: 3,
  blockedAttacks: 847,
  failedLogins: 23,
  activeSessions: 156,
  systemUptime: 99.9,
};

export function OverviewSection({ data = defaultData }: OverviewSectionProps) {
  return (
    <div className="overview-section">
      <style jsx>{`
        .overview-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 1200px) {
          .overview-section {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .overview-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <MetricCard
        title="Security Score"
        value={data.securityScore}
        subtitle="Overall security posture"
        icon={<ShieldCheckIcon />}
        iconColor="var(--color-primary)"
        trend={{ value: 5, direction: "down" }}
      />

      <MetricCard
        title="Active Threats"
        value={data.activeThreats}
        subtitle="Currently monitoring"
        icon={<AlertTriangleIcon />}
        iconColor="var(--color-warning)"
        trend={{ value: 2, direction: "down" }}
      />

      <MetricCard
        title="Blocked Attacks"
        value={data.blockedAttacks}
        subtitle="Last 24 hours"
        icon={<CheckCircleIcon />}
        iconColor="var(--color-success)"
        trend={{ value: 12, direction: "up" }}
      />

      <MetricCard
        title="Failed Logins"
        value={data.failedLogins}
        subtitle="Last hour"
        icon={<XCircleIcon />}
        iconColor="var(--color-danger)"
        trend={{ value: 8, direction: "down" }}
      />

      <MetricCard
        title="Active Sessions"
        value={data.activeSessions}
        subtitle="Current user sessions"
        icon={<UsersIcon />}
        iconColor="var(--color-info)"
        trend={{ value: 3, direction: "up" }}
      />

      <MetricCard
        title="System Uptime"
        value={`${data.systemUptime}%`}
        subtitle="Last 30 days"
        icon={<MonitorIcon />}
        iconColor="var(--text-primary)"
        trend={{ value: "0.1%", direction: "up" }}
      />
    </div>
  );
}

