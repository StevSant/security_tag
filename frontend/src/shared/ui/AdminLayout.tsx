"use client";

import { AdminNavbar } from "./AdminNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="admin-layout">
      <style jsx>{`
        .admin-layout {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
        }

        .admin-content {
          padding: 24px;
          max-width: 1400px;
          margin: 0 auto;
        }

        @media (max-width: 768px) {
          .admin-content {
            padding: 16px;
          }
        }
      `}</style>

      <AdminNavbar />
      <main className="admin-content">
        {children}
      </main>
    </div>
  );
}

