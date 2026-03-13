import { AppShell } from "@/components/app-shell"
import { PageHeader } from "@/components/page-header"
import { UICard } from "@/components/ui-card"
import { requireUser } from "@/lib/auth/require-user"
import { requireActiveWorkspaceId } from "@/lib/auth/require-workspace"
import { getWorkspaceById } from "@/lib/db/workspaces"

export default async function SettingsPage() {
  const user = await requireUser()
  const wsId = await requireActiveWorkspaceId()
  const workspace = wsId ? await getWorkspaceById(wsId) : null

  return (
    <AppShell>
      <PageHeader
        title="Paramètres"
        subtitle="Gérez les paramètres de votre compte et de votre espace de travail."
      />

      <UICard>
        <div style={{ display: "grid", gap: 16 }}>
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Compte</div>
            <div style={{ opacity: 0.75 }}>{user.email}</div>
          </div>
          <hr style={{ border: "none", borderTop: "1px solid #eee" }} />
          <div>
            <div style={{ fontWeight: 700, marginBottom: 4 }}>Espace de travail actif</div>
            <div style={{ opacity: 0.75 }}>{workspace ? workspace.name : "Aucun espace de travail"}</div>
          </div>
        </div>
      </UICard>
    </AppShell>
  )
}
