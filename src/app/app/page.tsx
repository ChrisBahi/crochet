import { requireUser } from "@/lib/auth/require-user";
import { requireActiveWorkspaceId } from "@/lib/auth/require-workspace";
import { getWorkspaceById } from "@/lib/db/workspaces";
import { AppShell } from "@/components/app-shell";

export default async function AppPage() {
  const user = await requireUser();
  const wsId = await requireActiveWorkspaceId();
  const workspace = wsId ? await getWorkspaceById(wsId) : null;

  return (
    <AppShell>
      <main className="p-8">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="opacity-80">Connecté en tant que {user.email}</p>

        <div className="mt-6 rounded-xl border p-6">
          <h2 className="font-medium">Workspace actif</h2>
          <p className="opacity-80">{workspace ? workspace.name : "Aucun workspace"}</p>
        </div>
      </main>
    </AppShell>
  );
}
