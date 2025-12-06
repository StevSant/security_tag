"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/shared/infrastructure/auth";
import { ShieldIcon } from "@/shared/ui/icons";

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
      setError("Please fill in all fields");
      setIsSubmitting(false);
      return;
    }

    const result = await signIn(email, password);
    
    if (result.error) {
      setError(translateError(result.error));
      setIsSubmitting(false);
    }
    // La redirección se maneja en el useEffect
  };

  // Traducir errores de Supabase
  const translateError = (error: string): string => {
    const errorMap: Record<string, string> = {
      "Invalid login credentials": "Invalid credentials",
      "Email not confirmed": "Email not confirmed",
      "User not found": "User not found",
      "Too many requests": "Too many attempts. Please wait.",
    };
    return errorMap[error] || error;
  };

  // Mostrar loading mientras verifica sesión
  if (isLoading) {
    return (
      <div className="login-page">
        <style jsx>{`
          .login-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .spinner {
            width: 48px;
            height: 48px;
            border: 3px solid var(--border-color, #e2e8f0);
            border-top-color: var(--color-primary, #10b981);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
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
          background: linear-gradient(
            135deg,
            #f0fdf4 0%,
            #ecfdf5 50%,
            #f0fdfa 100%
          );
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
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 48px 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }

        .login-header {
          text-align: center;
          margin-bottom: 40px;
        }

        .login-logo {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
          color: #0f172a;
          margin: 0 0 8px 0;
        }

        .login-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #475569;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          color: #0f172a;
          font-family: inherit;
          font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }

        .form-input::placeholder {
          color: #94a3b8;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 12px 16px;
          color: #dc2626;
          font-size: 13px;
          margin-bottom: 20px;
          text-align: center;
        }

        .submit-btn {
          width: 100%;
          padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }

        .demo-hint p {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 16px 0;
        }

        .demo-accounts {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .demo-btn {
          padding: 10px 20px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          color: #475569;
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
          background: #f1f5f9;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .demo-icon {
          font-size: 16px;
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <ShieldIcon />
          </div>
          <h1 className="login-title">NightGuard</h1>
          <p className="login-subtitle">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
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
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="demo-hint">
          <p>Demo accounts (create in Supabase Dashboard):</p>
          <div className="demo-accounts">
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setEmail("staff@company.com");
                setPassword("demo123");
              }}
            >
              <span className="demo-icon">👤</span>
              <span>Staff</span>
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setEmail("admin@company.com");
                setPassword("demo123");
              }}
            >
              <span className="demo-icon">🛡️</span>
              <span>Admin</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
