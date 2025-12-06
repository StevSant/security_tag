"use client";

import { useState } from "react";
import { AuthGuard, useAuth } from "@/shared/infrastructure/auth";
import { StaffProgress } from "@/dashboard/ui/StaffProgress";
import { CheckpointForm } from "@/rounds_execution/ui/CheckpointForm";

function StaffDashboardInner() {
  const { user } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState<{
    id: string;
    name: string;
    assignmentId: string;
  } | null>(null);

  const handleSelectLocation = (locationId: string, locationName: string, assignmentId: string) => {
    setSelectedLocation({
      id: locationId,
      name: locationName,
      assignmentId
    });
  };

  const handleCheckinSuccess = () => {
    setSelectedLocation(null);
  };

  const handleCheckinCancel = () => {
    setSelectedLocation(null);
  };

  if (selectedLocation && user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
          padding: "40px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CheckpointForm
          locationId={selectedLocation.id}
          locationName={selectedLocation.name}
          assignmentId={selectedLocation.assignmentId}
          userId={user.id}
          onSuccess={handleCheckinSuccess}
          onCancel={handleCheckinCancel}
        />
      </div>
    );
  }

  return <StaffProgress onSelectLocation={handleSelectLocation} />;
}

export default function StaffDashboardContent() {
  return (
    <AuthGuard requiredRole="staff">
      <StaffDashboardInner />
    </AuthGuard>
  );
}

