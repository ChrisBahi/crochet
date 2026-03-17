export type Lang = "FR" | "EN-GB"

const DEEPL_API_URL = "https://api-free.deepl.com/v2/translate"

export async function translateText(text: string, targetLang: Lang): Promise<string> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return text

  const res = await fetch(DEEPL_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: [text],
      target_lang: targetLang,
    }),
  })

  if (!res.ok) return text

  const data = await res.json() as { translations: { text: string }[] }
  return data.translations[0]?.text ?? text
}

export async function translateTexts(texts: string[], targetLang: Lang): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) return texts

  const res = await fetch(DEEPL_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: texts,
      target_lang: targetLang,
    }),
  })

  if (!res.ok) return texts

  const data = await res.json() as { translations: { text: string }[] }
  return data.translations.map((t, i) => t.text ?? texts[i])
}
