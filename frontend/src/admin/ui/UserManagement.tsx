"use client";

import { useState, useEffect } from "react";
import {
  createStaffUser,
  listUsers,
  assignRoundToUser,
  getAvailableRounds,
} from "../infrastructure/supabase/users.mutations";

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

interface Round {
  id: string;
  name: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  
  // Assignment state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState("");
  const [assignDate, setAssignDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const [usersResult, roundsResult] = await Promise.all([
      listUsers(),
      getAvailableRounds(),
    ]);

    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data);
    }
    if (roundsResult.success && roundsResult.data) {
      setRounds(roundsResult.data);
    }
    setLoading(false);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    setCreateSuccess(false);

    const result = await createStaffUser(
      newUserEmail,
      newUserPassword,
      newUserName
    );

    if (result.success) {
      setCreateSuccess(true);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      await loadData(); // Recargar lista
      setTimeout(() => {
        setShowCreateForm(false);
        setCreateSuccess(false);
      }, 2000);
    } else {
      setCreateError(result.error || "Error creando usuario");
    }
    setCreating(false);
  }

  async function handleAssignRound() {
    if (!selectedUserId || !selectedRoundId) return;
    
    setAssigning(true);
    const result = await assignRoundToUser(
      selectedUserId,
      selectedRoundId,
      assignDate
    );

    if (result.success) {
      setShowAssignModal(false);
      setSelectedUserId(null);
      setSelectedRoundId("");
    } else {
      setError(result.error || "Error asignando ronda");
    }
    setAssigning(false);
  }

  return (
    <div className="user-management">
      <style jsx>{`
        .user-management {
          font-family: 'JetBrains Mono', monospace;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .section-title {
          font-size: 20px;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0;
        }

        .create-btn {
          padding: 12px 20px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border: none;
          border-radius: 8px;
          color: white;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(5, 150, 105, 0.3);
        }

        .users-table {
          background: #1e1e2e;
          border: 1px solid #334155;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 180px 120px;
          padding: 14px 20px;
          background: #252536;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 180px 120px;
          padding: 16px 20px;
          border-bottom: 1px solid #334155;
          align-items: center;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 14px;
        }

        .user-name {
          font-weight: 500;
          color: #f1f5f9;
        }

        .user-date {
          font-size: 12px;
          color: #64748b;
        }

        .assign-btn {
          padding: 8px 16px;
          background: rgba(139, 92, 246, 0.1);
          border: 1px solid rgba(139, 92, 246, 0.3);
          border-radius: 6px;
          color: #a855f7;
          font-family: inherit;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .assign-btn:hover {
          background: rgba(139, 92, 246, 0.2);
        }

        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal {
          background: #1e1e2e;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 24px;
          width: 100%;
          max-width: 420px;
        }

        .modal-title {
          font-size: 18px;
          font-weight: 600;
          color: #f1f5f9;
          margin: 0 0 20px 0;
        }

        .form-group {
          margin-bottom: 16px;
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

        .form-input, .form-select {
          width: 100%;
          padding: 12px 14px;
          background: #0f172a;
          border: 1px solid #334155;
          border-radius: 8px;
          color: #f1f5f9;
          font-family: inherit;
          font-size: 14px;
        }

        .form-input:focus, .form-select:focus {
          outline: none;
          border-color: #059669;
        }

        .form-select {
          cursor: pointer;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .btn {
          flex: 1;
          padding: 12px 20px;
          border-radius: 8px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          border: none;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: transparent;
          border: 1px solid #334155;
          color: #94a3b8;
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          border-radius: 8px;
          padding: 12px;
          color: #fca5a5;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .success-message {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 12px;
          color: #6ee7b7;
          font-size: 13px;
          margin-bottom: 16px;
          text-align: center;
        }

        .loading-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          display: inline-block;
          margin-right: 8px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #64748b;
        }
      `}</style>

      <div className="section-header">
        <h2 className="section-title">👥 Gestión de Usuarios</h2>
        <button className="create-btn" onClick={() => setShowCreateForm(true)}>
          + Nuevo Staff
        </button>
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="loading-spinner" style={{ margin: "0 auto" }} />
          <p>Cargando usuarios...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <p>No hay usuarios registrados</p>
        </div>
      ) : (
        <div className="users-table">
          <div className="table-header">
            <span>Usuario</span>
            <span>Fecha de Registro</span>
            <span>Acciones</span>
          </div>
          {users.map((user) => (
            <div key={user.id} className="table-row">
              <div className="user-info">
                <div className="user-avatar">
                  {user.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="user-name">{user.fullName}</div>
                </div>
              </div>
              <div className="user-date">
                {new Date(user.createdAt).toLocaleDateString("es-ES")}
              </div>
              <button
                className="assign-btn"
                onClick={() => {
                  setSelectedUserId(user.id);
                  setShowAssignModal(true);
                }}
              >
                Asignar Ronda
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal crear usuario */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Crear Nuevo Usuario Staff</h3>
            
            {createSuccess && (
              <div className="success-message">
                ✅ Usuario creado exitosamente
              </div>
            )}
            
            {createError && (
              <div className="error-message">⚠️ {createError}</div>
            )}

            <form onSubmit={handleCreateUser}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Juan Pérez"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  disabled={creating}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="juan@hotel.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  disabled={creating}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contraseña</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Mínimo 6 caracteres"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  minLength={6}
                  disabled={creating}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowCreateForm(false)}
                  disabled={creating}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <span className="loading-spinner" />
                      Creando...
                    </>
                  ) : (
                    "Crear Usuario"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal asignar ronda */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Asignar Ronda</h3>
            
            {error && <div className="error-message">⚠️ {error}</div>}

            <div className="form-group">
              <label className="form-label">Ronda</label>
              <select
                className="form-select"
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                required
              >
                <option value="">Seleccionar ronda...</option>
                {rounds.map((round) => (
                  <option key={round.id} value={round.id}>
                    {round.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input
                type="date"
                className="form-input"
                value={assignDate}
                onChange={(e) => setAssignDate(e.target.value)}
                required
              />
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
                disabled={assigning}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAssignRound}
                disabled={assigning || !selectedRoundId}
              >
                {assigning ? (
                  <>
                    <span className="loading-spinner" />
                    Asignando...
                  </>
                ) : (
                  "Asignar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

