import { createServerClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth/require-user";

export async function getActiveWorkspace() {
  const user = await requireUser();
  const supabase = await createServerClient();

  const { data: settings, error: settingsError } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (settingsError && settingsError.code !== "PGRST116") throw settingsError;
  if (!settings?.active_workspace_id) return { user, workspace: null };

  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .select("id,name,slug,created_by,created_at")
    .eq("id", settings.active_workspace_id)
    .maybeSingle();

  if (wsError && wsError.code !== "PGRST116") throw wsError;

  return { user, workspace };
}
