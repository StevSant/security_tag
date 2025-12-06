"use client";

import { useState } from "react";
import { AuthGuard, useAuth } from "@/shared/infrastructure/auth";
import { StaffProgress } from "@/dashboard/ui/StaffProgress";
import { CheckpointForm } from "@/rounds_execution/ui/CheckpointForm";

function StaffDashboardContent() {
  const { user, signOut } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [currentAssignmentId, setCurrentAssignmentId] = useState<string | null>(null);

  const handleSelectLocation = (locationId: string, locationName: string, assignmentId?: string) => {
    setSelectedLocation({ id: locationId, name: locationName });
    if (assignmentId) {
      setCurrentAssignmentId(assignmentId);
    }
  };

  const handleCheckinSuccess = () => {
    setSelectedLocation(null);
  };

  const handleCheckinCancel = () => {
    setSelectedLocation(null);
  };

  if (selectedLocation && user) {
    return (
      <div style={{ 
        minHeight: "100vh", 
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <CheckpointForm
          locationId={selectedLocation.id}
          locationName={selectedLocation.name}
          assignmentId={currentAssignmentId || ""}
          userId={user.id}
          onSuccess={handleCheckinSuccess}
          onCancel={handleCheckinCancel}
        />
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Header con logout */}
      <div style={{
        position: "fixed",
        top: 0,
        right: 0,
        padding: "16px",
        zIndex: 100,
      }}>
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
      
      <StaffProgress 
        onSelectLocation={(id, name, assignmentId) => handleSelectLocation(id, name, assignmentId)} 
      />
    </div>
  );
}

export default function StaffDashboardPage() {
  return (
    <AuthGuard requiredRole="staff">
      <StaffDashboardContent />
    </AuthGuard>
  );
}
