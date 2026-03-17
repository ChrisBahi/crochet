import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { requireActiveWorkspaceId } from "@/lib/auth/require-workspace"
import { cookies } from "next/headers"

type DeckRow = { d_score?: number | null; status?: string | null }
type MatchRow = { id: string; status?: string | null; fit_score?: number | null }
type RoomRow = { id: string }

type OppRow = {
  id: string
  title: string
  description?: string | null
  sector?: string | null
  geo?: string | null
  deal_type?: string | null
  status?: string | null
  opportunity_decks?: DeckRow[] | null
  opportunity_matches?: MatchRow[] | null
  rooms?: RoomRow[] | null
}

type PipelineStatus = {
  label: string
  color: string
  fontWeight: number
  dot?: boolean
}

function getPipelineStatus(o: OppRow): PipelineStatus {
  const deckStatus = Array.isArray(o.opportunity_decks)
    ? o.opportunity_decks[0]?.status
    : undefined
  const matches = Array.isArray(o.opportunity_matches) ? o.opportunity_matches : []
  const hasRoom = (o.rooms?.length ?? 0) > 0
  const hasIntro = matches.some(m => m.status === "intro_requested")
  const hasMatches = matches.length > 0

  if (hasRoom)
    return { label: "ROOM OPEN", color: "#0A0A0A", fontWeight: 700 }
  if (hasIntro)
    return { label: "INTRO", color: "#1D4ED8", fontWeight: 600 }
  if (hasMatches)
    return { label: "MATCHED", color: "#1a7f37", fontWeight: 600 }
  if (deckStatus === "done")
    return { label: "QUALIFIED", color: "#0A0A0A", fontWeight: 500 }
  if (deckStatus === "processing" || deckStatus === "pending")
    return { label: "ANALYZING", color: "#B45309", fontWeight: 500, dot: true }
  if (deckStatus === "error")
    return { label: "ERROR", color: "#b02a37", fontWeight: 400 }
  return { label: "DRAFT", color: "#7A746E", fontWeight: 400 }
}

function mScoreColor(v: number): string {
  if (v >= 70) return "#1a7f37"
  if (v >= 55) return "#B45309"
  return "#7A746E"
}

export default async function OpportunitiesPage() {
  await requireUser()
  const workspaceId = await requireActiveWorkspaceId()
  const supabase = await createClient()
  const cookieStore = await cookies()
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en"

  const t = {
    submit:       lang === "en" ? "+ Submit" : "+ Soumettre",
    noFiles:      lang === "en" ? "No file submitted." : "Aucun dossier soumis.",
    noFilesHint:  lang === "en"
      ? "Use the Submit button to initiate your first signal."
      : "Utilisez le bouton Soumettre pour initier votre premier signal.",
    colFile:      lang === "en" ? "File" : "Dossier",
    colSector:    lang === "en" ? "Sector" : "Secteur",
    colGeo:       lang === "en" ? "Geography" : "Géographie",
    colPipeline:  "Pipeline",
    colDScore:    "D-Sc.",
    colMScore:    "M-Sc.",
  }

  const { data: opportunities } = workspaceId
    ? await supabase
        .from("opportunities")
        .select("id,title,description,sector,geo,deal_type,status,opportunity_decks(d_score,status),opportunity_matches(id,status,fit_score),rooms(id)")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
    : { data: [] }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 52px" }}>

      {/* Header */}
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "space-between",
        marginBottom: 32,
      }}>
        <div>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#7A746E",
            marginBottom: 8,
          }}>
            Pipeline
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
            Opportunities
          </h1>
        </div>
        <Link href="/app/opportunities/new" style={{
          padding: "10px 22px",
          background: "#0A0A0A",
          color: "#FFFFFF",
          textDecoration: "none",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          {t.submit}
        </Link>
      </div>

      {/* Thick rule */}
      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 24 }} />

      {/* Table header */}
      {opportunities && opportunities.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 110px 110px 130px 64px 64px",
          padding: "8px 16px",
          marginBottom: 4,
        }}>
          {[t.colFile, t.colSector, t.colGeo, t.colPipeline, t.colDScore, t.colMScore].map(h => (
            <span key={h} style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 10,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7A746E",
            }}>
              {h}
            </span>
          ))}
        </div>
      )}

      {/* Opportunities list */}
      {!opportunities || opportunities.length === 0 ? (
        <div style={{
          padding: "48px 0",
          textAlign: "center",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 13,
          color: "#7A746E",
          borderTop: "1px solid #E0DAD0",
          borderBottom: "1px solid #E0DAD0",
        }}>
          {t.noFiles}
          <br />
          <span style={{ fontSize: 11, display: "block", marginTop: 8 }}>
            {t.noFilesHint}
          </span>
        </div>
      ) : (
        <div>
          {(opportunities as OppRow[]).map((o) => {
            const pipeline = getPipelineStatus(o)
            const decks = o.opportunity_decks
            const d = Array.isArray(decks) ? decks[0]?.d_score : undefined
            const dScore = d != null ? Math.round(d) : null
            const matchList = Array.isArray(o.opportunity_matches) ? o.opportunity_matches : []
            const bestFit = matchList.length > 0 ? Math.max(...matchList.map(m => m.fit_score ?? 0)) : null
            const mScore = bestFit !== null && bestFit > 0 ? Math.round(bestFit) : null

            return (
              <Link
                key={o.id}
                href={`/app/opportunities/${o.id}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 110px 110px 130px 64px 64px",
                  padding: "16px",
                  borderTop: "1px solid #E0DAD0",
                  textDecoration: "none",
                  alignItems: "center",
                }}
              >
                <div style={{ minWidth: 0, overflow: "hidden" }}>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#0A0A0A",
                    marginBottom: 3,
                  }}>
                    {o.title}
                  </div>
                  {o.description && (
                    <div style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 12,
                      color: "#7A746E",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}>
                      {o.description}
                    </div>
                  )}
                </div>
                <span style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#7A746E",
                }}>
                  {o.sector ?? "—"}
                </span>
                <span style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#7A746E",
                }}>
                  {o.geo ?? "—"}
                </span>
                <span style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 10,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: pipeline.color,
                  fontWeight: pipeline.fontWeight,
                }}>
                  {pipeline.dot && (
                    <span style={{
                      display: "inline-block",
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: pipeline.color,
                      flexShrink: 0,
                      animation: "crochet-pulse 1.4s ease-in-out infinite",
                    }} />
                  )}
                  {pipeline.label}
                </span>
                <span style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: dScore !== null
                    ? (dScore >= 80 ? "#1a7f37" : dScore >= 60 ? "#0A0A0A" : "#7A746E")
                    : "#C8C2B8",
                }}>
                  {dScore !== null ? dScore : "—"}
                </span>
                <span style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 14,
                  fontWeight: 700,
                  color: mScore !== null ? mScoreColor(mScore) : "#C8C2B8",
                }}>
                  {mScore !== null ? mScore : "—"}
                </span>
              </Link>
            )
          })}
          <div style={{ borderTop: "1px solid #E0DAD0" }} />
        </div>
      )}

      <style>{`
        @keyframes crochet-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

    </div>
  )
}
