import { createClient } from "@/shared/infrastructure/supabase/client";

const supabase = createClient();

// Tipos
export interface TaskTemplate {
  id: string;
  name: string;
  description: string | null;
  category: "inspection" | "security" | "maintenance" | "cleaning" | "emergency";
  instructions: string | null;
  requires_photo: boolean;
  estimated_minutes: number;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface StaffTask {
  id: string;
  user_id: string;
  template_id: string | null;
  assigned_date: string;
  shift: "morning" | "afternoon" | "night";
  name: string;
  description: string | null;
  instructions: string | null;
  category: string;
  priority: number;
  requires_photo: boolean;
  is_custom: boolean;
  location_id: string | null;
  status: "pending" | "in_progress" | "completed" | "skipped" | "blocked";
  started_at: string | null;
  completed_at: string | null;
  completion_notes: string | null;
  evidence_photo_url: string | null;
  assigned_by: string | null;
  created_at: string;
  // Joined
  location?: { name: string } | null;
  user?: { full_name: string } | null;
}

export interface StaffUser {
  id: string;
  full_name: string;
  email?: string;
}

// ============================================
// TASK TEMPLATES
// ============================================

export async function fetchTaskTemplates(): Promise<TaskTemplate[]> {
  const { data, error } = await supabase
    .from("task_templates")
    .select("*")
    .order("priority", { ascending: false })
    .order("name");

  if (error) {
    console.error("Error fetching task templates:", error);
    return [];
  }
  return data || [];
}

export async function createTaskTemplate(
  template: Omit<TaskTemplate, "id" | "created_at">
): Promise<TaskTemplate | null> {
  const { data, error } = await supabase
    .from("task_templates")
    .insert(template)
    .select()
    .single();

  if (error) {
    console.error("Error creating task template:", error);
    return null;
  }
  return data;
}

export async function updateTaskTemplate(
  id: string,
  updates: Partial<TaskTemplate>
): Promise<boolean> {
  const { error } = await supabase
    .from("task_templates")
    .update(updates)
    .eq("id", id);

  if (error) {
    console.error("Error updating task template:", error);
    return false;
  }
  return true;
}

export async function deleteTaskTemplate(id: string): Promise<boolean> {
  const { error } = await supabase
    .from("task_templates")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting task template:", error);
    return false;
  }
  return true;
}

// ============================================
// STAFF TASKS
// ============================================

export async function fetchStaffTasks(
  userId?: string,
  date?: string
): Promise<StaffTask[]> {
  let query = supabase
    .from("staff_tasks")
    .select(`
      *,
      location:locations(name),
      user:profiles(full_name)
    `)
    .order("priority", { ascending: false })
    .order("created_at");

  if (userId) {
    query = query.eq("user_id", userId);
  }

  if (date) {
    query = query.eq("assigned_date", date);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching staff tasks:", error);
    return [];
  }
  return data || [];
}

export async function fetchMyTasks(date?: string): Promise<StaffTask[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  return fetchStaffTasks(user.id, date);
}

export async function assignTaskToUser(
  task: Omit<StaffTask, "id" | "created_at" | "location" | "user">
): Promise<StaffTask | null> {
  const { data, error } = await supabase
    .from("staff_tasks")
    .insert(task)
    .select()
    .single();

  if (error) {
    console.error("Error assigning task:", error);
    return null;
  }
  return data;
}

export async function assignDefaultTasksToUser(
  userId: string,
  date: string,
  shift: "morning" | "afternoon" | "night"
): Promise<boolean> {
  // Obtener todos los templates activos
  const templates = await fetchTaskTemplates();
  const activeTemplates = templates.filter((t) => t.is_active);

  const { data: { user } } = await supabase.auth.getUser();

  const tasks = activeTemplates.map((t) => ({
    user_id: userId,
    template_id: t.id,
    assigned_date: date,
    shift,
    name: t.name,
    description: t.description,
    instructions: t.instructions,
    category: t.category,
    priority: t.priority,
    requires_photo: t.requires_photo,
    is_custom: false,
    assigned_by: user?.id || null,
  }));

  const { error } = await supabase.from("staff_tasks").insert(tasks);

  if (error) {
    console.error("Error assigning default tasks:", error);
    return false;
  }
  return true;
}

export async function assignCustomTask(
  userId: string,
  task: {
    name: string;
    description?: string;
    instructions?: string;
    category?: string;
    priority?: number;
    requires_photo?: boolean;
    location_id?: string;
    assigned_date: string;
    shift: "morning" | "afternoon" | "night";
  }
): Promise<StaffTask | null> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("staff_tasks")
    .insert({
      user_id: userId,
      template_id: null,
      assigned_date: task.assigned_date,
      shift: task.shift,
      name: task.name,
      description: task.description || null,
      instructions: task.instructions || null,
      category: task.category || "inspection",
      priority: task.priority || 3,
      requires_photo: task.requires_photo ?? true,
      is_custom: true,
      location_id: task.location_id || null,
      assigned_by: user?.id || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error assigning custom task:", error);
    return null;
  }
  return data;
}

export async function updateTaskStatus(
  taskId: string,
  status: StaffTask["status"],
  notes?: string,
  photoUrl?: string
): Promise<boolean> {
  const updates: Partial<StaffTask> = { status };

  if (status === "in_progress") {
    updates.started_at = new Date().toISOString();
  } else if (status === "completed") {
    updates.completed_at = new Date().toISOString();
  }

  if (notes) {
    updates.completion_notes = notes;
  }

  if (photoUrl) {
    updates.evidence_photo_url = photoUrl;
  }

  const { error } = await supabase
    .from("staff_tasks")
    .update(updates)
    .eq("id", taskId);

  if (error) {
    console.error("Error updating task status:", error);
    return false;
  }
  return true;
}

export async function deleteStaffTask(taskId: string): Promise<boolean> {
  const { error } = await supabase
    .from("staff_tasks")
    .delete()
    .eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    return false;
  }
  return true;
}

// ============================================
// STAFF USERS (para asignar tareas)
// ============================================

export async function fetchStaffUsers(): Promise<StaffUser[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name")
    .order("full_name");

  if (error) {
    console.error("Error fetching staff users:", error);
    return [];
  }
  return data || [];
}

// ============================================
// ESTADÍSTICAS
// ============================================

export async function fetchTaskStats(date?: string) {
  const targetDate = date || new Date().toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("staff_tasks")
    .select("status, user_id")
    .eq("assigned_date", targetDate);

  if (error) {
    console.error("Error fetching task stats:", error);
    return null;
  }

  const stats = {
    total: data.length,
    completed: data.filter((t) => t.status === "completed").length,
    pending: data.filter((t) => t.status === "pending").length,
    inProgress: data.filter((t) => t.status === "in_progress").length,
    uniqueUsers: new Set(data.map((t) => t.user_id)).size,
  };

  return {
    ...stats,
    completionRate: stats.total > 0 
      ? Math.round((stats.completed / stats.total) * 100) 
      : 0,
  };
}

