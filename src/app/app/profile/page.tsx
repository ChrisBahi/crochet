import { requireUser } from "@/lib/auth/require-user"
import { requireActiveWorkspaceId } from "@/lib/auth/require-workspace"
import { createClient } from "@/lib/supabase/server"

const SECTOR_LABELS: Record<string, string> = {
  sante: "Santé",
  tech: "Technologie",
  energie: "Énergie",
  finance: "Finance",
  industrie: "Industrie",
  immobilier: "Immobilier",
  education: "Éducation",
  consumer: "Consumer",
}

const GEO_LABELS: Record<string, string> = {
  europe: "Europe",
  france: "France",
  usa: "États-Unis",
  mena: "MENA",
  asie: "Asie",
  global: "Global",
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

  const { data: profile } = await supabase
    .from("investor_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  const { data: member } = wsId
    ? await supabase
        .from("workspace_members")
        .select("role, p_score")
        .eq("workspace_id", wsId)
        .eq("user_id", user.id)
        .maybeSingle()
    : { data: null }

  const pScore = member?.p_score ?? profile?.p_score ?? null
  const sectors: string[] = profile?.sectors ?? []
  const geos: string[] = profile?.geos ?? []
  const verificationStatus = profile?.verification_status ?? "unverified"

  const verificationMap: Record<string, { label: string; color: string }> = {
    verified:   { label: "Vérifié", color: "#22c55e" },
    pending:    { label: "En cours", color: "#f59e0b" },
    unverified: { label: "Non vérifié", color: "#7A746E" },
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
          Passeport transactionnel
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
              {profile?.name ?? user.email?.split("@")[0] ?? "Investisseur"}
            </h1>
            <p style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13,
              color: "#7A746E",
              margin: 0,
            }}>
              {user.email}
            </p>
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

      {/* Verification */}
      <Section title="Statut de vérification">
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
            La vérification d&apos;identité est requise pour accéder aux dossiers confidentiels et aux Secure Rooms.
          </p>
        )}
      </Section>

      {/* Identity */}
      <Section title="Identité">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 32px",
        }}>
          {[
            { label: "Nom", value: profile?.name ?? "—" },
            { label: "Structure", value: profile?.firm ?? "—" },
            { label: "Rôle", value: profile?.role ?? "—" },
            { label: "Pays", value: profile?.country ?? "—" },
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
      <Section title="Capacité financière">
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px 32px",
        }}>
          {[
            { label: "Ticket min.", value: profile?.ticket_min ? `${profile.ticket_min.toLocaleString("fr-FR")} €` : "—" },
            { label: "Ticket max.", value: profile?.ticket_max ? `${profile.ticket_max.toLocaleString("fr-FR")} €` : "—" },
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
      <Section title="Secteurs d'intérêt">
        {sectors.length > 0 ? (
          <div>
            {sectors.map(s => (
              <Tag key={s} label={SECTOR_LABELS[s] ?? s} />
            ))}
          </div>
        ) : (
          <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#7A746E", fontStyle: "italic" }}>
            Non renseigné
          </span>
        )}
      </Section>

      {/* Geographies */}
      <Section title="Zones géographiques">
        {geos.length > 0 ? (
          <div>
            {geos.map(g => (
              <Tag key={g} label={GEO_LABELS[g] ?? g} />
            ))}
          </div>
        ) : (
          <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#7A746E", fontStyle: "italic" }}>
            Non renseigné
          </span>
        )}
      </Section>

      {/* Footer note */}
      <div style={{
        borderTop: "1px solid #E0DAD0",
        paddingTop: 20,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          color: "#7A746E",
        }}>
          Les informations de ce profil sont confidentielles et partagées uniquement dans le cadre de transactions autorisées.
        </span>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10,
          color: "#7A746E",
          letterSpacing: "0.06em",
          flexShrink: 0,
          marginLeft: 24,
        }}>
          crochett.ai
        </span>
      </div>

    </div>
  )
}
