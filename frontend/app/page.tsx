import Link from "next/link";

export default function Home() {
  return (
    <div className="landing">
      <style jsx>{`
        .landing {
          font-family: var(--font-mono), 'JetBrains Mono', monospace;
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #0f172a 50%, #1e1b4b 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          color: #f1f5f9;
          position: relative;
          overflow: hidden;
        }

        .landing::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.15) 0%, transparent 50%);
          pointer-events: none;
        }

        .content {
          position: relative;
          z-index: 1;
          text-align: center;
          max-width: 600px;
        }

        .logo {
          font-size: 72px;
          margin-bottom: 16px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .title {
          font-size: 48px;
          font-weight: 800;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #10b981 0%, #059669 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 18px;
          color: #94a3b8;
          margin: 0 0 48px 0;
          line-height: 1.6;
        }

        .cta-group {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .cta-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px 32px;
          border-radius: 12px;
          font-family: inherit;
          font-size: 16px;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .cta-primary {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
          border: none;
          box-shadow: 0 10px 40px rgba(5, 150, 105, 0.3);
        }

        .cta-primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 50px rgba(5, 150, 105, 0.4);
        }

        .cta-secondary {
          background: rgba(139, 92, 246, 0.1);
          color: #a855f7;
          border: 1px solid rgba(139, 92, 246, 0.3);
        }

        .cta-secondary:hover {
          background: rgba(139, 92, 246, 0.2);
          border-color: rgba(139, 92, 246, 0.5);
        }

        .features {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
          margin-top: 80px;
          text-align: center;
        }

        .feature {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.3s ease;
        }

        .feature:hover {
          border-color: #059669;
          transform: translateY(-5px);
        }

        .feature-icon {
          font-size: 36px;
          margin-bottom: 12px;
        }

        .feature-title {
          font-size: 16px;
          font-weight: 600;
          margin: 0 0 8px 0;
        }

        .feature-desc {
          font-size: 13px;
          color: #64748b;
          margin: 0;
        }

        .install-hint {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(15, 23, 42, 0.9);
          border: 1px solid #334155;
          border-radius: 30px;
          padding: 12px 24px;
          font-size: 13px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 600px) {
          .title { font-size: 36px; }
          .subtitle { font-size: 16px; }
          .features { grid-template-columns: 1fr; }
          .logo { font-size: 56px; }
        }
      `}</style>

      <div className="content">
        <div className="logo">🛡️</div>
        <h1 className="title">NightGuard</h1>
        <p className="subtitle">
          Sistema inteligente de auditoría nocturna para hoteles. 
          Check-ins NFC, evidencia fotográfica y reportes en tiempo real.
        </p>

        <div className="cta-group">
          <Link href="/dashboard/staff" className="cta-button cta-primary">
            <span>👤</span>
            <span>Acceso Staff</span>
          </Link>
          <Link href="/dashboard/admin" className="cta-button cta-secondary">
            <span>👁️</span>
            <span>Panel Administrador</span>
          </Link>
        </div>

        <div className="features">
          <div className="feature">
            <div className="feature-icon">📱</div>
            <h3 className="feature-title">NFC Integrado</h3>
            <p className="feature-desc">Verificación de presencia con tags NFC</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📸</div>
            <h3 className="feature-title">Evidencia Visual</h3>
            <p className="feature-desc">Fotos obligatorias de cada checkpoint</p>
          </div>
          <div className="feature">
            <div className="feature-icon">📊</div>
            <h3 className="feature-title">Dashboard Live</h3>
            <p className="feature-desc">Métricas y alertas en tiempo real</p>
          </div>
        </div>
      </div>

      <div className="install-hint">
        <span>💡</span>
        <span>Instala la app desde el menú de tu navegador</span>
      </div>
    </div>
  );
}
