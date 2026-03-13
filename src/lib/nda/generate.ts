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

  const rawText = (message.content[0] as { type: string; text: string }).text.trim()
  // Extract JSON object from response (handles markdown fences or extra text)
  const jsonMatch = rawText.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error("No JSON object found in NDA response")
  const parsed = JSON.parse(jsonMatch[0]) as { sections?: DocSection[] }

  return {
    reference: ref,
    date,
    sections: parsed.sections ?? [],
  }
}
