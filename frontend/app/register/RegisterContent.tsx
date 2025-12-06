"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/shared/infrastructure/auth";
import { UserIcon, CheckCircleIcon } from "@/shared/ui/icons";

// Icono de Botón/Guardia
const GuardIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

export default function RegisterContent() {
  const router = useRouter();
  const { signUp, isAuthenticated, role, isLoading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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

    // Validaciones
    if (!fullName || !employeeId || !email || !password || !confirmPassword) {
      setError("Por favor completa todos los campos");
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsSubmitting(false);
      return;
    }

    const result = await signUp(email, password, fullName, employeeId);

    if (result.error) {
      setError(translateError(result.error));
      setIsSubmitting(false);
    } else if (result.needsConfirmation) {
      setSuccess(true);
      setIsSubmitting(false);
    } else {
      // Registro exitoso sin confirmación requerida
      router.push("/dashboard/staff");
    }
  };

  const translateError = (error: string): string => {
    const errorMap: Record<string, string> = {
      "User already registered": "Este correo ya está registrado",
      "Invalid email": "Por favor ingresa un correo válido",
      "Password should be at least 6 characters": "La contraseña debe tener al menos 6 caracteres",
      "Signup requires a valid password": "Por favor ingresa una contraseña válida",
      "Unable to validate email address: invalid format": "Por favor ingresa un correo válido",
    };
    return errorMap[error] || error;
  };

  if (isLoading) {
    return (
      <div className="register-page">
        <style jsx>{`
          .register-page {
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

  if (success) {
    return (
      <div className="register-page">
        <style jsx>{`
          .register-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            position: relative;
          }
          .register-page::before {
            content: "";
            position: absolute;
            top: 0; left: 0; right: 0; bottom: 0;
            background: radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.06) 0%, transparent 50%);
            pointer-events: none;
          }
          .success-card {
            position: relative;
            z-index: 1;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
            padding: 48px 40px;
            width: 100%;
            max-width: 420px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
            text-align: center;
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
            color: white;
          }
          .success-icon :global(svg) { width: 40px; height: 40px; }
          .success-title {
            font-size: 24px;
            font-weight: 700;
            color: #0f172a;
            margin: 0 0 12px 0;
          }
          .success-message {
            font-size: 15px;
            color: #64748b;
            margin: 0 0 32px 0;
            line-height: 1.6;
          }
          .success-email {
            font-weight: 600;
            color: #10b981;
          }
          .back-link {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            padding: 14px 28px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            border-radius: 10px;
            color: white;
            font-size: 15px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.2s;
          }
          .back-link:hover {
            transform: translateY(-1px);
            box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
          }
        `}</style>
        <div className="success-card">
          <div className="success-icon">
            <CheckCircleIcon />
          </div>
          <h1 className="success-title">¡Revisa tu Correo!</h1>
          <p className="success-message">
            Hemos enviado un enlace de confirmación a<br />
            <span className="success-email">{email}</span><br /><br />
            Revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
          </p>
          <Link href="/login" className="back-link">
            Volver al Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <style jsx>{`
        .register-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdfa 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
        }
        .register-page::before {
          content: "";
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(16, 185, 129, 0.06) 0%, transparent 50%);
          pointer-events: none;
        }
        .register-card {
          position: relative;
          z-index: 1;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 40px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }
        .register-header { text-align: center; margin-bottom: 32px; }
        .register-logo {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
          color: white;
        }
        .register-logo :global(svg) { width: 36px; height: 36px; }
        .register-title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; }
        .register-subtitle { font-size: 14px; color: #64748b; margin: 0; }
        .form-group { margin-bottom: 18px; }
        .form-label { display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px; }
        .form-input {
          width: 100%; padding: 14px 16px;
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
          color: #0f172a; font-family: inherit; font-size: 15px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus { outline: none; border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1); }
        .form-input::placeholder { color: #94a3b8; }
        .password-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px; padding: 12px 16px; color: #dc2626;
          font-size: 13px; margin-bottom: 18px; text-align: center;
        }
        .submit-btn {
          width: 100%; padding: 14px;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border: none; border-radius: 10px; color: white;
          font-family: inherit; font-size: 15px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .loading-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .login-link {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }
        .login-link p {
          font-size: 14px;
          color: #64748b;
          margin: 0;
        }
        .login-link a {
          color: #10b981;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .login-link a:hover {
          color: #059669;
          text-decoration: underline;
        }
        .terms {
          font-size: 12px;
          color: #94a3b8;
          text-align: center;
          margin-top: 16px;
          line-height: 1.5;
        }
        .terms a {
          color: #64748b;
          text-decoration: underline;
        }
      `}</style>

      <div className="register-card">
        <div className="register-header">
          <div className="register-logo"><ShieldIcon /></div>
          <h1 className="register-title">Create Account</h1>
          <p className="register-subtitle">Join NightGuard security team</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="John Doe"
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)}
              disabled={isSubmitting} 
              autoComplete="name" 
            />
          </div>

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
            <div className="password-row">
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting} 
                autoComplete="new-password" 
              />
              <input 
                type="password" 
                className="form-input" 
                placeholder="Confirm"
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting} 
                autoComplete="new-password" 
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="submit-btn" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className="loading-spinner" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <UserIcon />
                <span>Create Account</span>
              </>
            )}
          </button>

          <p className="terms">
            By creating an account, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>
          </p>
        </form>

        <div className="login-link">
          <p>
            Already have an account?{" "}
            <Link href="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

