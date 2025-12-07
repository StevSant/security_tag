"use client";

import { AuthGuard } from "@/shared/infrastructure/auth/AuthGuard";
import { AdminLayout } from "@/shared/ui/AdminLayout";
import TaskManagement from "@/tasks/ui/TaskManagement";

export default function TasksPageContent() {
  return (
    <AuthGuard requiredRole="admin">
      <AdminLayout>
        <TaskManagement />
      </AdminLayout>
    </AuthGuard>
  );
}

