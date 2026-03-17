"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

type Notification = {
  id: string
  type: string
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}

const TYPE_ICON: Record<string, string> = {
  new_match:          "⚡",
  intro_requested:    "🔒",
  qualification_done: "✓",
  new_message:        "💬",
  meeting_proposed:   "📅",
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return "À l'instant"
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
}

export function NotificationBell({ userId }: { userId: string }) {
  const supabase = useMemo(() => createClient(), [])
  const [notifs, setNotifs] = useState<Notification[]>([])
  const [open, setOpen]     = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Initial load + realtime
  useEffect(() => {
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30)
      .then(({ data }) => setNotifs(data ?? []))

    const channel = supabase
      .channel(`notifs-${userId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${userId}`,
      }, payload => {
        setNotifs(prev => [payload.new as Notification, ...prev])
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId, supabase])

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const unread = notifs.filter(n => !n.read_at).length

  async function markRead(id: string) {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n))
  }

  async function markAllRead() {
    await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("user_id", userId)
      .is("read_at", null)
    const now = new Date().toISOString()
    setNotifs(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? now })))
  }

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: "relative",
          width: 36, height: 36,
          display: "flex", alignItems: "center", justifyContent: "center",
          background: open ? "#F5F0E8" : "transparent",
          border: "1px solid #E0DAD0",
          cursor: "pointer",
          fontSize: 15,
          transition: "background 0.1s",
        }}
      >
        🔔
        {unread > 0 && (
          <span style={{
            position: "absolute", top: -5, right: -5,
            minWidth: 17, height: 17,
            background: "#0A0A0A", color: "#FFFFFF",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "0 3px",
          }}>
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute",
          top: "calc(100% + 8px)",
          right: 0,
          width: 360,
          background: "#FFFFFF",
          border: "1px solid #0A0A0A",
          boxShadow: "4px 4px 0 #0A0A0A",
          zIndex: 200,
        }}>
          {/* Header */}
          <div style={{
            padding: "11px 16px",
            borderBottom: "1px solid #E0DAD0",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            background: "#FDFAF6",
          }}>
            <span style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#0A0A0A",
            }}>
              Notifications {unread > 0 && `· ${unread}`}
            </span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 10, color: "#7A746E",
                  background: "none", border: "none",
                  cursor: "pointer", letterSpacing: "0.04em",
                  textDecoration: "underline",
                }}
              >
                Tout lire
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 420, overflowY: "auto" }}>
            {notifs.length === 0 ? (
              <div style={{
                padding: "40px 20px", textAlign: "center",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12, color: "#7A746E", fontStyle: "italic",
              }}>
                Aucune notification.
              </div>
            ) : (
              notifs.map(n => {
                const isUnread = !n.read_at
                const inner = (
                  <div
                    onClick={() => markRead(n.id)}
                    style={{
                      padding: "13px 16px",
                      borderBottom: "1px solid #F0EAE0",
                      background: isUnread ? "#FDFAF6" : "#FFFFFF",
                      borderLeft: `3px solid ${isUnread ? "#0A0A0A" : "transparent"}`,
                      display: "flex", gap: 12, alignItems: "flex-start",
                      cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                  >
                    <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>
                      {TYPE_ICON[n.type] ?? "📌"}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 12, fontWeight: isUnread ? 600 : 400,
                        color: "#0A0A0A", marginBottom: 3,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                      }}>
                        {n.title}
                      </div>
                      {n.body && (
                        <div style={{
                          fontFamily: "var(--font-dm-sans), sans-serif",
                          fontSize: 11, color: "#7A746E", lineHeight: 1.5,
                        }}>
                          {n.body}
                        </div>
                      )}
                      <div style={{
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: 9, color: "#7A746E",
                        marginTop: 5, letterSpacing: "0.06em",
                      }}>
                        {timeAgo(n.created_at)}
                      </div>
                    </div>
                    {isUnread && (
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: "#0A0A0A", flexShrink: 0, marginTop: 5,
                      }} />
                    )}
                  </div>
                )
                return n.link
                  ? <Link key={n.id} href={n.link} style={{ textDecoration: "none" }}>{inner}</Link>
                  : <div key={n.id}>{inner}</div>
              })
            )}
          </div>

          {/* Footer */}
          {notifs.length > 0 && (
            <div style={{
              padding: "10px 16px",
              borderTop: "1px solid #E0DAD0",
              textAlign: "center",
            }}>
              <span style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 9, color: "#7A746E", letterSpacing: "0.08em",
              }}>
                {notifs.length} notification{notifs.length > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
