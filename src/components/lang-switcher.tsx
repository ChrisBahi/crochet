"use client"

import { useLang, type AppLang } from "@/lib/lang/context"

export function LangSwitcher() {
  const { lang, setLang } = useLang()

  const btn = (l: AppLang, label: string) => (
    <button
      key={l}
      onClick={() => setLang(l)}
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.08em",
        padding: 0,
        border: "none",
        background: "transparent",
        cursor: "pointer",
        color: lang === l ? "#FFFFFF" : "#555555",
        transition: "color 0.15s",
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
      {btn("fr", "FR")}
      {btn("en", "EN")}
    </div>
  )
}
