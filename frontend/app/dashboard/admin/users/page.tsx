"use client";

import dynamic from "next/dynamic";

const UsersPageContent = dynamic(
  () => import("./UsersPageContent"),
  { 
    ssr: false,
    loading: () => (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a0f 0%, #12121a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        <div style={{
          width: 48,
          height: 48,
          border: "3px solid #334155",
          borderTopColor: "#8b5cf6",
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

export default function UsersPage() {
  return <UsersPageContent />;
}
