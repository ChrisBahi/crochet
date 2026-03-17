import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { OfficialDoc, type DocSection } from "@/components/official-doc"
import { PrintButton } from "@/components/print-button"

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function buildFallbackMemo(opp: {
  title: string
  deal_type?: string | null
  sector?: string | null
}): string {
  const dealType = opp.deal_type ?? "non précisé"
  const sector = opp.sector ?? "non précisé"
  return [
    `Synthèse exécutive : ${opp.title} est un dossier de type ${dealType} dans le secteur ${sector}. En l'absence de données détaillées normalisées, ce mémo présente une lecture préliminaire orientée qualification investisseur.`,
    "Proposition de valeur et modèle : le positionnement semble construit autour d'un cas d'usage B2B avec potentiel de scalabilité. Les hypothèses de différenciation, de moat et de pricing doivent être confirmées par des éléments clients et opérationnels.",
    "Traction et fondamentaux : les informations financières et commerciales disponibles sont partielles. La priorité est de consolider la preuve de traction (revenus récurrents, croissance mensuelle, rétention, concentration clients, marge brute) avant décision d'intro.",
    "Structuration du deal et risques : la cohérence ticket/valorisation/stade reste à valider. Les risques principaux portent sur la qualité des données, la dépendance à quelques comptes clés et la visibilité court terme sur l'exécution.",
    "Verdict Crochet : dossier potentiellement intéressant mais actuellement sous-documenté. Recommandation : qualification complémentaire avant exposition large au deal flow, avec collecte d'un pack minimum (KPIs, cap table, historique ventes, plan 18 mois).",
  ].join("\n\n")
}

export default async function MemoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()

  const { data: opp } = await supabase
    .from("opportunities")
    .select("title, deal_type, sector, created_at")
    .eq("id", id)
    .maybeSingle()

  if (!opp) notFound()

  const { data: deck } = await supabase
    .from("opportunity_decks")
    .select("summary, d_score, tags, status, created_at")
    .eq("opportunity_id", id)
    .maybeSingle()

  const memoText: string = deck?.summary ?? ""
  const dScore: number | null = deck?.d_score ?? null
  const tags: string[] = Array.isArray(deck?.tags) ? deck.tags : []
  const status = deck?.status ?? "pending"
  const generatedAt: string = deck?.created_at ?? new Date().toISOString()
  const effectiveMemo = memoText.trim().length >= 280 ? memoText : buildFallbackMemo(opp)

  // Parse memo paragraphs into numbered sections for the official layout
  const rawParagraphs = effectiveMemo
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)

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
    ...rawParagraphs.map((para, i) => ({
      number: String(i + 2).padStart(2, "0"),
      title: i === 0 ? "Analyse" : i === rawParagraphs.length - 1 ? "Conclusion" : `Point ${i + 1}`,
      content: para,
    })),
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
