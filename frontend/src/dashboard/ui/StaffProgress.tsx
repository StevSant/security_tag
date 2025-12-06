"use client";

import { useState } from "react";
import { useAuth } from "@/shared/infrastructure/auth";
import { DashboardLayout } from "@/shared/ui/DashboardLayout";
import { MetricCard } from "@/shared/ui/MetricCard";
import { ProgressBar } from "@/shared/ui/ProgressBar";
import { StatusBadge } from "@/shared/ui/StatusBadge";
import {
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  ActivityIcon,
} from "@/shared/ui/icons";

interface StaffProgressProps {
  onSelectLocation?: (locationId: string, locationName: string, assignmentId: string) => void;
}

interface Task {
  id: string;
  name: string;
  location: string;
  status: "completed" | "pending" | "in_progress";
  time?: string;
}

const mockTasks: Task[] = [
  { id: "1", name: "Security Patrol - Floor 1", location: "Building A", status: "completed", time: "09:30 AM" },
  { id: "2", name: "Access Point Check", location: "Main Entrance", status: "completed", time: "10:15 AM" },
  { id: "3", name: "CCTV System Verification", location: "Control Room", status: "in_progress" },
  { id: "4", name: "Emergency Exit Inspection", location: "Building B", status: "pending" },
  { id: "5", name: "Server Room Access Audit", location: "Data Center", status: "pending" },
];

export function StaffProgress({ onSelectLocation }: StaffProgressProps) {
  const { signOut } = useAuth();
  const [tasks] = useState<Task[]>(mockTasks);

  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const totalTasks = tasks.length;
  const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

  const getStatusConfig = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return { badge: "resolved" as const, icon: <CheckCircleIcon />, color: "var(--color-success)" };
      case "in_progress":
        return { badge: "active" as const, icon: <ActivityIcon />, color: "var(--color-warning)" };
      case "pending":
        return { badge: "inactive" as const, icon: <ClockIcon />, color: "var(--text-muted)" };
    }
  };

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <DashboardLayout title="My Tasks" subtitle="Daily security checkpoint progress">
      <style jsx>{`
        .staff-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .progress-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .progress-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .progress-stats {
          font-size: 14px;
          color: var(--text-muted);
        }

        .tasks-section {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 20px 0;
        }

        .tasks-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .task-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          background: var(--bg-tertiary);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .task-item:hover {
          background: var(--bg-hover);
          transform: translateX(4px);
        }

        .task-info {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .task-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-card);
          border-radius: 10px;
        }

        .task-icon :global(svg) {
          width: 20px;
          height: 20px;
        }

        .task-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .task-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--text-primary);
          margin: 0;
        }

        .task-location {
          font-size: 13px;
          color: var(--text-muted);
          margin: 0;
        }

        .task-meta {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .task-time {
          font-size: 12px;
          color: var(--text-muted);
        }

        @media (max-width: 1024px) {
          .metrics-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="staff-content">
        <div className="metrics-grid">
          <MetricCard
            title="Completed Tasks"
            value={completedTasks}
            subtitle={`of ${totalTasks} total tasks`}
            icon={<CheckCircleIcon />}
            iconColor="var(--color-success)"
          />
          <MetricCard
            title="In Progress"
            value={tasks.filter((t) => t.status === "in_progress").length}
            subtitle="Currently working on"
            icon={<ActivityIcon />}
            iconColor="var(--color-warning)"
          />
          <MetricCard
            title="Pending"
            value={tasks.filter((t) => t.status === "pending").length}
            subtitle="Remaining tasks"
            icon={<ClockIcon />}
            iconColor="var(--text-muted)"
          />
        </div>

        <div className="progress-card">
          <div className="progress-header">
            <h3 className="progress-title">Daily Progress</h3>
            <span className="progress-stats">
              {completedTasks}/{totalTasks} tasks completed
            </span>
          </div>
          <ProgressBar
            label="Overall Completion"
            value={progressPercentage}
            color="var(--color-primary)"
          />
        </div>

        <div className="tasks-section">
          <h3 className="section-title">Today&apos;s Tasks</h3>
          <div className="tasks-list">
            {tasks.map((task) => {
              const config = getStatusConfig(task.status);
              return (
                <div
                  key={task.id}
                  className="task-item"
                  onClick={() => {
                    if (task.status === "pending" || task.status === "in_progress") {
                      onSelectLocation?.(task.id, task.name, "mock-assignment-id");
                    }
                  }}
                >
                  <div className="task-info">
                    <div className="task-icon" style={{ color: config.color }}>
                      {config.icon}
                    </div>
                    <div className="task-details">
                      <p className="task-name">{task.name}</p>
                      <p className="task-location">{task.location}</p>
                    </div>
                  </div>
                  <div className="task-meta">
                    {task.time && <span className="task-time">{task.time}</span>}
                    <StatusBadge status={config.badge} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
