import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { UICard } from "@/components/ui-card"

export default async function OpportunitiesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: settings, error: sErr } = await supabase
    .from("user_settings")
    .select("active_workspace_id")
    .eq("user_id", user.id)
    .single()

  if (sErr) throw sErr
  const workspaceId = settings?.active_workspace_id
  if (!workspaceId) throw new Error("No active workspace")

  const { data: opportunities, error } = await supabase
    .from("opportunities")
    .select("id,title,description,created_at")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })

  if (error) throw error

  return (
    <AppShell>
      <PageHeader
        title="Projets"
        subtitle="Créez et gérez les projets de votre espace de travail."
        right={
          <Link href="/app/opportunities/new" style={{ padding: "10px 12px", border: "1px solid #ddd", borderRadius: 10, textDecoration: "none" }}>
            + Nouveau
          </Link>
        }
      />

      <UICard>
        {opportunities?.length ? (
          <div style={{ display: "grid", gap: 10 }}>
            {opportunities.map((o) => (
              <div key={o.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
                <div style={{ fontWeight: 700 }}>{o.title}</div>
                <div style={{ opacity: 0.75 }}>{o.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ opacity: 0.75 }}>Aucun projet pour le moment.</div>
        )}
      </UICard>
    </AppShell>
  )
}
