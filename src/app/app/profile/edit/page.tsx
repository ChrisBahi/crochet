import { requireUser } from "@/lib/auth/require-user"
import { createClient } from "@/lib/supabase/server"
import { ProfileEditForm } from "./profile-edit-form"

export default async function ProfileEditPage() {
  const user = await requireUser()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from("investor_profiles")
    .select("firm,role,country,ticket_min,ticket_max,sectors,geos")
    .eq("user_id", user.id)
    .maybeSingle()

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 52px" }}>

      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 8,
        }}>
          Passeport transactionnel
        </div>
        <h1 style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontStyle: "italic",
          fontSize: 28,
          fontWeight: 700,
          color: "#0A0A0A",
          margin: 0,
          lineHeight: 1,
        }}>
          Éditer le profil
        </h1>
      </div>

      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 40 }} />

      <ProfileEditForm profile={profile} />

    </div>
  )
}
