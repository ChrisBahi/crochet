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

export interface NdaInput {
  opportunityId: string
  opportunityTitle: string
  dealType?: string | null
  sector?: string | null
  divulgateur: NdaParty   // émetteur / cédant
  recepteur: NdaParty     // investisseur / acquéreur potentiel
}

export interface NdaResult {
  reference: string
  date: string
  sections: DocSection[]
}

function extractJsonPayload(raw: string): string {
  const noFence = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim()

  const start = noFence.indexOf("{")
  const end = noFence.lastIndexOf("}")
  if (start === -1 || end === -1 || end <= start) return noFence
  return noFence.slice(start, end + 1)
}

function normalizeJsonPayload(payload: string): string[] {
  const normalizedQuotes = payload
    .replace(/\u201c|\u201d/g, "\"")
    .replace(/\u2018|\u2019/g, "'")
  const withoutTrailingCommas = normalizedQuotes.replace(/,\s*([}\]])/g, "$1")
  return [payload, normalizedQuotes, withoutTrailingCommas]
}

function coerceSections(parsed: unknown): DocSection[] | null {
  if (!parsed || typeof parsed !== "object") return null
  const sections = (parsed as { sections?: unknown }).sections
  if (!Array.isArray(sections)) return null

  const output: DocSection[] = []
  for (const item of sections) {
    if (!item || typeof item !== "object") return null
    const rec = item as Record<string, unknown>
    if (
      typeof rec.number !== "string" ||
      typeof rec.title !== "string" ||
      typeof rec.content !== "string"
    ) return null
    output.push({ number: rec.number, title: rec.title, content: rec.content })
  }
  return output
}

function fallbackSections(input: NdaInput): DocSection[] {
  return [
    { number: "01", title: "PARTIES", content: `La Partie Divulgatrice est ${partyLine(input.divulgateur)}.\nLa Partie Réceptrice est ${partyLine(input.recepteur)}.` },
    { number: "02", title: "OBJET", content: `Le présent accord encadre les échanges confidentiels relatifs à l'opportunité "${input.opportunityTitle}".` },
    { number: "03", title: "DÉFINITION DES INFORMATIONS CONFIDENTIELLES", content: "Sont confidentielles toutes les informations non publiques communiquées oralement, par écrit ou sous format numérique." },
    { number: "04", title: "OBLIGATIONS DES PARTIES", content: "La Partie Réceptrice s'engage à ne pas divulguer les informations et à les utiliser uniquement pour évaluer l'opération." },
    { number: "05", title: "EXCEPTIONS", content: "Sont exclues les informations publiques, déjà connues légitimement ou reçues d'un tiers non tenu à confidentialité." },
    { number: "06", title: "DURÉE", content: "Les obligations de confidentialité s'appliquent pendant deux (2) ans à compter de la signature." },
    { number: "07", title: "SANCTIONS ET RESPONSABILITÉ", content: "Toute violation ouvre droit à réparation intégrale et mesures conservatoires appropriées." },
    { number: "08", title: "DROIT APPLICABLE ET JURIDICTION", content: "Le présent accord est soumis au droit français. Juridiction exclusive: Paris." },
  ]
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

function buildNdaPrompt(input: NdaInput, date: string): string {
  const ref = `CROCHET-${input.opportunityId.slice(0, 8).toUpperCase()}`
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

Génère une réponse JSON avec exactement ce format :
{
  "sections": [
    { "number": "01", "title": "PARTIES", "content": "..." },
    { "number": "02", "title": "OBJET", "content": "..." },
    { "number": "03", "title": "DÉFINITION DES INFORMATIONS CONFIDENTIELLES", "content": "..." },
    { "number": "04", "title": "OBLIGATIONS DES PARTIES", "content": "..." },
    { "number": "05", "title": "EXCEPTIONS", "content": "..." },
    { "number": "06", "title": "DURÉE", "content": "..." },
    { "number": "07", "title": "SANCTIONS ET RESPONSABILITÉ", "content": "..." },
    { "number": "08", "title": "DROIT APPLICABLE ET JURIDICTION", "content": "..." }
  ]
}

Règles :
- Rédige chaque article en français juridique précis et complet.
- Intègre les noms des deux Parties dans les articles (surtout 01, 02, 04).
- Dans l'article 03, liste les types d'informations confidentielles pertinents pour ce type de deal (${input.dealType ?? "transaction financière"}).
- Dans l'article 06, précise une durée de 2 ans à compter de la signature.
- Dans l'article 08, précise la juridiction de Paris.
- Utilise des retours à la ligne (\\n) pour séparer les sous-paragraphes au sein d'un même article.
- Réponds UNIQUEMENT avec le JSON, sans markdown.`
}

export async function generateNda(input: NdaInput): Promise<NdaResult> {
  const date = formatDate(new Date())
  const ref = `NDA-CROCHET-${input.opportunityId.slice(0, 8).toUpperCase()}`

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    messages: [{ role: "user", content: buildNdaPrompt(input, date) }],
  })

  const rawText = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: string; text: string }).text)
    .join("\n")
    .trim()

  const payload = extractJsonPayload(rawText)
  let sections: DocSection[] | null = null
  for (const candidate of normalizeJsonPayload(payload)) {
    try {
      sections = coerceSections(JSON.parse(candidate))
      if (sections) break
    } catch {
      // keep trying next candidate
    }
  }
  if (!sections) {
    sections = fallbackSections(input)
  }

  return {
    reference: ref,
    date,
    sections,
  }
}
