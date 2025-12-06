"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";

interface QRScannerProps {
  expectedCode: string; // El código NFC/QR esperado para validar
  locationName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

type ScanStatus = "scanning" | "success" | "error" | "initializing";

export function QRScanner({
  expectedCode,
  locationName,
  onSuccess,
  onCancel,
}: QRScannerProps) {
  const [status, setStatus] = useState<ScanStatus>("initializing");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [scannedCode, setScannedCode] = useState<string>("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    async function startScanner() {
      if (!containerRef.current) return;

      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1,
          },
          (decodedText) => {
            if (!mounted) return;

            setScannedCode(decodedText);

            // Validar que el código escaneado coincida con el esperado
            if (decodedText === expectedCode) {
              setStatus("success");
              // Detener el scanner después de éxito
              scanner.stop().catch(console.error);
            } else {
              setStatus("error");
              setErrorMessage(
                `Código incorrecto. Este QR no corresponde a "${locationName}".`
              );
              // Reiniciar escaneo después de mostrar error
              setTimeout(() => {
                if (mounted) {
                  setStatus("scanning");
                  setErrorMessage("");
                }
              }, 2000);
            }
          },
          () => {
            // Error de escaneo silencioso (normal cuando no hay QR visible)
          }
        );

        if (mounted) {
          setStatus("scanning");
        }
      } catch (err) {
        console.error("Error starting scanner:", err);
        if (mounted) {
          setStatus("error");
          setErrorMessage(
            "No se pudo acceder a la cámara. Por favor, permite el acceso."
          );
        }
      }
    }

    startScanner();

    return () => {
      mounted = false;
      if (scannerRef.current) {
        const scanner = scannerRef.current;
        if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
          scanner.stop().catch(console.error);
        }
      }
    };
  }, [expectedCode, locationName]);

  const handleContinue = () => {
    onSuccess();
  };

  const handleRetry = async () => {
    setStatus("initializing");
    setErrorMessage("");
    setScannedCode("");

    if (scannerRef.current) {
      try {
        const scanner = scannerRef.current;
        if (scanner.getState() !== Html5QrcodeScannerState.SCANNING) {
          await scanner.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
              aspectRatio: 1,
            },
            (decodedText) => {
              setScannedCode(decodedText);
              if (decodedText === expectedCode) {
                setStatus("success");
                scanner.stop().catch(console.error);
              } else {
                setStatus("error");
                setErrorMessage(
                  `Código incorrecto. Este QR no corresponde a "${locationName}".`
                );
              }
            },
            () => {}
          );
          setStatus("scanning");
        }
      } catch (err) {
        setStatus("error");
        setErrorMessage("Error al reiniciar la cámara.");
      }
    }
  };

  return (
    <div className="qr-scanner">
      <style jsx>{`
        .qr-scanner {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 32px;
          max-width: 400px;
          margin: 0 auto;
          box-shadow: var(--shadow-lg);
        }

        .scanner-header {
          text-align: center;
          margin-bottom: 24px;
        }

        .location-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-primary);
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 12px;
        }

        .scanner-title {
          color: var(--text-primary);
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .scanner-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin: 0;
        }

        .camera-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          background: #000;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 24px;
        }

        .camera-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .scan-frame {
          width: 200px;
          height: 200px;
          border: 3px solid var(--color-primary);
          border-radius: 16px;
          box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
        }

        .scan-corners {
          position: absolute;
          width: 200px;
          height: 200px;
        }

        .scan-corners::before,
        .scan-corners::after {
          content: "";
          position: absolute;
          width: 30px;
          height: 30px;
          border: 4px solid var(--color-primary);
        }

        .scan-corners::before {
          top: -3px;
          left: -3px;
          border-right: none;
          border-bottom: none;
          border-radius: 12px 0 0 0;
        }

        .scan-corners::after {
          top: -3px;
          right: -3px;
          border-left: none;
          border-bottom: none;
          border-radius: 0 12px 0 0;
        }

        .status-indicator {
          text-align: center;
          padding: 16px;
          border-radius: 12px;
          margin-bottom: 20px;
        }

        .status-scanning {
          background: rgba(59, 130, 246, 0.1);
          color: var(--color-info);
        }

        .status-success {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
        }

        .status-error {
          background: rgba(239, 68, 68, 0.1);
          color: var(--color-danger);
        }

        .status-icon {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .status-text {
          font-size: 14px;
          font-weight: 500;
          margin: 0;
        }

        .buttons-container {
          display: flex;
          gap: 12px;
        }

        .btn {
          flex: 1;
          padding: 14px 20px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(
            135deg,
            var(--color-primary) 0%,
            var(--color-primary-dark) 100%
          );
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-hover);
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px;
          color: var(--text-muted);
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 16px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        #qr-reader {
          width: 100%;
          height: 100%;
        }

        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover;
          border-radius: 12px;
        }

        /* Ocultar elementos del scanner por defecto */
        :global(#qr-reader__scan_region) {
          min-height: unset !important;
        }

        :global(#qr-reader__dashboard) {
          display: none !important;
        }
      `}</style>

      <div className="scanner-header">
        <div className="location-badge">
          <span>📍</span>
          <span>Verificar Ubicación</span>
        </div>
        <h2 className="scanner-title">{locationName}</h2>
        <p className="scanner-subtitle">Escanea el código QR del checkpoint</p>
      </div>

      <div className="camera-container" ref={containerRef}>
        <div id="qr-reader" />
        {status === "scanning" && (
          <div className="camera-overlay">
            <div className="scan-frame">
              <div className="scan-corners" />
            </div>
          </div>
        )}
      </div>

      {status === "initializing" && (
        <div className="loading-container">
          <div className="spinner" />
          <p>Iniciando cámara...</p>
        </div>
      )}

      {status === "scanning" && (
        <div className="status-indicator status-scanning">
          <div className="status-icon">📸</div>
          <p className="status-text">Apunta la cámara al código QR</p>
        </div>
      )}

      {status === "success" && (
        <div className="status-indicator status-success">
          <div className="status-icon">✅</div>
          <p className="status-text">¡Ubicación verificada correctamente!</p>
        </div>
      )}

      {status === "error" && (
        <div className="status-indicator status-error">
          <div className="status-icon">❌</div>
          <p className="status-text">{errorMessage}</p>
        </div>
      )}

      <div className="buttons-container">
        <button className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        {status === "success" ? (
          <button className="btn btn-primary" onClick={handleContinue}>
            Continuar
          </button>
        ) : status === "error" && errorMessage.includes("cámara") ? (
          <button className="btn btn-primary" onClick={handleRetry}>
            Reintentar
          </button>
        ) : null}
      </div>
    </div>
  );
}

