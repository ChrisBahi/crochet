import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { withRetry } from "@/lib/ai/withRetry"

export const dynamic = "force-dynamic"

const client = new Anthropic()

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "Aucun fichier reçu" }, { status: 400 })
  }

  const bytes = await file.arrayBuffer()
  const base64 = Buffer.from(bytes).toString("base64")
  const isPdf = file.type === "application/pdf"

  const contentBlocks: Anthropic.MessageParam["content"] = isPdf
    ? [
        {
          type: "document",
          source: { type: "base64", media_type: "application/pdf", data: base64 },
        } as Anthropic.DocumentBlockParam,
        {
          type: "text",
          text: PROMPT,
        },
      ]
    : [
        {
          type: "text",
          text: `Voici le contenu du document financier :\n\n${Buffer.from(bytes).toString("utf-8")}\n\n${PROMPT}`,
        },
      ]

  const message = await withRetry(
    () => client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: contentBlocks }],
    }),
    "analyze document"
  )

  const raw = message.content[0].type === "text" ? message.content[0].text : ""

  // Extract JSON from response (Claude sometimes adds markdown)
  const jsonMatch = raw.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    return NextResponse.json({ error: "Réponse IA invalide", raw }, { status: 500 })
  }

  try {
    const signal = JSON.parse(jsonMatch[0])
    return NextResponse.json({ signal })
  } catch {
    return NextResponse.json({ error: "Parsing échoué", raw }, { status: 500 })
  }
}

const PROMPT = `Analyse ce dossier financier et extrais les informations suivantes en JSON strict.

Réponds UNIQUEMENT avec un objet JSON valide, sans markdown, sans commentaires :

{
  "ca": number ou null,
  "ebitda": number ou null,
  "dette_nette": number ou null,
  "valorisation": number ou null,
  "secteur": string ou null,
  "geo": string ou null,
  "deal_type": "cession" | "levee_fonds" | "fusion" | "rachat" | "partenariat" | null,
  "maturite_score": number entre 0 et 100,
  "resume": string de 2-3 phrases décrivant l'entreprise et l'opération,
  "points_forts": array de 3 strings maximum,
  "alertes": array de 2 strings maximum
}

Règles :
- CA, EBITDA, dette nette et valorisation sont en euros (entier)
- Si une information est absente du document, mettre null
- maturite_score reflète la qualité et complétude du dossier (0 = incomplet, 100 = excellent)
- points_forts : avantages clés de l'opportunité
- alertes : points d'attention ou risques identifiés`
