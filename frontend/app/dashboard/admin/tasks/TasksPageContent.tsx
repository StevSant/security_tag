"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/infrastructure/auth";
import { AuthGuard } from "@/shared/infrastructure/auth/AuthGuard";
import TaskManagement from "@/tasks/ui/TaskManagement";

function TasksContent() {
  const router = useRouter();
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="tasks-page">
      <style jsx>{`
        .tasks-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
        }
        .top-bar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 12px 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .nav-links {
          display: flex;
          gap: 16px;
        }
        .nav-link {
          padding: 8px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
          font-size: 13px;
          text-decoration: none;
          transition: all 0.2s;
        }
        .nav-link:hover {
          background: #f1f5f9;
          color: #0f172a;
        }
        .nav-link.active {
          background: #10b981;
          color: white;
          border-color: #10b981;
        }
        .user-section {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .user-name {
          font-size: 13px;
          color: #64748b;
        }
        .logout-btn {
          padding: 8px 16px;
          background: #fee2e2;
          border: 1px solid #fca5a5;
          border-radius: 8px;
          color: #dc2626;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-btn:hover {
          background: #fecaca;
        }
      `}</style>

      <div className="top-bar">
        <div className="nav-links">
          <a href="/dashboard/admin" className="nav-link">📊 Dashboard</a>
          <a href="/dashboard/admin/users" className="nav-link">👥 Usuarios</a>
          <a href="/dashboard/admin/tasks" className="nav-link active">📋 Tareas</a>
        </div>
        <div className="user-section">
          <span className="user-name">{user?.email}</span>
          <button className="logout-btn" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>

      <TaskManagement />
    </div>
  );
}

export default function TasksPageContent() {
  return (
    <AuthGuard allowedRoles={["admin"]}>
      <TasksContent />
    </AuthGuard>
  );
}

