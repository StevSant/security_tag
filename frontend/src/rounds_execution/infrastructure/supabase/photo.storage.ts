import { createClient } from "@/shared/infrastructure/supabase/client";

const BUCKET_NAME = "evidence_photos";

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

/**
 * Genera un nombre de archivo único para la foto
 */
function generateFileName(
  userId: string,
  assignmentId: string,
  type: "proof" | "damage"
): string {
  const timestamp = Date.now();
  return `${userId}/${assignmentId}/${type}_${timestamp}.jpg`;
}

/**
 * Convierte un data URI a Blob
 */
function dataURItoBlob(dataURI: string): Blob {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  
  return new Blob([ab], { type: mimeString });
}

/**
 * Sube una foto al bucket de evidencias
 * @param uri - Data URI o URL de la imagen
 * @param userId - ID del usuario que sube la foto
 * @param assignmentId - ID de la asignación actual
 * @param type - Tipo de foto: 'proof' (inspección) o 'damage' (daño)
 */
export async function uploadPhoto(
  uri: string,
  userId: string,
  assignmentId: string,
  type: "proof" | "damage"
): Promise<UploadResult> {
  try {
    const supabase = createClient();
    const fileName = generateFileName(userId, assignmentId, type);
    
    // Convertir data URI a blob si es necesario
    let fileData: Blob | string = uri;
    if (uri.startsWith("data:")) {
      fileData = dataURItoBlob(uri);
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, fileData, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading photo:", error);
      return { success: false, error: error.message };
    }

    // Obtener URL pública o firmada
    const { data: urlData } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(data.path, 60 * 60 * 24 * 7); // 7 días

    return {
      success: true,
      url: urlData?.signedUrl || data.path,
    };
  } catch (error) {
    console.error("Error in uploadPhoto:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Obtiene URL firmada de una foto existente
 */
export async function getSignedPhotoUrl(
  path: string,
  expiresIn: number = 3600
): Promise<string | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(path, expiresIn);

    if (error) {
      console.error("Error getting signed URL:", error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error("Error in getSignedPhotoUrl:", error);
    return null;
  }
}
