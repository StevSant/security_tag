"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/shared/infrastructure/auth";

const navItems = [
  { href: "/dashboard/admin", label: "Dashboard", icon: "📊" },
  { href: "/dashboard/admin/tasks", label: "Tareas", icon: "📋" },
  { href: "/dashboard/admin/users", label: "Botones", icon: "👥" },
];

export function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <nav className="admin-navbar">
      <style jsx>{`
        .admin-navbar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
          height: 60px;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 18px;
        }

        .brand-name {
          font-size: 16px;
          font-weight: 700;
          color: #0f172a;
        }

        .brand-role {
          font-size: 11px;
          color: #10b981;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .nav-links {
          display: flex;
          gap: 4px;
          height: 100%;
        }

        .nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0 16px;
          height: 100%;
          color: #64748b;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
        }

        .nav-link:hover {
          color: #0f172a;
          background: #f8fafc;
        }

        .nav-link.active {
          color: #10b981;
          border-bottom-color: #10b981;
          background: #f0fdf4;
        }

        .nav-icon {
          font-size: 16px;
        }

        .nav-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 13px;
        }

        .user-name {
          font-size: 13px;
          color: #475569;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .logout-btn {
          padding: 8px 14px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          color: #dc2626;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .logout-btn:hover {
          background: #fecaca;
        }

        @media (max-width: 768px) {
          .admin-navbar {
            padding: 0 16px;
          }

          .brand-name, .brand-role {
            display: none;
          }

          .nav-link span:not(.nav-icon) {
            display: none;
          }

          .nav-link {
            padding: 0 12px;
          }

          .user-name {
            display: none;
          }
        }
      `}</style>

      <div className="nav-brand">
        <div className="brand-logo">🛡️</div>
        <div>
          <div className="brand-name">NightGuard</div>
          <div className="brand-role">Admin</div>
        </div>
      </div>

      <div className="nav-links">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-link ${pathname === item.href ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="nav-right">
        <div className="user-info">
          <div className="user-avatar">
            {user?.email?.charAt(0).toUpperCase() || "A"}
          </div>
          <span className="user-name">{user?.email}</span>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Salir</span>
        </button>
      </div>
    </nav>
  );
}

