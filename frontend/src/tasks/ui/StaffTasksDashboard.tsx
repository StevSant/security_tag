"use client";

import { useState, useEffect, useRef } from "react";
import {
  fetchMyTasks,
  updateTaskStatus,
  type StaffTask,
} from "../infrastructure/supabase/queries";
import { createClient } from "@/shared/infrastructure/supabase/client";

// Iconos
const CameraIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
  </svg>
);

const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="5,3 19,12 5,21 5,3" />
  </svg>
);

const categoryLabels: Record<string, string> = {
  inspection: "Inspección",
  security: "Seguridad",
  maintenance: "Mantenimiento",
  cleaning: "Limpieza",
  emergency: "Emergencia",
};

const categoryColors: Record<string, string> = {
  inspection: "#3b82f6",
  security: "#ef4444",
  maintenance: "#f59e0b",
  cleaning: "#10b981",
  emergency: "#dc2626",
};

const categoryEmojis: Record<string, string> = {
  inspection: "🔍",
  security: "🛡️",
  maintenance: "🔧",
  cleaning: "🧹",
  emergency: "🚨",
};

export default function StaffTasksDashboard() {
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<StaffTask | null>(null);
  const [completionNotes, setCompletionNotes] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    const data = await fetchMyTasks(today);
    setTasks(data);
    setIsLoading(false);
  };

  const handleStartTask = async (task: StaffTask) => {
    const success = await updateTaskStatus(task.id, "in_progress");
    if (success) {
      loadTasks();
    }
  };

  const handleOpenComplete = (task: StaffTask) => {
    setSelectedTask(task);
    setCompletionNotes("");
    setPhoto(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;

    if (selectedTask.requires_photo && !photo) {
      alert("Esta tarea requiere una foto de evidencia");
      return;
    }

    setIsSubmitting(true);

    let photoUrl: string | undefined;

    // Subir foto si existe
    if (photo) {
      const supabase = createClient();
      const fileName = `${selectedTask.user_id}/${selectedTask.id}_${Date.now()}.jpg`;
      
      const { data, error } = await supabase.storage
        .from("evidence_photos")
        .upload(fileName, photo);

      if (error) {
        console.error("Error uploading photo:", error);
        alert("Error al subir la foto");
        setIsSubmitting(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("evidence_photos")
        .getPublicUrl(data.path);
      
      photoUrl = urlData.publicUrl;
    }

    const success = await updateTaskStatus(
      selectedTask.id,
      "completed",
      completionNotes || undefined,
      photoUrl
    );

    if (success) {
      setSelectedTask(null);
      loadTasks();
    } else {
      alert("Error al completar la tarea");
    }

    setIsSubmitting(false);
  };

  const pendingTasks = tasks.filter((t) => t.status === "pending");
  const inProgressTasks = tasks.filter((t) => t.status === "in_progress");
  const completedTasks = tasks.filter((t) => t.status === "completed");

  const progress = tasks.length > 0 
    ? Math.round((completedTasks.length / tasks.length) * 100) 
    : 0;

  if (isLoading) {
    return (
      <div className="staff-tasks">
        <style jsx>{styles}</style>
        <div className="loading">
          <div className="spinner" />
          <p>Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-tasks">
      <style jsx>{styles}</style>

      {/* Header con progreso */}
      <div className="progress-header">
        <div className="progress-info">
          <h2>Mis Tareas de Hoy</h2>
          <p>{completedTasks.length} de {tasks.length} completadas</p>
        </div>
        <div className="progress-circle">
          <svg viewBox="0 0 36 36">
            <path
              className="progress-bg"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="progress-fill"
              strokeDasharray={`${progress}, 100`}
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <span className="progress-text">{progress}%</span>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📋</span>
          <h3>Sin tareas asignadas</h3>
          <p>No tienes tareas asignadas para hoy. Contacta a tu supervisor.</p>
        </div>
      ) : (
        <>
          {/* Tareas en progreso */}
          {inProgressTasks.length > 0 && (
            <div className="task-section">
              <h3 className="section-title">
                <span className="dot in-progress" /> En Progreso ({inProgressTasks.length})
              </h3>
              <div className="tasks-list">
                {inProgressTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onComplete={() => handleOpenComplete(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tareas pendientes */}
          {pendingTasks.length > 0 && (
            <div className="task-section">
              <h3 className="section-title">
                <span className="dot pending" /> Pendientes ({pendingTasks.length})
              </h3>
              <div className="tasks-list">
                {pendingTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onStart={() => handleStartTask(task)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Tareas completadas */}
          {completedTasks.length > 0 && (
            <div className="task-section">
              <h3 className="section-title">
                <span className="dot completed" /> Completadas ({completedTasks.length})
              </h3>
              <div className="tasks-list completed">
                {completedTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal de completar tarea */}
      {selectedTask && (
        <div className="modal-overlay" onClick={() => setSelectedTask(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Completar Tarea</h3>
              <button className="close-btn" onClick={() => setSelectedTask(null)}>×</button>
            </div>

            <div className="modal-body">
              <div className="task-preview">
                <span 
                  className="category-badge"
                  style={{ background: categoryColors[selectedTask.category] }}
                >
                  {categoryEmojis[selectedTask.category]} {categoryLabels[selectedTask.category]}
                </span>
                <h4>{selectedTask.name}</h4>
                {selectedTask.instructions && (
                  <p className="instructions">{selectedTask.instructions}</p>
                )}
              </div>

              {selectedTask.requires_photo && (
                <div className="photo-section">
                  <label>Foto de Evidencia {selectedTask.requires_photo && "*"}</label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoChange}
                    style={{ display: "none" }}
                  />
                  
                  {photoPreview ? (
                    <div className="photo-preview">
                      <img src={photoPreview} alt="Preview" />
                      <button 
                        className="change-photo"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Cambiar foto
                      </button>
                    </div>
                  ) : (
                    <button 
                      className="take-photo-btn"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <CameraIcon />
                      <span>Tomar Foto</span>
                    </button>
                  )}
                </div>
              )}

              <div className="notes-section">
                <label>Notas (opcional)</label>
                <textarea
                  value={completionNotes}
                  onChange={(e) => setCompletionNotes(e.target.value)}
                  placeholder="Agrega observaciones o comentarios..."
                  rows={3}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setSelectedTask(null)}
              >
                Cancelar
              </button>
              <button 
                className="complete-btn"
                onClick={handleCompleteTask}
                disabled={isSubmitting || (selectedTask.requires_photo && !photo)}
              >
                {isSubmitting ? (
                  <>
                    <span className="btn-spinner" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <CheckIcon />
                    Completar Tarea
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente de tarjeta de tarea
function TaskCard({ 
  task, 
  onStart, 
  onComplete 
}: { 
  task: StaffTask; 
  onStart?: () => void;
  onComplete?: () => void;
}) {
  return (
    <div className={`task-card ${task.status}`}>
      <style jsx>{`
        .task-card {
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 16px;
          transition: all 0.2s;
        }
        .task-card.completed {
          opacity: 0.7;
        }
        .task-card.in_progress {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 10px;
        }
        .category-badge {
          font-size: 11px;
          font-weight: 600;
          color: white;
          padding: 4px 10px;
          border-radius: 20px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .priority-badge {
          font-size: 10px;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: 4px;
          margin-left: auto;
        }
        .priority-badge.high {
          background: #fee2e2;
          color: #dc2626;
        }
        .priority-badge.normal {
          background: #fef3c7;
          color: #92400e;
        }
        .priority-badge.low {
          background: #e2e8f0;
          color: #64748b;
        }
        .task-name {
          font-size: 15px;
          font-weight: 600;
          color: #0f172a;
          margin: 0 0 6px 0;
        }
        .task-desc {
          font-size: 13px;
          color: #64748b;
          margin: 0 0 12px 0;
          line-height: 1.4;
        }
        .task-footer {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .status-badge {
          font-size: 12px;
          padding: 6px 12px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .status-badge.pending {
          background: #fef3c7;
          color: #92400e;
        }
        .status-badge.in_progress {
          background: #dbeafe;
          color: #1e40af;
        }
        .status-badge.completed {
          background: #dcfce7;
          color: #166534;
        }
        .action-btn {
          margin-left: auto;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.2s;
        }
        .start-btn {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
        }
        .start-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }
        .complete-btn {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .complete-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .photo-indicator {
          font-size: 11px;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .completed-time {
          font-size: 11px;
          color: #10b981;
          margin-left: auto;
        }
      `}</style>

      <div className="card-header">
        <span 
          className="category-badge"
          style={{ background: categoryColors[task.category] }}
        >
          {categoryEmojis[task.category]} {categoryLabels[task.category]}
        </span>
        <span className={`priority-badge ${task.priority >= 4 ? "high" : task.priority >= 2 ? "normal" : "low"}`}>
          P{task.priority}
        </span>
      </div>

      <h4 className="task-name">{task.name}</h4>
      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-footer">
        {task.status === "pending" && (
          <>
            {task.requires_photo && (
              <span className="photo-indicator">📷 Requiere foto</span>
            )}
            {onStart && (
              <button className="action-btn start-btn" onClick={onStart}>
                <PlayIcon /> Iniciar
              </button>
            )}
          </>
        )}

        {task.status === "in_progress" && (
          <>
            <span className="status-badge in_progress">🔄 En progreso</span>
            {onComplete && (
              <button className="action-btn complete-btn" onClick={onComplete}>
                <CheckIcon /> Completar
              </button>
            )}
          </>
        )}

        {task.status === "completed" && (
          <>
            <span className="status-badge completed">✅ Completada</span>
            {task.completed_at && (
              <span className="completed-time">
                {new Date(task.completed_at).toLocaleTimeString("es", { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                })}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const styles = `
  .staff-tasks {
    padding: 20px;
    max-width: 600px;
    margin: 0 auto;
  }

  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    gap: 16px;
  }

  .spinner {
    width: 40px;
    height: 40px;
    border: 3px solid #e2e8f0;
    border-top-color: #10b981;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .progress-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: white;
    border-radius: 20px;
    padding: 20px 24px;
    margin-bottom: 24px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
  }

  .progress-info h2 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 4px 0;
  }

  .progress-info p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }

  .progress-circle {
    width: 70px;
    height: 70px;
    position: relative;
  }

  .progress-circle svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .progress-bg {
    fill: none;
    stroke: #e2e8f0;
    stroke-width: 3;
  }

  .progress-fill {
    fill: none;
    stroke: #10b981;
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dasharray 0.5s;
  }

  .progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 16px;
    font-weight: 700;
    color: #10b981;
  }

  .empty-state {
    text-align: center;
    padding: 60px 24px;
    background: white;
    border-radius: 20px;
  }

  .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-size: 18px;
    color: #0f172a;
    margin: 0 0 8px 0;
  }

  .empty-state p {
    font-size: 14px;
    color: #64748b;
    margin: 0;
  }

  .task-section {
    margin-bottom: 24px;
  }

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #475569;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .dot.pending { background: #f59e0b; }
  .dot.in-progress { background: #3b82f6; }
  .dot.completed { background: #10b981; }

  .tasks-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .tasks-list.completed {
    opacity: 0.8;
  }

  /* Modal */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: flex-end;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal {
    background: white;
    border-radius: 20px 20px 0 0;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.3s ease;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid #e2e8f0;
  }

  .modal-header h3 {
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .close-btn {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    border: none;
    background: #f1f5f9;
    font-size: 20px;
    cursor: pointer;
    color: #64748b;
  }

  .modal-body {
    padding: 24px;
  }

  .task-preview {
    background: #f8fafc;
    border-radius: 12px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .task-preview .category-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: white;
    padding: 4px 10px;
    border-radius: 20px;
    margin-bottom: 10px;
  }

  .task-preview h4 {
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 8px 0;
  }

  .task-preview .instructions {
    font-size: 13px;
    color: #64748b;
    margin: 0;
    line-height: 1.5;
  }

  .photo-section,
  .notes-section {
    margin-bottom: 20px;
  }

  .photo-section label,
  .notes-section label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #475569;
    margin-bottom: 8px;
  }

  .take-photo-btn {
    width: 100%;
    padding: 40px;
    border: 2px dashed #e2e8f0;
    border-radius: 12px;
    background: #f8fafc;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    color: #64748b;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;
  }

  .take-photo-btn:hover {
    border-color: #10b981;
    background: #f0fdf4;
    color: #10b981;
  }

  .photo-preview {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
  }

  .photo-preview img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .change-photo {
    position: absolute;
    bottom: 10px;
    right: 10px;
    padding: 8px 16px;
    background: rgba(0, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 12px;
    cursor: pointer;
  }

  .notes-section textarea {
    width: 100%;
    padding: 12px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    resize: vertical;
  }

  .modal-footer {
    display: flex;
    gap: 12px;
    padding: 20px 24px;
    border-top: 1px solid #e2e8f0;
  }

  .cancel-btn {
    flex: 1;
    padding: 14px;
    background: #f1f5f9;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
  }

  .modal-footer .complete-btn {
    flex: 2;
    padding: 14px;
    background: linear-gradient(135deg, #10b981, #059669);
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: all 0.2s;
  }

  .modal-footer .complete-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .modal-footer .complete-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
`;

