"use client";

import { AuthGuard } from "@/shared/infrastructure/auth";
import { AdminLayout } from "@/shared/ui/AdminLayout";
import { UserManagement } from "@/admin/ui/UserManagement";

export default function UsersPageContent() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <div className="page-header">
          <style jsx>{`
            .page-header {
              margin-bottom: 24px;
            }
            .page-header h1 {
              font-size: 24px;
              font-weight: 700;
              color: #0f172a;
              margin: 0 0 8px 0;
            }
            .page-header p {
              font-size: 14px;
              color: #64748b;
              margin: 0;
            }
          `}</style>
          <h1>Gestión de Botones</h1>
          <p>Crear y administrar cuentas del personal de rondas</p>
        </div>
        <UserManagement />
      </AdminLayout>
    </AuthGuard>
  );
}
