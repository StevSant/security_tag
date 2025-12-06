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
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    // No autenticado -> login
    if (!isAuthenticated) {
      router.replace(fallbackUrl);
      return;
    }

    // Verificar rol si es requerido
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
  }, [isAuthenticated, isLoading, role, requiredRole, router, fallbackUrl]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="auth-loading">
        <style jsx>{`
          .auth-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #0a0a0f 0%, #0f172a 100%);
            color: #f1f5f9;
            font-family: 'JetBrains Mono', monospace;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #334155;
            border-top-color: #059669;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="spinner" />
        <p>Verificando sesión...</p>
      </div>
    );
  }

  // No mostrar contenido si no está autenticado o no tiene el rol correcto
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && role !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
