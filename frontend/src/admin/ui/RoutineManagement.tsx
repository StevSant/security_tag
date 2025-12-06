"use client";

import { useState, useEffect } from "react";
import {
  getRounds,
  getLocations,
  getRoundDetails,
  createCustomRound,
  createAssignmentForDate,
  getUsers,
} from "../infrastructure/supabase/users.mutations";

interface Round {
  id: string;
  name: string;
  locationCount: number;
}

interface Location {
  id: string;
  name: string;
  floor: number | null;
  building: string | null;
}

interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
}

type ModalType = "none" | "create" | "assign" | "view";

export function RoutineManagement() {
  // Data states
  const [rounds, setRounds] = useState<Round[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [modalType, setModalType] = useState<ModalType>("none");
  const [selectedRound, setSelectedRound] = useState<Round | null>(null);
  const [roundDetails, setRoundDetails] = useState<{
    locationIds: string[];
    description: string | null;
  } | null>(null);

  // Create form states
  const [newRoutineName, setNewRoutineName] = useState("");
  const [newRoutineDescription, setNewRoutineDescription] = useState("");
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const [estimatedDuration, setEstimatedDuration] = useState(30);
  const [isCreating, setIsCreating] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);

  // Assign form states
  const [selectedUserId, setSelectedUserId] = useState("");
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split("T")[0]);
  const [assignShift, setAssignShift] = useState<"morning" | "afternoon" | "night">("night");
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const [roundsResult, locationsResult, usersResult] = await Promise.all([
      getRounds(),
      getLocations(),
      getUsers(),
    ]);

    if (roundsResult.success && roundsResult.data) {
      setRounds(roundsResult.data);
    }
    if (locationsResult.success && locationsResult.data) {
      setLocations(locationsResult.data);
    }
    if (usersResult.success && usersResult.data) {
      setUsers(usersResult.data.filter(u => u.role === "staff"));
    }

    setIsLoading(false);
  };

  const handleViewRound = async (round: Round) => {
    setSelectedRound(round);
    const result = await getRoundDetails(round.id);
    if (result.success && result.data) {
      setRoundDetails({
        locationIds: result.data.locationIds,
        description: result.data.description,
      });
    }
    setModalType("view");
  };

  const handleDuplicateRound = async (round: Round) => {
    const result = await getRoundDetails(round.id);
    if (result.success && result.data) {
      setNewRoutineName(`${round.name} (Copia)`);
      setNewRoutineDescription(result.data.description || "");
      setSelectedLocationIds(result.data.locationIds);
      setEstimatedDuration(result.data.estimatedDuration);
      setModalType("create");
    }
  };

  const handleAssignRound = (round: Round) => {
    setSelectedRound(round);
    setModalType("assign");
  };

  const handleCreateRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineName || selectedLocationIds.length === 0) return;

    setIsCreating(true);
    const result = await createCustomRound(
      newRoutineName,
      newRoutineDescription,
      selectedLocationIds,
      estimatedDuration
    );

    if (result.success) {
      setCreateSuccess(true);
      loadData();
      setTimeout(() => {
        closeModal();
      }, 1500);
    } else {
      setError(result.error || "Error creando rutina");
    }
    setIsCreating(false);
  };

  const handleAssign = async () => {
    if (!selectedRound || !selectedUserId) return;

    setIsAssigning(true);
    const result = await createAssignmentForDate(
      selectedUserId,
      selectedRound.id,
      assignDate,
      assignShift
    );

    if (result.success) {
      closeModal();
    } else {
      setError(result.error || "Error asignando rutina");
    }
    setIsAssigning(false);
  };

  const closeModal = () => {
    setModalType("none");
    setSelectedRound(null);
    setRoundDetails(null);
    setNewRoutineName("");
    setNewRoutineDescription("");
    setSelectedLocationIds([]);
    setEstimatedDuration(30);
    setCreateSuccess(false);
    setSelectedUserId("");
    setError(null);
  };

  const toggleLocation = (locationId: string) => {
    setSelectedLocationIds(prev =>
      prev.includes(locationId)
        ? prev.filter(id => id !== locationId)
        : [...prev, locationId]
    );
  };

  const moveLocation = (index: number, direction: "up" | "down") => {
    const newOrder = [...selectedLocationIds];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    setSelectedLocationIds(newOrder);
  };

  const getFloorText = (floor: number | null) => {
    if (floor === null) return "";
    if (floor === 0) return "PB";
    if (floor < 0) return `S${Math.abs(floor)}`;
    return `P${floor}`;
  };

  const getLocationById = (id: string) => locations.find(l => l.id === id);

  return (
    <div className="routine-management">
      <style jsx>{`
        .routine-management {
          padding: 24px;
          max-width: 1200px;
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
          color: var(--text-primary);
          margin: 0;
        }

        .subtitle {
          font-size: 14px;
          color: var(--text-muted);
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
          background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
          color: white;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover {
          background: var(--bg-hover);
        }

        .btn-small {
          padding: 8px 14px;
          font-size: 12px;
        }

        .rounds-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
        }

        .round-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s;
        }

        .round-card:hover {
          border-color: var(--color-primary);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .round-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .round-name {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0;
        }

        .round-badge {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-primary);
          padding: 4px 10px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }

        .round-meta {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          font-size: 13px;
          color: var(--text-muted);
        }

        .round-actions {
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
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 32px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 24px 0;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 12px 14px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 14px;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .form-textarea {
          min-height: 80px;
          resize: vertical;
        }

        .locations-section {
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 16px;
        }

        .locations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .locations-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .locations-count {
          font-size: 12px;
          color: var(--text-muted);
        }

        .locations-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 300px;
          overflow-y: auto;
        }

        .location-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.15s;
        }

        .location-item:hover {
          border-color: var(--color-primary);
        }

        .location-item.selected {
          border-color: var(--color-primary);
          background: rgba(16, 185, 129, 0.05);
        }

        .location-checkbox {
          width: 18px;
          height: 18px;
          border: 2px solid var(--border-color);
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .location-item.selected .location-checkbox {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }

        .location-info {
          flex: 1;
          min-width: 0;
        }

        .location-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .location-floor {
          font-size: 11px;
          color: var(--text-muted);
        }

        .location-order {
          display: flex;
          gap: 4px;
        }

        .order-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-muted);
        }

        .order-btn:hover {
          background: var(--bg-hover);
          color: var(--text-primary);
        }

        .selected-locations {
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid var(--border-color);
        }

        .selected-locations-title {
          font-size: 12px;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .selected-location-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--bg-card);
          border-radius: 6px;
          margin-bottom: 6px;
        }

        .selected-location-number {
          width: 24px;
          height: 24px;
          background: var(--color-primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
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
          color: var(--color-danger);
          font-size: 13px;
          margin-bottom: 16px;
        }

        .success-message {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.3);
          border-radius: 8px;
          padding: 16px;
          color: var(--color-success);
          font-size: 14px;
          text-align: center;
        }

        .loading {
          display: flex;
          justify-content: center;
          padding: 60px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 3px solid var(--border-color);
          border-top-color: var(--color-primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-muted);
        }

        .empty-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }
      `}</style>

      <div className="header">
        <div>
          <h1 className="title">📋 Gestión de Rutinas</h1>
          <p className="subtitle">Crear y administrar rutinas de supervisión</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModalType("create")}>
          + Nueva Rutina
        </button>
      </div>

      {isLoading ? (
        <div className="loading">
          <div className="spinner" />
        </div>
      ) : rounds.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>No hay rutinas creadas</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: 16 }}
            onClick={() => setModalType("create")}
          >
            Crear primera rutina
          </button>
        </div>
      ) : (
        <div className="rounds-grid">
          {rounds.map((round) => (
            <div key={round.id} className="round-card">
              <div className="round-header">
                <h3 className="round-name">{round.name}</h3>
                <span className="round-badge">{round.locationCount} checkpoints</span>
              </div>
              <div className="round-meta">
                <span>🗺️ {round.locationCount} ubicaciones</span>
              </div>
              <div className="round-actions">
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleViewRound(round)}
                >
                  👁️ Ver
                </button>
                <button
                  className="btn btn-secondary btn-small"
                  onClick={() => handleDuplicateRound(round)}
                >
                  📋 Duplicar
                </button>
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => handleAssignRound(round)}
                >
                  👤 Asignar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear/Editar Rutina */}
      {modalType === "create" && (
        <div className="modal-overlay" onClick={() => !isCreating && closeModal()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Crear Nueva Rutina</h2>

            {createSuccess ? (
              <div className="success-message">
                ✅ Rutina creada exitosamente
              </div>
            ) : (
              <form onSubmit={handleCreateRoutine}>
                <div className="form-group">
                  <label className="form-label">Nombre de la Rutina</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: Ronda Nocturna Pisos 1-3"
                    value={newRoutineName}
                    onChange={(e) => setNewRoutineName(e.target.value)}
                    required
                    disabled={isCreating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción (opcional)</label>
                  <textarea
                    className="form-textarea"
                    placeholder="Descripción de la rutina..."
                    value={newRoutineDescription}
                    onChange={(e) => setNewRoutineDescription(e.target.value)}
                    disabled={isCreating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Duración Estimada (minutos)</label>
                  <input
                    type="number"
                    className="form-input"
                    min="5"
                    max="240"
                    value={estimatedDuration}
                    onChange={(e) => setEstimatedDuration(Number(e.target.value))}
                    disabled={isCreating}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Seleccionar Ubicaciones</label>
                  <div className="locations-section">
                    <div className="locations-header">
                      <span className="locations-title">Ubicaciones Disponibles</span>
                      <span className="locations-count">
                        {selectedLocationIds.length} seleccionadas
                      </span>
                    </div>
                    <div className="locations-list">
                      {locations.map((location) => (
                        <div
                          key={location.id}
                          className={`location-item ${selectedLocationIds.includes(location.id) ? "selected" : ""}`}
                          onClick={() => toggleLocation(location.id)}
                        >
                          <div className="location-checkbox">
                            {selectedLocationIds.includes(location.id) && "✓"}
                          </div>
                          <div className="location-info">
                            <div className="location-name">{location.name}</div>
                            <div className="location-floor">
                              {getFloorText(location.floor)} · {location.building || "Principal"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {selectedLocationIds.length > 0 && (
                      <div className="selected-locations">
                        <div className="selected-locations-title">
                          Orden de los checkpoints (arrastrar para reordenar):
                        </div>
                        {selectedLocationIds.map((id, index) => {
                          const loc = getLocationById(id);
                          return (
                            <div key={id} className="selected-location-item">
                              <span className="selected-location-number">{index + 1}</span>
                              <span style={{ flex: 1 }}>{loc?.name}</span>
                              <div className="location-order">
                                <button
                                  type="button"
                                  className="order-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveLocation(index, "up");
                                  }}
                                  disabled={index === 0}
                                >
                                  ↑
                                </button>
                                <button
                                  type="button"
                                  className="order-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    moveLocation(index, "down");
                                  }}
                                  disabled={index === selectedLocationIds.length - 1}
                                >
                                  ↓
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeModal}
                    disabled={isCreating}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isCreating || !newRoutineName || selectedLocationIds.length === 0}
                  >
                    {isCreating ? "Creando..." : "Crear Rutina"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Modal Ver Rutina */}
      {modalType === "view" && selectedRound && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">{selectedRound.name}</h2>

            {roundDetails && (
              <>
                {roundDetails.description && (
                  <p style={{ color: "var(--text-muted)", marginBottom: 20 }}>
                    {roundDetails.description}
                  </p>
                )}

                <div className="locations-section">
                  <div className="locations-header">
                    <span className="locations-title">Checkpoints en orden</span>
                    <span className="locations-count">
                      {roundDetails.locationIds.length} ubicaciones
                    </span>
                  </div>
                  <div className="locations-list">
                    {roundDetails.locationIds.map((id, index) => {
                      const loc = getLocationById(id);
                      return (
                        <div key={id} className="selected-location-item">
                          <span className="selected-location-number">{index + 1}</span>
                          <div className="location-info">
                            <div className="location-name">{loc?.name || "Ubicación no encontrada"}</div>
                            <div className="location-floor">
                              {loc && getFloorText(loc.floor)} · {loc?.building || "Principal"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}

            <div className="form-actions">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cerrar
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  closeModal();
                  handleDuplicateRound(selectedRound);
                }}
              >
                Duplicar y Editar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Asignar Rutina */}
      {modalType === "assign" && selectedRound && (
        <div className="modal-overlay" onClick={() => !isAssigning && closeModal()}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Asignar: {selectedRound.name}</h2>

            <div className="form-group">
              <label className="form-label">Seleccionar Botón</label>
              <select
                className="form-select"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                disabled={isAssigning}
              >
                <option value="">-- Selecciona un botón --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
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
                min={new Date().toISOString().split("T")[0]}
                disabled={isAssigning}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Turno</label>
              <select
                className="form-select"
                value={assignShift}
                onChange={(e) => setAssignShift(e.target.value as typeof assignShift)}
                disabled={isAssigning}
              >
                <option value="morning">Mañana</option>
                <option value="afternoon">Tarde</option>
                <option value="night">Noche</option>
              </select>
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={closeModal}
                disabled={isAssigning}
              >
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAssign}
                disabled={isAssigning || !selectedUserId}
              >
                {isAssigning ? "Asignando..." : "Asignar Rutina"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

