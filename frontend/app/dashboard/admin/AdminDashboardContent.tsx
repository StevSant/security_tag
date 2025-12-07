"use client";

import { AuthGuard } from "@/shared/infrastructure/auth";
import { AdminLayout } from "@/shared/ui/AdminLayout";
import { AdminDashboard } from "@/dashboard/ui/AdminDashboard";

export default function AdminDashboardContent() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    </AuthGuard>
  );
}
