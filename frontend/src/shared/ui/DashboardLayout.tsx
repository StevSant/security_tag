"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { SystemStatusBadge } from "./StatusBadge";
import { BellIcon } from "./icons";

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function DashboardLayout({ children, title, subtitle }: DashboardLayoutProps) {
  const today = new Date().toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="dashboard-layout">
      <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: var(--bg-secondary);
        }

        .main-content {
          flex: 1;
          margin-left: var(--sidebar-width);
          min-height: 100vh;
        }

        .top-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 32px;
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-color);
        }

        .header-left {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }

        .page-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .notification-btn {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: all 0.15s ease;
        }

        .notification-btn:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
          color: var(--text-primary);
        }

        .notification-btn :global(svg) {
          width: 20px;
          height: 20px;
        }

        .page-content {
          padding: 32px;
        }

        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0;
          }

          .top-header {
            padding: 16px 20px;
          }

          .page-content {
            padding: 20px;
          }
        }

        @media (max-width: 640px) {
          .header-right {
            flex-direction: column;
            align-items: flex-end;
            gap: 12px;
          }
        }
      `}</style>

      <Sidebar />

      <main className="main-content">
        <header className="top-header">
          <div className="header-left">
            <h1 className="page-title">{title}</h1>
            <p className="page-subtitle">{subtitle || today}</p>
          </div>
          <div className="header-right">
            <SystemStatusBadge operational={true} />
            <button className="notification-btn" aria-label="Notifications">
              <BellIcon />
            </button>
          </div>
        </header>

        <div className="page-content">{children}</div>
      </main>
    </div>
  );
}

