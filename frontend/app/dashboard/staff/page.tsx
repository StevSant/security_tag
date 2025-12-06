"use client";

import { useState } from "react";
import { StaffProgress } from "@/dashboard/ui/StaffProgress";
import { CheckpointForm } from "@/rounds_execution/ui/CheckpointForm";

export default function StaffDashboardPage() {
  const [selectedLocation, setSelectedLocation] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Mock data - en producción vendría de la sesión
  const mockUserId = "mock-user-id";
  const mockAssignmentId = "mock-assignment-1";

  const handleSelectLocation = (locationId: string, locationName: string) => {
    setSelectedLocation({ id: locationId, name: locationName });
  };

  const handleCheckinSuccess = () => {
    setSelectedLocation(null);
    // Aquí se podría refrescar el progreso
  };

  const handleCheckinCancel = () => {
    setSelectedLocation(null);
  };

  if (selectedLocation) {
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
          assignmentId={mockAssignmentId}
          userId={mockUserId}
          onSuccess={handleCheckinSuccess}
          onCancel={handleCheckinCancel}
        />
      </div>
    );
  }

  return <StaffProgress onSelectLocation={handleSelectLocation} />;
}

