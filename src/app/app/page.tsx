import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth/require-user"
import { requireActiveWorkspaceId } from "@/lib/auth/require-workspace"
import { redirect } from "next/navigation"
import Link from "next/link"
import { cookies } from "next/headers"

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div style={{
      border: "1px solid #E0DAD0",
      padding: "24px 28px",
      flex: 1,
    }}>
      <div style={{
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 40,
        fontWeight: 700,
        color: "#0A0A0A",
        lineHeight: 1,
        letterSpacing: "-0.02em",
        marginBottom: 8,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 10,
        color: "#7A746E",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
      }}>
        {label}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const user = await requireUser()
  const wsId = await requireActiveWorkspaceId()
  const supabase = await createClient()
  const cookieStore = await cookies()
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en"

  // Resolve tunnel for this user
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).filter(Boolean)
  const isAdmin = adminEmails.includes(user.email ?? "")
  let tunnel = (user.user_metadata?.tunnel as string) ?? ""
  if (!tunnel && !isAdmin) {
    const admin = createAdminClient()
    const { data: ar } = await admin
      .from("admission_requests")
      .select("tunnel")
      .eq("email", user.email)
      .maybeSingle()
    tunnel = ar?.tunnel ?? ""
  }

  // Cédants don't fill investor profiles — only redirect repreneurs/fonds
  const needsInvestorProfile = !isAdmin && tunnel !== "cedant"
  if (needsInvestorProfile) {
    const { data: profile } = await supabase
      .from("investor_profiles")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle()
    if (!profile) redirect("/app/profile/edit?onboarding=1")
  }

  const isCedant = tunnel === "cedant"
  const t = {
    subtitle:       lang === "en" ? "Private infrastructure · CROCHET" : "Infrastructure privée · CROCHET",
    tagline:        isCedant
      ? (lang === "en" ? "Your file, your value." : "Votre dossier, votre valeur.")
      : (lang === "en" ? "The signal, not the noise." : "Le signal, pas le bruit."),
    statDossiers:   lang === "en" ? "Files" : "Dossiers",
    statMatches:    "Matches",
    statRooms:      lang === "en" ? "Active rooms" : "Rooms actives",
    recentFiles:    isCedant
      ? (lang === "en" ? "My files" : "Mes dossiers")
      : (lang === "en" ? "Recent files" : "Dossiers récents"),
    seeAll:         lang === "en" ? "See all →" : "Voir tout →",
    noFiles:        isCedant
      ? (lang === "en" ? "No file submitted yet." : "Aucun dossier soumis pour l'instant.")
      : (lang === "en" ? "No files submitted." : "Aucun dossier soumis."),
    submitFile:     isCedant
      ? (lang === "en" ? "+ Submit my file" : "+ Soumettre mon dossier")
      : (lang === "en" ? "+ Submit a file" : "+ Soumettre un dossier"),
    seeMatches:     isCedant
      ? (lang === "en" ? "See my matches" : "Voir mes matches")
      : (lang === "en" ? "See matches" : "Voir les matches"),
    tunnelBadge:    isCedant
      ? (lang === "en" ? "SELLER — CONFIDENTIAL SPACE" : "CÉDANT — ESPACE CONFIDENTIEL")
      : tunnel === "fonds"
        ? (lang === "en" ? "FUND — DEAL FLOW" : "FONDS — DEAL FLOW")
        : tunnel === "repreneur"
          ? (lang === "en" ? "BUYER — DEAL FLOW" : "REPRENEUR — DEAL FLOW")
          : null,
  }

  const [
    { count: oppCount },
    { count: matchCount },
    { count: roomCount },
    { data: recentOpps },
  ] = await Promise.all([
    wsId
      ? supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("workspace_id", wsId)
      : Promise.resolve({ count: 0 }),
    wsId
      ? supabase.from("opportunity_matches").select("id", { count: "exact", head: true }).eq("workspace_id", wsId)
      : Promise.resolve({ count: 0 }),
    supabase.from("rooms").select("id", { count: "exact", head: true }).eq("status", "active"),
    wsId
      ? supabase
          .from("opportunities")
          .select("id, title, sector, deal_type, status, created_at")
          .eq("workspace_id", wsId)
          .order("created_at", { ascending: false })
          .limit(4)
      : Promise.resolve({ data: [] }),
  ])

  const greeting = user.email?.split("@")[0] ?? "—"

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 52px" }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 10 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#7A746E",
          }}>
            {t.subtitle}
          </div>
          {t.tunnelBadge && (
            <div style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 9,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#4A4A4A",
              border: "1px solid #E0DAD0",
              padding: "3px 10px",
            }}>
              {t.tunnelBadge}
            </div>
          )}
        </div>
        <h1 style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontStyle: "italic",
          fontSize: 34,
          fontWeight: 700,
          color: "#0A0A0A",
          margin: "0 0 6px",
          lineHeight: 1.15,
        }}>
          {greeting}.
        </h1>
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 13,
          color: "#7A746E",
          margin: 0,
        }}>
          {t.tagline}
        </p>
      </div>

      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 36 }} />

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
        <Stat value={oppCount ?? 0} label={t.statDossiers} />
        <Stat value={matchCount ?? 0} label={t.statMatches} />
        <Stat value={roomCount ?? 0} label={t.statRooms} />
      </div>

      {/* Recent opportunities */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingBottom: 10,
          borderBottom: "1px solid #E0DAD0",
        }}>
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#7A746E",
          }}>
            {t.recentFiles}
          </span>
          <Link href="/app/opportunities" style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11,
            color: "#7A746E",
            textDecoration: "none",
            letterSpacing: "0.04em",
          }}>
            {t.seeAll}
          </Link>
        </div>

        {!recentOpps || recentOpps.length === 0 ? (
          <div style={{
            padding: "32px 0",
            textAlign: "center",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            color: "#7A746E",
            fontStyle: "italic",
          }}>
            {t.noFiles}
          </div>
        ) : (
          <div>
            {recentOpps.map((o) => (
              <Link
                key={o.id}
                href={`/app/opportunities/${o.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 0",
                  borderBottom: "1px solid #E0DAD0",
                  textDecoration: "none",
                  gap: 16,
                }}
              >
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  color: "#0A0A0A",
                }}>
                  {o.title}
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexShrink: 0 }}>
                  {o.sector && (
                    <span style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 10,
                      color: "#7A746E",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      border: "1px solid #E0DAD0",
                      padding: "2px 8px",
                    }}>
                      {o.sector}
                    </span>
                  )}
                  <span style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 10,
                    color: o.status === "active" ? "#0A0A0A" : "#7A746E",
                    fontWeight: o.status === "active" ? 600 : 400,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}>
                    {o.status ?? "draft"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <Link href="/app/opportunities/new" style={{
          padding: "12px 28px",
          background: "#0A0A0A",
          color: "#FFFFFF",
          textDecoration: "none",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {t.submitFile}
        </Link>
        <Link href="/app/matches" style={{
          padding: "12px 28px",
          background: "transparent",
          color: "#0A0A0A",
          border: "1px solid #E0DAD0",
          textDecoration: "none",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {t.seeMatches}
        </Link>
      </div>

    </div>
  )
}
