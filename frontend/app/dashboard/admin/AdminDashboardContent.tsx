"use client";

import { AuthGuard } from "@/shared/infrastructure/auth";
import { AdminDashboard } from "@/dashboard/ui/AdminDashboard";

export default function AdminDashboardContent() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboard />
    </AuthGuard>
  );
}
