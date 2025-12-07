"use client";

import { useState } from "react";
import { AuthGuard, useAuth } from "@/shared/infrastructure/auth";
import { StaffNavbar } from "@/shared/ui/StaffNavbar";
import { StaffProgress } from "@/dashboard/ui/StaffProgress";
import { CheckpointForm } from "@/rounds_execution/ui/CheckpointForm";
import StaffTasksDashboard from "@/tasks/ui/StaffTasksDashboard";

function StaffDashboardInner() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"tasks" | "rounds">("tasks");
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

  // Vista de CheckpointForm con botón de regresar
  if (selectedLocation && user) {
    return (
      <div className="checkin-view">
        <style jsx>{`
          .checkin-view {
            min-height: 100vh;
            background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
          }
          .back-header {
            padding: 16px 20px;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .back-btn {
            padding: 10px 16px;
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
            transition: all 0.2s;
          }
          .back-btn:hover {
            background: rgba(255, 255, 255, 0.15);
          }
          .location-title {
            color: white;
            font-size: 16px;
            font-weight: 600;
          }
          .form-container {
            padding: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}</style>
        
        <div className="back-header">
          <button className="back-btn" onClick={handleCheckinCancel}>
            ← Regresar
          </button>
          <span className="location-title">{selectedLocation.name}</span>
        </div>
        
        <div className="form-container">
          <CheckpointForm
            locationId={selectedLocation.id}
            locationName={selectedLocation.name}
            assignmentId={selectedLocation.assignmentId}
            userId={user.id}
            onSuccess={handleCheckinSuccess}
            onCancel={handleCheckinCancel}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="staff-dashboard">
      <style jsx>{`
        .staff-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
        }
        .content-area {
          padding-bottom: 20px;
        }
      `}</style>

      <StaffNavbar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="content-area">
        {activeTab === "tasks" && <StaffTasksDashboard />}
        {activeTab === "rounds" && <StaffProgress onSelectLocation={handleSelectLocation} />}
      </div>
    </div>
  );
}

export default function StaffDashboardContent() {
  return (
    <AuthGuard requiredRole="staff">
      <StaffDashboardInner />
    </AuthGuard>
  );
}

