"use client";

import { useState, useEffect } from "react";
import {
  fetchTaskTemplates,
  fetchStaffUsers,
  fetchStaffTasks,
  assignDefaultTasksToUser,
  assignCustomTask,
  deleteStaffTask,
  updateTaskTemplate,
  type TaskTemplate,
  type StaffUser,
  type StaffTask,
} from "../infrastructure/supabase/queries";

// Iconos
const PlusIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3,6 5,6 21,6" /><path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2v2" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20,6 9,17 4,12" />
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

const shiftLabels: Record<string, string> = {
  morning: "Mañana",
  afternoon: "Tarde",
  night: "Noche",
};

export default function TaskManagement() {
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<StaffTask[]>([]);
  const [allTasks, setAllTasks] = useState<StaffTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"templates" | "assign" | "monitor">("assign");

  // Form states
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedShift, setSelectedShift] = useState<"morning" | "afternoon" | "night">("night");

  // Custom task form
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [customTask, setCustomTask] = useState({
    name: "",
    description: "",
    instructions: "",
    category: "inspection",
    priority: 3,
    requires_photo: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedUser && selectedDate) {
      loadAssignedTasks();
    }
  }, [selectedUser, selectedDate]);

  // Cargar todas las tareas cuando cambia de tab o fecha (para monitoreo)
  useEffect(() => {
    if (activeTab === "monitor") {
      loadAllTasks();
    }
  }, [activeTab, selectedDate]);

  const loadData = async () => {
    setIsLoading(true);
    const [templatesData, usersData] = await Promise.all([
      fetchTaskTemplates(),
      fetchStaffUsers(),
    ]);
    setTemplates(templatesData);
    setStaffUsers(usersData);
    setIsLoading(false);
  };

  const loadAssignedTasks = async () => {
    const tasks = await fetchStaffTasks(selectedUser, selectedDate);
    setAssignedTasks(tasks);
  };

  const loadAllTasks = async () => {
    const tasks = await fetchStaffTasks(undefined, selectedDate);
    setAllTasks(tasks);
  };

  const handleAssignDefaults = async () => {
    if (!selectedUser) {
      setMessage({ type: "error", text: "Selecciona un botón primero" });
      return;
    }

    setIsSubmitting(true);
    const success = await assignDefaultTasksToUser(selectedUser, selectedDate, selectedShift);

    if (success) {
      setMessage({ type: "success", text: "Tareas predeterminadas asignadas correctamente" });
      loadAssignedTasks();
    } else {
      setMessage({ type: "error", text: "Error al asignar tareas" });
    }
    setIsSubmitting(false);
  };

  // Asignar tareas a TODOS los botones
  const handleAssignToAll = async () => {
    if (staffUsers.length === 0) {
      setMessage({ type: "error", text: "No hay botones registrados" });
      return;
    }

    if (!confirm(`¿Asignar tareas predeterminadas a ${staffUsers.length} botones para el ${selectedDate}?`)) {
      return;
    }

    setIsSubmitting(true);
    let successCount = 0;

    for (const user of staffUsers) {
      const success = await assignDefaultTasksToUser(user.id, selectedDate, selectedShift);
      if (success) successCount++;
    }

    if (successCount > 0) {
      setMessage({ 
        type: "success", 
        text: `Tareas asignadas a ${successCount} de ${staffUsers.length} botones` 
      });
      if (selectedUser) {
        loadAssignedTasks();
      }
    } else {
      setMessage({ type: "error", text: "Error al asignar tareas" });
    }
    setIsSubmitting(false);
  };

  const handleAssignCustom = async () => {
    if (!selectedUser || !customTask.name) {
      setMessage({ type: "error", text: "Completa los campos requeridos" });
      return;
    }

    setIsSubmitting(true);
    const result = await assignCustomTask(selectedUser, {
      ...customTask,
      assigned_date: selectedDate,
      shift: selectedShift,
    });

    if (result) {
      setMessage({ type: "success", text: "Tarea personalizada asignada" });
      setShowCustomForm(false);
      setCustomTask({
        name: "",
        description: "",
        instructions: "",
        category: "inspection",
        priority: 3,
        requires_photo: true,
      });
      loadAssignedTasks();
    } else {
      setMessage({ type: "error", text: "Error al asignar tarea personalizada" });
    }
    setIsSubmitting(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("¿Eliminar esta tarea?")) return;

    const success = await deleteStaffTask(taskId);
    if (success) {
      loadAssignedTasks();
    }
  };

  const handleToggleTemplate = async (template: TaskTemplate) => {
    const success = await updateTaskTemplate(template.id, {
      is_active: !template.is_active,
    });
    if (success) {
      loadData();
    }
  };

  const getUserName = (userId: string) => {
    return staffUsers.find((u) => u.id === userId)?.full_name || "Desconocido";
  };

  if (isLoading) {
    return (
      <div className="task-management">
        <style jsx>{styles}</style>
        <div className="loading">
          <div className="spinner" />
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="task-management">
      <style jsx>{styles}</style>

      <div className="header">
        <h1>Gestión de Tareas</h1>
        <p>Asigna tareas predeterminadas o personalizadas a los botones</p>
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button onClick={() => setMessage(null)}>×</button>
        </div>
      )}

      <div className="tabs">
        <button
          className={`tab ${activeTab === "assign" ? "active" : ""}`}
          onClick={() => setActiveTab("assign")}
        >
          📋 Asignar Tareas
        </button>
        <button
          className={`tab ${activeTab === "templates" ? "active" : ""}`}
          onClick={() => setActiveTab("templates")}
        >
          📝 Plantillas
        </button>
        <button
          className={`tab ${activeTab === "monitor" ? "active" : ""}`}
          onClick={() => setActiveTab("monitor")}
        >
          👁️ Monitorear
        </button>
      </div>

      {activeTab === "assign" && (
        <div className="assign-section">
          <div className="filters">
            <div className="filter-group">
              <label>Botón (Staff)</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Seleccionar botón...</option>
                {staffUsers.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Fecha</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Turno</label>
              <select
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value as typeof selectedShift)}
              >
                <option value="morning">Mañana (6:00 - 14:00)</option>
                <option value="afternoon">Tarde (14:00 - 22:00)</option>
                <option value="night">Noche (22:00 - 6:00)</option>
              </select>
            </div>
          </div>

          <div className="action-buttons">
            <button
              className="btn-primary"
              onClick={handleAssignDefaults}
              disabled={!selectedUser || isSubmitting}
            >
              {isSubmitting ? "Asignando..." : "📋 Asignar a Este Botón"}
            </button>
            <button
              className="btn-secondary"
              onClick={() => setShowCustomForm(true)}
              disabled={!selectedUser}
            >
              <PlusIcon /> Tarea Personalizada
            </button>
            <button
              className="btn-all"
              onClick={handleAssignToAll}
              disabled={staffUsers.length === 0 || isSubmitting}
            >
              {isSubmitting ? "Asignando..." : `🚀 Asignar a Todos (${staffUsers.length})`}
            </button>
          </div>

          {staffUsers.length === 0 && (
            <div className="empty-warning">
              <span>⚠️</span>
              <p>No hay botones registrados. Crea botones desde la sección de <strong>Usuarios</strong> o pídeles que se registren en <strong>/register</strong></p>
            </div>
          )}

          {showCustomForm && (
            <div className="custom-form">
              <h3>Nueva Tarea Personalizada</h3>
              <div className="form-grid">
                <div className="form-group full">
                  <label>Nombre de la tarea *</label>
                  <input
                    type="text"
                    value={customTask.name}
                    onChange={(e) => setCustomTask({ ...customTask, name: e.target.value })}
                    placeholder="Ej: Revisar puerta de emergencia piso 3"
                  />
                </div>
                <div className="form-group full">
                  <label>Descripción</label>
                  <textarea
                    value={customTask.description}
                    onChange={(e) => setCustomTask({ ...customTask, description: e.target.value })}
                    placeholder="Descripción detallada de la tarea..."
                    rows={2}
                  />
                </div>
                <div className="form-group full">
                  <label>Instrucciones</label>
                  <textarea
                    value={customTask.instructions}
                    onChange={(e) => setCustomTask({ ...customTask, instructions: e.target.value })}
                    placeholder="Pasos a seguir..."
                    rows={2}
                  />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select
                    value={customTask.category}
                    onChange={(e) => setCustomTask({ ...customTask, category: e.target.value })}
                  >
                    {Object.entries(categoryLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Prioridad (1-5)</label>
                  <select
                    value={customTask.priority}
                    onChange={(e) => setCustomTask({ ...customTask, priority: Number(e.target.value) })}
                  >
                    <option value={1}>1 - Baja</option>
                    <option value={2}>2 - Normal baja</option>
                    <option value={3}>3 - Normal</option>
                    <option value={4}>4 - Alta</option>
                    <option value={5}>5 - Urgente</option>
                  </select>
                </div>
                <div className="form-group checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={customTask.requires_photo}
                      onChange={(e) => setCustomTask({ ...customTask, requires_photo: e.target.checked })}
                    />
                    Requiere foto de evidencia
                  </label>
                </div>
              </div>
              <div className="form-actions">
                <button className="btn-cancel" onClick={() => setShowCustomForm(false)}>
                  Cancelar
                </button>
                <button className="btn-primary" onClick={handleAssignCustom} disabled={isSubmitting}>
                  {isSubmitting ? "Asignando..." : "Asignar Tarea"}
                </button>
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="assigned-tasks">
              <h3>
                Tareas asignadas a {getUserName(selectedUser)} - {selectedDate}
              </h3>
              {assignedTasks.length === 0 ? (
                <p className="no-tasks">No hay tareas asignadas para esta fecha</p>
              ) : (
                <div className="tasks-list">
                  {assignedTasks.map((task) => (
                    <div key={task.id} className={`task-card ${task.status}`}>
                      <div className="task-header">
                        <span
                          className="category-badge"
                          style={{ background: categoryColors[task.category] }}
                        >
                          {categoryLabels[task.category]}
                        </span>
                        <span className="priority">P{task.priority}</span>
                        {task.is_custom && <span className="custom-badge">Personalizada</span>}
                      </div>
                      <h4>{task.name}</h4>
                      {task.description && <p className="task-desc">{task.description}</p>}
                      <div className="task-footer">
                        <span className={`status-badge ${task.status}`}>
                          {task.status === "pending" && "⏳ Pendiente"}
                          {task.status === "in_progress" && "🔄 En progreso"}
                          {task.status === "completed" && "✅ Completada"}
                          {task.status === "skipped" && "⏭️ Omitida"}
                          {task.status === "blocked" && "🚫 Bloqueada"}
                        </span>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteTask(task.id)}
                          title="Eliminar tarea"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "templates" && (
        <div className="templates-section">
          <h3>Plantillas de Tareas Predeterminadas</h3>
          <p className="hint">Activa/desactiva las plantillas para incluirlas en las asignaciones predeterminadas</p>
          
          <div className="templates-grid">
            {templates.map((template) => (
              <div key={template.id} className={`template-card ${template.is_active ? "" : "inactive"}`}>
                <div className="template-header">
                  <span
                    className="category-badge"
                    style={{ background: categoryColors[template.category] }}
                  >
                    {categoryLabels[template.category]}
                  </span>
                  <button
                    className={`toggle-btn ${template.is_active ? "active" : ""}`}
                    onClick={() => handleToggleTemplate(template)}
                  >
                    {template.is_active ? <CheckIcon /> : "○"}
                  </button>
                </div>
                <h4>{template.name}</h4>
                <p>{template.description}</p>
                <div className="template-meta">
                  <span>⏱️ {template.estimated_minutes} min</span>
                  <span>P{template.priority}</span>
                  {template.requires_photo && <span>📷</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "monitor" && (
        <div className="monitor-section">
          <div className="monitor-header">
            <div>
              <h3>Monitoreo de Tareas</h3>
              <p>Progreso de los botones para el día seleccionado</p>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-picker"
            />
          </div>

          {/* Resumen general */}
          <div className="monitor-summary">
            <div className="summary-card">
              <span className="summary-icon">👥</span>
              <div>
                <span className="summary-value">{staffUsers.length}</span>
                <span className="summary-label">Botones</span>
              </div>
            </div>
            <div className="summary-card">
              <span className="summary-icon">📋</span>
              <div>
                <span className="summary-value">{allTasks.length}</span>
                <span className="summary-label">Tareas Asignadas</span>
              </div>
            </div>
            <div className="summary-card">
              <span className="summary-icon">✅</span>
              <div>
                <span className="summary-value">
                  {allTasks.filter((t) => t.status === "completed").length}
                </span>
                <span className="summary-label">Completadas</span>
              </div>
            </div>
            <div className="summary-card">
              <span className="summary-icon">📊</span>
              <div>
                <span className="summary-value">
                  {allTasks.length > 0 
                    ? Math.round((allTasks.filter((t) => t.status === "completed").length / allTasks.length) * 100)
                    : 0}%
                </span>
                <span className="summary-label">Cumplimiento</span>
              </div>
            </div>
          </div>

          {allTasks.length === 0 ? (
            <div className="no-tasks-warning">
              <span>📭</span>
              <div>
                <h4>Sin tareas asignadas</h4>
                <p>No hay tareas asignadas para esta fecha. Ve a la pestaña &quot;Asignar Tareas&quot; para asignar tareas a los botones.</p>
              </div>
            </div>
          ) : (
            <div className="monitor-grid">
              {staffUsers.map((user) => {
                const userTasks = allTasks.filter((t) => t.user_id === user.id);
                const completed = userTasks.filter((t) => t.status === "completed").length;
                const inProgress = userTasks.filter((t) => t.status === "in_progress").length;
                const total = userTasks.length;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

                if (total === 0) return null;

                return (
                  <div key={user.id} className={`user-progress-card ${progress === 100 ? "complete" : ""}`}>
                    <div className="user-info">
                      <span className="avatar">{user.full_name.charAt(0)}</span>
                      <div>
                        <h4>{user.full_name}</h4>
                        <span className="task-count">
                          {completed}/{total} tareas
                          {inProgress > 0 && <span className="in-progress-badge"> • {inProgress} en progreso</span>}
                        </span>
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${progress}%` }} />
                    </div>
                    <span className={`progress-text ${progress === 100 ? "complete" : progress >= 50 ? "good" : "low"}`}>
                      {progress}%
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const styles = `
  .task-management {
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
  }

  .header {
    margin-bottom: 24px;
  }

  .header h1 {
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px 0;
  }

  .header p {
    color: #64748b;
    margin: 0;
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

  .message {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-radius: 8px;
    margin-bottom: 20px;
    font-size: 14px;
  }

  .message.success {
    background: #dcfce7;
    color: #166534;
    border: 1px solid #86efac;
  }

  .message.error {
    background: #fee2e2;
    color: #991b1b;
    border: 1px solid #fca5a5;
  }

  .message button {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    opacity: 0.7;
  }

  .tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 24px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 12px;
  }

  .tab {
    padding: 10px 20px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tab:hover {
    background: #f1f5f9;
  }

  .tab.active {
    background: #10b981;
    color: white;
    border-color: #10b981;
  }

  .filters {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 20px;
  }

  .filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .filter-group label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  .filter-group select,
  .filter-group input {
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    background: white;
  }

  .action-buttons {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;
  }

  .btn-primary {
    padding: 12px 20px;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-primary:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .btn-all {
    padding: 12px 20px;
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-all:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
  }

  .btn-all:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .empty-warning {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    background: #fef3c7;
    border: 1px solid #fcd34d;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 20px;
  }

  .empty-warning span {
    font-size: 20px;
  }

  .empty-warning p {
    margin: 0;
    font-size: 13px;
    color: #92400e;
    line-height: 1.5;
  }

  .empty-warning strong {
    color: #78350f;
  }

  .btn-secondary {
    padding: 12px 20px;
    background: white;
    color: #475569;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #f8fafc;
    border-color: #cbd5e1;
  }

  .btn-secondary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .custom-form {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 24px;
  }

  .custom-form h3 {
    margin: 0 0 16px 0;
    font-size: 16px;
    color: #0f172a;
  }

  .form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group.full {
    grid-column: 1 / -1;
  }

  .form-group.checkbox {
    flex-direction: row;
    align-items: center;
  }

  .form-group.checkbox input {
    width: auto;
    margin-right: 8px;
  }

  .form-group label {
    font-size: 13px;
    font-weight: 600;
    color: #475569;
  }

  .form-group input,
  .form-group select,
  .form-group textarea {
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
  }

  .form-group textarea {
    resize: vertical;
  }

  .form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .btn-cancel {
    padding: 10px 20px;
    background: white;
    color: #64748b;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    cursor: pointer;
  }

  .assigned-tasks h3 {
    font-size: 16px;
    color: #0f172a;
    margin: 0 0 16px 0;
  }

  .no-tasks {
    text-align: center;
    color: #94a3b8;
    padding: 40px;
    background: #f8fafc;
    border-radius: 12px;
  }

  .tasks-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .task-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s;
  }

  .task-card.completed {
    opacity: 0.7;
    background: #f0fdf4;
  }

  .task-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
  }

  .category-badge {
    font-size: 11px;
    font-weight: 600;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .priority {
    font-size: 11px;
    font-weight: 600;
    color: #64748b;
    background: #f1f5f9;
    padding: 4px 6px;
    border-radius: 4px;
  }

  .custom-badge {
    font-size: 10px;
    color: #7c3aed;
    background: #ede9fe;
    padding: 4px 8px;
    border-radius: 4px;
    margin-left: auto;
  }

  .task-card h4 {
    font-size: 14px;
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
    justify-content: space-between;
  }

  .status-badge {
    font-size: 12px;
    padding: 4px 8px;
    border-radius: 6px;
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

  .btn-delete {
    background: none;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 4px;
    transition: color 0.2s;
  }

  .btn-delete:hover {
    color: #ef4444;
  }

  .templates-section h3 {
    margin: 0 0 8px 0;
  }

  .hint {
    color: #64748b;
    font-size: 13px;
    margin: 0 0 20px 0;
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .template-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    transition: all 0.2s;
  }

  .template-card.inactive {
    opacity: 0.5;
  }

  .template-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }

  .toggle-btn {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    border: 2px solid #e2e8f0;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    transition: all 0.2s;
  }

  .toggle-btn.active {
    background: #10b981;
    border-color: #10b981;
    color: white;
  }

  .template-card h4 {
    font-size: 14px;
    margin: 0 0 6px 0;
    color: #0f172a;
  }

  .template-card p {
    font-size: 13px;
    color: #64748b;
    margin: 0 0 12px 0;
  }

  .template-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #94a3b8;
  }

  .monitor-section h3 {
    margin: 0 0 4px 0;
    font-size: 18px;
    color: #0f172a;
  }

  .monitor-section p {
    margin: 0;
    font-size: 13px;
    color: #64748b;
  }

  .monitor-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 24px;
  }

  .date-picker {
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 14px;
  }

  .monitor-summary {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .summary-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .summary-icon {
    font-size: 24px;
  }

  .summary-value {
    display: block;
    font-size: 24px;
    font-weight: 700;
    color: #0f172a;
  }

  .summary-label {
    font-size: 12px;
    color: #64748b;
  }

  .no-tasks-warning {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 24px;
    text-align: left;
  }

  .no-tasks-warning span {
    font-size: 32px;
  }

  .no-tasks-warning h4 {
    margin: 0 0 8px 0;
    font-size: 16px;
    color: #0f172a;
  }

  .no-tasks-warning p {
    margin: 0;
    font-size: 14px;
    color: #64748b;
    line-height: 1.5;
  }

  .monitor-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 16px;
  }

  .user-progress-card {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    transition: all 0.2s;
  }

  .user-progress-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .user-progress-card.complete {
    background: #f0fdf4;
    border-color: #86efac;
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 140px;
  }

  .avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: linear-gradient(135deg, #3b82f6, #1d4ed8);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 16px;
    flex-shrink: 0;
  }

  .user-info h4 {
    font-size: 14px;
    margin: 0 0 4px 0;
    color: #0f172a;
  }

  .task-count {
    font-size: 12px;
    color: #64748b;
  }

  .in-progress-badge {
    color: #3b82f6;
    font-weight: 500;
  }

  .progress-bar {
    flex: 1;
    height: 10px;
    background: #e2e8f0;
    border-radius: 5px;
    overflow: hidden;
    min-width: 80px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #10b981, #059669);
    transition: width 0.3s;
    border-radius: 5px;
  }

  .progress-text {
    font-size: 16px;
    font-weight: 700;
    min-width: 50px;
    text-align: right;
  }

  .progress-text.complete {
    color: #10b981;
  }

  .progress-text.good {
    color: #3b82f6;
  }

  .progress-text.low {
    color: #f59e0b;
  }

  @media (max-width: 768px) {
    .monitor-summary {
      grid-template-columns: repeat(2, 1fr);
    }
    
    .monitor-header {
      flex-direction: column;
      gap: 16px;
    }

    .action-buttons {
      flex-wrap: wrap;
    }
  }
`;


