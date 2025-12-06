"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/shared/infrastructure/auth";
import {
  DashboardIcon,
  AlertTriangleIcon,
  ActivityIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
} from "./icons";

// Hotel Icon Component
function HotelIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
      <path d="M1 21h22" />
      <path d="M9 7h1" />
      <path d="M9 11h1" />
      <path d="M9 15h1" />
      <path d="M14 7h1" />
      <path d="M14 11h1" />
      <path d="M14 15h1" />
    </svg>
  );
}

// Clipboard/Route Icon
function RouteIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="M9 12h6" />
      <path d="M9 16h6" />
    </svg>
  );
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const adminNavItems: NavItem[] = [
  { label: "Panel de Control", href: "/dashboard/admin", icon: DashboardIcon },
  { label: "Rutinas", href: "/dashboard/admin/routines", icon: RouteIcon },
  { label: "Incidencias", href: "/dashboard/admin/incidents", icon: AlertTriangleIcon },
  { label: "Botones", href: "/dashboard/admin/users", icon: UsersIcon },
  { label: "Historial", href: "/dashboard/admin/history", icon: ClockIcon },
];

const staffNavItems: NavItem[] = [
  { label: "Mis Checkpoints", href: "/dashboard/staff", icon: CheckCircleIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const { role, signOut } = useAuth();
  
  const navItems = role === "admin" ? adminNavItems : staffNavItems;

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
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
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

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .logout-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
          border-color: var(--color-danger);
        }

        .role-badge {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-primary);
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 12px;
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
            <HotelIcon />
          </div>
          <div className="logo-text">
            <h1 className="logo-title">HotelGuard</h1>
            <p className="logo-subtitle">Sistema de Rondas</p>
          </div>
        </div>
      </div>

      <nav className="nav-section">
        <ul className="nav-list">
          {navItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard/admin" && item.href !== "/dashboard/staff" && pathname.startsWith(item.href));
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

      <div className="sidebar-footer">
        <span className="role-badge">
          {role === "admin" ? "Administrador" : "Botón"}
        </span>
        <button className="logout-btn" onClick={() => signOut()}>
          🚪 Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
