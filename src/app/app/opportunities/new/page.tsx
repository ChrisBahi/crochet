import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
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
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "48px 52px" }}>
      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#7A746E",
        marginBottom: 12,
      }}>
        Nouveau signal
      </div>
      <h1 style={{
        fontFamily: "var(--font-playfair), Georgia, serif",
        fontStyle: "italic",
        fontSize: 28,
        fontWeight: 700,
        color: "#0A0A0A",
        margin: "0 0 8px",
        lineHeight: 1.2,
      }}>
        Soumettre un dossier
      </h1>
      <p style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 13,
        color: "#7A746E",
        margin: "0 0 32px",
        lineHeight: 1.7,
      }}>
        Votre dossier sera qualifié par le moteur et transformé en signal investissable.
      </p>
      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 32 }} />
      <OpportunityForm action={createOpportunity} />
    </div>
  )
}
