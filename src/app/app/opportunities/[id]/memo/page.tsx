import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { requireUser } from "@/lib/auth/require-user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { OfficialDoc, type DocSection } from "@/components/official-doc"
import { PrintButton } from "@/components/print-button"

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function normalizeMemoTitle(raw: string) {
  const cleaned = raw
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\s+\(.*?\)\s*$/u, "")

  const map: Record<string, string> = {
    "SYNTHÈSE EXÉCUTIVE": "Synthèse exécutive",
    "PROPOSITION DE VALEUR & MODÈLE ÉCONOMIQUE": "Proposition de valeur & modèle économique",
    "TRACTION & DONNÉES FINANCIÈRES": "Traction & données financières",
    "STRUCTURATION DU DEAL": "Structuration du deal",
    "FACTEURS D'ATTRACTIVITÉ & RISQUES": "Facteurs d'attractivité & risques",
    "VERDICT CROCHET": "Verdict Crochet.",
  }

  return map[cleaned.toUpperCase()] ?? cleaned
}

function parseMemoSections(memoText: string): DocSection[] {
  const matches = [...memoText.matchAll(/§\s*(\d+)\s+([^:]+?)\s*:\s*([\s\S]*?)(?=(?:\n\s*§\s*\d+\s+)|$)/gu)]

  if (matches.length === 0) {
    return memoText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean)
      .map((content, i, arr) => ({
        number: String(i + 2).padStart(2, "0"),
        title: i === 0 ? "Synthèse exécutive" : i === arr.length - 1 ? "Verdict Crochet." : `Point ${i + 1}`,
        content,
      }))
  }

  return matches.map((match) => {
    const sectionNumber = Number.parseInt(match[1] ?? "", 10)
    const title = normalizeMemoTitle(match[2] ?? "")
    const content = (match[3] ?? "").trim()

    return {
      number: String(sectionNumber + 1).padStart(2, "0"),
      title,
      content,
    }
  })
}

export default async function MemoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()

  // First try with RLS (own opportunities)
  let { data: opp } = await supabase
    .from("opportunities")
    .select("title, deal_type, sector, created_at")
    .eq("id", id)
    .maybeSingle()

  // If not found via RLS, check if current user has a match with this opportunity
  if (!opp) {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const adminSupabase = createAdminClient()
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
          .select("title, deal_type, sector, created_at")
          .eq("id", id)
          .maybeSingle()
        opp = adminOpp
      }
    }
  }

  if (!opp) notFound()

  let { data: deck } = await supabase
    .from("opportunity_decks")
    .select("summary, d_score, tags, status, created_at")
    .eq("opportunity_id", id)
    .maybeSingle()

  if (!deck) {
    const { data: adminDeck } = await createAdminClient()
      .from("opportunity_decks")
      .select("summary, d_score, tags, status, created_at")
      .eq("opportunity_id", id)
      .maybeSingle()
    deck = adminDeck
  }

  const memoText: string = deck?.summary ?? ""
  const dScore: number | null = deck?.d_score ?? null
  const tags: string[] = Array.isArray(deck?.tags) ? deck.tags : []
  const status = deck?.status ?? "pending"
  const generatedAt: string = deck?.created_at ?? new Date().toISOString()

  const parsedMemoSections = parseMemoSections(memoText)

  const sections: DocSection[] = [
    {
      number: "00",
      title: "",
      content: `Ce mémorandum est généré par le Moteur de qualification CROCHET. Il synthétise les éléments clés du dossier référencé ci-dessous à des fins d'évaluation confidentielle par les parties autorisées.`,
    },
    {
      number: "01",
      title: "Identification du dossier",
      content: [
        `Titre : ${opp.title}`,
        opp.deal_type ? `Type d'opération : ${opp.deal_type}` : null,
        opp.sector ? `Secteur : ${opp.sector}` : null,
        tags.length > 0 ? `Tags : ${tags.join(" · ")}` : null,
        dScore !== null ? `D-Score (qualité dossier) : ${Math.round(dScore)} / 100` : null,
        `Référence : CROCHET-${id.slice(0, 8).toUpperCase()}`,
      ].filter(Boolean).join("\n"),
    },
    ...parsedMemoSections,
  ]

  const date = formatDate(new Date())
  const ref = `MEMO-CROCHET-${id.slice(0, 8).toUpperCase()}`

  return (
    <>
      {/* Nav bar — no print */}
      <div className="no-print" style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 32px",
      }}>
        <Link href={`/app/opportunities/${id}`} style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          color: "#7A746E",
          textDecoration: "none",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}>
          ← Retour au dossier
        </Link>
        <PrintButton />
      </div>

      {status !== "done" ? (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          gap: 16,
          fontFamily: "var(--font-dm-sans), sans-serif",
        }}>
          <span style={{ fontSize: 13, color: "#7A746E" }}>
            {status === "error"
              ? "Une erreur est survenue lors de la génération du MEMO."
              : "Le moteur analyse le dossier. Le MEMO sera disponible sous peu."}
          </span>
          <Link href={`/app/opportunities/${id}`} style={{
            fontSize: 11,
            color: "#7A746E",
            textDecoration: "underline",
            letterSpacing: "0.04em",
          }}>
            ← Retour
          </Link>
        </div>
      ) : (
        <OfficialDoc
          kind="MEMO"
          subtitle={`MÉMORANDUM DE QUALIFICATION · ${ref}`}
          title="Mémorandum de"
          titleItalic="qualification."
          metaLine={`${ref} · CONFIDENTIEL · IA · MOTEUR CROCHET`}
          reference={ref}
          date={date}
          generatedAt={generatedAt}
          sections={sections}
        />
      )}
    </>
  )
}
