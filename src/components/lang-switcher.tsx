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
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.08em",
        padding: "6px 14px",
        border: "none",
        cursor: "pointer",
        background: lang === l ? "#FFFFFF" : "transparent",
        color: lang === l ? "#000000" : "#666666",
        transition: "background 0.15s, color 0.15s",
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{
      display: "flex",
      border: "1px solid #333",
      overflow: "hidden",
    }}>
      {btn("fr", "FR")}
      {btn("en", "EN")}
    </div>
  )
}
