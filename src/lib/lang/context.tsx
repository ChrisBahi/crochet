"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

export type AppLang = "fr" | "en"

const COOKIE_KEY = "crochet_lang"

function getCookieLang(): AppLang {
  if (typeof document === "undefined") return "fr"
  const match = document.cookie.match(/crochet_lang=(fr|en)/)
  return (match?.[1] as AppLang) ?? "fr"
}

function setCookieLang(lang: AppLang) {
  document.cookie = `${COOKIE_KEY}=${lang};path=/;max-age=31536000`
}

type LangCtx = {
  lang: AppLang
  setLang: (l: AppLang) => void
}

const LangContext = createContext<LangCtx>({ lang: "fr", setLang: () => {} })

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<AppLang>("fr")

  useEffect(() => {
    setLangState(getCookieLang())
  }, [])

  function setLang(l: AppLang) {
    setLangState(l)
    setCookieLang(l)
  }

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export function useLang() {
  return useContext(LangContext)
}

export async function translateClient(text: string, targetLang: AppLang): Promise<string> {
  if (targetLang === "fr") return text
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang: "EN-GB" }),
  })
  if (!res.ok) return text
  const data = await res.json() as { translation: string }
  return data.translation ?? text
}

export async function translateManyClient(texts: string[], targetLang: AppLang): Promise<string[]> {
  if (targetLang === "fr") return texts
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, targetLang: "EN-GB" }),
  })
  if (!res.ok) return texts
  const data = await res.json() as { translations: string[] }
  return data.translations ?? texts
}
