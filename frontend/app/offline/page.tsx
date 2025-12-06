export default function OfflinePage() {
  return (
    <div className="offline-page">
      <style jsx>{`
        .offline-page {
          font-family: 'JetBrains Mono', monospace;
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0f 0%, #0f172a 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 24px;
          text-align: center;
          color: #f1f5f9;
        }

        .icon {
          font-size: 72px;
          margin-bottom: 24px;
          opacity: 0.8;
        }

        .title {
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 12px 0;
          color: #94a3b8;
        }

        .message {
          font-size: 16px;
          color: #64748b;
          max-width: 400px;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .retry-btn {
          padding: 14px 28px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border: none;
          border-radius: 10px;
          color: white;
          font-family: inherit;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .retry-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(5, 150, 105, 0.3);
        }
      `}</style>

      <div className="icon">📡</div>
      <h1 className="title">Sin conexión</h1>
      <p className="message">
        No tienes conexión a internet. Los check-ins pendientes se sincronizarán
        automáticamente cuando vuelvas a estar en línea.
      </p>
      <button
        className="retry-btn"
        onClick={() => window.location.reload()}
      >
        Reintentar
      </button>
    </div>
  );
}

