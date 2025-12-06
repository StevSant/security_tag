/**
 * Checkin Entity
 * Representa un registro de check-in en un punto de auditoría
 */

export interface Checkin {
  id: string;
  userId: string;
  locationId: string;
  assignmentId: string;
  proofPhotoUrl: string;
  hasIncident: boolean;
  damagePhotoUrl: string | null;
  damageDescription: string | null;
  nfcScanVerified: boolean;
  createdAt: Date;
}

export interface CreateCheckinDTO {
  locationId: string;
  assignmentId: string;
  proofPhotoUrl: string;
  hasIncident: boolean;
  damagePhotoUrl?: string;
  damageDescription?: string;
  nfcScanVerified?: boolean;
  deviceInfo?: Record<string, unknown>;
}

export interface Location {
  id: string;
  name: string;
  description: string | null;
  nfcTagId: string;
  floor: number | null;
  building: string | null;
  isActive: boolean;
}

export interface Round {
  id: string;
  name: string;
  description: string | null;
  locationIds: string[];
  estimatedDurationMinutes: number;
  isActive: boolean;
}

export interface DailyAssignment {
  id: string;
  userId: string;
  roundId: string;
  assignedDate: string;
  shift: 'morning' | 'afternoon' | 'night';
  status: 'pending' | 'in_progress' | 'completed' | 'incomplete';
  startedAt: Date | null;
  completedAt: Date | null;
}

/**
 * Valida los datos de un check-in antes de enviarlo
 */
export function validateCheckinData(data: CreateCheckinDTO): string[] {
  const errors: string[] = [];

  if (!data.locationId) {
    errors.push('La ubicación es requerida');
  }

  if (!data.assignmentId) {
    errors.push('La asignación es requerida');
  }

  if (!data.proofPhotoUrl) {
    errors.push('La foto de inspección es obligatoria');
  }

  if (data.hasIncident) {
    if (!data.damagePhotoUrl) {
      errors.push('La foto del daño es obligatoria cuando hay incidencia');
    }
    if (!data.damageDescription || data.damageDescription.trim() === '') {
      errors.push('La descripción del daño es obligatoria cuando hay incidencia');
    }
  }

  return errors;
}

