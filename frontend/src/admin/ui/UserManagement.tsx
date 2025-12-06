"use client";

import { useState, useEffect } from "react";
import { createStaffUser, getUsers, getRounds, createAssignment } from "../infrastructure/supabase/users.mutations";

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
  locationCount: number;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form states
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Assignment modal
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedRoundId, setSelectedRoundId] = useState<string>("");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [usersResult, roundsResult] = await Promise.all([
      getUsers(),
      getRounds(),
    ]);

    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data);
    } else {
      setError(usersResult.error || "Error cargando usuarios");
    }

    if (roundsResult.success && roundsResult.data) {
      setRounds(roundsResult.data);
    }

    setIsLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError(null);
    setCreateSuccess(false);

    const result = await createStaffUser(email, password, fullName);

    if (result.success) {
      setCreateSuccess(true);
      setEmail("");
      setPassword("");
      setFullName("");
      loadData(); // Recargar lista
      setTimeout(() => {
        setShowCreateForm(false);
        setCreateSuccess(false);
      }, 2000);
    } else {
      setCreateError(result.error || "Error creando usuario");
    }

    setIsCreating(false);
  };

  const handleAssign = async () => {
    if (!selectedUserId || !selectedRoundId) return;
    
    setIsAssigning(true);
    const result = await createAssignment(selectedUserId, selectedRoundId, "night");
    
    if (result.success) {
      setShowAssignModal(false);
      setSelectedUserId(null);
      setSelectedRoundId("");
    } else {
      alert(result.error);
    }
    
    setIsAssigning(false);
  };

  return (
    <div className="user-management">
      <style jsx>{`
        .user-management {
          font-family: 'JetBrains Mono', monospace;
          padding: 24px;
          max-width: 1000px;
          margin: 0 auto;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .title {
          font-size: 24px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0;
        }

        .subtitle {
          font-size: 14px;
          color: #64748b;
          margin: 4px 0 0 0;
        }

        .btn {
          padding: 12px 20px;
          border-radius: 10px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(135deg, #059669 0%, #10b981 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(5, 150, 105, 0.3);
        }

        .btn-secondary {
          background: #334155;
          color: #94a3b8;
        }

        .btn-secondary:hover {
          background: #475569;
        }

        .btn-small {
          padding: 8px 14px;
          font-size: 12px;
        }

        .users-table {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          overflow: hidden;
        }

        .table-header {
          display: grid;
          grid-template-columns: 1fr 1fr 120px 150px;
          padding: 16px 20px;
          background: #252536;
          font-size: 11px;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .table-row {
          display: grid;
          grid-template-columns: 1fr 1fr 120px 150px;
          padding: 16px 20px;
          border-bottom: 1px solid #334155;
          align-items: center;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .user-name {
          font-weight: 500;
          color: #f1f5f9;
        }

        .user-email {
          color: #94a3b8;
          font-size: 13px;
        }

        .role-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .role-staff {
          background: rgba(59, 130, 246, 0.15);
          color: #3b82f6;
        }

        .role-admin {
          background: rgba(139, 92, 246, 0.15);
          color: #a855f7;
        }

        .actions {
          display: flex;
          gap: 8px;
        }

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
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 450px;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #f1f5f9;
          margin: 0 0 24px 0;
        }

        .form-group {
          margin-bottom: 20px;
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

        .form-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
        }

        .form-actions .btn {
          flex: 1;
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

        .loading {
          text-align: center;
          padding: 60px;
          color: #64748b;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #334155;
          border-top-color: #059669;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #64748b;
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="header">
        <div>
          <h1 className="title">👥 Gestión de Usuarios</h1>
          <p className="subtitle">Crear y administrar cuentas de staff</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => setShowCreateForm(true)}
        >
          + Crear Usuario
        </button>
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner" />
          <p>Cargando usuarios...</p>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : users.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>No hay usuarios registrados</p>
          <button 
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => setShowCreateForm(true)}
          >
            Crear primer usuario
          </button>
        </div>
      ) : (
        <div className="users-table">
          <div className="table-header">
            <span>Nombre</span>
            <span>Email</span>
            <span>Rol</span>
            <span>Acciones</span>
          </div>
          {users.map((user) => (
            <div key={user.id} className="table-row">
              <span className="user-name">{user.fullName}</span>
              <span className="user-email">{user.email}</span>
              <span>
                <span className={`role-badge role-${user.role}`}>
                  {user.role}
                </span>
              </span>
              <div className="actions">
                <button 
                  className="btn btn-secondary btn-small"
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setShowAssignModal(true);
                  }}
                >
                  📋 Asignar Ronda
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear Usuario */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => !isCreating && setShowCreateForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Crear Usuario Staff</h2>
            
            {createSuccess ? (
              <div className="success-message">
                ✅ Usuario creado exitosamente
              </div>
            ) : (
              <form onSubmit={handleCreateUser}>
                <div className="form-group">
                  <label className="form-label">Nombre Completo</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Juan Pérez"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="juan@hotel.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    disabled={isCreating}
                  />
                </div>

                {createError && (
                  <div className="error-message">{createError}</div>
                )}

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setShowCreateForm(false)}
                    disabled={isCreating}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={isCreating}
                  >
                    {isCreating ? "Creando..." : "Crear Usuario"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Asignar Ronda */}
      {showAssignModal && (
        <div className="modal-overlay" onClick={() => !isAssigning && setShowAssignModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Asignar Ronda</h2>
            
            <div className="form-group">
              <label className="form-label">Seleccionar Ronda</label>
              <select
                className="form-select"
                value={selectedRoundId}
                onChange={(e) => setSelectedRoundId(e.target.value)}
                disabled={isAssigning}
              >
                <option value="">-- Selecciona una ronda --</option>
                {rounds.map((round) => (
                  <option key={round.id} value={round.id}>
                    {round.name} ({round.locationCount} puntos)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowAssignModal(false)}
                disabled={isAssigning}
              >
                Cancelar
              </button>
              <button 
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={isAssigning || !selectedRoundId}
              >
                {isAssigning ? "Asignando..." : "Asignar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
