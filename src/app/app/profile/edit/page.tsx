import { requireUser } from "@/lib/auth/require-user"
import { createClient } from "@/lib/supabase/server"
import { ProfileEditForm } from "./profile-edit-form"
import { cookies } from "next/headers"

export default async function ProfileEditPage({
  searchParams,
}: {
  searchParams: Promise<{ onboarding?: string }>
}) {
  const user = await requireUser()
  const supabase = await createClient()
  const params = await searchParams
  const isOnboarding = params.onboarding === "1"
  const cookieStore = await cookies()
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en"

  const t = {
    passport:       lang === "en" ? "Transactional passport" : "Passeport transactionnel",
    welcomeTitle:   lang === "en" ? "Welcome to CROCHET." : "Bienvenue sur CROCHET.",
    welcomeBody:    lang === "en"
      ? "Complete your transactional passport to activate the matching engine."
      : "Complétez votre passeport transactionnel pour activer le moteur de matching.",
    createProfile:  lang === "en" ? "Create my profile" : "Créer mon profil",
    editProfile:    lang === "en" ? "Edit profile" : "Éditer le profil",
  }

  const { data: profile } = await supabase
    .from("investor_profiles")
    .select("firm,role,country,ticket_min,ticket_max,sectors,geos")
    .eq("user_id", user.id)
    .maybeSingle()

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 52px" }}>

      {isOnboarding && (
        <div style={{
          padding: "16px 20px",
          background: "#F5F0E8",
          border: "1px solid #E0DAD0",
          marginBottom: 32,
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#0A0A0A",
            flexShrink: 0,
            marginTop: 5,
            display: "inline-block",
          }} />
          <div>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13,
              fontWeight: 600,
              color: "#0A0A0A",
              marginBottom: 4,
            }}>
              {t.welcomeTitle}
            </div>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              color: "#7A746E",
              lineHeight: 1.65,
            }}>
              {t.welcomeBody}
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 8,
        }}>
          {t.passport}
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
          {isOnboarding ? t.createProfile : t.editProfile}
        </h1>
      </div>

      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 40 }} />

      <ProfileEditForm profile={profile} />

    </div>
  )
}
