"use client";

import { useState, useEffect } from "react";
import { AuthGuard, useAuth } from "@/shared/infrastructure/auth";
import { StaffProgress } from "@/dashboard/ui/StaffProgress";
import { CheckpointForm } from "@/rounds_execution/ui/CheckpointForm";
import { QRScanner } from "@/rounds_execution/ui/QRScanner";
import { getLocationDetails } from "@/dashboard/infrastructure/supabase/queries";

type FlowStep = "list" | "scanning" | "checkin";

interface SelectedLocation {
  id: string;
  name: string;
  assignmentId: string;
  nfcTagId?: string;
}

function StaffDashboardContent() {
  const { user } = useAuth();
  const [flowStep, setFlowStep] = useState<FlowStep>("list");
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const handleSelectLocation = async (
    locationId: string,
    locationName: string,
    assignmentId: string
  ) => {
    setIsLoadingLocation(true);

    // Obtener detalles de la ubicación incluyendo el código QR esperado
    const result = await getLocationDetails(locationId);

    if (result.success && result.data) {
      setSelectedLocation({
        id: locationId,
        name: locationName,
        assignmentId,
        nfcTagId: result.data.nfcTagId,
      });
      setFlowStep("scanning");
    } else {
      // Si no se puede obtener el código QR, ir directo al checkin
      setSelectedLocation({
        id: locationId,
        name: locationName,
        assignmentId,
      });
      setFlowStep("checkin");
    }

    setIsLoadingLocation(false);
  };

  const handleQRSuccess = () => {
    setFlowStep("checkin");
  };

  const handleQRCancel = () => {
    setSelectedLocation(null);
    setFlowStep("list");
  };

  const handleCheckinSuccess = () => {
    setSelectedLocation(null);
    setFlowStep("list");
    // La página mostrará el progreso actualizado
  };

  const handleCheckinCancel = () => {
    setSelectedLocation(null);
    setFlowStep("list");
  };

  // Mostrar loading mientras carga detalles de ubicación
  if (isLoadingLocation) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-secondary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            border: "3px solid var(--border-color)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        />
        <style jsx>{`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Paso 2: Escanear QR
  if (flowStep === "scanning" && selectedLocation?.nfcTagId) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-secondary)",
          padding: "40px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <QRScanner
          expectedCode={selectedLocation.nfcTagId}
          locationName={selectedLocation.name}
          onSuccess={handleQRSuccess}
          onCancel={handleQRCancel}
        />
      </div>
    );
  }

  // Paso 3: Formulario de check-in
  if (flowStep === "checkin" && selectedLocation && user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg-secondary)",
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

  // Paso 1: Lista de checkpoints
  return <StaffProgress onSelectLocation={handleSelectLocation} />;
}

export default function StaffDashboardPage() {
  return (
    <AuthGuard requiredRole="staff">
      <StaffDashboardContent />
    </AuthGuard>
  );
}
