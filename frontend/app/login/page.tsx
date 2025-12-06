"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldIcon } from "@/shared/ui/icons";

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
      setError("Please fill in all fields");
    }

    setIsLoading(false);
  };

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
            <ShieldIcon />
          </div>
          <h1 className="login-title">CyberSec Control</h1>
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
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
          <p>Demo accounts available:</p>
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
