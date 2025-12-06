"use client";

import Link from "next/link";
import { AuthGuard, useAuth } from "@/shared/infrastructure/auth";
import { UserManagement } from "@/admin/ui/UserManagement";

// Deshabilitar prerendering - requiere autenticación
export const dynamic = "force-dynamic";

function UsersPageContent() {
  const { signOut } = useAuth();

  return (
    <div className="users-page">
      <style jsx>{`
        .users-page {
          font-family: 'JetBrains Mono', monospace;
          background: linear-gradient(180deg, #0a0a0f 0%, #12121a 100%);
          min-height: 100vh;
          padding: 24px;
          color: #f1f5f9;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .back-link {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #94a3b8;
          text-decoration: none;
          font-size: 14px;
          padding: 8px 12px;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .back-link:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #f1f5f9;
        }

        .page-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logout-btn {
          padding: 10px 16px;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          color: #fca5a5;
          font-family: inherit;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.2);
        }
      `}</style>

      <div className="header">
        <div className="header-left">
          <Link href="/dashboard/admin" className="back-link">
            ← Volver al Dashboard
          </Link>
          <h1 className="page-title">Gestión de Staff</h1>
        </div>
        <button className="logout-btn" onClick={signOut}>
          Cerrar Sesión
        </button>
      </div>

      <UserManagement />
    </div>
  );
}

export default function UsersPage() {
  return (
    <AuthGuard requiredRole="admin">
      <UsersPageContent />
    </AuthGuard>
  );
}

