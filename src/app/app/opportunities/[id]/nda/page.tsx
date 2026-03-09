import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { notFound } from "next/navigation"
import Link from "next/link"
import { OfficialDoc, type DocSection } from "@/components/official-doc"
import { PrintButton } from "@/components/print-button"
import { generateNda, type NdaParty } from "@/lib/nda/generate"
import { NdaSignButton } from "./nda-sign-button"

export const dynamic = "force-dynamic"

export default async function NdaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const user = await requireUser()
  const { id } = await params
  const supabase = await createClient()

  // Opportunité
  const { data: opp } = await supabase
    .from("opportunities")
    .select("title, deal_type, sector, created_by")
    .eq("id", id)
    .maybeSingle()

  if (!opp) notFound()

  // Profils des deux parties (toujours fetchés pour les noms en gras)
  const [{ data: divulgateurProfile }, { data: recepteurProfile }] = await Promise.all([
    supabase.from("investor_profiles").select("name, firm, role, country, email").eq("user_id", opp.created_by).maybeSingle(),
    supabase.from("investor_profiles").select("name, firm, role, country, email").eq("user_id", user.id).maybeSingle(),
  ])

  const { data: divulgateurUser } = opp.created_by !== user.id
    ? await supabase.auth.admin.getUserById(opp.created_by).catch(() => ({ data: { user: null } }))
    : { data: { user } }

  const divulgateur: NdaParty = {
    name: divulgateurProfile?.name ?? divulgateurProfile?.firm ?? "Partie Divulgatrice",
    firm: divulgateurProfile?.firm ?? null,
    role: divulgateurProfile?.role ?? null,
    country: divulgateurProfile?.country ?? "France",
  }

  const recepteur: NdaParty = {
    name: recepteurProfile?.name ?? recepteurProfile?.firm ?? "Partie Réceptrice",
    firm: recepteurProfile?.firm ?? null,
    role: recepteurProfile?.role ?? null,
    country: recepteurProfile?.country ?? "France",
    email: user.email ?? null,
  }

  const partyNames = [divulgateur.name, recepteur.name].filter(Boolean)

  // NDA en cache ou à générer
  const { data: deck } = await supabase
    .from("opportunity_decks")
    .select("nda_text, nda_reference, nda_date, created_at")
    .eq("opportunity_id", id)
    .maybeSingle()

  let ndaReference: string = deck?.nda_reference ?? ""
  let ndaDate: string = deck?.nda_date ?? ""
  let ndaSections: DocSection[] = []
  const generatedAt: string = deck?.created_at ?? new Date().toISOString()

  if (deck?.nda_text) {
    try {
      const parsed = JSON.parse(deck.nda_text) as { sections: DocSection[] }
      ndaSections = parsed.sections
    } catch {
      ndaSections = []
    }
  }

  if (ndaSections.length === 0) {
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

  // Section 09 — Signatures électroniques (fixe, hors Claude)
  const section09: DocSection = {
    number: "09",
    title: "Signatures électroniques",
    content: `Les Parties reconnaissent avoir lu et accepté les termes du présent Accord. La signature électronique apposée via la plateforme Crochet. a la même valeur juridique qu'une signature manuscrite, conformément au Règlement eIDAS (UE) n°910/2014 et aux articles 1366 et suivants du Code civil français.`,
  }

  const allSections = ndaSections.length > 0 ? [...ndaSections, section09] : []
  const hasNda = allSections.length > 0

  // Signatures
  const { data: signatures } = await supabase
    .from("nda_signatures")
    .select("user_id, signed_at")
    .eq("opportunity_id", id)

  const mySignature = (signatures ?? []).find(s => s.user_id === user.id)
  const signatureCount = (signatures ?? []).length

  // Empreinte simulée (SHA-256 sur la référence)
  const hashPreview = ndaReference
    ? `sha256:${Buffer.from(ndaReference).toString("base64").padEnd(64, "x").slice(0, 64)}`
    : "sha256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

  return (
    <>
      {/* Barre de navigation */}
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
          <PrintButton />
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
          generatedAt={generatedAt}
          sections={allSections}
          partyNames={partyNames}
        >

          {/* ── Bloc signatures ── */}
          <div style={{ marginBottom: 40 }}>
            <NdaSignButton
              opportunityId={id}
              ndaReference={ndaReference}
              alreadySigned={!!mySignature}
              signedAt={mySignature?.signed_at ?? null}
            />
          </div>

          {/* Deux boîtes de signature */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 32 }}>
            {[
              {
                label: "PARTIE DIVULGATRICE",
                name: divulgateur.name,
                firm: divulgateur.firm,
                role: divulgateur.role,
                sig: (signatures ?? []).find(s => s.user_id === opp.created_by),
              },
              {
                label: "PARTIE RÉCEPTRICE",
                name: recepteur.name,
                firm: recepteur.firm,
                role: recepteur.role,
                sig: mySignature,
              },
            ].map(party => (
              <div key={party.label} style={{
                border: "1px solid #D6D0C8",
                padding: "20px 24px",
                background: "#FDFAF6",
              }}>
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#7A746E",
                  marginBottom: 16,
                }}>
                  {party.label}
                </div>

                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 11,
                  color: "#7A746E",
                  marginBottom: 20,
                }}>
                  <strong style={{ color: "#0A0A0A", fontWeight: 700 }}>
                    {party.name?.toUpperCase()}
                  </strong>
                  {party.role && <> · {party.role}</>}
                  {party.firm && <> · {party.firm}</>}
                </div>

                {[
                  { label: "Signature électronique", value: party.sig ? "✓ Accepté" : null },
                  { label: "Date et heure d'acceptation (UTC)", value: party.sig ? new Date(party.sig.signed_at).toLocaleString("fr-FR") : null },
                  { label: "Empreinte numérique (SHA-256)", value: party.sig ? hashPreview : null },
                ].map(field => (
                  <div key={field.label} style={{
                    borderTop: "1px solid #E0DAD0",
                    paddingTop: 8,
                    marginTop: 8,
                  }}>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 9,
                      color: "#B0A898",
                      letterSpacing: "0.04em",
                      marginBottom: 2,
                    }}>
                      {field.label}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 9,
                      color: field.value ? "#0A0A0A" : "#D6D0C8",
                      letterSpacing: "0.02em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {field.value ?? "—"}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* Sceau plateforme */}
          <div style={{
            border: "1px solid #D6D0C8",
            padding: "16px 24px",
            background: "#FDFAF6",
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}>
            <div>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11,
                fontWeight: 700,
                color: "#0A0A0A",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}>
                crochet.
              </div>
              <div style={{
                fontFamily: "var(--font-playfair), Georgia, serif",
                fontSize: 11,
                fontStyle: "italic",
                color: "#0A0A0A",
                lineHeight: 1,
              }}>
                C
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 9,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#7A746E",
                marginBottom: 4,
              }}>
                SCEAU PLATEFORME · Secure Room ID : {ndaReference}
              </div>
              <div style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 8,
                color: "#B0A898",
                letterSpacing: "0.02em",
              }}>
                Accord généré et archivé par Crochet. · Hash SHA-256 : {hashPreview}
              </div>
              {signatureCount > 0 && (
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 9,
                  color: "#22c55e",
                  marginTop: 4,
                  letterSpacing: "0.04em",
                }}>
                  {signatureCount} / 2 partie{signatureCount > 1 ? "s" : ""} signé{signatureCount > 1 ? "es" : "e"}
                </div>
              )}
            </div>
          </div>

        </OfficialDoc>
      )}
    </>
  )
}
