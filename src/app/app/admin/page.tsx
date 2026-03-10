import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { AdmissionActions } from "./admission-actions";
import { KycActions } from "./kyc-actions";
import { runAiAnalysis } from "./actions";

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Refusé",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#7A746E",
  approved: "#2D6A4F",
  rejected: "#C0392B",
};

function StatusBadge({ status }: { status: string }) {
  return (
    <span style={{
      fontFamily: "var(--font-dm-sans), sans-serif",
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
      color: STATUS_COLORS[status] ?? "#7A746E",
    }}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; view?: string }>;
}) {
  await requireAdmin();
  const { status: filterStatus, view } = await searchParams;
  const isMembersView = view === "members";

  const admin = createAdminClient();

  const [
    { data: allRequests },
    { count: pendingCount },
    { count: approvedCount },
    { count: rejectedCount },
    { count: membersCount },
    { count: matchesCount },
    { count: activeRoomsCount },
    { count: activeOppsCount },
  ] = await Promise.all([
    filterStatus
      ? admin
          .from("admission_requests")
          .select("*")
          .eq("status", filterStatus)
          .order("created_at", { ascending: false })
      : admin
          .from("admission_requests")
          .select("*")
          .order("created_at", { ascending: false }),
    admin
      .from("admission_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    admin
      .from("admission_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "approved"),
    admin
      .from("admission_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "rejected"),
    admin
      .from("workspace_members")
      .select("id", { count: "exact", head: true }),
    admin
      .from("opportunity_matches")
      .select("id", { count: "exact", head: true }),
    admin
      .from("rooms")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "negotiating"]),
    admin
      .from("opportunities")
      .select("id", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  const requests = allRequests ?? [];
  const totalCount = (pendingCount ?? 0) + (approvedCount ?? 0) + (rejectedCount ?? 0);

  // Membres (vue KYC)
  let members: {
    user_id: string;
    name: string | null;
    firm: string | null;
    role: string | null;
    verification_status: string | null;
    email: string | null;
  }[] = [];
  if (isMembersView) {
    const { data: memberProfiles } = await admin
      .from("investor_profiles")
      .select("user_id, name, firm, role, verification_status, email")
      .order("name", { ascending: true });
    members = memberProfiles ?? [];
  }

  // Auto-analyse IA des candidatures sans note
  const unanalyzed = requests
    .filter((r: { ai_score: number | null }) => r.ai_score === null || r.ai_score === undefined)
    .map((r: { id: string }) => r.id);
  if (unanalyzed.length > 0) {
    await runAiAnalysis(unanalyzed);
    // Re-fetch après analyse (avec le même filtre de statut)
    const query = admin
      .from("admission_requests")
      .select("*")
      .order("created_at", { ascending: false });
    const { data: refreshed } = filterStatus
      ? await query.eq("status", filterStatus)
      : await query;
    if (refreshed) requests.splice(0, requests.length, ...refreshed);
  }

  const tabs = [
    { label: "Tout", value: undefined, count: totalCount },
    { label: "En attente", value: "pending", count: pendingCount ?? 0 },
    { label: "Approuvés", value: "approved", count: approvedCount ?? 0 },
    { label: "Refusés", value: "rejected", count: rejectedCount ?? 0 },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 52px" }}>

      {/* Header */}
      <div style={{ marginBottom: 40 }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 10,
        }}>
          Administration · CROCHET
        </div>
        <h1 style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontStyle: "italic",
          fontSize: 34,
          fontWeight: 700,
          color: "#0A0A0A",
          margin: "0 0 6px",
          lineHeight: 1.15,
        }}>
          Candidatures.
        </h1>
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 13,
          color: "#7A746E",
          margin: 0,
        }}>
          Examinez et validez les demandes d&apos;admission au réseau.
        </p>
      </div>

      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 32 }} />

      {/* Stats globales */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 40 }}>
        {[
          { label: "Membres actifs", value: membersCount ?? 0 },
          { label: "Opportunités actives", value: activeOppsCount ?? 0 },
          { label: "Matches créés", value: matchesCount ?? 0 },
          { label: "Rooms en cours", value: activeRoomsCount ?? 0 },
        ].map(({ label, value }) => (
          <div key={label} style={{
            border: "1px solid #E0DAD0",
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}>
            <div style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 28,
              fontWeight: 700,
              color: "#0A0A0A",
              lineHeight: 1,
            }}>
              {value}
            </div>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#7A746E",
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Vue switcher */}
      <div style={{ display: "flex", gap: 0, marginBottom: 0, borderBottom: "1px solid #E0DAD0" }}>
        {[
          { label: "Candidatures", href: "/app/admin", active: !isMembersView },
          { label: "Membres", href: "/app/admin?view=members", active: isMembersView },
        ].map(({ label, href, active }) => (
          <Link
            key={label}
            href={href}
            style={{
              padding: "10px 20px",
              textDecoration: "none",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              fontWeight: active ? 600 : 400,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: active ? "#0A0A0A" : "#7A746E",
              borderBottom: active ? "2px solid #0A0A0A" : "2px solid transparent",
              marginBottom: "-1px",
            }}
          >
            {label}
          </Link>
        ))}
      </div>

      {isMembersView ? (
        /* ——— Vue Membres (KYC) ——— */
        <div style={{ marginTop: 32 }}>
          {members.length === 0 ? (
            <div style={{
              padding: "64px 0",
              textAlign: "center",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 13,
              color: "#7A746E",
              fontStyle: "italic",
            }}>
              Aucun membre inscrit.
            </div>
          ) : (
            <div>
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 2fr",
                gap: 16,
                padding: "8px 0 12px",
                borderBottom: "1px solid #E0DAD0",
              }}>
                {["Membre", "Rôle", "Société", "Vérification KYC"].map((h) => (
                  <div key={h} style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 10,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    color: "#7A746E",
                  }}>
                    {h}
                  </div>
                ))}
              </div>
              {members.map((m) => (
                <div key={m.user_id} style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr 2fr",
                  gap: 16,
                  padding: "16px 0",
                  borderBottom: "1px solid #E0DAD0",
                  alignItems: "center",
                }}>
                  <div>
                    <div style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#0A0A0A",
                      marginBottom: 2,
                    }}>
                      {m.name ?? "—"}
                    </div>
                    {m.email && (
                      <div style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 12,
                        color: "#7A746E",
                      }}>
                        {m.email}
                      </div>
                    )}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 13,
                    color: "#0A0A0A",
                  }}>
                    {m.role ?? "—"}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 13,
                    color: "#0A0A0A",
                  }}>
                    {m.firm ?? "—"}
                  </div>
                  <KycActions
                    userId={m.user_id}
                    current={(m.verification_status ?? "unverified") as "unverified" | "pending" | "verified"}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Tabs candidatures */}
          <div style={{ display: "flex", gap: 0, marginTop: 32, marginBottom: 32, borderBottom: "1px solid #E0DAD0" }}>
            {tabs.map((tab) => {
              const isActive = filterStatus === tab.value || (!filterStatus && tab.value === undefined);
              return (
                <Link
                  key={String(tab.value)}
                  href={tab.value ? `/app/admin?status=${tab.value}` : "/app/admin"}
                  style={{
                    padding: "10px 20px",
                    textDecoration: "none",
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 12,
                    fontWeight: isActive ? 600 : 400,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: isActive ? "#0A0A0A" : "#7A746E",
                    borderBottom: isActive ? "2px solid #0A0A0A" : "2px solid transparent",
                    marginBottom: "-1px",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {tab.label}
                  <span style={{
                    fontFamily: "var(--font-jetbrains), monospace",
                    fontSize: 11,
                    background: isActive ? "#0A0A0A" : "#E0DAD0",
                    color: isActive ? "#FFFFFF" : "#7A746E",
                    padding: "1px 6px",
                    borderRadius: 2,
                    minWidth: 20,
                    textAlign: "center",
                  }}>
                    {tab.count}
                  </span>
                </Link>
              );
            })}
          </div>

      {/* List */}
      {requests.length === 0 ? (
        <div style={{
          padding: "64px 0",
          textAlign: "center",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 13,
          color: "#7A746E",
          fontStyle: "italic",
        }}>
          Aucune candidature dans cette catégorie.
        </div>
      ) : (
        <div>
          {/* Table header */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
            gap: 16,
            padding: "8px 0 12px",
            borderBottom: "1px solid #E0DAD0",
            marginBottom: 0,
          }}>
            {["Candidat", "Rôle", "Ticket", "Statut", "Date"].map((h) => (
              <div key={h} style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#7A746E",
              }}>
                {h}
              </div>
            ))}
          </div>

          {requests.map((req: {
            id: string;
            name: string;
            email: string;
            role: string;
            ticket: string | null;
            city: string | null;
            linkedin: string | null;
            siret: string | null;
            message: string | null;
            status: string;
            created_at: string;
            ai_score: number | null;
            ai_note: string | null;
          }) => (
            <div key={req.id} style={{ borderBottom: "1px solid #E0DAD0" }}>
              {/* Main row */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                gap: 16,
                padding: "20px 0 12px",
                alignItems: "start",
              }}>
                {/* Name + email */}
                <div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 14,
                    fontWeight: 500,
                    color: "#0A0A0A",
                    marginBottom: 2,
                  }}>
                    {req.name}
                  </div>
                  <div style={{
                    fontFamily: "var(--font-dm-sans), sans-serif",
                    fontSize: 12,
                    color: "#7A746E",
                  }}>
                    {req.email}
                  </div>
                  {req.city && (
                    <div style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 11,
                      color: "#7A746E",
                      marginTop: 2,
                    }}>
                      {req.city}
                    </div>
                  )}
                </div>

                {/* Role */}
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 13,
                  color: "#0A0A0A",
                  paddingTop: 2,
                }}>
                  {req.role}
                </div>

                {/* Ticket */}
                <div style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 12,
                  color: "#0A0A0A",
                  paddingTop: 2,
                }}>
                  {req.ticket ?? "—"}
                </div>

                {/* Status */}
                <div style={{ paddingTop: 2 }}>
                  <StatusBadge status={req.status} />
                </div>

                {/* Date */}
                <div style={{
                  fontFamily: "var(--font-dm-sans), sans-serif",
                  fontSize: 12,
                  color: "#7A746E",
                  paddingTop: 2,
                }}>
                  {formatDate(req.created_at)}
                </div>
              </div>

              {/* Details row */}
              <div style={{ paddingBottom: 16, display: "flex", flexWrap: "wrap", gap: 24, alignItems: "flex-start" }}>
                {/* Links + SIRET */}
                <div style={{ display: "flex", gap: 16, flexWrap: "wrap", flex: 1 }}>
                  {req.linkedin && (
                    <a
                      href={req.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "var(--font-dm-sans), sans-serif",
                        fontSize: 11,
                        color: "#7A746E",
                        textDecoration: "underline",
                        letterSpacing: "0.04em",
                      }}
                    >
                      LinkedIn ↗
                    </a>
                  )}
                  {req.siret && (
                    <span style={{
                      fontFamily: "var(--font-jetbrains), monospace",
                      fontSize: 11,
                      color: "#7A746E",
                    }}>
                      Siren {req.siret}
                    </span>
                  )}
                  {req.message && (
                    <span style={{
                      fontFamily: "var(--font-dm-sans), sans-serif",
                      fontSize: 12,
                      color: "#7A746E",
                      fontStyle: "italic",
                      maxWidth: 500,
                      lineHeight: 1.5,
                    }}>
                      &ldquo;{req.message}&rdquo;
                    </span>
                  )}
                </div>

                {/* Score IA + Actions */}
                <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  {req.ai_score !== null && req.ai_score !== undefined && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          fontFamily: "var(--font-dm-sans), sans-serif",
                          fontSize: 10,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#7A746E",
                        }}>
                          Score IA
                        </span>
                        <span style={{
                          fontFamily: "var(--font-jetbrains), monospace",
                          fontSize: 13,
                          fontWeight: 700,
                          color: req.ai_score >= 70 ? "#2D6A4F" : req.ai_score >= 40 ? "#B7791F" : "#C0392B",
                        }}>
                          {req.ai_score}/100
                        </span>
                      </div>
                      {req.ai_note && (
                        <p style={{
                          fontFamily: "var(--font-dm-sans), sans-serif",
                          fontSize: 11,
                          color: "#7A746E",
                          fontStyle: "italic",
                          maxWidth: 280,
                          textAlign: "right",
                          lineHeight: 1.5,
                          margin: 0,
                        }}>
                          {req.ai_note}
                        </p>
                      )}
                    </div>
                  )}
                  <AdmissionActions
                    id={req.id}
                    email={req.email}
                    name={req.name}
                    status={req.status}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}
