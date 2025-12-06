import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/shared/infrastructure/supabase/server";
import { NextRequest, NextResponse } from "next/server";

// Cliente admin con service_role key
function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario actual es admin
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const role = user.app_metadata?.role;
    if (role !== "admin") {
      return NextResponse.json(
        { error: "No autorizado. Solo admins pueden crear usuarios." },
        { status: 403 }
      );
    }

    // Obtener datos del body
    const body = await request.json();
    const { email, password, fullName, role: userRole = "staff" } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Faltan campos requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      );
    }

    // Crear usuario con admin client
    const adminClient = createAdminClient();

    const { data: newUser, error: createError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
      app_metadata: {
        role: userRole,
      },
      user_metadata: {
        full_name: fullName,
      },
    });

    if (createError) {
      console.error("Error creating user:", createError);
      
      // Traducir errores comunes
      let errorMessage = createError.message;
      if (createError.message.includes("already registered")) {
        errorMessage = "Este email ya está registrado";
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // El trigger handle_new_user creará el perfil automáticamente
    // Pero actualizamos el nombre por si acaso
    if (newUser.user) {
      await adminClient
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", newUser.user.id);
    }

    return NextResponse.json({
      success: true,
      userId: newUser.user?.id,
      message: "Usuario creado exitosamente",
    });
  } catch (error) {
    console.error("Error in create-user API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}

