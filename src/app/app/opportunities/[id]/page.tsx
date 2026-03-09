import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { notFound } from "next/navigation"
import Link from "next/link"

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

function MetaTag({ label }: { label: string }) {
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      border: "1px solid #E0DAD0",
      fontFamily: "var(--font-dm-sans), sans-serif",
      fontSize: 10,
      color: "#7A746E",
      letterSpacing: "0.06em",
      textTransform: "uppercase" as const,
    }}>
      {label}
    </span>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontFamily: "var(--font-dm-sans), sans-serif",
      fontSize: 10,
      letterSpacing: "0.1em",
      textTransform: "uppercase" as const,
      color: "#7A746E",
      marginBottom: 14,
      paddingBottom: 10,
      borderBottom: "1px solid #E0DAD0",
    }}>
      {children}
    </div>
  )
}

export default async function OpportunityDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()

  const { data: opp } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (!opp) notFound()

  const { data: deck } = await supabase
    .from("opportunity_decks")
    .select("*")
    .eq("opportunity_id", id)
    .maybeSingle()

  const { data: matchData } = await supabase
    .from("opportunity_matches")
    .select("fit_score, breakdown, ranking_score")
    .eq("opportunity_id", id)
    .order("ranking_score", { ascending: false })
    .limit(1)
    .maybeSingle()

  // D-Score: from deck (set by qualification engine) or fallback to match breakdown
  const dScore = deck?.d_score ?? matchData?.breakdown?.d_score ?? null
  const mScore = matchData?.fit_score ?? null

  const memoText: string | null = deck?.summary ?? null
  const deckStatus: string = deck?.status ?? "pending"

  const deckTags: string[] = Array.isArray(deck?.tags) ? deck.tags : []

  const tags = [
    ...new Set([
      opp.sector ? (SECTOR_LABELS[opp.sector] ?? opp.sector) : null,
      opp.geo ? (GEO_LABELS[opp.geo] ?? opp.geo) : null,
      opp.deal_type ?? null,
      opp.stage ?? null,
      ...deckTags,
    ]),
  ].filter(Boolean) as string[]

  return (
    <div style={{ display: "flex", background: "#FFFFFF", minHeight: "calc(100vh - 56px)" }}>

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <div style={{ maxWidth: 720, padding: "48px 52px" }}>

          {/* Breadcrumb */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 32,
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 11,
            color: "#7A746E",
          }}>
            <Link href="/app/opportunities" style={{ color: "#7A746E", textDecoration: "none" }}>
              Opportunities
            </Link>
            <span>/</span>
            <span style={{ color: "#0A0A0A" }}>{opp.title}</span>
          </div>

          {/* Header */}
          <div style={{ marginBottom: 28 }}>
            {tags.length > 0 && (
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
                {tags.map(t => <MetaTag key={t} label={t} />)}
              </div>
            )}

            <h1 style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontStyle: "italic",
              fontSize: 34,
              fontWeight: 700,
              color: "#0A0A0A",
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
              margin: "0 0 16px",
            }}>
              {opp.title}
            </h1>

            {opp.description && (
              <p style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 15,
                color: "#7A746E",
                lineHeight: 1.75,
                margin: 0,
              }}>
                {opp.description}
              </p>
            )}
          </div>

          {/* Thick rule */}
          <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 32 }} />

          {/* MEMO IA */}
          <div style={{ marginBottom: 36 }}>
            <SectionLabel>MEMO</SectionLabel>
            <div style={{
              border: "1px solid #E0DAD0",
            }}>
              <div style={{
                padding: "12px 20px",
                borderBottom: "1px solid #E0DAD0",
                background: "#F5F0E8",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <span style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#0A0A0A",
                  fontWeight: 700,
                }}>
                  MEMO
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {dScore !== null && deckStatus === "done" && (
                    <span style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 10,
                      color: "#0A0A0A",
                      fontWeight: 700,
                      letterSpacing: "0.04em",
                    }}>
                      D-Score {Math.round(dScore)}
                    </span>
                  )}
                  <span style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 9,
                    color: "#7A746E",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                  }}>
                    {deckStatus === "done" ? "IA · Confidentiel" : deckStatus === "error" ? "Erreur" : "Analyse en cours…"}
                  </span>
                </div>
              </div>
              <div style={{ padding: "20px" }}>
                {memoText ? (
                  <p style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 14,
                    color: "#0A0A0A",
                    lineHeight: 1.85,
                    margin: 0,
                  }}>
                    {memoText && memoText.length > 420
                      ? memoText.slice(0, 420).replace(/\s+\S*$/, "") + "…"
                      : memoText}
                  </p>
                ) : (
                  <p style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 13,
                    color: "#7A746E",
                    fontStyle: "italic",
                    margin: 0,
                    lineHeight: 1.8,
                  }}>
                    {deckStatus === "pending"
                      ? "Le moteur analyse le dossier. Le MEMO sera disponible sous peu."
                      : deckStatus === "error"
                      ? "L'analyse a échoué. Cliquez sur « Relancer » ci-dessous pour réessayer."
                      : "Aucun MEMO disponible pour ce dossier."}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Snapshot financier */}
          {(opp.amount || opp.valuation || opp.revenue) && (
            <div style={{ marginBottom: 36 }}>
              <SectionLabel>Snapshot financier</SectionLabel>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                border: "1px solid #E0DAD0",
              }}>
                {[
                  { label: "Levée cible", value: opp.amount ? `${Number(opp.amount).toLocaleString("fr-FR")} €` : null },
                  { label: "Valorisation", value: opp.valuation ? `${Number(opp.valuation).toLocaleString("fr-FR")} €` : null },
                  { label: "Revenus", value: opp.revenue ? `${Number(opp.revenue).toLocaleString("fr-FR")} €` : null },
                ].filter(s => s.value).map((s, i, arr) => (
                  <div key={i} style={{
                    padding: "20px",
                    borderRight: i < arr.length - 1 ? "1px solid #E0DAD0" : "none",
                  }}>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 10,
                      color: "#7A746E",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      marginBottom: 6,
                    }}>
                      {s.label}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 20,
                      fontWeight: 700,
                      color: "#0A0A0A",
                      letterSpacing: "-0.01em",
                    }}>
                      {s.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confidentialité */}
          <div style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-start",
            padding: "14px 18px",
            background: "#F5F0E8",
            border: "1px solid #EDE8DF",
            marginBottom: 36,
          }}>
            <span style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10,
              color: "#7A746E",
              flexShrink: 0,
              paddingTop: 2,
              letterSpacing: "0.06em",
            }}>
              NDA
            </span>
            <p style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              color: "#7A746E",
              margin: 0,
              lineHeight: 1.7,
            }}>
              Ce dossier est soumis à un accord de confidentialité. Toute divulgation non autorisée engage votre responsabilité. L&apos;accès aux documents complets nécessite une signature NDA via la Secure Room.
            </p>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Relancer analyse si erreur ou pending */}
            {(deckStatus === "error" || deckStatus === "pending") && (
              <form action={async () => {
                "use server"
                const { createClient } = await import("@/lib/supabase/server")
                const { runQualification } = await import("@/lib/qualify/run")
                const supabase = await createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (user) {
                  try {
                    await runQualification(supabase, id, { id: user.id, email: user.email ?? undefined })
                  } catch (_) { /* error status set by runQualification */ }
                }
                const { revalidatePath } = await import("next/cache")
                revalidatePath(`/app/opportunities/${id}`)
              }}>
                <button type="submit" style={{
                  padding: "12px 28px",
                  background: "#0A0A0A",
                  color: "#FFFFFF",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}>
                  Relancer l&apos;analyse
                </button>
              </form>
            )}

            {/* Voir MEMO officiel */}
            {deckStatus === "done" && (
              <Link href={`/app/opportunities/${id}/memo`} style={{
                padding: "12px 28px",
                background: "#0A0A0A",
                color: "#FFFFFF",
                border: "none",
                textDecoration: "none",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}>
                Mémo officiel →
              </Link>
            )}

            {/* Générer / voir NDA */}
            <Link href={`/app/opportunities/${id}/nda`} style={{
              padding: "12px 28px",
              background: "transparent",
              color: "#0A0A0A",
              border: "1px solid #0A0A0A",
              textDecoration: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Générer NDA
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
              Retour aux matches
            </Link>
          </div>

        </div>
      </div>

      {/* ── SIDEBAR — Scores + meta ── */}
      <aside style={{
        width: 240,
        flexShrink: 0,
        borderLeft: "1px solid #E0DAD0",
        padding: "40px 28px",
        overflowY: "auto",
      }}>

        {/* D-Score */}
        <div style={{
          border: "1px solid #E0DAD0",
          padding: "20px",
          textAlign: "center",
          marginBottom: 12,
        }}>
          <div style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 40,
            fontWeight: 700,
            color: "#0A0A0A",
            lineHeight: 1,
            letterSpacing: "-0.02em",
          }}>
            {dScore !== null ? Math.round(dScore) : "—"}
          </div>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            color: "#7A746E",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginTop: 6,
          }}>
            D-Score
          </div>
        </div>

        {/* M-Score */}
        {mScore !== null && (
          <div style={{
            border: "1px solid #E0DAD0",
            padding: "20px",
            textAlign: "center",
            marginBottom: 28,
          }}>
            <div style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 40,
              fontWeight: 700,
              color: "#0A0A0A",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}>
              {Math.round(mScore)}
            </div>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 10,
              color: "#7A746E",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginTop: 6,
            }}>
              M-Score
            </div>
          </div>
        )}

        {/* Documents */}
        {deck && (
          <div style={{ marginBottom: 28 }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7A746E",
              marginBottom: 12,
              paddingBottom: 8,
              borderBottom: "1px solid #E0DAD0",
            }}>
              Documents
            </div>
            <div style={{
              padding: "10px 14px",
              background: "#F5F0E8",
              border: "1px solid #EDE8DF",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                color: "#0A0A0A",
              }}>
                Deck
              </span>
              <span style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 10,
                color: "#7A746E",
              }}>
                {deck.status}
              </span>
            </div>
          </div>
        )}

        {/* Meta */}
        <div>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#7A746E",
            marginBottom: 12,
            paddingBottom: 8,
            borderBottom: "1px solid #E0DAD0",
          }}>
            Informations
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Secteur", value: opp.sector ? (SECTOR_LABELS[opp.sector] ?? opp.sector) : "—" },
              { label: "Géographie", value: opp.geo ? (GEO_LABELS[opp.geo] ?? opp.geo) : "—" },
              { label: "Type", value: opp.deal_type ?? "—" },
              { label: "Stade", value: opp.stage ?? "—" },
            ].map(({ label, value }) => (
              <div key={label}>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 10,
                  color: "#7A746E",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  marginBottom: 2,
                }}>
                  {label}
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#0A0A0A",
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

      </aside>
    </div>
  )
}
