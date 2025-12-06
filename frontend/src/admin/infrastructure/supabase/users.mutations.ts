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
 * Crea un nuevo usuario staff usando el Server Action
 * Nota: La creación real se hace via Server Action con service_role
 */
export async function createStaffUser(
  email: string,
  password: string,
  fullName: string
): Promise<CreateUserResult> {
  try {
    const response = await fetch("/api/admin/create-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        fullName,
        role: "staff",
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error || "Error creando usuario" };
    }

    return { success: true, userId: result.userId };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error de conexión",
    };
  }
}

/**
 * Obtiene la lista de usuarios (solo admins)
 */
export async function getUsers(): Promise<{
  success: boolean;
  data?: UserData[];
  error?: string;
}> {
  try {
    const response = await fetch("/api/admin/users");
    const result = await response.json();

    if (!response.ok) {
      return { success: false, error: result.error };
    }

    return { success: true, data: result.users };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error de conexión",
    };
  }
}

/**
 * Crea una asignación diaria para un usuario
 */
export async function createAssignment(
  userId: string,
  roundId: string,
  shift: "morning" | "afternoon" | "night" = "night"
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("daily_assignments").insert({
      user_id: userId,
      round_id: roundId,
      assigned_date: today,
      shift,
      status: "pending",
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
 * Obtiene las rondas disponibles
 */
export async function getRounds(): Promise<{
  success: boolean;
  data?: Array<{ id: string; name: string; locationCount: number }>;
  error?: string;
}> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("rounds")
      .select("id, name, location_ids")
      .eq("is_active", true);

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: (data || []).map((round: { id: string; name: string; location_ids: string[] | null }) => ({
        id: round.id,
        name: round.name,
        locationCount: round.location_ids?.length || 0,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}
