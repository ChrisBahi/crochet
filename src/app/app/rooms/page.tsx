import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { requireUser } from "@/lib/auth/require-user"
import { createDemoRoom } from "./actions"

export default async function RoomsPage() {
  await requireUser()
  const supabase = await createClient()

  const { data: rooms } = await supabase
    .from("rooms")
    .select("id, created_at, match_id, opportunity_id, status")
    .order("created_at", { ascending: false })

  const statusLabel: Record<string, string> = {
    active: "En négociation",
    pending_close: "En attente de clôture",
    closed_deal: "Deal conclu",
    closed_no_deal: "Archivée",
  }
  const statusColor: Record<string, string> = {
    active: "#22c55e",
    pending_close: "#f59e0b",
    closed_deal: "#3b82f6",
    closed_no_deal: "#7A746E",
  }

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "48px 52px" }}>

      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 12,
        }}>
          Secure Rooms
        </div>
        <h1 style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontStyle: "italic",
          fontSize: 32,
          fontWeight: 700,
          color: "#0A0A0A",
          margin: "0 0 8px",
          lineHeight: 1.2,
        }}>
          Espaces de négociation.
        </h1>
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 13,
          color: "#7A746E",
          margin: 0,
          lineHeight: 1.7,
        }}>
          Chaque Room est une zone sécurisée NDA. Elle reste ouverte jusqu&apos;au closing.
        </p>
      </div>

      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 32 }} />

      {/* Security notice */}
      <div style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "12px 16px",
        background: "#0A0A0A",
        marginBottom: 32,
      }}>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 9,
          color: "#555",
          letterSpacing: "0.1em",
          flexShrink: 0,
          paddingTop: 1,
        }}>
          ZONE SÉCURISÉE
        </span>
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          color: "#888",
          margin: 0,
          lineHeight: 1.7,
        }}>
          Les échanges dans les Secure Rooms sont couverts par un Accord de Confidentialité (NDA-CROCHET-V1). Droit français — Juridiction Paris.
        </p>
      </div>

      {/* Rooms list */}
      {(rooms ?? []).length === 0 ? (
        <div style={{
          border: "1px solid #E0DAD0",
          padding: "48px 32px",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 16 }}>🔒</div>
          <p style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            color: "#7A746E",
            fontStyle: "italic",
            margin: "0 0 16px",
            lineHeight: 1.7,
          }}>
            Aucune Secure Room active. Les rooms sont créées automatiquement lors d&apos;une demande d&apos;intro.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/app/matches" style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11,
              color: "#0A0A0A",
              textDecoration: "none",
              border: "1px solid #E0DAD0",
              padding: "8px 18px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              Voir mes matches →
            </Link>
            <form action={createDemoRoom}>
              <button type="submit" style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11,
                color: "#FFFFFF",
                background: "#0A0A0A",
                border: "none",
                padding: "8px 18px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}>
                Ouvrir une room démo →
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {rooms!.map(r => {
            const ref = `ROOM-${r.id.slice(0, 8).toUpperCase()}`
            const status = (r.status as string) ?? "active"

            return (
              <Link
                key={r.id}
                href={`/app/rooms/${r.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  border: "1px solid #E0DAD0",
                  background: "#FFFFFF",
                  textDecoration: "none",
                  transition: "border-color 0.1s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  {/* Lock icon */}
                  <div style={{
                    width: 40,
                    height: 40,
                    background: "#F5F0E8",
                    border: "1px solid #E0DAD0",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    flexShrink: 0,
                  }}>
                    🔒
                  </div>

                  <div>
                    <div style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#0A0A0A",
                      marginBottom: 4,
                      letterSpacing: "0.02em",
                    }}>
                      {ref}
                    </div>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 11,
                      color: "#7A746E",
                      letterSpacing: "0.04em",
                    }}>
                      Créée le {new Date(r.created_at).toLocaleDateString("fr-FR", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  {/* Status */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor[status] ?? "#7A746E", flexShrink: 0 }} />
                    <span style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 10,
                      color: "#7A746E",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}>
                      {statusLabel[status] ?? status}
                    </span>
                  </div>

                  <span style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 11,
                    color: "#7A746E",
                    letterSpacing: "0.04em",
                  }}>
                    Entrer →
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
