"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"

// ─── Types ──────────────────────────────────────────────────────────────────

type Tab = "chat" | "deck" | "vision" | "rdv" | "info"

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
  if (m.content.startsWith("__SYSTEM__:")) {
    return { ...m, kind: "system" }
  }
  if (m.content.startsWith("__DOC__|")) {
    const parts = m.content.split("|")
    return { ...m, kind: "doc", docUrl: parts[1], docTitle: parts[2] ?? parts[1] }
  }
  if (m.content.startsWith("__MEETING__|")) {
    const parts = m.content.split("|")
    return {
      ...m, kind: "meeting",
      meeting: {
        datetime: parts[1],
        format: parts[2],
        duration: parseInt(parts[3] ?? "60"),
        status: parts[4] ?? "pending",
      },
    }
  }
  return { ...m, kind: "text" }
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
}

function formatDateFr(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
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

// ─── Header ─────────────────────────────────────────────────────────────────

function RoomHeader({
  roomRef, status, ndaSigned, opportunityTitle,
}: {
  roomRef: string; status: string; ndaSigned: boolean; opportunityTitle?: string
}) {
  const statusLabel: Record<string, string> = {
    active: "Actif",
    negotiating: "En négociation",
    closing: "Closing",
    closed: "Clôturé",
  }
  const statusColor: Record<string, string> = {
    active: "#22c55e",
    negotiating: "#f59e0b",
    closing: "#3b82f6",
    closed: "#7A746E",
  }

  return (
    <div style={{
      background: C.bgDark,
      borderBottom: "1px solid #1A1A1A",
      padding: "0 24px",
      height: 52,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexShrink: 0,
    }}>
      {/* Left */}
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <span style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
          crochet.
        </span>
        <div style={{ width: 1, height: 16, background: "#2A2A2A" }} />
        <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#555", letterSpacing: "0.08em" }}>
          {roomRef}
        </span>
        {opportunityTitle && (
          <>
            <div style={{ width: 1, height: 16, background: "#2A2A2A" }} />
            <span style={{ fontFamily: FONT_SANS, fontSize: 12, color: "#888", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {opportunityTitle}
            </span>
          </>
        )}
      </div>

      {/* Right */}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        {/* NDA */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "3px 10px",
          border: `1px solid ${ndaSigned ? "#16a34a" : "#5a4000"}`,
          background: ndaSigned ? "#052e16" : "#1c1000",
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: ndaSigned ? "#22c55e" : "#f59e0b", flexShrink: 0 }} />
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: ndaSigned ? "#22c55e" : "#f59e0b", letterSpacing: "0.1em" }}>
            NDA {ndaSigned ? "SIGNÉ" : "REQUIS"}
          </span>
        </div>

        {/* Status */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[status] ?? "#7A746E" }} />
          <span style={{ fontFamily: FONT_SANS, fontSize: 10, color: "#888", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {statusLabel[status] ?? status}
          </span>
        </div>

        {/* Secure badge */}
        <div style={{
          padding: "3px 10px",
          border: "1px solid #1A1A1A",
          background: "#111",
        }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#444", letterSpacing: "0.1em" }}>
            ZONE SÉCURISÉE
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "chat",   icon: "💬", label: "Chat" },
  { id: "deck",   icon: "📊", label: "Dossier" },
  { id: "vision", icon: "🎥", label: "Vision" },
  { id: "rdv",    icon: "📅", label: "Rendez-vous" },
  { id: "info",   icon: "🔒", label: "Sécurité" },
]

function Sidebar({ tab, setTab }: { tab: Tab; setTab: (t: Tab) => void }) {
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
      {TABS.map(t => (
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
          }}
        >
          <span style={{ fontSize: 16 }}>{t.icon}</span>
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
  messages, userId, displayName, onSend,
}: {
  messages: ParsedMessage[]
  userId: string
  displayName: string
  onSend: (content: string, kind?: MsgKind, meta?: Record<string, string>) => Promise<void>
}) {
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
              La room est ouverte. Les échanges sont chiffrés et confidentiels.
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
                      Ouvrir le document →
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
                    📅 Proposition de rendez-vous
                  </div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                    {formatDateFr(mt.datetime)}
                  </div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted }}>
                    {mt.format === "video" ? "🎥 Appel vidéo" : "📞 Appel téléphonique"} · {mt.duration} min
                  </div>
                  <div style={{
                    marginTop: 8,
                    fontFamily: FONT_MONO, fontSize: 9, letterSpacing: "0.08em",
                    color: mt.status === "accepted" ? "#16a34a" : mt.status === "declined" ? "#dc2626" : C.muted,
                  }}>
                    {mt.status === "accepted" ? "✓ CONFIRMÉ" : mt.status === "declined" ? "✗ REFUSÉ" : "EN ATTENTE DE CONFIRMATION"}
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
                {formatTime(m.created_at)}
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
            placeholder="Nom du document"
            style={{ flex: "0 0 180px", padding: "6px 10px", border: `1px solid ${C.border}`, fontFamily: FONT_SANS, fontSize: 12, background: "#FFF", outline: "none" }}
          />
          <input
            value={docUrl}
            onChange={e => setDocUrl(e.target.value)}
            placeholder="URL du document (Drive, Notion, PDF…)"
            style={{ flex: 1, minWidth: 200, padding: "6px 10px", border: `1px solid ${C.border}`, fontFamily: FONT_SANS, fontSize: 12, background: "#FFF", outline: "none" }}
          />
          <button onClick={handleDocShare} disabled={!docUrl.trim()} style={btnStyle(false)}>Partager</button>
          <button onClick={() => setDocMode(false)} style={{ ...btnStyle(true), borderColor: C.border }}>Annuler</button>
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
          title="Partager un document"
          onClick={() => setDocMode(d => !d)}
          style={{ ...btnStyle(true), padding: "8px 10px", flexShrink: 0 }}
        >
          📎
        </button>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() } }}
          placeholder="Message… (Entrée pour envoyer, Shift+Entrée pour nouvelle ligne)"
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
          {sending ? "…" : "Envoyer"}
        </button>
      </div>
    </div>
  )
}

// ─── Deck ─────────────────────────────────────────────────────────────────────

function DeckSection({
  opportunity, messages,
}: {
  opportunity: Record<string, unknown> | null
  messages: ParsedMessage[]
}) {
  const deckUrl = opportunity?.pitch_deck_url as string | null
  const websiteUrl = opportunity?.website_url as string | null
  const docMessages = messages.filter(m => m.kind === "doc")

  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 36px" }}>
      <SectionHeader label="Dossier & Documents" />

      {/* Opportunity snapshot */}
      {opportunity && (
        <div style={{ marginBottom: 32 }}>
          <Label>Opportunité référencée</Label>
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

      {/* Pitch deck embed */}
      {deckUrl && (
        <div style={{ marginBottom: 32 }}>
          <Label>Pitch Deck</Label>
          <div style={{ marginTop: 8, border: `1px solid ${C.border}`, background: C.bgSubtle }}>
            <div style={{
              padding: "10px 16px", borderBottom: `1px solid ${C.border}`,
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: C.muted, letterSpacing: "0.08em" }}>DECK PARTAGÉ</span>
              <a href={deckUrl} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: FONT_SANS, fontSize: 10, color: C.text, textDecoration: "none",
                border: `1px solid ${C.border}`, padding: "3px 10px",
              }}>
                Ouvrir →
              </a>
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
          <Label>Site web</Label>
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
          <Label>Documents partagés dans la Room</Label>
          <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            {docMessages.map(m => (
              <a
                key={m.id}
                href={m.docUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "12px 16px", border: `1px solid ${C.border}`, background: C.bgSubtle,
                  textDecoration: "none", display: "flex", alignItems: "center", gap: 12,
                }}
              >
                <span style={{ fontSize: 18 }}>📎</span>
                <div>
                  <div style={{ fontFamily: FONT_SANS, fontSize: 13, fontWeight: 600, color: C.text }}>{m.docTitle}</div>
                  <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, marginTop: 2 }}>{formatTime(m.created_at)}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {!deckUrl && !websiteUrl && docMessages.length === 0 && !opportunity && (
        <EmptyState icon="📊" text="Aucun document partagé. Partagez des liens via le chat (bouton 📎)." />
      )}
    </div>
  )
}

// ─── Vision ───────────────────────────────────────────────────────────────────

function VisionSection({ roomId }: { roomId: string }) {
  const jitsiRoom = `crochet-${roomId.slice(0, 8)}`
  const jitsiUrl = `https://meet.jit.si/${jitsiRoom}`
  const [embedded, setEmbedded] = useState(false)

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {!embedded ? (
        <div style={{ padding: "32px 36px", overflowY: "auto" }}>
          <SectionHeader label="Appel Vision" />

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
                Appel sécurisé
              </h2>
              <p style={{ fontFamily: FONT_SANS, fontSize: 13, color: C.muted, lineHeight: 1.7, margin: 0, maxWidth: 400 }}>
                L&apos;appel vidéo est chiffré de bout en bout. Seuls les membres de cette Secure Room y ont accès via le code ci-dessous.
              </p>
            </div>

            <div style={{
              padding: "14px 24px",
              background: C.bgSubtle,
              border: `1px solid ${C.border}`,
            }}>
              <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted, letterSpacing: "0.1em", marginBottom: 6 }}>CODE D&apos;ACCÈS</div>
              <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 700, color: C.text, letterSpacing: "0.04em" }}>
                {jitsiRoom}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button
                onClick={() => setEmbedded(true)}
                style={{ ...btnStyle(false), padding: "12px 32px", fontSize: 13 }}
              >
                🎥 Démarrer l&apos;appel
              </button>
              <a
                href={jitsiUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ...btnStyle(true), padding: "12px 24px", fontSize: 12, textDecoration: "none" }}
              >
                Ouvrir dans un onglet →
              </a>
            </div>
          </div>

          {/* Instructions */}
          <div style={{ border: `1px solid ${C.border}`, padding: "20px 24px" }}>
            <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
              Instructions
            </div>
            {[
              "Cliquez « Démarrer l'appel » pour rejoindre la salle vidéo.",
              "Partagez le code d'accès avec les autres participants de cette Room.",
              "L'appel reste actif jusqu'à la fermeture de la Room.",
              "Vous pouvez partager votre écran pour présenter le deck.",
              "La session n'est pas enregistrée automatiquement.",
            ].map((step, i) => (
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
              APPEL EN COURS · {jitsiRoom}
            </span>
            <button onClick={() => setEmbedded(false)} style={{ ...btnStyle(true), padding: "4px 12px", fontSize: 11 }}>
              Réduire
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
      <SectionHeader label="Rendez-vous" />

      {/* Proposer */}
      <div style={{ border: `1px solid ${C.border}`, padding: "24px", marginBottom: 32 }}>
        <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted, marginBottom: 20, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
          Proposer un créneau
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
          <div>
            <Label>Date</Label>
            <input type="date" value={date} min={minDate} onChange={e => setDate(e.target.value)}
              style={fieldStyle} />
          </div>
          <div>
            <Label>Heure</Label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)}
              style={fieldStyle} />
          </div>
          <div>
            <Label>Format</Label>
            <select value={format} onChange={e => setFormat(e.target.value as "video" | "phone")}
              style={fieldStyle}>
              <option value="video">🎥 Vidéo</option>
              <option value="phone">📞 Téléphone</option>
            </select>
          </div>
          <div>
            <Label>Durée (min)</Label>
            <select value={duration} onChange={e => setDuration(Number(e.target.value))}
              style={fieldStyle}>
              <option value={30}>30 min</option>
              <option value={60}>1 heure</option>
              <option value={90}>1h30</option>
              <option value={120}>2 heures</option>
            </select>
          </div>
        </div>

        <button
          onClick={proposeRdv}
          disabled={!date || !time || sending}
          style={btnStyle(false)}
        >
          {sending ? "Envoi…" : "Proposer ce créneau"}
        </button>
      </div>

      {/* Liste des RDV proposés */}
      <div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
          Propositions ({meetingMessages.length})
        </div>
        {meetingMessages.length === 0 ? (
          <EmptyState icon="📅" text="Aucun rendez-vous proposé. La room reste ouverte jusqu'au closing." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {meetingMessages.map(m => {
              const mt = m.meeting!
              const statusColor = { accepted: "#22c55e", declined: "#dc2626", pending: C.muted }
              const statusLabel = { accepted: "Confirmé", declined: "Refusé", pending: "En attente" }
              return (
                <div key={m.id} style={{
                  border: `1px solid ${mt.status === "accepted" ? "#bbf7d0" : C.border}`,
                  padding: "18px 22px",
                  background: mt.status === "accepted" ? "#f0fdf4" : C.bg,
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <div>
                    <div style={{ fontFamily: FONT_SANS, fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                      {formatDateFr(mt.datetime)}
                    </div>
                    <div style={{ fontFamily: FONT_MONO, fontSize: 10, color: C.muted }}>
                      {mt.format === "video" ? "🎥 Vidéo" : "📞 Téléphone"} · {mt.duration} min
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

// ─── Info / Sécurité ──────────────────────────────────────────────────────────

function InfoSection({
  roomRef, ndaSigned, roomStatus, opportunity,
}: {
  roomRef: string; ndaSigned: boolean; roomStatus: string; opportunity: Record<string, unknown> | null
}) {
  return (
    <div style={{ height: "100%", overflowY: "auto", padding: "32px 36px" }}>
      <SectionHeader label="Sécurité & Confidentialité" />

      {/* Security status */}
      <div style={{ border: `1px solid ${C.border}`, marginBottom: 24 }}>
        <div style={{ padding: "12px 18px", background: "#0A0A0A", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontFamily: FONT_MONO, fontSize: 10, color: "#555", letterSpacing: "0.1em" }}>ZONE SÉCURISÉE CROCHET</span>
          <span style={{ fontFamily: FONT_MONO, fontSize: 9, color: "#22c55e", letterSpacing: "0.08em" }}>CHIFFRÉ</span>
        </div>
        <div style={{ padding: "20px 18px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            { label: "Référence Room", value: roomRef },
            { label: "Statut", value: roomStatus === "active" ? "Actif" : roomStatus },
            { label: "NDA", value: ndaSigned ? "Signé" : "Non signé" },
            { label: "Protocole", value: "NDA-CROCHET-V1" },
            { label: "Juridiction", value: "Droit français — Paris" },
            { label: "Durée confidentialité", value: "2 ans post-closing" },
          ].map(({ label, value }) => (
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
            {ndaSigned ? "Accord de Confidentialité signé" : "NDA en attente de signature"}
          </span>
        </div>
        {!ndaSigned && (
          <p style={{ fontFamily: FONT_SANS, fontSize: 12, color: C.muted, margin: 0, lineHeight: 1.7 }}>
            L&apos;accès aux documents confidentiels nécessite la signature du NDA. Rendez-vous sur la page du dossier pour générer et signer l&apos;accord.
          </p>
        )}
      </div>

      {/* Règles */}
      <div>
        <div style={{ fontFamily: FONT_SANS, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: C.muted, marginBottom: 16, paddingBottom: 10, borderBottom: `1px solid ${C.border}` }}>
          Règles de la Secure Room
        </div>
        {[
          "Toutes les communications échangées dans cette Room sont couvertes par le NDA.",
          "Les documents partagés restent la propriété exclusive de la Partie Divulgatrice.",
          "La reproduction ou transmission à des tiers est strictement interdite.",
          "Toute violation engage la responsabilité pénale et civile des contrevenants.",
          "La Room reste ouverte jusqu'au closing ou résiliation mutuelle.",
          "CROCHET n'est pas partie aux négociations — rôle d'intermédiaire uniquement.",
        ].map((rule, i) => (
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
  roomId, roomRef, roomStatus, opportunity, deck,
  ndaSigned, initialMessages, userId, displayName,
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
}) {
  const supabase = useMemo(() => createClient(), [])
  const [tab, setTab] = useState<Tab>("chat")
  const [rawMessages, setRawMessages] = useState<RawMessage[]>(initialMessages)

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`secure-room-${roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_id=eq.${roomId}`,
      }, payload => {
        const msg = payload.new as RawMessage
        setRawMessages(prev => prev.some(m => m.id === msg.id) ? prev : [...prev, msg])
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [roomId, supabase])

  const messages = useMemo(() => rawMessages.map(parseMessage), [rawMessages])

  async function sendMessage(content: string) {
    const { error } = await supabase.from("messages").insert({
      room_id: roomId,
      content,
      sender_id: userId,
      created_by: userId,
    })
    if (error) console.error("[send]", error)
  }

  const opportunityTitle = opportunity?.title as string | undefined

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: C.bg }}>
      <RoomHeader
        roomRef={roomRef}
        status={roomStatus}
        ndaSigned={ndaSigned}
        opportunityTitle={opportunityTitle}
      />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar tab={tab} setTab={setTab} />

        <div style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          {tab === "chat" && (
            <ChatSection
              messages={messages}
              userId={userId}
              displayName={displayName}
              onSend={sendMessage}
            />
          )}
          {tab === "deck" && (
            <DeckSection
              opportunity={opportunity}
              messages={messages}
            />
          )}
          {tab === "vision" && (
            <VisionSection roomId={roomId} />
          )}
          {tab === "rdv" && (
            <RdvSection
              messages={messages}
              onSend={sendMessage}
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
  )
}
