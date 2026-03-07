import { AppShell } from "@/components/app-shell"
import { createClient } from "@/lib/supabase/server"

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <AppShell userId={user?.id ?? null}>{children}</AppShell>
}
