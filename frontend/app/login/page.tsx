"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/infrastructure/auth";

// Hotel Icon Component
function HotelIcon({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16" />
      <path d="M1 21h22" />
      <path d="M9 7h1" />
      <path d="M9 11h1" />
      <path d="M9 15h1" />
      <path d="M14 7h1" />
      <path d="M14 11h1" />
      <path d="M14 15h1" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isAuthenticated, role, isLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      if (role === "admin") {
        router.replace("/dashboard/admin");
      } else {
        router.replace("/dashboard/staff");
      }
    }
  }, [isAuthenticated, isLoading, role, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!email || !password) {
      setError("Por favor completa todos los campos");
      setIsSubmitting(false);
      return;
    }

    // Autenticación real con Supabase
    const result = await signIn(email, password);

    if (result.error) {
      setError(translateError(result.error));
      setIsSubmitting(false);
    }
    // Si no hay error, el useEffect redirigirá automáticamente
  };

  // Traducir errores de Supabase
  const translateError = (error: string): string => {
    const errorMap: Record<string, string> = {
      "Invalid login credentials": "Credenciales incorrectas",
      "Email not confirmed": "Email no confirmado",
      "User not found": "Usuario no encontrado",
      "Too many requests": "Demasiados intentos. Espera un momento.",
    };
    return errorMap[error] || error;
  };

  // Mostrar loading mientras verifica sesión
  if (isLoading) {
    return (
      <div className="login-page">
        <style jsx>{`
          .login-page {
            font-family: 'JetBrains Mono', monospace;
            min-height: 100vh;
            background: linear-gradient(135deg, #0a0a0f 0%, #0f172a 50%, #1e1b4b 100%);
            display: flex;
            align-items: center;
            justify-content: center;
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

  return (
    <div className="login-page">
      <style jsx>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
        }

        .login-page::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: radial-gradient(
              circle at 20% 80%,
              rgba(16, 185, 129, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 20%,
              rgba(16, 185, 129, 0.06) 0%,
              transparent 50%
            );
          pointer-events: none;
        }

        .login-card {
          position: relative;
          z-index: 1;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: var(--shadow-lg);
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: white;
        }

        .login-logo :global(svg) {
          width: 36px;
          height: 36px;
        }

        .login-title {
          font-size: 24px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 8px 0;
        }

        .login-subtitle {
          font-size: 14px;
          color: var(--text-muted);
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-input::placeholder {
          color: var(--text-muted);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          color: var(--color-danger);
          font-size: 13px;
          margin-bottom: 20px;
          text-align: center;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .demo-hint {
          margin-top: 32px;
          padding-top: 24px;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }

        .demo-hint p {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0 0 16px 0;
        }

        .demo-accounts {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .demo-btn {
          padding: 10px 20px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-secondary);
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .demo-btn:hover {
          background: var(--bg-hover);
          border-color: var(--border-hover);
          color: var(--text-primary);
        }

        .demo-icon {
          font-size: 16px;
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <HotelIcon />
          </div>
          <h1 className="login-title">HotelGuard</h1>
          <p className="login-subtitle">Sistema de Verificación de Rondas</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="tu@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading-spinner" />
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <span>Iniciar Sesión</span>
            )}
          </button>
        </form>

        <div className="demo-hint">
          <p>Cuentas de prueba disponibles:</p>
          <div className="demo-accounts">
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setEmail("boton@hotel.com");
                setPassword("demo123");
              }}
            >
              <span className="demo-icon">🛎️</span>
              <span>Botón</span>
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setEmail("admin@hotel.com");
                setPassword("demo123");
              }}
            >
              <span className="demo-icon">👔</span>
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
