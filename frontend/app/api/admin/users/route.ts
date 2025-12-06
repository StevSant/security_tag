import { createClient } from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/shared/infrastructure/supabase/server";
import { NextResponse } from "next/server";

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

export async function GET() {
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
        { error: "No autorizado" },
        { status: 403 }
      );
    }

    // Obtener usuarios con admin client
    const adminClient = createAdminClient();

    const { data: authUsers, error } = await adminClient.auth.admin.listUsers();

    if (error) {
      console.error("Error listing users:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Mapear usuarios
    const users = authUsers.users.map((user) => ({
      id: user.id,
      email: user.email || "",
      fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Sin nombre",
      role: user.app_metadata?.role || "staff",
      createdAt: user.created_at,
    }));

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Error in users API:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error interno del servidor" },
      { status: 500 }
    );
  }
}

