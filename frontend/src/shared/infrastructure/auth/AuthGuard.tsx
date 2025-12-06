"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, type UserRole } from "./AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallbackUrl?: string;
}

export function AuthGuard({
  children,
  requiredRole,
  fallbackUrl = "/login",
}: AuthGuardProps) {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // No autenticado -> redirigir a login
    if (!user) {
      router.replace(fallbackUrl);
      return;
    }

    // Rol requerido pero no coincide
    if (requiredRole && role !== requiredRole) {
      // Staff intentando acceder a admin -> redirigir a su dashboard
      if (role === "staff") {
        router.replace("/dashboard/staff");
      } else if (role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace(fallbackUrl);
      }
    }
  }, [user, role, loading, requiredRole, fallbackUrl, router]);

  // Mostrar loading mientras verifica
  if (loading) {
    return (
      <div className="auth-loading">
        <style jsx>{`
          .auth-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0a0a0f 0%, #0f172a 100%);
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #334155;
            border-top-color: #059669;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="spinner" />
      </div>
    );
  }

  // No autorizado -> no renderizar nada (ya redirigiendo)
  if (!user) {
    return null;
  }

  // Rol requerido y no coincide -> no renderizar
  if (requiredRole && role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}

