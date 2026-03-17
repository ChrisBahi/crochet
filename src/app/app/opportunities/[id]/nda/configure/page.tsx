import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import type { NdaOptions } from "@/lib/nda/generate"

export default async function NdaConfigurePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireUser()
  const { id } = await params
  const supabase = await createClient()

  const { data: opp } = await supabase
    .from("opportunities")
    .select("title, deal_type")
    .eq("id", id)
    .maybeSingle()

  if (!opp) notFound()

  // Check if NDA already generated — if so, go directly to NDA page
  const { data: deck } = await supabase
    .from("opportunity_decks")
    .select("nda_text")
    .eq("opportunity_id", id)
    .maybeSingle()

  if (deck?.nda_text) {
    redirect(`/app/opportunities/${id}/nda`)
  }

  async function submitOptions(formData: FormData) {
    "use server"
    const dur = Number(formData.get("duree")) as 1 | 2 | 3
    const per = formData.get("perimetre") as NdaOptions["perimetre"]
    const excl = formData.get("exclusivite") as NdaOptions["exclusivite"]
    const tiers = formData.get("partage_tiers") as NdaOptions["partage_tiers"]

    const options: NdaOptions = {
      duree: ([1, 2, 3].includes(dur) ? dur : 2) as 1 | 2 | 3,
      perimetre: (["financier", "complet", "etendu"].includes(per) ? per : "complet") as NdaOptions["perimetre"],
      exclusivite: (["non", "30j", "60j", "90j"].includes(excl) ? excl : "non") as NdaOptions["exclusivite"],
      partage_tiers: (["accord", "libre", "interdit"].includes(tiers) ? tiers : "accord") as NdaOptions["partage_tiers"],
    }

    // Build searchParams and redirect to NDA page which will pick up options
    const qs = new URLSearchParams({
      dur: String(options.duree),
      per: options.perimetre,
      excl: options.exclusivite,
      tiers: options.partage_tiers,
    })
    redirect(`/app/opportunities/${id}/nda?${qs.toString()}`)
  }

  const SECTIONS = [
    {
      key: "duree",
      title: "Durée de confidentialité",
      hint: "Combien de temps les informations restent-elles confidentielles après la signature ?",
      options: [
        { value: "1", label: "1 an", desc: "Opérations courtes ou exploratoires" },
        { value: "2", label: "2 ans", desc: "Standard marché M&A · Recommandé" },
        { value: "3", label: "3 ans", desc: "Dossiers sensibles ou stratégiques" },
      ],
      defaultValue: "2",
    },
    {
      key: "perimetre",
      title: "Périmètre des informations couvertes",
      hint: "Quelles catégories d'informations sont soumises à la confidentialité ?",
      options: [
        { value: "financier", label: "Financier uniquement", desc: "Comptes, valorisation, projections" },
        { value: "complet", label: "Complet", desc: "Commercial + financier + technique · Recommandé" },
        { value: "etendu", label: "Étendu", desc: "Toutes informations incl. RH, clients, IP" },
      ],
      defaultValue: "complet",
    },
    {
      key: "exclusivite",
      title: "Exclusivité d'accès",
      hint: "La contrepartie bénéficie-t-elle d'une période pendant laquelle vous ne pouvez pas parler à d'autres ?",
      options: [
        { value: "non", label: "Aucune exclusivité", desc: "Vous restez libre de contacter d'autres parties · Recommandé" },
        { value: "30j", label: "30 jours", desc: "Exclusivité courte pour due diligence initiale" },
        { value: "60j", label: "60 jours", desc: "Standard pour LOI / process structuré" },
        { value: "90j", label: "90 jours", desc: "Processus exclusif long ou complexe" },
      ],
      defaultValue: "non",
    },
    {
      key: "partage_tiers",
      title: "Partage avec des tiers (conseils, avocats)",
      hint: "La contrepartie peut-elle montrer vos informations à ses conseils extérieurs ?",
      options: [
        { value: "accord", label: "Avec accord préalable", desc: "Partage possible mais soumis à votre validation · Recommandé" },
        { value: "libre", label: "Libre aux conseils directs", desc: "Avocats et experts-comptables peuvent voir le dossier" },
        { value: "interdit", label: "Strictement interdit", desc: "Aucun partage tiers sauf exception écrite" },
      ],
      defaultValue: "accord",
    },
  ]

  return (
    <div style={{ background: "#FFFFFF", minHeight: "calc(100vh - 56px)" }}>
      {/* Top bar */}
      <div style={{
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
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9,
          color: "#3A3A3A",
          letterSpacing: "0.08em",
        }}>
          NDA · CONFIGURATION
        </span>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "52px 40px" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 10,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#7A746E",
            marginBottom: 12,
          }}>
            Accord de Confidentialité
          </div>
          <h1 style={{
            fontFamily: "var(--font-playfair), Georgia, serif",
            fontStyle: "italic",
            fontSize: 28,
            fontWeight: 700,
            color: "#0A0A0A",
            lineHeight: 1.2,
            margin: "0 0 12px",
          }}>
            Configurer les clauses.
          </h1>
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            color: "#7A746E",
            lineHeight: 1.7,
            margin: 0,
          }}>
            Sélectionnez les options pour <strong style={{ color: "#0A0A0A" }}>{opp.title}</strong>.
            Le NDA bilatéral sera généré par l&apos;IA et signable électroniquement (eIDAS).
          </p>
        </div>

        <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 40 }} />

        <form action={submitOptions}>
          <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
            {SECTIONS.map(section => (
              <div key={section.key}>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "#0A0A0A",
                  marginBottom: 4,
                }}>
                  {section.title}
                </div>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#7A746E",
                  marginBottom: 14,
                  lineHeight: 1.5,
                }}>
                  {section.hint}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {section.options.map(opt => (
                    <label key={opt.value} style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      padding: "14px 16px",
                      border: "1px solid #E0DAD0",
                      cursor: "pointer",
                    }}>
                      <input
                        type="radio"
                        name={section.key}
                        value={opt.value}
                        defaultChecked={opt.value === section.defaultValue}
                        style={{ marginTop: 2, flexShrink: 0, accentColor: "#0A0A0A" }}
                      />
                      <div>
                        <div style={{
                          fontFamily: "var(--font-dm-sans), sans-serif",
                          fontSize: 13,
                          fontWeight: 600,
                          color: "#0A0A0A",
                          marginBottom: 2,
                        }}>
                          {opt.label}
                          {opt.desc.includes("Recommandé") && (
                            <span style={{
                              marginLeft: 8,
                              padding: "1px 6px",
                              background: "#F5F0E8",
                              fontFamily: "var(--font-jetbrains), monospace",
                              fontSize: 9,
                              color: "#7A746E",
                              letterSpacing: "0.06em",
                              fontWeight: 400,
                            }}>
                              Recommandé
                            </span>
                          )}
                        </div>
                        <div style={{
                          fontFamily: "var(--font-dm-sans), sans-serif",
                          fontSize: 11,
                          color: "#7A746E",
                          lineHeight: 1.5,
                        }}>
                          {opt.desc.replace(" · Recommandé", "")}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid #E0DAD0", marginTop: 40, paddingTop: 32, display: "flex", gap: 12 }}>
            <button
              type="submit"
              style={{
                padding: "14px 36px",
                background: "#0A0A0A",
                color: "#FFFFFF",
                border: "none",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              Générer le NDA →
            </button>
            <Link href={`/app/opportunities/${id}`} style={{
              padding: "14px 28px",
              border: "1px solid #E0DAD0",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              color: "#7A746E",
              textDecoration: "none",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              display: "inline-flex",
              alignItems: "center",
            }}>
              Annuler
            </Link>
          </div>
        </form>

      </div>
    </div>
  )
}
