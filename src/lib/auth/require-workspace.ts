import { requireUser } from "@/lib/auth/require-user";
import { createClient } from "@/lib/supabase/server";

export async function requireActiveWorkspaceId() {
  const user = await requireUser();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    // Tolerate setup-phase DB/RLS issues and treat as "no active workspace" for now.
    if (["PGRST116", "42P01", "42P17", "42501"].includes(error.code ?? "")) {
      return null;
    }
    throw error;
  }
  if (!data?.active_workspace_id) return null;

  return data.active_workspace_id as string;
}
