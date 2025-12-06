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
          padding: 32px;
          width: 100%;
          max-width: 480px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.08);
        }
        .register-header { text-align: center; margin-bottom: 20px; }
        .register-logo {
          width: 64px; height: 64px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px;
          color: white;
        }
        .register-logo :global(svg) { width: 32px; height: 32px; }
        .register-title { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 6px 0; }
        .register-subtitle { font-size: 13px; color: #64748b; margin: 0; }
        .role-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          border: 1px solid #bfdbfe;
          border-radius: 8px;
          padding: 10px 16px;
          margin-bottom: 20px;
          font-size: 13px;
          font-weight: 600;
          color: #1e40af;
        }
        .role-icon { font-size: 16px; }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .form-group { margin-bottom: 14px; }
        .form-label { display: block; font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px; }
        .form-input {
          width: 100%; padding: 12px 14px;
          background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px;
          color: #0f172a; font-family: inherit; font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus { outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .form-input::placeholder { color: #94a3b8; }
        .password-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        .error-message {
          background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px; padding: 10px 14px; color: #dc2626;
          font-size: 13px; margin-bottom: 14px; text-align: center;
        }
        .submit-btn {
          width: 100%; padding: 12px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border: none; border-radius: 10px; color: white;
          font-family: inherit; font-size: 14px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.3); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .loading-spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white; border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .info-box {
          margin-top: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 14px 16px;
        }
        .info-box p {
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          margin: 0 0 10px 0;
        }
        .info-box ul {
          margin: 0;
          padding: 0;
          list-style: none;
        }
        .info-box li {
          font-size: 12px;
          color: #64748b;
          padding: 4px 0;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .login-link {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e2e8f0;
          text-align: center;
        }
        .login-link p {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }
        .login-link a {
          color: #3b82f6;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }
        .login-link a:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }
      `}</style>

      <div className="register-card">
        <div className="register-header">
          <div className="register-logo"><GuardIcon /></div>
          <h1 className="register-title">Registro de Botones</h1>
          <p className="register-subtitle">Únete al equipo de seguridad NightGuard</p>
        </div>

        <div className="role-badge">
          <span className="role-icon">🛡️</span>
          <span>Personal de Rondas</span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Juan Pérez"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                disabled={isSubmitting} 
                autoComplete="name" 
              />
            </div>

            <div className="form-group">
              <label className="form-label">ID de Empleado</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="EMP-001"
                value={employeeId} 
                onChange={(e) => setEmployeeId(e.target.value)}
                disabled={isSubmitting} 
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Correo Electrónico</label>
            <input 
              type="email" 
              className="form-input" 
              placeholder="tu@empresa.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting} 
              autoComplete="email" 
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
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
                placeholder="Confirmar"
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
                <span>Registrando...</span>
              </>
            ) : (
              <>
                <UserIcon />
                <span>Crear Cuenta</span>
              </>
            )}
          </button>

          <div className="info-box">
            <p><strong>Como Botón podrás:</strong></p>
            <ul>
              <li>📍 Registrar check-ins en puntos de ronda</li>
              <li>📸 Subir fotos de inspección</li>
              <li>⚠️ Reportar incidentes con evidencia</li>
              <li>📊 Ver tu progreso diario</li>
            </ul>
          </div>
        </form>

        <div className="login-link">
          <p>
            ¿Ya tienes cuenta?{" "}
            <Link href="/login">Iniciar Sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

