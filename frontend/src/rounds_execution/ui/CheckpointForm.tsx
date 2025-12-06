"use client";

import { useState, useRef } from "react";
import { submitCheckin } from "../application/submit-checkin.usecase";
import { CheckCircleIcon, AlertTriangleIcon } from "@/shared/ui/icons";

interface CheckpointFormProps {
  locationId: string;
  locationName: string;
  assignmentId: string;
  userId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type SubmitStatus = "idle" | "uploading" | "success" | "error";

export function CheckpointForm({
  locationId,
  locationName,
  assignmentId,
  userId,
  onSuccess,
  onCancel,
}: CheckpointFormProps) {
  // Estados del formulario
  const [hasIncident, setHasIncident] = useState(false);
  const [proofPhoto, setProofPhoto] = useState<string | null>(null);
  const [damagePhoto, setDamagePhoto] = useState<string | null>(null);
  const [damageDescription, setDamageDescription] = useState("");
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>("idle");
  const [errors, setErrors] = useState<string[]>([]);

  // Referencias para inputs de cámara
  const proofInputRef = useRef<HTMLInputElement>(null);
  const damageInputRef = useRef<HTMLInputElement>(null);

  // Manejar captura de foto
  const handlePhotoCapture = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "proof" | "damage"
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUri = reader.result as string;
      if (type === "proof") {
        setProofPhoto(dataUri);
      } else {
        setDamagePhoto(dataUri);
      }
    };
    reader.readAsDataURL(file);
  };

  // Validar formulario
  const validateForm = (): string[] => {
    const formErrors: string[] = [];

    if (!proofPhoto) {
      formErrors.push("La foto de inspección es obligatoria");
    }

    if (hasIncident) {
      if (!damagePhoto) {
        formErrors.push("La foto del daño es obligatoria al reportar una incidencia");
      }
      if (!damageDescription.trim()) {
        formErrors.push("La descripción del daño es obligatoria al reportar una incidencia");
      }
    }

    return formErrors;
  };

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formErrors = validateForm();
    if (formErrors.length > 0) {
      setErrors(formErrors);
      return;
    }

    setSubmitStatus("uploading");
    setErrors([]);

    const result = await submitCheckin({
      locationId,
      assignmentId,
      userId,
      proofPhotoUri: proofPhoto!,
      hasIncident,
      damagePhotoUri: hasIncident ? damagePhoto! : undefined,
      damageDescription: hasIncident ? damageDescription : undefined,
      nfcScanVerified: true,
    });

    if (result.success) {
      setSubmitStatus("success");
      onSuccess?.();
    } else {
      setSubmitStatus("error");
      setErrors(result.errors || ["Ocurrió un error inesperado"]);
    }
  };

  // Reset del formulario
  const handleReset = () => {
    setHasIncident(false);
    setProofPhoto(null);
    setDamagePhoto(null);
    setDamageDescription("");
    setSubmitStatus("idle");
    setErrors([]);
  };

  const isSubmitting = submitStatus === "uploading";

  return (
    <div className="checkpoint-form">
      <style jsx>{`
        .checkpoint-form {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 32px;
          max-width: 480px;
          margin: 0 auto;
          box-shadow: var(--shadow-lg);
        }

        .form-header {
          text-align: center;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
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
          margin-bottom: 16px;
        }

        .location-name {
          color: var(--text-primary);
          font-size: 22px;
          font-weight: 700;
          margin: 0;
        }

        .photo-section {
          margin-bottom: 24px;
        }

        .section-label {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 12px;
        }

        .required-badge {
          background: var(--color-danger);
          color: white;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
        }

        .photo-capture-btn {
          width: 100%;
          aspect-ratio: 4/3;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: var(--bg-secondary);
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          color: var(--text-muted);
        }

        .photo-capture-btn:hover {
          border-color: var(--color-primary);
          background: var(--bg-hover);
        }

        .photo-capture-btn.has-photo {
          border-style: solid;
          border-color: var(--color-primary);
          padding: 0;
          overflow: hidden;
        }

        .photo-capture-btn img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .camera-icon {
          font-size: 48px;
        }

        .camera-text {
          font-size: 14px;
          font-weight: 500;
        }

        .hidden-input {
          display: none;
        }

        .incident-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px 20px;
          margin-bottom: 24px;
        }

        .incident-label {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .incident-icon {
          width: 24px;
          height: 24px;
          color: var(--color-warning);
        }

        .incident-icon :global(svg) {
          width: 100%;
          height: 100%;
        }

        .switch {
          position: relative;
          width: 52px;
          height: 28px;
          background: var(--border-color);
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.2s;
        }

        .switch.active {
          background: var(--color-danger);
        }

        .switch::after {
          content: "";
          position: absolute;
          top: 2px;
          left: 2px;
          width: 24px;
          height: 24px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
          box-shadow: var(--shadow-sm);
        }

        .switch.active::after {
          transform: translateX(24px);
        }

        .damage-section {
          animation: slideDown 0.3s ease;
          background: rgba(239, 68, 68, 0.05);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .damage-title {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--color-danger);
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .damage-textarea {
          width: 100%;
          min-height: 100px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 12px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
          resize: vertical;
          margin-top: 16px;
        }

        .damage-textarea:focus {
          outline: none;
          border-color: var(--color-danger);
        }

        .damage-textarea::placeholder {
          color: var(--text-muted);
        }

        .errors-container {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 20px;
        }

        .error-item {
          color: var(--color-danger);
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 0;
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

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-hover);
        }

        .loading-spinner {
          display: inline-block;
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 0.8s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .success-message {
          text-align: center;
          padding: 48px 24px;
        }

        .success-icon {
          width: 72px;
          height: 72px;
          background: rgba(16, 185, 129, 0.1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          color: var(--color-success);
        }

        .success-icon :global(svg) {
          width: 36px;
          height: 36px;
        }

        .success-title {
          color: var(--color-success);
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 8px 0;
        }

        .success-subtitle {
          color: var(--text-muted);
          font-size: 14px;
          margin: 0;
        }
      `}</style>

      {submitStatus === "success" ? (
        <div className="success-message">
          <div className="success-icon">
            <CheckCircleIcon />
          </div>
          <h3 className="success-title">¡Check-in Completado!</h3>
          <p className="success-subtitle">{locationName} registrado correctamente</p>
          <button
            className="btn btn-primary"
            onClick={handleReset}
            style={{ marginTop: 24, width: "100%" }}
          >
            Siguiente Checkpoint
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <div className="form-header">
            <div className="location-badge">
              <span>📍</span>
              <span>Checkpoint</span>
            </div>
            <h2 className="location-name">{locationName}</h2>
          </div>

          {/* Foto de Inspección (obligatoria) */}
          <div className="photo-section">
            <div className="section-label">
              <span>📸 Foto de Inspección</span>
              <span className="required-badge">Obligatorio</span>
            </div>
            <input
              ref={proofInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden-input"
              onChange={(e) => handlePhotoCapture(e, "proof")}
              disabled={isSubmitting}
            />
            <button
              type="button"
              className={`photo-capture-btn ${proofPhoto ? "has-photo" : ""}`}
              onClick={() => proofInputRef.current?.click()}
              disabled={isSubmitting}
            >
              {proofPhoto ? (
                <img src={proofPhoto} alt="Foto de inspección" />
              ) : (
                <>
                  <span className="camera-icon">📷</span>
                  <span className="camera-text">Tomar foto de inspección</span>
                </>
              )}
            </button>
          </div>

          {/* Toggle de Incidencia */}
          <div className="incident-toggle">
            <div className="incident-label">
              <div className="incident-icon">
                <AlertTriangleIcon />
              </div>
              <span>Reportar Incidencia</span>
            </div>
            <div
              className={`switch ${hasIncident ? "active" : ""}`}
              onClick={() => !isSubmitting && setHasIncident(!hasIncident)}
              role="switch"
              aria-checked={hasIncident}
            />
          </div>

          {/* Sección de Daño (condicional) */}
          {hasIncident && (
            <div className="damage-section">
              <div className="damage-title">
                <span>🚨</span>
                <span>Evidencia de Incidencia</span>
              </div>

              {/* Foto de Daño */}
              <div className="section-label">
                <span>📸 Foto del Daño</span>
                <span className="required-badge">Obligatorio</span>
              </div>
              <input
                ref={damageInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden-input"
                onChange={(e) => handlePhotoCapture(e, "damage")}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className={`photo-capture-btn ${damagePhoto ? "has-photo" : ""}`}
                onClick={() => damageInputRef.current?.click()}
                disabled={isSubmitting}
                style={{ aspectRatio: "16/9" }}
              >
                {damagePhoto ? (
                  <img src={damagePhoto} alt="Foto del daño" />
                ) : (
                  <>
                    <span className="camera-icon">🔍</span>
                    <span className="camera-text">Fotografiar el daño</span>
                  </>
                )}
              </button>

              {/* Descripción del Daño */}
              <textarea
                className="damage-textarea"
                placeholder="Describe el daño o incidencia encontrada..."
                value={damageDescription}
                onChange={(e) => setDamageDescription(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Errores */}
          {errors.length > 0 && (
            <div className="errors-container">
              {errors.map((error, i) => (
                <div key={i} className="error-item">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              ))}
            </div>
          )}

          {/* Botones */}
          <div className="buttons-container">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || !proofPhoto}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner" />
                  Enviando...
                </>
              ) : (
                "Confirmar Check-in"
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
