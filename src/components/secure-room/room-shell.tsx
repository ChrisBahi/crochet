"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { validateDeal, declineDeal, revokeValidation } from "@/app/app/rooms/[id]/actions"
import { useLang } from "@/lib/lang/context"

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = "chat" | "deck" | "vision" | "rdv" | "closing" | "info"

type Validation = { user_id: string; created_at: string }

type RawMessage = {
  id: string
  room_id: string
  content: string
  sender_id: string
  created_by: string
  created_at: string
}

type MsgKind = "text" | "system" | "doc" | "meeting"

type ParsedMessage = RawMessage & {
  kind: MsgKind
  docUrl?: string
  docTitle?: string
  meeting?: { datetime: string; format: string; status: string; duration: number }
}

function parseMessage(m: RawMessage): ParsedMessage {
  const content = typeof m.content === "string" ? m.content : ""

  if (content.startsWith("__SYSTEM__:")) {
    return { ...m, kind: "system" }
  }
  if (content.startsWith("__DOC__|")) {
    const parts = content.split("|")
    return { ...m, kind: "doc", docUrl: parts[1], docTitle: parts[2] ?? parts[1] }
  }
  if (content.startsWith("__MEETING__|")) {
    const parts = content.split("|")
    return {
      ...m, kind: "meeting",
      meeting: {
        datetime: parts[1] ?? "",
        format: parts[2] ?? "",
        duration: parseInt(parts[3] ?? "60"),
        status: parts[4] ?? "pending",
      },
    }
  }
  return { ...m, content, kind: "text" }
}

function formatTime(iso: string, lang: "fr" | "en" = "fr") {
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) return "--:--"
  return value.toLocaleTimeString(lang === "en" ? "en-GB" : "fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function formatDateFr(iso: string, lang: "fr" | "en" = "fr") {
  const value = new Date(iso)
  if (Number.isNaN(value.getTime())) return lang === "en" ? "Date unavailable" : "Date indisponible"
  return value.toLocaleDateString(lang === "en" ? "en-GB" : "fr-FR", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Shared styles ──────────────────────────────────────────────────────────

const FONT_MONO = "var(--font-jetbrains), monospace"
const FONT_SANS = "var(--font-dm-sans), sans-serif"
const FONT_SERIF = "var(--font-playfair), Georgia, serif"

const C = {
  bg: "#FFFFFF",
  bgSubtle: "#F5F0E8",
  bgDark: "#0A0A0A",
  border: "#E0DAD0",
  text: "#0A0A0A",
  muted: "#7A746E",
  accent: "#0A0A0A",
}

// ─── Black Screen Guard ───────────────────────────────────────────────────────

function BlackScreenGuard({ children }: { children: React.ReactNode }) {
  // Use a ref to drive visibility — faster than setState (no React re-render cycle)
  const overlayRef = useRef<HTMLDivElement>(null)
  const { lang } = useLang()

  useEffect(() => {
    const show = () => {
      if (overlayRef.current) overlayRef.current.style.visibility = "visible"
    }
    const hide = () => {
      if (overlayRef.current) overlayRef.current.style.visibility = "hidden"
    }

    const onVisibility = () => {
      if (document.visibilityState === "hidden") show(); else hide()
    }

    // Desktop tab switch + mobile app-switch (Safari/Chrome)
    document.addEventListener("visibilitychange", onVisibility)
    // Window loses focus (alt-tab, command-tab, screenshot on Mac)
    window.addEventListener("blur", show)
    window.addEventListener("focus", hide)
    // iOS: page hidden when navigating away
    window.addEventListener("pagehide", show)
    window.addEventListener("pageshow", hide)

    return () => {
      document.removeEventListener("visibilitychange", onVisibility)
      window.removeEventListener("blur", show)
      window.removeEventListener("focus", hide)
      window.removeEventListener("pagehide", show)
      window.removeEventListener("pageshow", hide)
    }
  }, [])

  return (
    <>
      <style>{`
        @media print { body { display: none !important; } }
        /* Blur content when window not focused — CSS fallback */
        .bsg-content { transition: filter 0.05s; }
      `}</style>
      <div className="bsg-content" style={{ display: "contents" }}>
        {children}
      </div>
      {/* Always in DOM — toggled via style.visibility for zero React lag */}
      <div
        ref={overlayRef}
        style={{
          position: "fixed", inset: 0,
          background: "#000000",
          zIndex: 999999,
          visibility: "hidden",   // starts hidden
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          userSelect: "none",
          willChange: "visibility",
        }}
      >
        <span style={{
          fontFamily: FONT_SANS,
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "rgba(255,255,255,0.35)",
        }}>
          {lang === "en" ? "THE SIGNAL, NOT THE NOISE." : "LE SIGNAL, PAS LE BRUIT."}
        </span>
        <span style={{
          fontFamily: FONT_SERIF,
          fontSize: 32,
          fontWeight: 700,
          color: "#FFFFFF",
          letterSpacing: "0.06em",
        }}>
          Crochet.
        </span>
      </div>
    </>
  )
}

// ─── Header ─────────────────────────────────────────────────────────────────

function RoomHeader({
  roomRef, status, ndaSigned, opportunityTitle,
}: {
  roomRef: string; status: string; ndaSigned: boolean; opportunityTitle?: string
}) {
  const { lang } = useLang()
  const statusLabel: Record<string, string> = lang === "en"
    ? {
        active: "Active",
        negotiating: "Negotiating",
        closing: "Closing",
        closed: "Closed",
        pending_close: "Pending validation",
        closed_deal: "Deal validated",
        closed_no_deal: "Archived",
      }
    : {
        active: "Actif",
        negotiating: "En négociation",
        closing: "Closing",
        closed: "Clôturé",
        pending_close: "En attente de validation",
        closed_deal: "Deal validé",
        closed_no_deal: "Archivé",
      }
  const statusColor: Record<string, string> = {
    active: "#22c55e",
    negotiating: "#f59e0b",
    closing: "#3b82f6",
    closed: "#7A746E",
    pending_close: "#f59e0b",
    closed_deal: "#22c55e",
    closed_no_deal: "#7A746E",
  }

  return (
    <>
      <style>{`
        @media (max-width: 640px) {
          .room-header-title { display: none !important; }
          .room-header-secure { display: none !important; }
          .room-header-opp { max-width: 120px !important; }
        }
      `}</style>
      <div style={{
        background: C.bgDark,
        borderBottom: "1px solid #1A1A1A",
        padding: "0 16px",
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
        minWidth: 0,
        overflow: "hidden",
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: 1, overflow: "hidden" }}>
          <span className="room-header-title" style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.01em", flexShrink: 0 }}>
            crochet.
          </span>
          <div className="room-header-title" style={{ width: 1, height: 16, background: "#2A2A2A", flexShrink: 0 }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#555", letterSpacing: "0.08em", flexShrink: 0 }}>
            {roomRef}
          </span>
          {opportunityTitle && (
            <>
              <div className="room-header-title" style={{ width: 1, height: 16, background: "#2A2A2A", flexShrink: 0 }} />
              <span className="room-header-opp" style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#888", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {opportunityTitle}
              </span>
            </>
          )}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 8 }}>
          {/* NDA */}
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "3px 8px",
            border: `1px solid ${ndaSigned ? "#16a34a" : "#5a4000"}`,
            background: ndaSigned ? "#052e16" : "#1c1000",
            flexShrink: 0,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: ndaSigned ? "#22c55e" : "#f59e0b", flexShrink: 0 }} />
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: ndaSigned ? "#22c55e" : "#f59e0b", letterSpacing: "0.08em" }}>
              NDA {ndaSigned ? (lang === "en" ? "OK" : "OK") : (lang === "en" ? "REQ." : "REQ.")}
            </span>
          </div>

          {/* Status */}
          <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[status] ?? "#7A746E" }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {statusLabel[status] ?? status}
            </span>
          </div>

          {/* Secure badge — hidden on mobile */}
          <div className="room-header-secure" style={{
            padding: "3px 8px",
            border: "1px solid #1A1A1A",
            background: "#111",
            flexShrink: 0,
          }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#444", letterSpacing: "0.08em" }}>
              {lang === "en" ? "SECURE" : "SÉCURISÉ"}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const SvgChat = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
    <rect x="2" y="2" width="16" height="13" />
    <polyline points="2,15 2,18 5,15" />
  </svg>
)

const SvgDossier = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
    <rect x="2" y="6" width="16" height="12" />
    <polyline points="7,6 7,3 13,3 13,6" />
    <line x1="2" y1="12" x2="18" y2="12" />
  </svg>
)

const SvgVision = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
    <path d="M2 10 Q10 4 18 10 Q10 16 2 10" strokeLinecap="square" />
    <circle cx="10" cy="10" r="2.5" />
  </svg>
)

const SvgRdv = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
    <rect x="2" y="4" width="16" height="14" />
    <line x1="2" y1="9" x2="18" y2="9" />
    <line x1="6" y1="2" x2="6" y2="6" />
    <line x1="14" y1="2" x2="14" y2="6" />
  </svg>
)

const SvgClosing = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
    <polyline points="4,10 8,15 16,6" />
  </svg>
)

const SvgSecurite = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="square" strokeLinejoin="miter">
    <rect x="4" y="9" width="12" height="9" />
    <path d="M7 9 L7 6 Q7 3 10 3 Q13 3 13 6 L13 9" strokeLinecap="square" />
  </svg>
)

function getTabs(lang: "fr" | "en"): { id: Tab; icon: React.ReactNode; label: string }[] {
  return [
    { id: "chat",    icon: <SvgChat />,     label: "Chat" },
    { id: "deck",    icon: <SvgDossier />,  label: lang === "en" ? "File" : "Dossier" },
    { id: "vision",  icon: <SvgVision />,   label: "Vision" },
    { id: "rdv",     icon: <SvgRdv />,      label: lang === "en" ? "Appt." : "RDV" },
    { id: "closing", icon: <SvgClosing />,  label: "Closing" },
    { id: "info",    icon: <SvgSecurite />, label: lang === "en" ? "Security" : "Sécurité" },
  ]
}

function Sidebar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
  const { lang } = useLang()
  const tabs = getTabs(lang)
  return (
    <div style={{
      width: 64,
      flexShrink: 0,
      borderRight: `1px solid ${C.border}`,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      paddingTop: 16,
      gap: 4,
      background: "#FDFAF6",
    }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          title={t.label}
          style={{
            width: 44,
            height: 44,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            border: "none",
            background: tab === t.id ? C.bgSubtle : "transparent",
            cursor: "pointer",
            borderLeft: `2px solid ${tab === t.id ? C.accent : "transparent"}`,
            transition: "all 0.1s",
            color: tab === t.id ? C.text : C.muted,
          }}
        >
          {t.icon}
          <span style={{
            fontFamily: FONT_SANS, fontSize: 8,
            color: tab === t.id ? C.text : C.muted,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            {t.label}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── Chat ────────────────────────────────────────────────────────────────────

function ChatSection({
  messages, userId, displayName, onSend, canShare = true,
}: {
  messages: ParsedMessage[]
  userId: string
  displayName: string
  onSend: (content: string, kind?: MsgKind, meta?: Record<string, string>) => Promise<void>
  canShare?: boolean
}) {
  const { lang } = useLang()
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const [docMode, setDocMode] = useState(false)
  const [docUrl, setDocUrl] = useState("")
  const [docTitle, setDocTitle] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    const t = text.trim()
    if (!t) return
    setSending(true)
    setText("")
    await onSend(t, "text")
    setSending(false)
  }

  async function handleDocShare() {
    if (!docUrl.trim()) return
    setSending(true)
    await onSend(`__DOC__|${docUrl.trim()}|${docTitle.trim() || docUrl.trim()}`)
    setDocUrl(""); setDocTitle(""); setDocMode(false)
    setSending(false)
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, fontStyle: "italic" }}>
              {lang === "en"
                ? "The room is open. Exchanges are encrypted and confidential."
                : "La room est ouverte. Les échanges sont chiffrés et confidentiels."}
            </p>
          </div>
        )}
        {messages.map(m => {
          const isMe = m.sender_id === userId

          if (m.kind === "system") {
            return (
              <div key={m.id} style={{ textAlign: "center", padding: "4px 0" }}>
                <span style={{
                  fontFamily: FONT_MONO, fontSize: 10, color: C.muted,
                  letterSpacing: "0.06em", background: C.bgSubtle,
                  padding: "3px 12px",
                }}>
                  {m.content.replace("__SYSTEM__:", "").trim()}
                </span>
              </div>
            )
          }

          if (m.kind === "doc") {
            return (
              <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <a
                  href={m.docUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    maxWidth: 340,
                    padding: "12px 16px",
                    background: isMe ? C.bgDark : C.bgSubtle,
                    border: `1px solid ${isMe ? C.bgDark : C.border}`,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 20 }}>📎</span>
                  <div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 12, fontWeight: 600, color: isMe ? "#FFF" : C.text, marginBottom: 2 }}>
                      {m.docTitle}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: isMe ? "#888" : C.muted, letterSpacing: "0.04em" }}>
                      {lang === "en" ? "Open document →" : "Ouvrir le document →"}
                    </div>
                  </div>
                </a>
              </div>
            )
          }

          if (m.kind === "meeting") {
            const mt = m.meeting!
            return (
              <div key={m.id} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: 340,
                  padding: "14px 18px",
                  border: `1px solid ${mt.status === "accepted" ? "#16a34a" : C.border}`,
                  background: mt.status === "accepted" ? "#f0fdf4" : C.bgSubtle,
                }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 8 }}>
                    {lang === "en" ? "📅 Meeting proposal" : "📅 Proposition de rendez-vous"}
                  </div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                    {formatDateFr(mt.datetime, lang)}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted }}>
                    {mt.format === "video"
                      ? (lang === "en" ? "🎥 Video call" : "🎥 Appel vidéo")
                      : (lang === "en" ? "📞 Phone call" : "📞 Appel téléphonique")
                    } · {mt.duration} min
                  </div>
                  <div style={{
                    marginTop: 8,
                    fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em",
                    color: mt.status === "accepted" ? "#16a34a" : mt.status === "declined" ? "#dc2626" : C.muted,
                  }}>
                    {mt.status === "accepted"
                      ? (lang === "en" ? "✓ CONFIRMED" : "✓ CONFIRMÉ")
                      : mt.status === "declined"
                        ? (lang === "en" ? "✗ DECLINED" : "✗ REFUSÉ")
                        : (lang === "en" ? "PENDING CONFIRMATION" : "EN ATTENTE DE CONFIRMATION")
                    }
                  </div>
                </div>
              </div>
            )
          }

          // Regular text
          return (
            <div key={m.id} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: isMe ? "flex-end" : "flex-start",
              gap: 3,
            }}>
              {!isMe && (
                <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: C.muted, letterSpacing: "0.04em", marginLeft: 2 }}>
                  {displayName}
                </span>
              )}
              <div style={{
                maxWidth: 480,
                padding: "10px 14px",
                background: isMe ? C.bgDark : C.bgSubtle,
                border: `1px solid ${isMe ? C.bgDark : C.border}`,
              }}>
                <p style={{
                  fontFamily: FONT_SANS, fontSize: 14, color: isMe ? "#FFFFFF" : C.text,
                  margin: 0, lineHeight: 1.6, whiteSpace: "pre-wrap",
                }}>
                  {m.content}
                </p>
              </div>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.muted, marginLeft: isMe ? 0 : 2 }}>
                {formatTime(m.created_at, lang)}
              </span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Doc share form */}
      {docMode && (
        <div style={{
          borderTop: `1px solid ${C.border}`,
          padding: "12px 16px",
          background: C.bgSubtle,
          display: "flex",
          gap: 8,
          alignItems: "center",
          flexWrap: "wrap",
        }}>
          <input
            value={docTitle}
            onChange={e => setDocTitle(e.target.value)}
            placeholder={lang === "en" ? "Document name" : "Nom du document"}
            style={{ flex: "0 0 180px", padding: "6px 10px", border: `1px solid ${C.border}`, fontFamily: FONT_SANS, fontSize: 12, background: "#FFF", outline: "none" }}
          />
          <input
            value={docUrl}
            onChange={e => setDocUrl(e.target.value)}
            placeholder={lang === "en" ? "Document URL (Drive, Notion, PDF…)" : "URL du document (Drive, Notion, PDF…)"}
            style={{ flex: 1, minWidth: 200, padding: "6px 10px", border: `1px solid ${C.border}`, fontFamily: FONT_SANS, fontSize: 12, background: "#FFF", outline: "none" }}
          />
          <button onClick={handleDocShare} disabled={!docUrl.trim()} style={btnStyle(false)}>{lang === "en" ? "Share" : "Partager"}</button>
          <button onClick={() => setDocMode(false)} style={{ ...btnStyle(true), borderColor: C.border }}>{lang === "en" ? "Cancel" : "Annuler"}</button>
        </div>
      )}

      {/* Input */}
      <div style={{
        borderTop: `1px solid ${C.border}`,
        padding: "12px 16px",
        display: "flex",
        gap: 8,
        alignItems: "flex-end",
      }}>
        <button
          title={canShare ? (lang === "en" ? "Share a document" : "Partager un document") : (lang === "en" ? "Upgrade to share documents" : "Passez au plan payant pour partager")}
          onClick={() => canShare ? setDocMode(d => !d) : window.location.href = "/pricing"}
          style={{ ...btnStyle(!canShare), padding: "8px 10px", flexShrink: 0, opacity: canShare ? 1 : 0.5 }}
        >
          📎
        </button>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder={lang === "en"
            ? "Message… (Enter to send, Shift+Enter for new line)"
            : "Message… (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"}
          rows={2}
          style={{
            flex: 1,
            padding: "10px 12px",
            border: `1px solid ${C.border}`,
            fontFamily: FONT_SANS, fontSize: 13,
            color: C.text,
            resize: "none",
            outline: "none",
            lineHeight: 1.5,
          }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{ ...btnStyle(false), flexShrink: 0, alignSelf: "flex-end", padding: "10px 20px" }}
        >
          {sending ? "…" : (lang === "en" ? "Send" : "Envoyer")}
        </button>
      </div>
    </div>
  )
}

// ─── Deck ─────────────────────────────────────────────────────────────────────

function DeckSection({
  opportunity, deck, messages, roomStatus,
}: {
  opportunity: Record<string, unknown> | null
  deck: Record<string, unknown> | null
  messages: ParsedMessage[]
  roomStatus: string
}) {
  const { lang } = useLang()
  const deckUrl = opportunity?.pitch_deck_url as string | null
  const websiteUrl = opportunity?.website_url as string | null
  const docMessages = messages.filter(m => m.kind === "doc")
  const isUnlocked = roomStatus === "closed_deal"
  const oppId = opportunity?.id as string | null
  const isDemo = oppId === "demo" || !oppId
  const dScore = deck?.d_score as number | null | undefined
  const memoReady = deck?.status === "done"

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 36px" }}>
      <SectionHeader label={lang === "en" ? "File & Documents" : "Dossier & Documents"} />

      {/* Opportunity snapshot */}
      {opportunity && (
        <div style={{ marginBottom: 32 }}>
          <Label>{lang === "en" ? "Referenced Opportunity" : "Opportunité référencée"}</Label>
          <div style={{ border: `1px solid ${C.border}`, padding: "18px 22px", marginTop: 8 }}>
            <div style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 700, color: C.text, marginBottom: 12 }}>
              {opportunity.title as string}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[opportunity.deal_type, opportunity.sector, opportunity.geo, opportunity.stage]
                .filter(Boolean)
                .map((t, i) => (
                  <span key={i} style={{
                    padding: "2px 10px", border: `1px solid ${C.border}`,
                    fontFamily: FONT_SANS, fontSize: 10, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase",
                  }}>
                    {t as string}
                  </span>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Documents IA — MEMO + NDA */}
      {!isDemo && (
        <div style={{ marginBottom: 32 }}>
          <Label>{lang === "en" ? "AI Documents" : "Documents IA"}</Label>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>

            {/* MEMO */}
            <a
              href={memoReady ? `/app/opportunities/${oppId}/memo` : undefined}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 18px", border: `1px solid ${C.border}`,
                background: C.bgSubtle, textDecoration: "none",
                opacity: memoReady ? 1 : 0.5,
                cursor: memoReady ? "pointer" : "default",
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 2 }}>AI MEMO</div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.text }}>
                  {lang === "en" ? "Qualification Memorandum" : "Mémorandum de qualification"}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.muted, marginTop: 2 }}>
                  {memoReady
                    ? (lang === "en" ? "Qualified · Ready to read" : "Qualifié · Prêt à lire")
                    : (lang === "en" ? "Pending qualification" : "En attente de qualification")
                  }
                </div>
              </div>
              {dScore != null && (
                <div style={{ marginLeft: "auto", textAlign: "center", flexShrink: 0 }}>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 28, fontWeight: 700, color: C.text, lineHeight: 1 }}>{Math.round(dScore)}</div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 9, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: 4 }}>D-Score</div>
                </div>
              )}
              {memoReady && (
                <div style={{ marginLeft: dScore != null ? 0 : "auto", flexShrink: 0 }}>
                  <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: C.text, border: `1px solid ${C.border}`, padding: "3px 10px" }}>
                    {lang === "en" ? "Open →" : "Ouvrir →"}
                  </span>
                </div>
              )}
            </a>

            {/* NDA */}
            <a
              href={`/app/opportunities/${oppId}/nda`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "14px 18px", border: `1px solid ${C.border}`,
                background: C.bgSubtle, textDecoration: "none",
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: FONT_SANS, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 2 }}>NDA</div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.text }}>
                  {lang === "en" ? "Confidentiality Agreement" : "Accord de Confidentialité"}
                </div>
                <div style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.muted, marginTop: 2 }}>
                  {lang === "en" ? "Bilateral · French law · eIDAS" : "Bilatéral · Droit français · eIDAS"}
                </div>
              </div>
              <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: C.text, border: `1px solid ${C.border}`, padding: "3px 10px", flexShrink: 0 }}>
                {lang === "en" ? "Sign / Read →" : "Signer / Lire →"}
              </span>
            </a>

          </div>
        </div>
      )}

      {/* Unlock banner */}
      {!isUnlocked && (
        <div style={{
          marginBottom: 24,
          padding: "12px 18px",
          background: "#0A0A0A",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#555", letterSpacing: "0.1em" }}>
            {lang === "en" ? "🔒 DOWNLOAD LOCKED" : "🔒 TÉLÉCHARGEMENT VERROUILLÉ"}
          </span>
          <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#888", lineHeight: 1.5 }}>
            {lang === "en"
              ? "Documents are viewable but not downloadable. Downloads will be unlocked once both parties have validated the deal."
              : "Les documents sont visibles mais non téléchargeables. Le téléchargement sera déverrouillé après validation du deal par les deux parties."
            }
          </span>
        </div>
      )}

      {/* Pitch deck embed */}
      {deckUrl && (
        <div style={{ marginBottom: 32 }}>
          <Label>Pitch Deck</Label>
          <div style={{ marginTop: 8, border: `1px solid ${C.border}`, background: C.bgSubtle }}>
            <div style={{
              padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.muted, letterSpacing: "0.08em" }}>
                {lang === "en" ? "SHARED DECK" : "DECK PARTAGÉ"}
              </span>
              {isUnlocked ? (
                <a href={deckUrl} target="_blank" rel="noopener noreferrer" style={{
                  fontFamily: FONT_SANS, fontSize: 10, color: C.text, textDecoration: "none",
                  border: `1px solid ${C.border}`, padding: "3px 10px",
                }}>
                  {lang === "en" ? "Download →" : "Télécharger →"}
                </a>
              ) : (
                <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#555", letterSpacing: "0.06em" }}>
                  {lang === "en" ? "🔒 Locked" : "🔒 Verrouillé"}
                </span>
              )}
            </div>
            <iframe
              src={deckUrl}
              style={{ width: "100%", height: 440, border: "none", display: "block" }}
              allow="fullscreen"
              title="Pitch Deck"
            />
          </div>
        </div>
      )}

      {/* Site web */}
      {websiteUrl && (
        <div style={{ marginBottom: 28 }}>
          <Label>{lang === "en" ? "Website" : "Site web"}</Label>
          <a href={websiteUrl} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 10, marginTop: 8,
            padding: "12px 16px", border: `1px solid ${C.border}`, background: C.bgSubtle,
            textDecoration: "none",
          }}>
            <span style={{ fontSize: 16 }}>🌐</span>
            <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.text }}>{websiteUrl}</span>
          </a>
        </div>
      )}

      {/* Shared docs from chat */}
      {docMessages.length > 0 && (
        <div>
          <Label>{lang === "en" ? "Documents shared in the Room" : "Documents partagés dans la Room"}</Label>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {docMessages.map(m => (
              <div
                key={m.id}
                style={{
                  padding: "12px 16px", border: `1px solid ${C.border}`, background: C.bgSubtle,
                  display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <span style={{ fontSize: 18 }}>📎</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.text }}>{m.docTitle}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, marginTop: 2 }}>{formatTime(m.created_at, lang)}</div>
                </div>
                {isUnlocked ? (
                  <a href={m.docUrl} target="_blank" rel="noopener noreferrer" style={{
                    fontFamily: FONT_SANS, fontSize: 10, color: C.text, textDecoration: "none",
                    border: `1px solid ${C.border}`, padding: "3px 10px", flexShrink: 0,
                  }}>
                    {lang === "en" ? "Download →" : "Télécharger →"}
                  </a>
                ) : (
                  <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#555", letterSpacing: "0.06em", flexShrink: 0 }}>
                    🔒
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!deckUrl && !websiteUrl && docMessages.length === 0 && !opportunity && (
        <EmptyState icon="📊" text={lang === "en"
          ? "No documents shared. Share links via chat (📎 button)."
          : "Aucun document partagé. Partagez des liens via le chat (bouton 📎)."
        } />
      )}
    </div>
  )
}

// ─── Vision ───────────────────────────────────────────────────────────────────

function VisionSection({ roomId }: { roomId: string }) {
  const { lang } = useLang()
  const jitsiRoom = `crochet-${roomId.slice(0, 8)}`
  const jitsiUrl = `https://meet.jit.si/${jitsiRoom}`
  const [embedded, setEmbedded] = useState(false)

  const instructions = lang === "en"
    ? [
        "Click \"Start call\" to join the video room.",
        "Share the access code with other participants in this Room.",
        "The call remains active until the Room is closed.",
        "You can share your screen to present the deck.",
        "The session is not recorded automatically.",
      ]
    : [
        "Cliquez « Démarrer l'appel » pour rejoindre la salle vidéo.",
        "Partagez le code d'accès avec les autres participants de cette Room.",
        "L'appel reste actif jusqu'à la fermeture de la Room.",
        "Vous pouvez partager votre écran pour présenter le deck.",
        "La session n'est pas enregistrée automatiquement.",
      ]

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {!embedded ? (
        <div style={{ padding: "32px 36px", overflowY: "auto" }}>
          <SectionHeader label={lang === "en" ? "Vision Call" : "Appel Vision"} />

          <div style={{
            border: `1px solid ${C.border}`,
            padding: "32px",
            marginBottom: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            textAlign: "center",
          }}>
            <span style={{ fontSize: 48 }}>🎥</span>
            <div>
              <h2 style={{ fontFamily: FONT_SERIF, fontStyle: "italic", fontSize: 28, fontWeight: 700, color: C.text, margin: "0 0 8px" }}>
                {lang === "en" ? "Secure call" : "Appel sécurisé"}
              </h2>
              <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0, maxWidth: 400 }}>
                {lang === "en"
                  ? "The video call is end-to-end encrypted. Only members of this Secure Room have access via the code below."
                  : "L\u2019appel vidéo est chiffré de bout en bout. Seuls les membres de cette Secure Room y ont accès via le code ci-dessous."
                }
              </p>
            </div>

            <div style={{
              padding: "14px 24px",
              background: C.bgSubtle,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>
                {lang === "en" ? "ACCESS CODE" : "CODE D\u2019ACCÈS"}
              </div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: "0.04em" }}>
                {jitsiRoom}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setEmbedded(true)}
                style={{ ...btnStyle(false), padding: "12px 32px", fontSize: 13 }}
              >
                {lang === "en" ? "🎥 Start call" : "🎥 Démarrer l\u2019appel"}
              </button>
              <a
                href={jitsiUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnStyle(true), padding: "12px 24px", fontSize: 12, textDecoration: "none" }}
              >
                {lang === "en" ? "Open in a tab →" : "Ouvrir dans un onglet →"}
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ border: `1px solid ${C.border}`, padding: "20px 24px" }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
              {lang === "en" ? "Instructions" : "Instructions"}
            </div>
            {instructions.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, flexShrink: 0, paddingTop: 2, minWidth: 16 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.text, lineHeight: 1.6 }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{
            padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: C.bgSubtle, flexShrink: 0,
          }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
              {lang === "en" ? `CALL IN PROGRESS · ${jitsiRoom}` : `APPEL EN COURS · ${jitsiRoom}`}
            </span>
            <button onClick={() => setEmbedded(false)} style={{ ...btnStyle(true), padding: "4px 12px", fontSize: 11 }}>
              {lang === "en" ? "Minimize" : "Réduire"}
            </button>
          </div>
          <iframe
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            style={{ flex: 1, border: "none", display: "block" }}
            title="Vision Call"
          />
        </div>
      )}
    </div>
  )
}

// ─── Rendez-vous ──────────────────────────────────────────────────────────────

function RdvSection({
  messages, onSend,
}: {
  messages: ParsedMessage[]
  onSend: (content: string) => Promise<void>
}) {
  const { lang } = useLang()
  const meetingMessages = messages.filter(m => m.kind === "meeting")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")
  const [format, setFormat] = useState<"video" | "phone">("video")
  const [duration, setDuration] = useState(60)
  const [sending, setSending] = useState(false)

  async function proposeRdv() {
    if (!date || !time) return
    setSending(true)
    const datetime = new Date(`${date}T${time}:00`).toISOString()
    await onSend(`__MEETING__|${datetime}|${format}|${duration}|pending`)
    setDate(""); setTime("")
    setSending(false)
  }

  // Min date = today
  const minDate = new Date().toISOString().split("T")[0]

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 36px" }}>
      <SectionHeader label={lang === "en" ? "Appointments" : "Rendez-vous"} />

      {/* Proposer */}
      <div style={{ border: `1px solid ${C.border}`, padding: "24px", marginBottom: 32 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
          {lang === "en" ? "Propose a slot" : "Proposer un créneau"}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <Label>Date</Label>
            <input type="date" value={date} min={minDate} onChange={e => setDate(e.target.value)}
              style={fieldStyle} />
          </div>
          <div>
            <Label>{lang === "en" ? "Time" : "Heure"}</Label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={fieldStyle} />
          </div>
          <div>
            <Label>Format</Label>
            <select value={format} onChange={e => setFormat(e.target.value as "video" | "phone")}
              style={fieldStyle}>
              <option value="video">{lang === "en" ? "🎥 Video" : "🎥 Vidéo"}</option>
              <option value="phone">{lang === "en" ? "📞 Phone" : "📞 Téléphone"}</option>
            </select>
          </div>
          <div>
            <Label>{lang === "en" ? "Duration (min)" : "Durée (min)"}</Label>
            <select value={duration} onChange={e => setDuration(Number(e.target.value))}
              style={fieldStyle}>
              <option value={30}>30 min</option>
              <option value={60}>{lang === "en" ? "1 hour" : "1 heure"}</option>
              <option value={90}>1h30</option>
              <option value={120}>{lang === "en" ? "2 hours" : "2 heures"}</option>
            </select>
          </div>
        </div>

        <button
          onClick={proposeRdv}
          disabled={!date || !time || sending}
          style={btnStyle(false)}
        >
          {sending ? "…" : (lang === "en" ? "Propose this slot" : "Proposer ce créneau")}
        </button>
      </div>

      {/* Liste des RDV proposés */}
      <div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
          {lang === "en" ? `Proposals (${meetingMessages.length})` : `Propositions (${meetingMessages.length})`}
        </div>
        {meetingMessages.length === 0 ? (
          <EmptyState icon="📅" text={lang === "en"
            ? "No appointments proposed. The room remains open until closing."
            : "Aucun rendez-vous proposé. La room reste ouverte jusqu'au closing."
          } />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {meetingMessages.map(m => {
              const mt = m.meeting!
              const statusColor = { accepted: "#22c55e", declined: "#dc2626", pending: C.muted }
              const statusLabel = lang === "en"
                ? { accepted: "Confirmed", declined: "Declined", pending: "Pending" }
                : { accepted: "Confirmé", declined: "Refusé", pending: "En attente" }
              return (
                <div key={m.id} style={{
                  border: `1px solid ${mt.status === "accepted" ? "#bbf7d0" : C.border}`,
                  padding: "18px 22px",
                  background: mt.status === "accepted" ? "#f0fdf4" : C.bg,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                      {formatDateFr(mt.datetime, lang)}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted }}>
                      {mt.format === "video"
                        ? (lang === "en" ? "🎥 Video" : "🎥 Vidéo")
                        : (lang === "en" ? "📞 Phone" : "📞 Téléphone")
                      } · {mt.duration} min
                    </div>
                  </div>
                  <div style={{
                    fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.1em",
                    color: statusColor[mt.status as keyof typeof statusColor] ?? C.muted,
                    border: `1px solid ${statusColor[mt.status as keyof typeof statusColor] ?? C.border}`,
                    padding: "4px 12px",
                  }}>
                    {statusLabel[mt.status as keyof typeof statusLabel] ?? mt.status}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Closing / Deal validation ────────────────────────────────────────────────

function ClosingSection({
  roomId, roomStatus, validations, userId,
  onStatusChange, onValidationsChange,
}: {
  roomId: string
  roomStatus: string
  validations: Validation[]
  userId: string
  onStatusChange: (s: string) => void
  onValidationsChange: (v: Validation[]) => void
}) {
  const { lang } = useLang()
  const [loading, setLoading] = useState(false)

  const hasValidated = validations.some(v => v.user_id === userId)
  const otherValidated = validations.some(v => v.user_id !== userId)
  const isDone = roomStatus === "closed_deal" || roomStatus === "closed_no_deal"
  const isPendingClose = roomStatus === "pending_close"

  // Qui est en attente de qui ?
  // A (validé, attend B) : hasValidated && !otherValidated
  // B (doit décider)     : !hasValidated && otherValidated
  const iWaitingForOther = hasValidated && !otherValidated && isPendingClose
  const otherWaitsForMe  = !hasValidated && otherValidated && isPendingClose

  async function handleValidate() {
    setLoading(true)
    try { await validateDeal(roomId) } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleDecline() {
    setLoading(true)
    try { await declineDeal(roomId) } catch (e) { console.error(e) }
    setLoading(false)
  }

  async function handleRevoke() {
    setLoading(true)
    try { await revokeValidation(roomId) } catch (e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 36px" }}>
      <SectionHeader label={lang === "en" ? "Closing & Deal Validation" : "Closing & Validation du Deal"} />

      {/* ── CLOSED DEAL ── */}
      {roomStatus === "closed_deal" && (
        <div style={{
          padding: "28px 28px", marginBottom: 28,
          background: "#052e16", border: "1px solid #16a34a",
          display: "flex", alignItems: "center", gap: 18,
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            border: "2px solid #22c55e",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}>
            ✓
          </div>
          <div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 15, fontWeight: 700, color: "#22c55e", marginBottom: 6 }}>
              {lang === "en" ? "Deal validated by both parties" : "Deal validé par les deux parties"}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#4ade80", lineHeight: 1.7 }}>
              {lang === "en"
                ? "The Room is archived. Documents are now downloadable."
                : "La Room est archivée. Les documents sont maintenant téléchargeables."
              }
            </div>
          </div>
        </div>
      )}

      {/* ── CLOSED NO DEAL ── */}
      {roomStatus === "closed_no_deal" && (
        <div style={{
          padding: "28px 28px", marginBottom: 28,
          background: "#0f0f0f", border: "1px solid #3a3a3a",
        }}>
          <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#555", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
            {lang === "en" ? "Archived room · Read only" : "Room archivée · Lecture seule"}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 700, color: "#7A746E", marginBottom: 6 }}>
            {lang === "en" ? "Deal declined" : "Deal décliné"}
          </div>
          <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#555", lineHeight: 1.7 }}>
            {lang === "en"
              ? "The Room is archived as read-only. Exchanges and shared documents remain visible to both parties, but documents are not downloadable."
              : "La Room est archivée en lecture seule. Les échanges et documents partagés restent visibles pour les deux parties, mais les documents ne sont pas téléchargeables."
            }
          </div>
        </div>
      )}

      {/* ── ACTIVE — no one has validated yet ── */}
      {!isDone && !isPendingClose && (
        <>
          <div style={{ border: `1px solid ${C.border}`, padding: "20px 24px", marginBottom: 28 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
              {lang === "en" ? "Closing conditions" : "Conditions de fermeture"}
            </div>
            {(lang === "en"
              ? [
                  "Both parties must confirm the deal independently.",
                  "Once both validations are received, the Room is closed.",
                  "Documents become downloadable only after closure.",
                  "Each party can revoke their validation as long as the other has not yet validated.",
                ]
              : [
                  "Les deux parties doivent confirmer le deal indépendamment.",
                  "Une fois les deux validations reçues, la Room est clôturée.",
                  "Les documents deviennent téléchargeables uniquement après clôture.",
                  "Chaque partie peut révoquer sa validation tant que l'autre n'a pas encore validé.",
                ]
            ).map((rule, i) => (
              <div key={i} style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "flex-start" }}>
                <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, flexShrink: 0, paddingTop: 2 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.text, lineHeight: 1.7 }}>{rule}</span>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
            <div style={{ border: `1px solid ${C.border}`, padding: "20px", background: C.bg }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
                {lang === "en" ? "Your position" : "Votre position"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.muted, flexShrink: 0 }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.muted, letterSpacing: "0.06em" }}>
                  {lang === "en" ? "PENDING" : "EN ATTENTE"}
                </span>
              </div>
              <button onClick={handleValidate} disabled={loading} style={{ ...btnStyle(false), fontSize: 11, padding: "10px 20px" }}>
                {loading ? "…" : (lang === "en" ? "Validate deal" : "Valider le deal")}
              </button>
            </div>
            <div style={{ border: `1px solid ${C.border}`, padding: "20px", background: C.bg }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
                {lang === "en" ? "Other party" : "Autre partie"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.muted, flexShrink: 0 }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: C.muted, letterSpacing: "0.06em" }}>
                  {lang === "en" ? "PENDING" : "EN ATTENTE"}
                </span>
              </div>
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 20 }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: "#dc2626", marginBottom: 12 }}>
              {lang === "en" ? "Refusal zone" : "Zone de refus"}
            </div>
            <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, marginBottom: 14, lineHeight: 1.7 }}>
              {lang === "en"
                ? "Declining the deal closes the Room immediately and archives it without unlocking documents."
                : "Refuser le deal ferme la Room immédiatement et l\u2019archive sans débloquer les documents."
              }
            </p>
            <button
              onClick={handleDecline}
              disabled={loading}
              style={{
                padding: "8px 20px", background: "transparent", color: "#dc2626",
                border: "1px solid #dc2626", fontFamily: FONT_SANS, fontSize: 11,
                fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
              }}
            >
              {lang === "en" ? "Decline deal" : "Refuser le deal"}
            </button>
          </div>
        </>
      )}

      {/* ── PENDING CLOSE — I validated, waiting for other ── */}
      {iWaitingForOther && (
        <>
          <div style={{
            padding: "24px 28px", marginBottom: 28,
            background: "#1c1000", border: "1px solid #5a4000",
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 10, height: 10, borderRadius: "50%", background: "#f59e0b", flexShrink: 0,
              boxShadow: "0 0 0 3px rgba(245,158,11,0.2)",
            }} />
            <div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: "#f59e0b", marginBottom: 4 }}>
                {lang === "en"
                  ? "Waiting for confirmation from the other party"
                  : "En attente de confirmation de l\u2019autre partie"
                }
              </div>
              <div style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#92600a", lineHeight: 1.6 }}>
                {lang === "en"
                  ? "Your validation has been recorded. The Room will close automatically once the other party confirms."
                  : "Votre validation a été enregistrée. La Room se fermera automatiquement dès que l\u2019autre partie confirmera."
                }
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            <div style={{ border: "1px solid #16a34a", padding: "20px", background: "#052e16" }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
                {lang === "en" ? "Your position" : "Votre position"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#22c55e", letterSpacing: "0.06em" }}>
                  {lang === "en" ? "DEAL CONFIRMED" : "DEAL CONFIRMÉ"}
                </span>
              </div>
              <button onClick={handleRevoke} disabled={loading} style={{ ...btnStyle(true), fontSize: 10, padding: "6px 14px" }}>
                {loading ? "…" : (lang === "en" ? "Revoke my validation" : "Révoquer ma validation")}
              </button>
            </div>
            <div style={{ border: `1px solid ${C.border}`, padding: "20px", background: C.bg }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
                {lang === "en" ? "Other party" : "Autre partie"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#f59e0b", letterSpacing: "0.06em" }}>
                  {lang === "en" ? "PENDING" : "EN ATTENTE"}
                </span>
              </div>
            </div>
          </div>

          <p style={{ fontFamily: FONT_SANS, fontSize: 11, color: C.muted, margin: 0, lineHeight: 1.7 }}>
            {lang === "en"
              ? "You can revoke your validation as long as the other party has not yet confirmed. Once both parties have validated, the deal is locked."
              : "Vous pouvez révoquer votre validation tant que l\u2019autre partie n\u2019a pas encore confirmé. Une fois les deux parties validées, le deal est verrouillé."
            }
          </p>
        </>
      )}

      {/* ── PENDING CLOSE — Other validated, my turn to decide ── */}
      {otherWaitsForMe && (
        <>
          <div style={{
            padding: "28px 28px", marginBottom: 32,
            border: "1px solid #3b82f6", background: "#0c1a3a",
          }}>
            <div style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#3b82f6", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 12 }}>
              {lang === "en" ? "Action required" : "Action requise"}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 15, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>
              {lang === "en" ? "The other party has validated the deal." : "L\u2019autre partie a validé le deal."}
            </div>
            <div style={{ fontFamily: FONT_SANS, fontSize: 13, color: "#93c5fd", lineHeight: 1.7, marginBottom: 24 }}>
              {lang === "en"
                ? "Do you confirm the deal? If you confirm, the Room is closed and documents are unlocked for both parties. If you decline, the Room is archived without access to documents."
                : "Confirmez-vous le deal ? Si vous confirmez, la Room est clôturée et les documents sont débloqués pour les deux parties. Si vous déclinez, la Room est archivée sans accès aux documents."
              }
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={handleValidate}
                disabled={loading}
                style={{
                  padding: "14px 32px", background: "#FFFFFF", color: "#0A0A0A", border: "none",
                  fontFamily: FONT_SANS, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em",
                  textTransform: "uppercase", cursor: loading ? "wait" : "pointer", opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "…" : (lang === "en" ? "Confirm deal" : "Confirmer le deal")}
              </button>
              <button
                onClick={handleDecline}
                disabled={loading}
                style={{
                  padding: "14px 32px", background: "transparent", color: "#ef4444",
                  border: "1px solid #ef4444", fontFamily: FONT_SANS, fontSize: 12,
                  fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase",
                  cursor: loading ? "wait" : "pointer", opacity: loading ? 0.5 : 1,
                }}
              >
                {lang === "en" ? "Decline" : "Décliner"}
              </button>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ border: "1px solid #16a34a", padding: "20px", background: "#052e16" }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
                {lang === "en" ? "Other party" : "Autre partie"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#22c55e", letterSpacing: "0.06em" }}>
                  {lang === "en" ? "DEAL CONFIRMED" : "DEAL CONFIRMÉ"}
                </span>
              </div>
            </div>
            <div style={{ border: "1px solid #3b82f6", padding: "20px", background: "#0c1a3a" }}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 12 }}>
                {lang === "en" ? "Your position" : "Votre position"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3b82f6", flexShrink: 0 }} />
                <span style={{ fontFamily: FONT_MONO, fontSize: 11, color: "#3b82f6", letterSpacing: "0.06em" }}>
                  {lang === "en" ? "DECISION REQUIRED" : "DÉCISION REQUISE"}
                </span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── Info / Sécurité ──────────────────────────────────────────────────────────

function InfoSection({
  roomRef, ndaSigned, roomStatus, opportunity,
}: {
  roomRef: string; ndaSigned: boolean; roomStatus: string; opportunity: Record<string, unknown> | null
}) {
  const { lang } = useLang()
  const securityFields = lang === "en"
    ? [
        { label: "Room Reference", value: roomRef },
        { label: "Status", value: roomStatus === "active" ? "Active" : roomStatus },
        { label: "NDA", value: ndaSigned ? "Signed" : "Not signed" },
        { label: "Protocol", value: "NDA-CROCHET-V1" },
        { label: "Jurisdiction", value: "French law — Paris" },
        { label: "Confidentiality period", value: "2 years post-closing" },
      ]
    : [
        { label: "Référence Room", value: roomRef },
        { label: "Statut", value: roomStatus === "active" ? "Actif" : roomStatus },
        { label: "NDA", value: ndaSigned ? "Signé" : "Non signé" },
        { label: "Protocole", value: "NDA-CROCHET-V1" },
        { label: "Juridiction", value: "Droit français — Paris" },
        { label: "Durée confidentialité", value: "2 ans post-closing" },
      ]
  const rules = lang === "en"
    ? [
        "All communications exchanged in this Room are covered by the NDA.",
        "Shared documents remain the exclusive property of the Disclosing Party.",
        "Reproduction or transmission to third parties is strictly prohibited.",
        "Any violation incurs criminal and civil liability for the offenders.",
        "The Room remains open until closing or mutual termination.",
        "CROCHET is not a party to the negotiations — intermediary role only.",
      ]
    : [
        "Toutes les communications échangées dans cette Room sont couvertes par le NDA.",
        "Les documents partagés restent la propriété exclusive de la Partie Divulgatrice.",
        "La reproduction ou transmission à des tiers est strictement interdite.",
        "Toute violation engage la responsabilité pénale et civile des contrevenants.",
        "La Room reste ouverte jusqu'au closing ou résiliation mutuelle.",
        "CROCHET n'est pas partie aux négociations — rôle d'intermédiaire uniquement.",
      ]

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 36px" }}>
      <SectionHeader label={lang === "en" ? "Security & Confidentiality" : "Sécurité & Confidentialité"} />

      {/* Security status */}
      <div style={{ border: `1px solid ${C.border}`, marginBottom: 24 }}>
        <div style={{ padding: "12px 18px", background: "#0A0A0A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#555", letterSpacing: "0.1em" }}>
            {lang === "en" ? "CROCHET SECURE ZONE" : "ZONE SÉCURISÉE CROCHET"}
          </span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#22c55e", letterSpacing: "0.08em" }}>
            {lang === "en" ? "ENCRYPTED" : "CHIFFRÉ"}
          </span>
        </div>
        <div style={{ padding: "20px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {securityFields.map(({ label, value }) => (
            <div key={label}>
              <div style={{ fontFamily: FONT_SANS, fontSize: 9, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: C.text }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* NDA status */}
      <div style={{ border: `1px solid ${ndaSigned ? "#bbf7d0" : C.border}`, padding: "16px 20px", marginBottom: 24, background: ndaSigned ? "#f0fdf4" : C.bgSubtle }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: ndaSigned ? 0 : 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: ndaSigned ? "#22c55e" : "#f59e0b", flexShrink: 0 }} />
          <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.text }}>
            {ndaSigned
              ? (lang === "en" ? "Confidentiality Agreement signed" : "Accord de Confidentialité signé")
              : (lang === "en" ? "NDA pending signature" : "NDA en attente de signature")
            }
          </span>
        </div>
        {!ndaSigned && (
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.7 }}>
            {lang === "en"
              ? "Access to confidential documents requires signing the NDA. Go to the file page to generate and sign the agreement."
              : "L\u2019accès aux documents confidentiels nécessite la signature du NDA. Rendez-vous sur la page du dossier pour générer et signer l\u2019accord."
            }
          </p>
        )}
      </div>

      {/* Rules */}
      <div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
          {lang === "en" ? "Secure Room Rules" : "Règles de la Secure Room"}
        </div>
        {rules.map((rule, i) => (
          <div key={i} style={{ display: "flex", gap: 12, marginBottom: 12, alignItems: "flex-start" }}>
            <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, flexShrink: 0, paddingTop: 1, minWidth: 20 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.text, lineHeight: 1.7 }}>{rule}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function SectionHeader({ label }: { label: string }) {
  return (
    <div style={{
      fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.1em",
      textTransform: "uppercase", color: C.muted,
      marginBottom: 24, paddingBottom: 12, borderBottom: `2px solid ${C.text}`,
    }}>
      {label}
    </div>
  )
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.06em", textTransform: "uppercase", color: C.muted, marginBottom: 6 }}>
      {children}
    </div>
  )
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, fontStyle: "italic", margin: 0, maxWidth: 320, marginLeft: "auto", marginRight: "auto", lineHeight: 1.7 }}>
        {text}
      </p>
    </div>
  )
}

function btnStyle(ghost: boolean): React.CSSProperties {
  return {
    padding: "8px 18px",
    background: ghost ? "transparent" : C.bgDark,
    color: ghost ? C.text : "#FFFFFF",
    border: `1px solid ${ghost ? C.border : C.bgDark}`,
    fontFamily: FONT_SANS,
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  } as React.CSSProperties
}

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 10px",
  border: `1px solid ${C.border}`,
  fontFamily: FONT_SANS,
  fontSize: 13,
  color: C.text,
  background: "#FFF",
  outline: "none",
  boxSizing: "border-box",
  appearance: "none",
}

// ─── RoomShell (main export) ──────────────────────────────────────────────────

export function RoomShell({
  roomId, roomRef, roomStatus: initialRoomStatus, opportunity, deck,
  ndaSigned, initialMessages, userId, displayName, initialValidations,
  planStatus = "trial", trialDaysLeft = 14,
}: {
  roomId: string
  roomRef: string
  roomStatus: string
  opportunity: Record<string, unknown> | null
  deck: Record<string, unknown> | null
  ndaSigned: boolean
  initialMessages: RawMessage[]
  userId: string
  displayName: string
  initialValidations: Validation[]
  planStatus?: "active_paid" | "trial" | "expired"
  trialDaysLeft?: number
}) {
  const supabase = useMemo(() => createClient(), [])
  const [tab, setTab] = useState<Tab>("chat")
  const [rawMessages, setRawMessages] = useState<RawMessage[]>(initialMessages)
  const [roomStatus, setRoomStatus] = useState(initialRoomStatus)
  const [validations, setValidations] = useState<Validation[]>(initialValidations)

  // Realtime: messages + room status + validations
  useEffect(() => {
    const channel = supabase
      .channel(`secure-room-${roomId}`)
      // New messages
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "messages",
        filter: `room_id=eq.${roomId}`,
      }, payload => {
        const msg = payload.new as RawMessage
        setRawMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      })
      // Room status change
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "rooms",
        filter: `id=eq.${roomId}`,
      }, payload => {
        const updated = payload.new as { status: string }
        setRoomStatus(updated.status)
      })
      // Validation added
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "room_validations",
        filter: `room_id=eq.${roomId}`,
      }, payload => {
        const v = payload.new as Validation
        setValidations(prev => prev.some(x => x.user_id === v.user_id) ? prev : [...prev, v])
      })
      // Validation removed
      .on("postgres_changes", {
        event: "DELETE", schema: "public", table: "room_validations",
        filter: `room_id=eq.${roomId}`,
      }, payload => {
        const v = payload.old as Validation
        setValidations(prev => prev.filter(x => x.user_id !== v.user_id))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId, supabase])

  const messages = useMemo(() => rawMessages.map(parseMessage), [rawMessages])

  async function sendMessage(content: string) {
    const { error } = await supabase.from("messages").insert({
      room_id: roomId, content, sender_id: userId, created_by: userId,
    })
    if (error) console.error("[send]", error)
  }

  const { lang } = useLang()
  const opportunityTitle = opportunity?.title as string | undefined
  const isDone = roomStatus === "closed_deal" || roomStatus === "closed_no_deal"

  return (
    <BlackScreenGuard>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: C.bg }}>
        <RoomHeader
          roomRef={roomRef}
          status={roomStatus}
          ndaSigned={ndaSigned}
          opportunityTitle={opportunityTitle}
        />

        {/* Trial banner */}
        {planStatus === "trial" && trialDaysLeft <= 3 && trialDaysLeft > 0 && (
          <div style={{ background: "#1c1000", borderBottom: "1px solid #5a4000", padding: "8px 24px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#fbbf24" }}>
              {lang === "en"
                ? `Trial ending in ${trialDaysLeft} day${trialDaysLeft > 1 ? "s" : ""} — add a payment method to keep access.`
                : `Essai se termine dans ${trialDaysLeft} jour${trialDaysLeft > 1 ? "s" : ""} — ajoutez un moyen de paiement pour conserver l'accès.`
              }
            </span>
            <a href="/pricing" style={{ marginLeft: "auto", fontFamily: FONT_SANS, fontSize: 11, color: "#f59e0b", textDecoration: "none", padding: "4px 14px", border: "1px solid #5a4000" }}>
              {lang === "en" ? "Choose a plan →" : "Choisir un plan →"}
            </a>
          </div>
        )}

        {/* Expired paywall banner */}
        {planStatus === "expired" && (
          <div style={{ background: "#1a0a0a", borderBottom: "1px solid #5a1000", padding: "10px 24px", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444", flexShrink: 0 }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#fca5a5" }}>
              {lang === "en"
                ? "Your trial has ended. Document sharing is disabled."
                : "Votre essai est terminé. Le partage de documents est désactivé."
              }
            </span>
            <a href="/pricing" style={{ marginLeft: "auto", fontFamily: FONT_SANS, fontSize: 11, fontWeight: 700, color: "#FFFFFF", textDecoration: "none", padding: "6px 16px", background: "#ef4444", border: "none" }}>
              {lang === "en" ? "Upgrade →" : "Passer au plan payant →"}
            </a>
          </div>
        )}

        {/* Pending close banner */}
        {roomStatus === "pending_close" && (
          <div style={{
            background: "#1c1000", borderBottom: "1px solid #5a4000",
            padding: "8px 24px",
            display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", flexShrink: 0 }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#fbbf24" }}>
              {lang === "en"
                ? "One party has validated the deal — waiting for confirmation from the other party."
                : "Une partie a validé le deal — en attente de confirmation de l\u2019autre partie."
              }
            </span>
            <button
              onClick={() => setTab("closing")}
              style={{ marginLeft: "auto", ...btnStyle(true), padding: "4px 14px", fontSize: 11, borderColor: "#5a4000", color: "#f59e0b" }}
            >
              {lang === "en" ? "View →" : "Voir →"}
            </button>
          </div>
        )}

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <Sidebar tab={tab} setTab={setTab} />

          <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
            {tab === "chat" && (
              <ChatSection
                messages={messages}
                userId={userId}
                displayName={displayName}
                onSend={sendMessage}
                canShare={planStatus !== "expired"}
              />
            )}
            {tab === "deck" && (
              <DeckSection
                opportunity={opportunity}
                deck={deck}
                messages={messages}
                roomStatus={roomStatus}
              />
            )}
            {tab === "vision" && (
              <VisionSection roomId={roomId} />
            )}
            {tab === "rdv" && (
              <RdvSection messages={messages} onSend={sendMessage} />
            )}
            {tab === "closing" && (
              <ClosingSection
                roomId={roomId}
                roomStatus={roomStatus}
                validations={validations}
                userId={userId}
                onStatusChange={setRoomStatus}
                onValidationsChange={setValidations}
              />
            )}
            {tab === "info" && (
              <InfoSection
                roomRef={roomRef}
                ndaSigned={ndaSigned}
                roomStatus={roomStatus}
                opportunity={opportunity}
              />
            )}
          </div>
        </div>
      </div>
    </BlackScreenGuard>
  )
}
