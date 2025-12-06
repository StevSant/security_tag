import { createClient } from "@/shared/infrastructure/supabase/client";

interface CreateUserResult {
  success: boolean;
  userId?: string;
  error?: string;
}

interface UserData {
  id: string;
  email: string;
  fullName: string;
  role: string;
  createdAt: string;
}

/**
 * Crear usuario via función RPC (requiere permisos especiales)
 * Esta función llama a una Edge Function de Supabase
 */
export async function createStaffUser(
  email: string,
  password: string,
  fullName: string
): Promise<CreateUserResult> {
  try {
    const supabase = createClient();
    
    // Llamar a la Edge Function para crear usuario
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: {
        email,
        password,
        fullName,
        role: "staff",
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      userId: data?.userId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Obtener lista de usuarios (admin only)
 */
export async function listUsers(): Promise<{
  success: boolean;
  data?: UserData[];
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    // Obtener perfiles con información del usuario
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map((profile: { id: string; full_name: string; created_at: string }) => ({
        id: profile.id,
        email: "", // No disponible desde profiles
        fullName: profile.full_name,
        role: "staff", // Por defecto
        createdAt: profile.created_at,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Asignar ronda a un usuario
 */
export async function assignRoundToUser(
  userId: string,
  roundId: string,
  assignedDate: string,
  shift: "morning" | "afternoon" | "night" = "night"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    const { error } = await supabase.from("daily_assignments").insert({
      user_id: userId,
      round_id: roundId,
      assigned_date: assignedDate,
      shift,
    });

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
 * Obtener rondas disponibles
 */
export async function getAvailableRounds(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string }>;
  error?: string;
}> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from("rounds")
      .select("id, name")
      .eq("is_active", true)
      .order("name");

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data || [],
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

