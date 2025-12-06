"use client";

import { AuthGuard } from "@/shared/infrastructure/auth";
import { DashboardLayout } from "@/shared/ui/DashboardLayout";
import { UserManagement } from "@/admin/ui/UserManagement";

function UsersPageInner() {
  return (
    <DashboardLayout title="Gestión de Botones" subtitle="Crear y administrar cuentas de personal">
      <UserManagement />
    </DashboardLayout>
  );
}

export default function UsersPageContent() {
  return (
    <AuthGuard requiredRole="admin">
      <UsersPageInner />
    </AuthGuard>
  );
}
