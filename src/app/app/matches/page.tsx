import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth/require-user"
import { requireActiveWorkspaceId } from "@/lib/auth/require-workspace"
import { IntroButton } from "@/components/intro-button"
import { OpenRoomButton } from "@/components/open-room-button"
import { cookies } from "next/headers"

type Match = {
  id: string
  opportunity_id: string
  member_id: string
  fit_score: number
  ranking_score: number
  breakdown: { d_score?: number; p_score?: number; linked_opportunity_id?: string } | null
  why: string[] | null
  created_at: string
  status?: string
}

type Opportunity = {
  id: string
  title: string
  description: string
  sector?: string
  geo?: string
  deal_type?: string
  stage?: string
}


function scoreColor(v: number): string {
  if (v >= 70) return "#22c55e"
  if (v >= 55) return "#f59e0b"
  return "#7A746E"
}

function ScoreBadge({ label, value }: { label: string; value: number | undefined }) {
  const display = value !== undefined ? Math.round(value) : "—"
  const color = value !== undefined ? scoreColor(value) : "#7A746E"
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 36,
        fontWeight: 700,
        color,
        lineHeight: 1,
        letterSpacing: "-0.02em",
      }}>
        {display}
      </div>
      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 10,
        color: "#7A746E",
        letterSpacing: "0.1em",
        textTransform: "uppercase" as const,
        marginTop: 6,
      }}>
        {label}
      </div>
    </div>
  )
}

function StatusPill({ status, lang }: { status?: string; lang: "fr" | "en" }) {
  const map: Record<string, { labelFr: string; labelEn: string; bg: string; color: string }> = {
    ready:            { labelFr: "Ready",              labelEn: "Ready",             bg: "#0A0A0A",  color: "#FFFFFF" },
    pending:          { labelFr: "Pending",             labelEn: "Pending",           bg: "#F5F0E8",  color: "#7A746E" },
    review:           { labelFr: "Review",              labelEn: "Review",            bg: "#FEF3C7",  color: "#92400E" },
    intro_requested:  { labelFr: "Intro demandée",      labelEn: "Intro requested",   bg: "#EFF6FF",  color: "#1D4ED8" },
    room_active:      { labelFr: "Room active",         labelEn: "Room active",       bg: "#052e16",  color: "#22c55e" },
    closing:          { labelFr: "Closing",             labelEn: "Closing",           bg: "#1E1B4B",  color: "#818CF8" },
  }
  const s = map[status ?? "pending"] ?? map.pending
  const label = lang === "en" ? s.labelEn : s.labelFr
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      background: s.bg,
      color: s.color,
      fontFamily: "var(--font-dm-sans), sans-serif",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase" as const,
    }}>
      {label}
    </span>
  )
}

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ match?: string }>
}) {
  const user = await requireUser()
  const wsId = await requireActiveWorkspaceId()
  const params = await searchParams
  const cookieStore = await cookies()
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en"

  const t = {
    noMatch:        lang === "en" ? "No match available." : "Aucun match disponible.",
    noMatchHint:    lang === "en" ? "Submit a file to activate the engine." : "Soumettez un dossier pour activer le moteur.",
    noMatchDisplay: lang === "en" ? "No match to display." : "Aucun match à afficher.",
    selectMatch:    lang === "en" ? "Select a match." : "Sélectionnez un match.",
    whyMatch:       lang === "en" ? "Why this match" : "Pourquoi ce match",
    introTitle:     lang === "en" ? "Intro requested · Awaiting activation" : "Intro demandée · En attente d'activation",
    introBody:      lang === "en"
      ? "A notification has been sent to the counterpart. You can also open the Room directly."
      : "Une notification a été envoyée à la contrepartie. Vous pouvez également ouvrir la Room directement.",
    memoBody:       lang === "en"
      ? "The full MEMO is accessible through the file or the Secure Room."
      : "Le MEMO complet est accessible via le dossier ou la Secure Room.",
    yourFile:       lang === "en" ? "Your file" : "Votre dossier",
    counterpart:    lang === "en" ? "Counterpart" : "Contrepartie",
    openFile:       lang === "en" ? "Open file" : "Ouvrir le dossier",
    accessRoom:     lang === "en" ? "Access Room" : "Accéder à la Room",
    aiConfidential: lang === "en" ? "AI · Confidential" : "IA · Confidentiel",
    untitled:       lang === "en" ? "Untitled opportunity" : "Opportunité sans titre",
  }

  const supabase = await createClient()
  const matchesQuery = supabase
    .from("opportunity_matches")
    .select("*")
    .order("ranking_score", { ascending: false })

  const matchesResult = wsId && user
    ? await matchesQuery.eq("workspace_id", wsId).eq("member_id", user.id)
    : { data: [] }

  const typedMatches: Match[] = matchesResult.data ?? []

  const opportunityIds = [...new Set([
    ...typedMatches.map(m => m.opportunity_id).filter(Boolean),
    ...typedMatches.map(m => m.breakdown?.linked_opportunity_id).filter(Boolean),
  ])]

  // Use admin client to fetch opportunities — bypasses RLS for seed opps (created_by=null)
  const adminSupabase = createAdminClient()
  const { data: opportunities } = opportunityIds.length
    ? await adminSupabase.from("opportunities").select("id,title,description,sector,geo,deal_type,stage").in("id", opportunityIds)
    : { data: [] }

  const oppMap = Object.fromEntries((opportunities ?? []).map(o => [o.id, o as Opportunity]))

  const selectedId = params.match ?? typedMatches[0]?.id
  const selected = typedMatches.find(m => m.id === selectedId)
  const selectedOpp = selected ? oppMap[selected.opportunity_id] : null
  const selectedLinkedOpp = selected?.breakdown?.linked_opportunity_id
    ? oppMap[selected.breakdown.linked_opportunity_id]
    : null

  const empty = typedMatches.length === 0

  return (
    <div style={{
      display: "flex",
      height: "calc(100vh - 56px)",
      background: "#FFFFFF",
    }}>

      {/* ── LEFT PANEL — Match list ── */}
      <aside style={{
        width: 300,
        flexShrink: 0,
        borderRight: "1px solid #E0DAD0",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
      }}>

        {/* Panel header */}
        <div style={{
          padding: "16px 24px 12px",
          borderBottom: "1px solid #E0DAD0",
          display: "flex",
          alignItems: "baseline",
          gap: 10,
        }}>
          <span style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontStyle: "italic",
            fontSize: 15,
            fontWeight: 700,
            color: "#0A0A0A",
          }}>
            Deal Flow
          </span>
          {!empty && (
            <span style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 11,
              color: "#7A746E",
            }}>
              {typedMatches.length}
            </span>
          )}
        </div>

        {/* Match items */}
        {empty ? (
          <div style={{
            padding: 32,
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            color: "#7A746E",
            textAlign: "center",
            marginTop: 32,
            lineHeight: 1.7,
          }}>
            {t.noMatch}
            <br />
            <span style={{ fontSize: 11, display: "block", marginTop: 8 }}>
              {t.noMatchHint}
            </span>
          </div>
        ) : (
          typedMatches.map((m, i) => {
            const listOpp = m.breakdown?.linked_opportunity_id
              ? oppMap[m.breakdown.linked_opportunity_id]
              : oppMap[m.opportunity_id]
            const isActive = m.id === selectedId
            const mScoreVal = Math.round(m.fit_score ?? 0)
            return (
              <form
                key={m.id}
                style={{
                  display: "block",
                  margin: 0,
                }}
              >
                <input type="hidden" name="match" value={m.id} />
                <button
                  type="submit"
                  formAction="/app/matches"
                  formMethod="get"
                  style={{
                    width: "100%",
                    display: "block",
                    padding: "16px 24px",
                    borderBottom: "1px solid #E0DAD0",
                    background: isActive ? "#F5F0E8" : "transparent",
                    borderLeft: isActive ? "3px solid #0A0A0A" : "3px solid transparent",
                    borderTop: "none",
                    borderRight: "none",
                    borderBottomStyle: "solid",
                    borderBottomWidth: "1px",
                    borderBottomColor: "#E0DAD0",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}>
                    <span style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 10,
                      color: "#7A746E",
                      letterSpacing: "0.06em",
                    }}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <StatusPill status={m.status} lang={lang} />
                  </div>

                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#0A0A0A",
                    marginBottom: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {listOpp?.title ?? t.untitled}
                  </div>

                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 11,
                    color: "#7A746E",
                    marginBottom: 10,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}>
                    {[listOpp?.sector, listOpp?.geo].filter(Boolean).join(" · ") || "—"}
                  </div>

                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 9,
                      color: "#7A746E",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}>
                      M-Score
                    </span>
                    <span style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 18,
                      fontWeight: 700,
                      color: scoreColor(mScoreVal),
                    }}>
                      {mScoreVal}
                    </span>
                  </div>
                </button>
              </form>
            )
          })
        )}
      </aside>

      {/* ── RIGHT PANEL — Match detail ── */}
      <div style={{ flex: 1, overflowY: "auto", background: "#FFFFFF" }}>
        {!selected || !selectedOpp ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            color: "#7A746E",
          }}>
            {empty ? t.noMatchDisplay : t.selectMatch}
          </div>
        ) : (
          <div style={{ maxWidth: 720, padding: "40px 52px" }}>

            {/* Header */}
            <div style={{ marginBottom: 28 }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 16,
                flexWrap: "wrap",
              }}>
                <StatusPill status={selected.status} lang={lang} />
                {[selectedOpp.sector, selectedOpp.geo, selectedOpp.deal_type].filter(Boolean).map((tag, i) => (
                  <span key={i} style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 10,
                    color: "#7A746E",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    padding: "3px 10px",
                    border: "1px solid #E0DAD0",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              <h1 style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontStyle: "italic",
                fontSize: 30,
                fontWeight: 700,
                color: "#0A0A0A",
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
                margin: "0 0 14px",
              }}>
                {selectedLinkedOpp ? `${selectedLinkedOpp.title} ↔ ${selectedOpp.title}` : selectedOpp.title}
              </h1>

              {selectedLinkedOpp && (
                <div style={{
                  display: "flex",
                  gap: 18,
                  flexWrap: "wrap",
                  marginBottom: 14,
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#7A746E",
                }}>
                  <span><strong style={{ color: "#0A0A0A" }}>{t.yourFile}:</strong> {selectedLinkedOpp.title}</span>
                  <span><strong style={{ color: "#0A0A0A" }}>{t.counterpart}:</strong> {selectedOpp.title}</span>
                </div>
              )}

              {selectedOpp.description && (
                <p style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 14,
                  color: "#7A746E",
                  lineHeight: 1.75,
                  margin: 0,
                }}>
                  {selectedOpp.description}
                </p>
              )}
            </div>

            {/* Thick rule */}
            <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 28 }} />

            {/* Score strip */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              border: "1px solid #E0DAD0",
              marginBottom: 32,
            }}>
              {[
                { label: "M-Score", value: selected.fit_score },
                { label: "D-Score", value: selected.breakdown?.d_score },
                { label: "P-Score", value: selected.breakdown?.p_score },
              ].map((s, i) => (
                <div key={i} style={{
                  padding: "28px 16px",
                  borderRight: i < 2 ? "1px solid #E0DAD0" : "none",
                }}>
                  <ScoreBadge label={s.label} value={s.value} />
                </div>
              ))}
            </div>

            {/* Why this match */}
            {selected.why && selected.why.length > 0 && (
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#7A746E",
                  marginBottom: 14,
                }}>
                  {t.whyMatch}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {selected.why.map((reason, i) => (
                    <div key={i} style={{
                      display: "flex",
                      gap: 14,
                      padding: "12px 16px",
                      background: "#F5F0E8",
                      border: "1px solid #EDE8DF",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: 10,
                        color: "#7A746E",
                        flexShrink: 0,
                        paddingTop: 2,
                      }}>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 13,
                        color: "#0A0A0A",
                        lineHeight: 1.65,
                      }}>
                        {reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Intro requested — intermediate state */}
            {selected.status === "intro_requested" && (
              <div style={{
                padding: "16px 20px",
                background: "#EFF6FF",
                border: "1px solid #BFDBFE",
                marginBottom: 32,
                display: "flex",
                alignItems: "flex-start",
                gap: 14,
              }}>
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#3B82F6",
                  flexShrink: 0,
                  marginTop: 4,
                }} />
                <div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#1D4ED8",
                    marginBottom: 4,
                  }}>
                    {t.introTitle}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 12,
                    color: "#3B82F6",
                    lineHeight: 1.6,
                  }}>
                    {t.introBody}
                  </div>
                </div>
              </div>
            )}

            {/* MEMO placeholder */}
            <div style={{
              border: "1px solid #E0DAD0",
              marginBottom: 32,
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
                <span style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 10,
                  color: "#7A746E",
                  letterSpacing: "0.04em",
                }}>
                  {t.aiConfidential}
                </span>
              </div>
              <div style={{ padding: "20px" }}>
                <p style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13,
                  color: "#7A746E",
                  fontStyle: "italic",
                  margin: 0,
                  lineHeight: 1.8,
                }}>
                  {t.memoBody}
                </p>
              </div>
            </div>

            {/* CTA — dynamic by status */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link
                href={`/app/opportunities/${selected.opportunity_id}`}
                style={{
                  padding: "12px 28px",
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
                {t.openFile}
              </Link>

              {/* Status-based CTA */}
              {(!selected.status || selected.status === "pending" || selected.status === "ready" || selected.status === "review") && (
                <IntroButton matchId={selected.id} opportunityId={selected.opportunity_id} />
              )}

              {selected.status === "intro_requested" && (
                <OpenRoomButton matchId={selected.id} opportunityId={selected.opportunity_id} />
              )}

              {(selected.status === "room_active" || selected.status === "closing") && (
                <Link
                  href="/app/rooms"
                  style={{
                    padding: "12px 28px",
                    background: "#052e16",
                    color: "#22c55e",
                    border: "1px solid #16a34a",
                    textDecoration: "none",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 12,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  🔒 {t.accessRoom}
                </Link>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}
