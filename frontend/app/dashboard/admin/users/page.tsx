"use client";

import Link from "next/link";
import { AuthGuard, useAuth } from "@/shared/infrastructure/auth";
import { UserManagement } from "@/admin/ui/UserManagement";

export const dynamic = "force-dynamic";

function UsersPageContent() {
  const { signOut } = useAuth();

  return (
    <div style={{ 
      minHeight: "100vh",
      background: "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)",
    }}>
      {/* Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 24px",
        borderBottom: "1px solid #334155",
      }}>
        <Link
          href="/dashboard/admin"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            color: "#94a3b8",
            textDecoration: "none",
            fontSize: "14px",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          ← Volver al Dashboard
        </Link>
        <button
          onClick={signOut}
          style={{
            padding: "8px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#fca5a5",
            fontFamily: "inherit",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Cerrar sesión
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
