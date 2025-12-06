import type { CreateCheckinDTO, Checkin } from "../domain/checkin.entity";
import { validateCheckinData } from "../domain/checkin.entity";
import { createCheckin } from "../infrastructure/supabase/checkin.mutations";
import { uploadPhoto } from "../infrastructure/supabase/photo.storage";

interface SubmitCheckinParams {
  locationId: string;
  assignmentId: string;
  userId: string;
  proofPhotoUri: string;
  hasIncident: boolean;
  damagePhotoUri?: string;
  damageDescription?: string;
  nfcScanVerified?: boolean;
}

interface SubmitResult {
  success: boolean;
  checkin?: Checkin;
  errors?: string[];
}

/**
 * Caso de uso: Enviar un check-in completo
 * 
 * Este caso de uso orquesta:
 * 1. Validación de datos
 * 2. Subida de foto(s) al storage
 * 3. Creación del registro en la base de datos
 */
export async function submitCheckin(params: SubmitCheckinParams): Promise<SubmitResult> {
  try {
    // 1. Subir foto de prueba (obligatoria)
    const proofUpload = await uploadPhoto(
      params.proofPhotoUri,
      params.userId,
      params.assignmentId,
      "proof"
    );

    if (!proofUpload.success) {
      return {
        success: false,
        errors: [`Error subiendo foto de inspección: ${proofUpload.error}`],
      };
    }

    // 2. Si hay incidencia, subir foto de daño
    let damagePhotoUrl: string | undefined;
    if (params.hasIncident && params.damagePhotoUri) {
      const damageUpload = await uploadPhoto(
        params.damagePhotoUri,
        params.userId,
        params.assignmentId,
        "damage"
      );

      if (!damageUpload.success) {
        return {
          success: false,
          errors: [`Error subiendo foto de daño: ${damageUpload.error}`],
        };
      }
      damagePhotoUrl = damageUpload.url;
    }

    // 3. Preparar DTO para crear check-in
    const dto: CreateCheckinDTO = {
      locationId: params.locationId,
      assignmentId: params.assignmentId,
      proofPhotoUrl: proofUpload.url!,
      hasIncident: params.hasIncident,
      damagePhotoUrl,
      damageDescription: params.damageDescription,
      nfcScanVerified: params.nfcScanVerified,
      deviceInfo: {
        userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
        timestamp: new Date().toISOString(),
      },
    };

    // 4. Validar datos
    const validationErrors = validateCheckinData(dto);
    if (validationErrors.length > 0) {
      return { success: false, errors: validationErrors };
    }

    // 5. Crear check-in en la base de datos
    const result = await createCheckin(dto);

    if (!result.success) {
      return {
        success: false,
        errors: [result.error || "Error creando check-in"],
      };
    }

    return {
      success: true,
      checkin: result.data,
    };
  } catch (error) {
    console.error("Error in submitCheckin:", error);
    return {
      success: false,
      errors: [error instanceof Error ? error.message : "Error inesperado"],
    };
  }
}
