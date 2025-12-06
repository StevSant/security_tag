"use client";

import Link from "next/link";
import { AuthGuard, useAuth } from "@/shared/infrastructure/auth";
import { AdminDashboard } from "@/dashboard/ui/AdminDashboard";

function AdminDashboardContent() {
  const { signOut } = useAuth();

  return (
    <div style={{ position: "relative" }}>
      {/* Header con navegación */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        padding: "16px",
        zIndex: 100,
        display: "flex",
        gap: "12px",
      }}>
        <Link
          href="/dashboard/admin/users"
          style={{
            padding: "8px 16px",
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "8px",
            color: "#a855f7",
            fontFamily: "inherit",
            fontSize: "12px",
            textDecoration: "none",
          }}
        >
          👥 Gestionar Usuarios
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
      
      <AdminDashboard />
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboardContent />
    </AuthGuard>
  );
}
