"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGuard, useAuth } from "@/shared/infrastructure/auth";
import { StaffProgress } from "@/dashboard/ui/StaffProgress";
import { CheckpointForm } from "@/rounds_execution/ui/CheckpointForm";
import StaffTasksDashboard from "@/tasks/ui/StaffTasksDashboard";

function StaffDashboardInner() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<"tasks" | "rounds">("tasks");
  const [selectedLocation, setSelectedLocation] = useState<{
    id: string;
    name: string;
    assignmentId: string;
  } | null>(null);

  const handleSelectLocation = (locationId: string, locationName: string, assignmentId: string) => {
    setSelectedLocation({
      id: locationId,
      name: locationName,
      assignmentId
    });
  };

  const handleCheckinSuccess = () => {
    setSelectedLocation(null);
  };

  const handleCheckinCancel = () => {
    setSelectedLocation(null);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (selectedLocation && user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          padding: "40px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckpointForm
          locationId={selectedLocation.id}
          locationName={selectedLocation.name}
          assignmentId={selectedLocation.assignmentId}
          userId={user.id}
          onSuccess={handleCheckinSuccess}
          onCancel={handleCheckinCancel}
        />
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <style jsx>{`
        .staff-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
        }
        .top-bar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 14px;
        }
        .user-name {
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
        }
        .user-role {
          font-size: 11px;
          color: #64748b;
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
        }
        .logout-btn:hover {
          background: #fecaca;
        }
        .tabs {
          display: flex;
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0 20px;
        }
        .tab {
          padding: 14px 20px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;
          cursor: pointer;
          border: none;
          background: none;
          border-bottom: 2px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab:hover {
          color: #0f172a;
        }
        .tab.active {
          color: #10b981;
          border-bottom-color: #10b981;
        }
        .tab-icon {
          font-size: 16px;
        }
      `}</style>

      <div className="top-bar">
        <div className="user-info">
          <div className="user-avatar">
            {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0) || "B"}
          </div>
          <div>
            <div className="user-name">{user?.user_metadata?.full_name || "Botón"}</div>
            <div className="user-role">Personal de Rondas</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === "tasks" ? "active" : ""}`}
          onClick={() => setActiveTab("tasks")}
        >
          <span className="tab-icon">📋</span>
          Mis Tareas
        </button>
        <button 
          className={`tab ${activeTab === "rounds" ? "active" : ""}`}
          onClick={() => setActiveTab("rounds")}
        >
          <span className="tab-icon">🗺️</span>
          Rondas
        </button>
      </div>

      {activeTab === "tasks" && <StaffTasksDashboard />}
      {activeTab === "rounds" && <StaffProgress onSelectLocation={handleSelectLocation} />}
    </div>
  );
}

export default function StaffDashboardContent() {
  return (
    <AuthGuard requiredRole="staff">
      <StaffDashboardInner />
    </AuthGuard>
  );
}

