"use client";

import { AuthGuard } from "@/shared/infrastructure/auth";
import { AdminDashboard } from "@/dashboard/ui/AdminDashboard";

export default function AdminDashboardPage() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminDashboard />
    </AuthGuard>
  );
}
