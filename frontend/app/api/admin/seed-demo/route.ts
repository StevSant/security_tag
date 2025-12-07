import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Cliente con service_role para operaciones admin
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: Request) {
  try {
    const { staffUserIds, date } = await request.json();

    if (!staffUserIds || !Array.isArray(staffUserIds) || staffUserIds.length === 0) {
      return NextResponse.json(
        { error: "Se requiere al menos un ID de usuario staff" },
        { status: 400 }
      );
    }

    const targetDate = date || new Date().toISOString().split("T")[0];
    const results: { userId: string; tasksAssigned: number }[] = [];

    // Obtener todas las plantillas activas
    const { data: templates, error: templatesError } = await supabaseAdmin
      .from("task_templates")
      .select("*")
      .eq("is_active", true);

    if (templatesError) {
      return NextResponse.json(
        { error: "Error al obtener plantillas: " + templatesError.message },
        { status: 500 }
      );
    }

    if (!templates || templates.length === 0) {
      return NextResponse.json(
        { error: "No hay plantillas de tareas activas" },
        { status: 400 }
      );
    }

    // Asignar tareas a cada usuario
    for (const userId of staffUserIds) {
      const tasksToInsert = templates.map((t) => ({
        user_id: userId,
        template_id: t.id,
        assigned_date: targetDate,
        shift: "night",
        name: t.name,
        description: t.description,
        instructions: t.instructions,
        category: t.category,
        priority: t.priority,
        requires_photo: t.requires_photo,
        is_custom: false,
        status: "pending",
      }));

      const { error: insertError } = await supabaseAdmin
        .from("staff_tasks")
        .upsert(tasksToInsert, {
          onConflict: "user_id,template_id,assigned_date,shift",
          ignoreDuplicates: true,
        });

      if (insertError) {
        console.error(`Error asignando tareas a ${userId}:`, insertError);
      } else {
        results.push({ userId, tasksAssigned: templates.length });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Tareas asignadas a ${results.length} usuarios`,
      results,
      date: targetDate,
    });
  } catch (error) {
    console.error("Error en seed-demo:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}

// GET para obtener estado de datos de prueba
export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0];

    // Contar tareas de hoy
    const { count: todayTasks } = await supabaseAdmin
      .from("staff_tasks")
      .select("*", { count: "exact", head: true })
      .eq("assigned_date", today);

    // Contar templates activos
    const { count: activeTemplates } = await supabaseAdmin
      .from("task_templates")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    // Contar usuarios staff
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();
    const staffCount = users?.users?.filter(
      (u) => u.app_metadata?.role !== "admin"
    ).length || 0;

    return NextResponse.json({
      todayTasks: todayTasks || 0,
      activeTemplates: activeTemplates || 0,
      staffUsers: staffCount,
      date: today,
    });
  } catch (error) {
    console.error("Error obteniendo estado:", error);
    return NextResponse.json(
      { error: "Error al obtener estado" },
      { status: 500 }
    );
  }
}

