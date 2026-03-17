import Link from "next/link"
import { requireUser } from "@/lib/auth/require-user"
import { requireActiveWorkspaceId } from "@/lib/auth/require-workspace"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

function scoreColor(v: number): string {
  if (v >= 70) return "#22c55e"
  if (v >= 55) return "#f59e0b"
  return "#7A746E"
}

function Tag({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "4px 12px",
      border: "1px solid #E0DAD0",
      fontFamily: "var(--font-dm-sans), sans-serif",
      fontSize: 11,
      color: "#0A0A0A",
      letterSpacing: "0.04em",
      marginRight: 8,
      marginBottom: 8,
    }}>
      {label}
    </span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 40 }}>
      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "#7A746E",
        marginBottom: 16,
        paddingBottom: 10,
        borderBottom: "1px solid #E0DAD0",
      }}>
        {title}
      </div>
      {children}
    </div>
  )
}

export default async function ProfilePage() {
  const user = await requireUser()
  const wsId = await requireActiveWorkspaceId()
  const supabase = await createClient()
  const cookieStore = await cookies()
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en"

  const SECTOR_LABELS: Record<string, string> = lang === "en"
    ? { sante: "Health", tech: "Technology", energie: "Energy", finance: "Finance", industrie: "Industry", immobilier: "Real estate", education: "Education", consumer: "Consumer" }
    : { sante: "Santé", tech: "Technologie", energie: "Énergie", finance: "Finance", industrie: "Industrie", immobilier: "Immobilier", education: "Éducation", consumer: "Consumer" }

  const GEO_LABELS: Record<string, string> = lang === "en"
    ? { europe: "Europe", france: "France", usa: "United States", mena: "MENA", asie: "Asia", global: "Global" }
    : { europe: "Europe", france: "France", usa: "États-Unis", mena: "MENA", asie: "Asie", global: "Global" }

  const t = {
    passport:         lang === "en" ? "Transactional passport" : "Passeport transactionnel",
    defaultName:      lang === "en" ? "Investor" : "Investisseur",
    editProfile:      lang === "en" ? "Edit profile" : "Éditer le profil",
    investorActivity: lang === "en" ? "Investor activity" : "Activité investisseur",
    totalMatches:     "Total matches",
    ready:            lang === "en" ? "Ready" : "Prêts",
    introInProgress:  lang === "en" ? "Intro in progress" : "Intro en cours",
    activeRooms:      lang === "en" ? "Active rooms" : "Rooms actives",
    bestMScore:       lang === "en" ? "Best active M-Score" : "Meilleur M-Score actif",
    seeDealFlow:      lang === "en" ? "See deal flow →" : "Voir le deal flow →",
    verifStatus:      lang === "en" ? "Verification status" : "Statut de vérification",
    verified:         lang === "en" ? "Verified" : "Vérifié",
    inProgress:       lang === "en" ? "In progress" : "En cours",
    unverified:       lang === "en" ? "Unverified" : "Non vérifié",
    verifRequired:    lang === "en"
      ? "Identity verification is required to access confidential files and Secure Rooms."
      : "La vérification d'identité est requise pour accéder aux dossiers confidentiels et aux Secure Rooms.",
    identity:         lang === "en" ? "Identity" : "Identité",
    name:             lang === "en" ? "Name" : "Nom",
    structure:        lang === "en" ? "Structure" : "Structure",
    role:             lang === "en" ? "Role" : "Rôle",
    country:          lang === "en" ? "Country" : "Pays",
    capacity:         lang === "en" ? "Financial capacity" : "Capacité financière",
    ticketMin:        lang === "en" ? "Min. ticket" : "Ticket min.",
    ticketMax:        lang === "en" ? "Max. ticket" : "Ticket max.",
    sectors:          lang === "en" ? "Sectors of interest" : "Secteurs d'intérêt",
    geographies:      lang === "en" ? "Geographies" : "Zones géographiques",
    notSpecified:     lang === "en" ? "Not specified" : "Non renseigné",
    footerNote:       lang === "en"
      ? "The information in this profile is confidential and shared only within the context of authorized transactions."
      : "Les informations de ce profil sont confidentielles et partagées uniquement dans le cadre de transactions autorisées.",
  }

  const [profileResult, memberResult, matchesResult] = await Promise.all([
    supabase.from("investor_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    wsId
      ? supabase.from("workspace_members").select("role, p_score").eq("workspace_id", wsId).eq("user_id", user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    wsId
      ? supabase.from("opportunity_matches").select("id,status,fit_score").eq("workspace_id", wsId)
      : Promise.resolve({ data: [] }),
  ])

  const profile = profileResult.data
  const member = memberResult.data as { role?: string; p_score?: number | null } | null
  const matchList = (matchesResult.data ?? []) as { id: string; status?: string | null; fit_score?: number | null }[]

  const pScore = member?.p_score ?? profile?.p_score ?? null

  const readyCount = matchList.filter(m => !m.status || m.status === "pending" || m.status === "ready").length
  const introCount = matchList.filter(m => m.status === "intro_requested").length
  const roomCount = matchList.filter(m => m.status === "room_active" || m.status === "closing").length
  const totalMatches = matchList.length
  const bestMScore = matchList.length > 0 ? Math.max(...matchList.map(m => m.fit_score ?? 0)) : null
  const sectors: string[] = profile?.sectors ?? []
  const geos: string[] = profile?.geos ?? []
  const verificationStatus = profile?.verification_status ?? "unverified"

  const verificationMap: Record<string, { label: string; color: string }> = {
    verified:   { label: t.verified, color: "#22c55e" },
    pending:    { label: t.inProgress, color: "#f59e0b" },
    unverified: { label: t.unverified, color: "#7A746E" },
  }
  const verification = verificationMap[verificationStatus] ?? verificationMap.unverified

  return (
    <div style={{
      maxWidth: 760,
      margin: "0 auto",
      padding: "48px 52px",
    }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 16,
        }}>
          {t.passport}
        </div>

        <div style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 24,
        }}>
          <div>
            <h1 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontStyle: "italic",
              fontSize: 32,
              fontWeight: 700,
              color: "#0A0A0A",
              lineHeight: 1.2,
              margin: "0 0 8px",
            }}>
              {profile?.name ?? user.email?.split("@")[0] ?? t.defaultName}
            </h1>
            <p style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13,
              color: "#7A746E",
              margin: "0 0 16px",
            }}>
              {user.email}
            </p>
            <Link
              href="/app/profile/edit"
              style={{
                display: "inline-block",
                padding: "8px 20px",
                border: "1px solid #E0DAD0",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "#0A0A0A",
                textDecoration: "none",
              }}
            >
              {t.editProfile}
            </Link>
          </div>

          {/* P-Score */}
          <div style={{
            border: "1px solid #E0DAD0",
            padding: "20px 28px",
            textAlign: "center",
            flexShrink: 0,
          }}>
            <div style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 36,
              fontWeight: 700,
              color: "#0A0A0A",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}>
              {pScore !== null ? Math.round(pScore) : "—"}
            </div>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 10,
              color: "#7A746E",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop: 6,
            }}>
              P-Score
            </div>
          </div>
        </div>
      </div>

      {/* Thick rule */}
      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 40 }} />

      {/* Investor activity */}
      <Section title={t.investorActivity}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 1,
          background: "#E0DAD0",
          marginBottom: 16,
        }}>
          {[
            { label: t.totalMatches, value: totalMatches, color: "#0A0A0A" },
            { label: t.ready, value: readyCount, color: "#0A0A0A" },
            { label: t.introInProgress, value: introCount, color: introCount > 0 ? "#1D4ED8" : "#0A0A0A" },
            { label: t.activeRooms, value: roomCount, color: roomCount > 0 ? "#22c55e" : "#0A0A0A" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#FFFFFF", padding: "16px 12px", textAlign: "center" }}>
              <div style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 28,
                fontWeight: 700,
                color,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}>
                {value}
              </div>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 9,
                color: "#7A746E",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginTop: 6,
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {bestMScore !== null && bestMScore > 0 && (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#F5F0E8",
            border: "1px solid #EDE8DF",
            marginBottom: 12,
          }}>
            <span style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              color: "#7A746E",
              letterSpacing: "0.04em",
            }}>
              {t.bestMScore}
            </span>
            <span style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 22,
              fontWeight: 700,
              color: scoreColor(Math.round(bestMScore)),
              letterSpacing: "-0.02em",
            }}>
              {Math.round(bestMScore)}
            </span>
          </div>
        )}

        <Link
          href="/app/matches"
          style={{
            display: "inline-block",
            padding: "10px 24px",
            background: "#0A0A0A",
            color: "#FFFFFF",
            textDecoration: "none",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {t.seeDealFlow}
        </Link>
      </Section>

      {/* Verification */}
      <Section title={t.verifStatus}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}>
          <span style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: verification.color,
            display: "inline-block",
            flexShrink: 0,
          }} />
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 14,
            color: "#0A0A0A",
            fontWeight: 500,
          }}>
            {verification.label}
          </span>
        </div>
        {verificationStatus === "unverified" && (
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            color: "#7A746E",
            marginTop: 10,
            lineHeight: 1.7,
          }}>
            {t.verifRequired}
          </p>
        )}
      </Section>

      {/* Identity */}
      <Section title={t.identity}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 32px",
        }}>
          {[
            { label: t.name, value: profile?.name ?? "—" },
            { label: t.structure, value: profile?.firm ?? "—" },
            { label: t.role, value: profile?.role ?? "—" },
            { label: t.country, value: profile?.country ?? "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10,
                color: "#7A746E",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}>
                {label}
              </div>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 14,
                color: "#0A0A0A",
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Capacity */}
      <Section title={t.capacity}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 32px",
        }}>
          {[
            { label: t.ticketMin, value: profile?.ticket_min ? `${profile.ticket_min.toLocaleString("fr-FR")} €` : "—" },
            { label: t.ticketMax, value: profile?.ticket_max ? `${profile.ticket_max.toLocaleString("fr-FR")} €` : "—" },
          ].map(({ label, value }) => (
            <div key={label}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10,
                color: "#7A746E",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: 4,
              }}>
                {label}
              </div>
              <div style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 18,
                color: "#0A0A0A",
                fontWeight: 600,
              }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Sectors */}
      <Section title={t.sectors}>
        {sectors.length > 0 ? (
          <div>
            {sectors.map(s => (
              <Tag key={s} label={SECTOR_LABELS[s] ?? s} />
            ))}
          </div>
        ) : (
          <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#7A746E", fontStyle: "italic" }}>
            {t.notSpecified}
          </span>
        )}
      </Section>

      {/* Geographies */}
      <Section title={t.geographies}>
        {geos.length > 0 ? (
          <div>
            {geos.map(g => (
              <Tag key={g} label={GEO_LABELS[g] ?? g} />
            ))}
          </div>
        ) : (
          <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#7A746E", fontStyle: "italic" }}>
            {t.notSpecified}
          </span>
        )}
      </Section>

      {/* Footer note */}
      <div style={{
        borderTop: "1px solid #E0DAD0",
        paddingTop: 20,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: 24,
      }}>
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          color: "#7A746E",
          flex: 1,
        }}>
          {t.footerNote}
        </span>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10,
          color: "#7A746E",
          letterSpacing: "0.06em",
          flexShrink: 0,
        }}>
          crochett.ai
        </span>
      </div>

    </div>
  )
}
