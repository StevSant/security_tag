"use server";

import { createClient } from "@supabase/supabase-js";

interface CreateUserResult {
  success: boolean;
  userId?: string;
  error?: string;
}

/**
 * Server Action para crear usuarios con rol asignado
 * Requiere SUPABASE_SERVICE_ROLE_KEY en las variables de entorno
 */
export async function createUserWithRole(
  email: string,
  password: string,
  fullName: string,
  role: "admin" | "staff" = "staff"
): Promise<CreateUserResult> {
  // Validar inputs
  if (!email || !password || !fullName) {
    return { success: false, error: "Todos los campos son requeridos" };
  }

  if (password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
  }

  // Crear cliente admin con service role key
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("Missing Supabase environment variables");
    return { 
      success: false, 
      error: "Error de configuración del servidor" 
    };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    // Crear usuario con Admin API
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      user_metadata: {
        full_name: fullName,
      },
      app_metadata: {
        role, // Asignar rol en app_metadata
      },
    });

    if (error) {
      console.error("Error creating user:", error);
      
      // Traducir errores comunes
      if (error.message.includes("already registered")) {
        return { success: false, error: "Este email ya está registrado" };
      }
      
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: "No se pudo crear el usuario" };
    }

    return {
      success: true,
      userId: data.user.id,
    };
  } catch (error) {
    console.error("Error in createUserWithRole:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

/**
 * Server Action para actualizar el rol de un usuario existente
 */
export async function updateUserRole(
  userId: string,
  newRole: "admin" | "staff"
): Promise<{ success: boolean; error?: string }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: "Error de configuración del servidor" };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      app_metadata: { role: newRole },
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
 * Server Action para listar todos los usuarios (admin)
 */
export async function listAllUsers(): Promise<{
  success: boolean;
  data?: Array<{
    id: string;
    email: string;
    fullName: string;
    role: string;
    createdAt: string;
  }>;
  error?: string;
}> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return { success: false, error: "Error de configuración del servidor" };
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: data.users.map((user) => ({
        id: user.id,
        email: user.email || "",
        fullName: (user.user_metadata?.full_name as string) || user.email || "",
        role: (user.app_metadata?.role as string) || "staff",
        createdAt: user.created_at,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

