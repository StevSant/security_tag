"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/shared/infrastructure/auth";
import { ShieldIcon, ActivityIcon, UsersIcon, CheckCircleIcon } from "@/shared/ui/icons";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, isLoading, role } = useAuth();

  // Redirigir automáticamente si el usuario está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/staff");
      }
    }
  }, [isAuthenticated, isLoading, role, router]);

  // Mostrar loading mientras verifica
  if (isLoading) {
    return (
      <div className="loading-page">
        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #e2e8f0;
            border-top-color: #10b981;
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

  // Si está autenticado, mostrar loading mientras redirige
  if (isAuthenticated) {
    return (
      <div className="loading-page">
        <style jsx>{`
          .loading-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid #e2e8f0;
            border-top-color: #10b981;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          .loading-text {
            color: #64748b;
            font-size: 14px;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="spinner" />
        <p className="loading-text">Redirigiendo al dashboard...</p>
      </div>
    );
  }

  return (
    <div className="landing">
      <style jsx>{`
        .landing {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
        }

        .landing::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
              circle at 20% 80%,
              rgba(16, 185, 129, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(16, 185, 129, 0.08) 0%,
              transparent 50%
            );
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 700px;
        }

        .logo-container {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 24px;
          color: white;
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.25);
        }

        .logo-container :global(svg) {
          width: 48px;
          height: 48px;
        }

        .title {
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 16px 0;
          color: #0f172a;
          line-height: 1.1;
        }

        .title-accent {
          color: #10b981;
        }

        .subtitle {
          font-size: 18px;
          color: #64748b;
          margin: 0 0 48px 0;
          line-height: 1.6;
        }

        .cta-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: center;
        }

        .cta-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 16px 32px;
          border-radius: 12px;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.2s ease;
          cursor: pointer;
          min-width: 260px;
        }

        .cta-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.25);
        }

        .cta-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(16, 185, 129, 0.35);
        }

        .cta-secondary {
          background: white;
          color: #0f172a;
          border: 1px solid #e2e8f0;
        }

        .cta-secondary:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 80px;
          text-align: center;
        }

        .feature {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 28px 24px;
          transition: all 0.2s ease;
        }

        .feature:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.1);
          border-color: #10b981;
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 16px;
          color: #10b981;
        }

        .feature-icon :global(svg) {
          width: 24px;
          height: 24px;
        }

        .feature-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #0f172a;
        }

        .feature-desc {
          font-size: 14px;
          color: #64748b;
          margin: 0;
          line-height: 1.5;
        }

        @media (max-width: 768px) {
          .title {
            font-size: 36px;
          }
          .subtitle {
            font-size: 16px;
          }
          .features {
            grid-template-columns: 1fr;
            margin-top: 60px;
          }
          .logo-container {
            width: 64px;
            height: 64px;
          }
          .logo-container :global(svg) {
            width: 36px;
            height: 36px;
          }
        }
      `}</style>

      <div className="content">
        <div className="logo-container">
          <ShieldIcon />
        </div>
        <h1 className="title">
          <span className="title-accent">Night</span>Guard
        </h1>
        <p className="subtitle">
          Sistema de auditoría hotelera con check-ins NFC, gestión de rondas y 
          monitoreo en tiempo real del personal de seguridad.
        </p>

        <div className="cta-group">
          <Link href="/login" className="cta-button cta-primary">
            <span>🔐 Iniciar Sesión</span>
          </Link>
          <Link href="/register" className="cta-button cta-secondary">
            <span>📝 Registrarse como Botón</span>
          </Link>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">
              <ActivityIcon />
            </div>
            <h3 className="feature-title">Rondas NFC</h3>
            <p className="feature-desc">
              Check-in en puntos con escaneo NFC y evidencia fotográfica obligatoria
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <CheckCircleIcon />
            </div>
            <h3 className="feature-title">Reporte de Incidencias</h3>
            <p className="feature-desc">
              Documenta daños con fotos y descripciones detalladas en tiempo real
            </p>
          </div>
          <div className="feature">
            <div className="feature-icon">
              <UsersIcon />
            </div>
            <h3 className="feature-title">Dashboard Admin</h3>
            <p className="feature-desc">
              Métricas de cumplimiento, ranking de botones y alertas de incidencias
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
