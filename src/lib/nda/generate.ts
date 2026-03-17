import Anthropic from "@anthropic-ai/sdk"
import type { DocSection } from "@/components/official-doc"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface NdaParty {
  name: string
  firm?: string | null
  role?: string | null
  country?: string | null
  email?: string | null
}

/** Clause options selected by the user before generation */
export interface NdaOptions {
  /** Durée de confidentialité en années: 1 | 2 | 3 */
  duree: 1 | 2 | 3
  /** Périmètre des informations couvertes */
  perimetre: "financier" | "complet" | "etendu"
  /** Exclusivité d'accès aux informations */
  exclusivite: "non" | "30j" | "60j" | "90j"
  /** Droit de partage avec des tiers (conseils, avocats) */
  partage_tiers: "accord" | "libre" | "interdit"
}

export const NDA_OPTIONS_DEFAULT: NdaOptions = {
  duree: 2,
  perimetre: "complet",
  exclusivite: "non",
  partage_tiers: "accord",
}

export interface NdaInput {
  opportunityId: string
  opportunityTitle: string
  dealType?: string | null
  sector?: string | null
  divulgateur: NdaParty   // émetteur / cédant
  recepteur: NdaParty     // investisseur / acquéreur potentiel
  options?: NdaOptions
}

export interface NdaResult {
  reference: string
  date: string
  sections: DocSection[]
  options: NdaOptions
}

function formatDate(d: Date) {
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })
}

function partyLine(p: NdaParty): string {
  const parts = [p.name]
  if (p.firm) parts.push(p.firm)
  if (p.role) parts.push(p.role)
  if (p.country) parts.push(p.country)
  if (p.email) parts.push(p.email)
  return parts.join(", ")
}

function optionsToFrench(opts: NdaOptions): string {
  const perimetre = {
    financier: "les données financières uniquement (comptes, valorisation, projections)",
    complet:   "l'ensemble des informations commerciales, financières, techniques et stratégiques",
    etendu:    "toutes les informations, y compris les données commerciales, clients, RH, techniques, financières et stratégiques",
  }[opts.perimetre]

  const exclusivite = opts.exclusivite === "non"
    ? "Aucune exclusivité n'est stipulée. La Partie Divulgatrice reste libre de partager les informations avec d'autres contreparties."
    : `La Partie Réceptrice bénéficie d'une période d'exclusivité de ${opts.exclusivite} à compter de la signature, pendant laquelle la Partie Divulgatrice s'engage à ne pas entrer en discussion avec d'autres contreparties sur le même dossier.`

  const partage = {
    accord:   "La Partie Réceptrice peut communiquer les Informations Confidentielles à ses conseils (avocats, experts-comptables, conseils financiers) sous réserve d'un accord préalable écrit de la Partie Divulgatrice et à condition que ces tiers soient eux-mêmes soumis à une obligation de confidentialité équivalente.",
    libre:    "La Partie Réceptrice est autorisée à communiquer les Informations Confidentielles à ses conseils directs (avocats, experts-comptables, conseils financiers), sans accord préalable, à condition que ces tiers soient eux-mêmes soumis à une obligation de confidentialité au moins équivalente.",
    interdit: "La Partie Réceptrice s'interdit strictement de communiquer les Informations Confidentielles à tout tiers, y compris à ses propres conseils, sans accord écrit préalable exprès de la Partie Divulgatrice.",
  }[opts.partage_tiers]

  return `PARAMÈTRES DE CET ACCORD :
- Périmètre des informations couvertes : ${perimetre}
- Durée de confidentialité : ${opts.duree} an${opts.duree > 1 ? "s" : ""} à compter de la signature
- Exclusivité : ${exclusivite}
- Partage avec tiers : ${partage}`
}

function buildNdaPrompt(input: NdaInput, date: string): string {
  const ref = `CROCHET-${input.opportunityId.slice(0, 8).toUpperCase()}`
  const opts = input.options ?? NDA_OPTIONS_DEFAULT

  return `Tu es le moteur juridique CROCHET. Génère un Accord de Confidentialité (NDA) bilatéral complet, rédigé en droit français.

OPPORTUNITÉ RÉFÉRENCÉE :
- Titre : ${input.opportunityTitle}
- Type d'opération : ${input.dealType ?? "—"}
- Secteur : ${input.sector ?? "—"}
- Référence plateforme : ${ref}
- Date : ${date}

PARTIE DIVULGATRICE (émetteur / cédant) :
${partyLine(input.divulgateur)}

PARTIE RÉCEPTRICE (investisseur / acquéreur potentiel) :
${partyLine(input.recepteur)}

${optionsToFrench(opts)}

Génère une réponse JSON avec exactement ce format :
{
  "sections": [
    { "number": "01", "title": "PARTIES", "content": "..." },
    { "number": "02", "title": "OBJET", "content": "..." },
    { "number": "03", "title": "DÉFINITION DES INFORMATIONS CONFIDENTIELLES", "content": "..." },
    { "number": "04", "title": "OBLIGATIONS DES PARTIES", "content": "..." },
    { "number": "05", "title": "EXCEPTIONS", "content": "..." },
    { "number": "06", "title": "DURÉE ET EXCLUSIVITÉ", "content": "..." },
    { "number": "07", "title": "COMMUNICATION AUX TIERS", "content": "..." },
    { "number": "08", "title": "SANCTIONS ET RESPONSABILITÉ", "content": "..." },
    { "number": "09", "title": "DROIT APPLICABLE ET JURIDICTION", "content": "..." }
  ]
}

Règles :
- Rédige chaque article en français juridique précis et complet.
- Intègre les noms des deux Parties dans les articles (surtout 01, 02, 04).
- Dans l'article 03, liste les types d'informations confidentielles correspondant au périmètre choisi.
- Dans l'article 06, intègre exactement la durée et les clauses d'exclusivité définies dans les paramètres.
- Dans l'article 07, intègre exactement la règle de partage avec tiers définie dans les paramètres.
- Dans l'article 09, précise la juridiction de Paris.
- Utilise des retours à la ligne (\\n) pour séparer les sous-paragraphes au sein d'un même article.
- Réponds UNIQUEMENT avec le JSON, sans markdown.`
}

export async function generateNda(input: NdaInput): Promise<NdaResult> {
  const date = formatDate(new Date())
  const ref = `NDA-CROCHET-${input.opportunityId.slice(0, 8).toUpperCase()}`
  const opts = input.options ?? NDA_OPTIONS_DEFAULT

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: buildNdaPrompt(input, date) }],
  })

  const rawText = (message.content[0] as { type: string; text: string }).text.trim()
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON object found in NDA response")
  const parsed = JSON.parse(jsonMatch[0]) as { sections?: DocSection[] }

  return {
    reference: ref,
    date,
    sections: parsed.sections ?? [],
    options: opts,
  }
}
