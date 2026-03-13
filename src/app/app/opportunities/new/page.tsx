import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { UICard } from "@/components/ui-card"
import { OpportunityForm } from "./opportunity-form"

export default async function NewOpportunityPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: settings, error: sErr } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .single()

  if (sErr) throw sErr
  const workspaceId = settings?.active_workspace_id
  if (!workspaceId) throw new Error("No active workspace")

  async function createOpportunity(
    prevState: { error?: string | null },
    formData: FormData
  ): Promise<{ error?: string | null }> {
    "use server"
    void prevState
    const supabase = await createClient()

    const title = String(formData.get("title") || "").trim()
    const description = String(formData.get("description") || "").trim()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect("/login")

    const { data: settings } = await supabase
      .from("user_settings")
      .select("active_workspace_id")
      .eq("user_id", user.id)
      .single()

    const workspaceId = settings?.active_workspace_id
    if (!workspaceId) throw new Error("No active workspace")

    if (!title) return { error: "Title is required" }

    const { error } = await supabase.from("opportunities").insert({
      workspace_id: workspaceId,
      created_by: user.id,
      title,
      description,
    })

    if (error) return { error: error.message }

    redirect("/app/opportunities")
  }

  return (
    <AppShell>
      <PageHeader title="Créer un projet" subtitle="Ajoutez un nouveau projet à votre espace de travail." />

      <UICard>
        <OpportunityForm action={createOpportunity} />
      </UICard>
    </AppShell>
  )
}
