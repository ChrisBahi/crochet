import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth/require-user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { DeckStatusPoller } from "@/components/deck-status-poller"
import { cookies } from "next/headers"

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
  const cookieStore = await cookies()
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en"

  const SECTOR_LABELS: Record<string, string> = lang === "en"
    ? { sante: "Health", tech: "Technology", energie: "Energy", finance: "Finance", industrie: "Industry", immobilier: "Real estate", education: "Education", consumer: "Consumer" }
    : { sante: "Santé", tech: "Technologie", energie: "Énergie", finance: "Finance", industrie: "Industrie", immobilier: "Immobilier", education: "Éducation", consumer: "Consumer" }

  const GEO_LABELS: Record<string, string> = lang === "en"
    ? { europe: "Europe", france: "France", usa: "United States", mena: "MENA", asie: "Asia", global: "Global" }
    : { europe: "Europe", france: "France", usa: "États-Unis", mena: "MENA", asie: "Asie", global: "Global" }

  const t = {
    qualifying:       lang === "en" ? "Qualification in progress…" : "Qualification en cours…",
    qualifyingBody:   lang === "en"
      ? "The engine is generating the MEMO and calculating the D-Score. This page updates automatically."
      : "Le moteur génère le MEMO et calcule le D-Score. Cette page se met à jour automatiquement.",
    analysisError:    lang === "en"
      ? "Analysis failed. Click 'Restart' below to try again."
      : "L'analyse a échoué. Cliquez sur « Relancer » ci-dessous pour réessayer.",
    noMemo:           lang === "en" ? "No MEMO available for this file." : "Aucun MEMO disponible pour ce dossier.",
    financialSnapshot: lang === "en" ? "Financial snapshot" : "Snapshot financier",
    targetRaise:      lang === "en" ? "Target raise" : "Levée cible",
    valuation:        lang === "en" ? "Valuation" : "Valorisation",
    revenue:          lang === "en" ? "Revenue" : "Revenus",
    ndaNotice:        lang === "en"
      ? "This file is subject to a confidentiality agreement. Any unauthorized disclosure is your responsibility. Access to full documents requires an NDA signature via the Secure Room."
      : "Ce dossier est soumis à un accord de confidentialité. Toute divulgation non autorisée engage votre responsabilité. L'accès aux documents complets nécessite une signature NDA via la Secure Room.",
    restartAnalysis:  lang === "en" ? "Restart analysis" : "Relancer l'analyse",
    officialMemo:     lang === "en" ? "Official Memo →" : "Mémo officiel →",
    generateNda:      lang === "en" ? "Generate NDA" : "Générer NDA",
    backToMatches:    lang === "en" ? "Back to matches" : "Retour aux matches",
    qualifyFile:      lang === "en" ? "Qualify the file" : "Qualifiez le dossier",
    awaitingMatch:    lang === "en" ? "Awaiting match" : "En attente de match",
    documents:        lang === "en" ? "Documents" : "Documents",
    information:      lang === "en" ? "Information" : "Informations",
    sector:           lang === "en" ? "Sector" : "Secteur",
    geography:        lang === "en" ? "Geography" : "Géographie",
    type:             lang === "en" ? "Type" : "Type",
    stage:            lang === "en" ? "Stage" : "Stade",
    aiConfidential:   lang === "en" ? "AI · Confidential" : "IA · Confidentiel",
    error:            lang === "en" ? "Error" : "Erreur",
    analyzing:        lang === "en" ? "Analysis in progress…" : "Analyse en cours…",
  }

  // First try with RLS (own opportunities)
  let { data: opp } = await supabase
    .from("opportunities")
    .select("*")
    .eq("id", id)
    .maybeSingle()

  // If not found via RLS, check if current user has a match with this opportunity
  // (counterparty opportunity — use admin client with auth check)
  if (!opp) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const adminSupabase = createAdminClient()
      // Verify user is authorized (has a match row with this opportunity_id)
      const { data: matchCheck } = await adminSupabase
        .from("opportunity_matches")
        .select("id")
        .eq("opportunity_id", id)
        .eq("member_id", user.id)
        .limit(1)
        .maybeSingle()

      if (matchCheck) {
        const { data: adminOpp } = await adminSupabase
          .from("opportunities")
          .select("*")
          .eq("id", id)
          .maybeSingle()
        opp = adminOpp
      }
    }
  }

  if (!opp) notFound()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: deck } = await supabase
    .from("opportunity_decks")
    .select("*")
    .eq("opportunity_id", id)
    .maybeSingle()

  let { data: matchData } = await supabase
    .from("opportunity_matches")
    .select("fit_score, breakdown, ranking_score")
    .eq("opportunity_id", id)
    .order("ranking_score", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!matchData && user) {
    const adminSupabase = createAdminClient()

    // Preferred fallback for post-patch rows: row belongs to current user and points back to this opportunity.
    const { data: linkedMatch } = await adminSupabase
      .from("opportunity_matches")
      .select("fit_score, breakdown, ranking_score")
      .eq("member_id", user.id)
      .eq("breakdown->>linked_opportunity_id", id)
      .order("ranking_score", { ascending: false })
      .limit(1)
      .maybeSingle()

    matchData = linkedMatch

    // Compatibility fallback for older rows that don't yet have linked_opportunity_id.
    if (!matchData) {
      const { data: memberMatch } = await adminSupabase
        .from("opportunity_matches")
        .select("fit_score, breakdown, ranking_score")
        .eq("member_id", user.id)
        .order("ranking_score", { ascending: false })
        .limit(1)
        .maybeSingle()

      matchData = memberMatch
    }
  }

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

      {/* Silent polling — stops automatically when status != pending */}
      <DeckStatusPoller opportunityId={id} deckStatus={deckStatus} />

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
                    {deckStatus === "done" ? t.aiConfidential : deckStatus === "error" ? t.error : t.analyzing}
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
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {memoText}
                  </p>
                ) : (deckStatus === "pending" || deckStatus === "processing") ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "8px 0" }}>
                    <span style={{
                      display: "inline-block",
                      width: 16,
                      height: 16,
                      border: "2px solid #E0DAD0",
                      borderTopColor: "#0A0A0A",
                      borderRadius: "50%",
                      animation: "crochet-spin 0.8s linear infinite",
                      flexShrink: 0,
                    }} />
                    <style>{`@keyframes crochet-spin { to { transform: rotate(360deg); } }`}</style>
                    <div>
                      <p style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 13,
                        color: "#0A0A0A",
                        margin: "0 0 4px",
                        fontWeight: 500,
                      }}>
                        {t.qualifying}
                      </p>
                      <p style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 11,
                        color: "#7A746E",
                        margin: 0,
                        lineHeight: 1.6,
                      }}>
                        {t.qualifyingBody}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 13,
                    color: "#7A746E",
                    fontStyle: "italic",
                    margin: 0,
                    lineHeight: 1.8,
                  }}>
                    {deckStatus === "error" ? t.analysisError : t.noMemo}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Financial snapshot */}
          {(opp.amount || opp.valuation || opp.revenue) && (
            <div style={{ marginBottom: 36 }}>
              <SectionLabel>{t.financialSnapshot}</SectionLabel>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                border: "1px solid #E0DAD0",
              }}>
                {[
                  { label: t.targetRaise, value: opp.amount ? `${Number(opp.amount).toLocaleString("fr-FR")} €` : null },
                  { label: t.valuation, value: opp.valuation ? `${Number(opp.valuation).toLocaleString("fr-FR")} €` : null },
                  { label: t.revenue, value: opp.revenue ? `${Number(opp.revenue).toLocaleString("fr-FR")} €` : null },
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

          {/* Confidentiality notice */}
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
              {t.ndaNotice}
            </p>
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {/* Restart analysis if error or pending */}
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
                  {t.restartAnalysis}
                </button>
              </form>
            )}

            {/* Official Memo */}
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
                {t.officialMemo}
              </Link>
            )}

            {/* Generate NDA */}
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
              {t.generateNda}
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
              {t.backToMatches}
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

        {/* Scores */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          background: "#E0DAD0",
          marginBottom: 28,
        }}>
          {[
            {
              label: "D-Score",
              value: dScore !== null ? Math.round(dScore) : null,
              color: dScore !== null
                ? dScore >= 70 ? "#22c55e" : dScore >= 50 ? "#f59e0b" : "#7A746E"
                : "#7A746E",
              hint: dScore === null ? t.qualifyFile : null,
            },
            {
              label: "M-Score",
              value: mScore !== null ? Math.round(mScore) : null,
              color: mScore !== null
                ? mScore >= 70 ? "#22c55e" : mScore >= 55 ? "#f59e0b" : "#7A746E"
                : "#7A746E",
              hint: mScore === null ? t.awaitingMatch : null,
            },
          ].map(({ label, value, color, hint }) => (
            <div key={label} style={{
              background: "#FFFFFF",
              padding: "18px 12px",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 34,
                fontWeight: 700,
                color,
                lineHeight: 1,
                letterSpacing: "-0.02em",
              }}>
                {value !== null ? value : "—"}
              </div>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 9,
                color: "#7A746E",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginTop: 5,
              }}>
                {label}
              </div>
              {hint && (
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 9,
                  color: "#B0A898",
                  marginTop: 4,
                  lineHeight: 1.4,
                }}>
                  {hint}
                </div>
              )}
            </div>
          ))}
        </div>

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
              {t.documents}
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
            {t.information}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: t.sector, value: opp.sector ? (SECTOR_LABELS[opp.sector] ?? opp.sector) : "—" },
              { label: t.geography, value: opp.geo ? (GEO_LABELS[opp.geo] ?? opp.geo) : "—" },
              { label: t.type, value: opp.deal_type ?? "—" },
              { label: t.stage, value: opp.stage ?? "—" },
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
