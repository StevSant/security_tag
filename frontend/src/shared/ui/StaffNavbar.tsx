"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/infrastructure/auth";

interface StaffNavbarProps {
  activeTab: "tasks" | "rounds";
  onTabChange: (tab: "tasks" | "rounds") => void;
}

export function StaffNavbar({ activeTab, onTabChange }: StaffNavbarProps) {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  const getUserInitial = () => {
    const name = user?.user_metadata?.full_name || user?.email || "B";
    return name.charAt(0).toUpperCase();
  };

  const getUserName = () => {
    return user?.user_metadata?.full_name || "Botón";
  };

  return (
    <div className="staff-navbar-wrapper">
      <style jsx>{`
        .staff-navbar-wrapper {
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .top-bar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .brand-logo {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 20px;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }

        .user-role {
          font-size: 11px;
          color: #3b82f6;
          font-weight: 500;
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

        .tabs {
          display: flex;
          background: white;
          border-bottom: 1px solid #e2e8f0;
        }

        .tab {
          flex: 1;
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border: none;
          background: none;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .tab:hover {
          color: #0f172a;
          background: #f8fafc;
        }

        .tab.active {
          color: #3b82f6;
          border-bottom-color: #3b82f6;
          background: #eff6ff;
        }

        .tab-icon {
          font-size: 18px;
        }

        @media (max-width: 480px) {
          .user-name {
            display: none;
          }

          .logout-btn span:last-child {
            display: none;
          }
        }
      `}</style>

      <div className="top-bar">
        <div className="nav-brand">
          <div className="brand-logo">{getUserInitial()}</div>
          <div className="user-info">
            <div className="user-name">{getUserName()}</div>
            <div className="user-role">Personal de Rondas</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <span>🚪</span>
          <span>Salir</span>
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => onTabChange("tasks")}
        >
          <span className="tab-icon">📋</span>
          <span>Mis Tareas</span>
        </button>
        <button 
          className={`tab ${activeTab === "rounds" ? "active" : ""}`}
          onClick={() => onTabChange("rounds")}
        >
          <span className="tab-icon">🗺️</span>
          <span>Rondas</span>
        </button>
      </div>
    </div>
  );
}

