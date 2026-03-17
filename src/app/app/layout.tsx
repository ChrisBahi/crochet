import { AppShell } from "@/components/app-shell"
import { createClient } from "@/lib/supabase/server"

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
}

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const isAdmin = getAdminEmails().includes(user?.email ?? "")
  return <AppShell userId={user?.id ?? null} isAdmin={isAdmin}>{children}</AppShell>
}
