"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    // Mock login - en producción usar Supabase Auth
    await new Promise((r) => setTimeout(r, 1000));
    
    if (email && password) {
      // Redirigir basado en email (mock)
      if (email.includes("admin")) {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard/staff");
      }
    } else {
      setError("Por favor completa todos los campos");
    }
    
    setIsLoading(false);
  };

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
          padding: 24px;
          position: relative;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 30% 70%, rgba(16, 185, 129, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 70% 30%, rgba(139, 92, 246, 0.1) 0%, transparent 50%);
          pointer-events: none;
        }

        .login-card {
          position: relative;
          z-index: 1;
          background: rgba(30, 41, 59, 0.8);
          border: 1px solid #334155;
          border-radius: 20px;
          padding: 40px;
          width: 100%;
          max-width: 400px;
          backdrop-filter: blur(10px);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-logo {
          font-size: 48px;
          margin-bottom: 12px;
        }

        .login-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: #f1f5f9;
        }

        .login-subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 8px 0 0 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .form-input {
          width: 100%;
          padding: 14px 16px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 10px;
          color: #f1f5f9;
          font-family: inherit;
          font-size: 15px;
          transition: border-color 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #059669;
        }

        .form-input::placeholder {
          color: #475569;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 12px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 20px;
          text-align: center;
        }

        .submit-btn {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(5, 150, 105, 0.3);
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
          to { transform: rotate(360deg); }
        }

        .demo-hint {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #334155;
          text-align: center;
        }

        .demo-hint p {
          font-size: 12px;
          color: #64748b;
          margin: 0 0 12px 0;
        }

        .demo-accounts {
          display: flex;
          gap: 12px;
          justify-content: center;
        }

        .demo-btn {
          padding: 8px 16px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 8px;
          color: #a855f7;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .demo-btn:hover {
          background: rgba(139, 92, 246, 0.2);
        }
      `}</style>

      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">🛡️</div>
          <h1 className="login-title">NightGuard</h1>
          <p className="login-subtitle">Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-input"
              placeholder="correo@hotel.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading-spinner" />
                <span>Ingresando...</span>
              </>
            ) : (
              <span>Ingresar</span>
            )}
          </button>
        </form>

        <div className="demo-hint">
          <p>Cuentas de demostración:</p>
          <div className="demo-accounts">
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setEmail("staff@hotel.com");
                setPassword("demo123");
              }}
            >
              👤 Staff
            </button>
            <button
              type="button"
              className="demo-btn"
              onClick={() => {
                setEmail("admin@hotel.com");
                setPassword("demo123");
              }}
            >
              👁️ Admin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

