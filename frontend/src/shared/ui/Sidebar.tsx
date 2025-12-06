"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldIcon,
  DashboardIcon,
  AlertTriangleIcon,
  ActivityIcon,
  UsersIcon,
  ServerIcon,
  ClockIcon,
} from "./icons";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard/admin", icon: DashboardIcon },
  { label: "Security Alerts", href: "/dashboard/admin/alerts", icon: AlertTriangleIcon },
  { label: "System Monitor", href: "/dashboard/admin/monitor", icon: ActivityIcon },
  { label: "User Access", href: "/dashboard/admin/users", icon: UsersIcon },
  { label: "Server Status", href: "/dashboard/admin/servers", icon: ServerIcon },
  { label: "Time Tracking", href: "/dashboard/admin/time", icon: ClockIcon },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <style jsx>{`
        .sidebar {
          width: var(--sidebar-width);
          height: 100vh;
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .logo-section {
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--bg-tertiary);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-primary);
        }

        .logo-icon :global(svg) {
          width: 24px;
          height: 24px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.2;
        }

        .logo-subtitle {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
        }

        .nav-section {
          flex: 1;
          padding: 16px 12px;
          overflow-y: auto;
        }

        .nav-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: block;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 8px;
          color: var(--text-secondary);
          font-size: 14px;
          font-weight: 500;
          transition: all 0.15s ease;
          text-decoration: none;
        }

        .nav-link:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .nav-link.active {
          background: var(--color-primary);
          color: var(--text-inverse);
        }

        .nav-link :global(svg) {
          width: 20px;
          height: 20px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
          }

          .sidebar.open {
            transform: translateX(0);
          }
        }
      `}</style>

      <div className="logo-section">
        <div className="logo-container">
          <div className="logo-icon">
            <ShieldIcon />
          </div>
          <div className="logo-text">
            <h1 className="logo-title">CyberSec Control</h1>
            <p className="logo-subtitle">Security Operations Center</p>
          </div>
        </div>
      </div>

      <nav className="nav-section">
        <ul className="nav-list">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href} className="nav-item">
                <Link href={item.href} className={`nav-link ${isActive ? "active" : ""}`}>
                  <Icon />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

