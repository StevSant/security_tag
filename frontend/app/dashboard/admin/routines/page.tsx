"use client";

import { AuthGuard } from "@/shared/infrastructure/auth";
import { RoutineManagement } from "@/admin/ui/RoutineManagement";

export default function RoutinesPage() {
  return (
    <AuthGuard requiredRole="admin">
      <div style={{ 
        minHeight: "100vh", 
        background: "var(--bg-secondary)",
        paddingTop: "80px" 
      }}>
        <RoutineManagement />
      </div>
    </AuthGuard>
  );
}

