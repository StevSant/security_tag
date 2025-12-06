import { createClient } from "@/shared/infrastructure/supabase/client";
import type { CreateCheckinDTO, Checkin } from "../../domain/checkin.entity";

interface MutationResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Crea un nuevo check-in en la base de datos
 */
export async function createCheckin(
  dto: CreateCheckinDTO
): Promise<MutationResult<Checkin>> {
  try {
    const supabase = createClient();
    
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      return { success: false, error: "Usuario no autenticado" };
    }

    const { data, error } = await supabase
      .from("checkins")
      .insert({
        user_id: userData.user.id,
        location_id: dto.locationId,
        assignment_id: dto.assignmentId,
        proof_photo_url: dto.proofPhotoUrl,
        has_incident: dto.hasIncident,
        damage_photo_url: dto.damagePhotoUrl || null,
        damage_description: dto.damageDescription || null,
        nfc_scan_verified: dto.nfcScanVerified || false,
        device_info: dto.deviceInfo || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating checkin:", error);
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: mapToCheckin(data),
    };
  } catch (error) {
    console.error("Error in createCheckin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Actualiza el estado de una asignación diaria
 */
export async function updateAssignmentStatus(
  assignmentId: string,
  status: "pending" | "in_progress" | "completed" | "incomplete"
): Promise<MutationResult<void>> {
  try {
    const supabase = createClient();
    
    const updateData: Record<string, unknown> = { status };
    
    if (status === "in_progress") {
      updateData.started_at = new Date().toISOString();
    } else if (status === "completed" || status === "incomplete") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("daily_assignments")
      .update(updateData)
      .eq("id", assignmentId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Mock para desarrollo - simula la creación de check-in
 */
export async function createCheckinMock(
  dto: CreateCheckinDTO
): Promise<MutationResult<Checkin>> {
  // Simular delay
  await new Promise((resolve) => setTimeout(resolve, 800));
  
  console.log("[MOCK] Creating checkin:", dto);
  
  return {
    success: true,
    data: {
      id: crypto.randomUUID(),
      userId: "mock-user-id",
      locationId: dto.locationId,
      assignmentId: dto.assignmentId,
      proofPhotoUrl: dto.proofPhotoUrl,
      hasIncident: dto.hasIncident,
      damagePhotoUrl: dto.damagePhotoUrl || null,
      damageDescription: dto.damageDescription || null,
      nfcScanVerified: dto.nfcScanVerified || false,
      createdAt: new Date(),
    },
  };
}

// Mapper de DB a Entity
function mapToCheckin(dbRecord: Record<string, unknown>): Checkin {
  return {
    id: dbRecord.id as string,
    userId: dbRecord.user_id as string,
    locationId: dbRecord.location_id as string,
    assignmentId: dbRecord.assignment_id as string,
    proofPhotoUrl: dbRecord.proof_photo_url as string,
    hasIncident: dbRecord.has_incident as boolean,
    damagePhotoUrl: dbRecord.damage_photo_url as string | null,
    damageDescription: dbRecord.damage_description as string | null,
    nfcScanVerified: dbRecord.nfc_scan_verified as boolean,
    createdAt: new Date(dbRecord.created_at as string),
  };
}

