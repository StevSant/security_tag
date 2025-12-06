"use client";

import dynamic from "next/dynamic";

const StaffDashboardContent = dynamic(
  () => import("./StaffDashboardContent"),
  { 
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: "3px solid #334155",
          borderTopColor: "#10b981",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }} />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }
);

export default function StaffDashboardPage() {
  return <StaffDashboardContent />;
}
