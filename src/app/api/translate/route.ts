import { NextRequest, NextResponse } from "next/server"
import { translateText, translateTexts, type Lang } from "@/lib/translate/deepl"

export async function POST(req: NextRequest) {
  const body = await req.json() as { text?: string; texts?: string[]; targetLang: Lang }

  if (body.texts) {
    const translated = await translateTexts(body.texts, body.targetLang)
    return NextResponse.json({ translations: translated })
  }

  if (body.text) {
    const translated = await translateText(body.text, body.targetLang)
    return NextResponse.json({ translation: translated })
  }

  return NextResponse.json({ error: "missing text" }, { status: 400 })
}
