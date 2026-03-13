import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export interface AdmissionRequest {
  id: string
  name: string
  email: string
  role: string
  linkedin?: string | null
  city?: string | null
  siret?: string | null
  ticket?: string | null
  message?: string | null
}

export interface AdmissionAnalysis {
  score: number   // 0-100
  note: string    // justification courte (2-3 phrases max)
}

export async function analyzeAdmission(req: AdmissionRequest): Promise<AdmissionAnalysis> {
  const prompt = `Tu es le moteur de qualification CROCHET, une plateforme privée d'investissement M&A.
Analyse cette candidature d'admission et donne une note de pertinence (0-100) avec une justification courte.

CANDIDATURE :
- Nom : ${req.name}
- Email : ${req.email}
- Rôle : ${req.role}
- Ville : ${req.city ?? "—"}
- LinkedIn : ${req.linkedin ?? "—"}
- SIREN : ${req.siret ?? "—"}
- Ticket moyen : ${req.ticket ?? "—"}
- Message : ${req.message ?? "—"}

CRITÈRES D'ÉVALUATION (pondérés) :
- Rôle professionnel cohérent avec l'investissement ou la cession d'entreprise (30%)
- Ticket déclaré crédible et pertinent pour du M&A (25%)
- Email professionnel (pas gmail/hotmail générique) (15%)
- Présence LinkedIn ou SIREN (légitimité) (15%)
- Message contextuel qualitatif (15%)

Réponds UNIQUEMENT en JSON :
{ "score": <entier 0-100>, "note": "<justification 2-3 phrases max, en français>" }`

  const msg = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 256,
    messages: [{ role: "user", content: prompt }],
  })

  const raw = (msg.content[0] as { type: string; text: string }).text.trim()
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error("No JSON in AI response")
  const parsed = JSON.parse(match[0]) as { score: number; note: string }
  return { score: Math.min(100, Math.max(0, parsed.score)), note: parsed.note }
}
