import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { OfficialDoc, type DocSection } from "@/components/official-doc"
import { generateNda, type NdaParty } from "@/lib/nda/generate"

export const dynamic = "force-dynamic"

export default async function NdaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const supabase = await createClient()

  // Load opportunity
  const { data: opp } = await supabase
    .from("opportunities")
    .select("title, deal_type, sector, created_by")
    .eq("id", id)
    .maybeSingle()

  if (!opp) notFound()

  // Load cached NDA if exists
  const { data: deck } = await supabase
    .from("opportunity_decks")
    .select("nda_text, nda_reference, nda_date")
    .eq("opportunity_id", id)
    .maybeSingle()

  let ndaReference: string = deck?.nda_reference ?? ""
  let ndaDate: string = deck?.nda_date ?? ""
  let ndaSections: DocSection[] = []

  const cachedRaw: string | null = deck?.nda_text ?? null

  if (cachedRaw) {
    // Restore from cache
    try {
      const parsed = JSON.parse(cachedRaw) as { sections: DocSection[] }
      ndaSections = parsed.sections
    } catch {
      ndaSections = []
    }
  }

  // Generate if no valid cache
  if (ndaSections.length === 0) {
    // Load both parties' profiles
    const [{ data: divulgateurProfile }, { data: recepteurProfile }] = await Promise.all([
      supabase.from("investor_profiles").select("name, firm, role, country, email").eq("user_id", opp.created_by).maybeSingle(),
      supabase.from("investor_profiles").select("name, firm, role, country, email").eq("user_id", user.id).maybeSingle(),
    ])

    // Fallback: use auth email if no profile
    const { data: divulgateurUser } = opp.created_by !== user.id
      ? await supabase.auth.admin.getUserById(opp.created_by).catch(() => ({ data: { user: null } }))
      : { data: { user } }

    const divulgateur: NdaParty = {
      name: divulgateurProfile?.name ?? (divulgateurUser as { user?: { email?: string } })?.user?.email?.split("@")[0] ?? "Partie Divulgatrice",
      firm: divulgateurProfile?.firm ?? null,
      role: divulgateurProfile?.role ?? null,
      country: divulgateurProfile?.country ?? "France",
    }

    const recepteur: NdaParty = {
      name: recepteurProfile?.name ?? user.email?.split("@")[0] ?? "Partie Réceptrice",
      firm: recepteurProfile?.firm ?? null,
      role: recepteurProfile?.role ?? null,
      country: recepteurProfile?.country ?? "France",
      email: user.email ?? null,
    }

    try {
      const result = await generateNda({
        opportunityId: id,
        opportunityTitle: opp.title,
        dealType: opp.deal_type,
        sector: opp.sector,
        divulgateur,
        recepteur,
      })

      ndaSections = result.sections
      ndaReference = result.reference
      ndaDate = result.date

      // Cache in opportunity_decks
      await supabase.from("opportunity_decks").upsert({
        opportunity_id: id,
        nda_text: JSON.stringify({ sections: result.sections }),
        nda_reference: result.reference,
        nda_date: result.date,
      }, { onConflict: "opportunity_id" })
    } catch (err) {
      console.error("[nda/generate]", err)
    }
  }

  const hasNda = ndaSections.length > 0

  return (
    <>
      {/* Nav bar */}
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
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 9,
            color: "#3A3A3A",
            letterSpacing: "0.08em",
          }}>
            IA · CONFIDENTIEL
          </span>
          <button
            onClick={() => window.print()}
            style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11,
              color: "#FFFFFF",
              background: "transparent",
              border: "1px solid #3A3A3A",
              padding: "6px 16px",
              cursor: "pointer",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Imprimer / PDF
          </button>
        </div>
      </div>

      {!hasNda ? (
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
            Une erreur est survenue lors de la génération du NDA. Veuillez réessayer.
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
          kind="NDA"
          subtitle={`ACCORD DE CONFIDENTIALITÉ · ${ndaReference}`}
          title="Accord de"
          titleItalic="Confidentialité."
          metaLine={`${ndaReference} · ACCORD BILATÉRAL · DROIT FRANÇAIS`}
          reference={ndaReference}
          date={ndaDate}
          sections={ndaSections}
        >
          {/* Signature block */}
          <div style={{ borderTop: "1px solid #C8C2B8", paddingTop: 32 }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 9,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7A746E",
              marginBottom: 24,
            }}>
              Signatures
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
              {["Partie Divulgatrice", "Partie Réceptrice"].map(party => (
                <div key={party}>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 10,
                    color: "#7A746E",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 40,
                  }}>
                    {party}
                  </div>
                  <div style={{ borderTop: "1px solid #C8C2B8", paddingTop: 8 }}>
                    <span style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 10,
                      color: "#C8C2B8",
                      letterSpacing: "0.04em",
                    }}>
                      Signature électronique — Secure Room CROCHET
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </OfficialDoc>
      )}
    </>
  )
}
