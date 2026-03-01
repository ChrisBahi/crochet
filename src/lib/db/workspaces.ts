import { createClient } from "@/lib/supabase/server";

export async function getWorkspaceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("workspaces")
    .select("id, name, slug, created_by, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    if (["PGRST116", "42P01", "42P17", "42501"].includes(error.code ?? "")) {
      return null;
    }
    throw error;
  }
  return data;
}
