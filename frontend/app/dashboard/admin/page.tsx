"use client";

import { AuthGuard } from "@/shared/infrastructure/auth";
import { AdminDashboard } from "@/dashboard/ui/AdminDashboard";

// Deshabilitar prerendering - requiere autenticación
export const dynamic = "force-dynamic";

export default function AdminDashboardPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboard />
    </AuthGuard>
  );
}
