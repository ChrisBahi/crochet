import { requireAdmin } from "@/lib/auth/require-admin";
import { createAdminClient } from "@/lib/supabase/admin";
import { after } from "next/server";
import Link from "next/link";
import { AdmissionActions } from "./admission-actions";
import { KycActions } from "./kyc-actions";
import { runAiAnalysis } from "./actions";
import { MatchEngineButton } from "./match-engine-button";
import { SeedButton } from "./seed-button";
import { TestEmailPanel } from "./test-email-panel";
import { cookies } from "next/headers";

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, {
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
  const isStatsView = view === "stats";
  const cookieStore = await cookies();
  const lang = (cookieStore.get("crochet_lang")?.value ?? "fr") as "fr" | "en";
  const dateLocale = lang === "en" ? "en-GB" : "fr-FR";

  const t = {
    breadcrumb:     "Administration · CROCHET",
    heading:        lang === "en" ? "Applications." : "Candidatures.",
    subheading:     lang === "en"
      ? "Review and validate admission requests to the network."
      : "Examinez et validez les demandes d'admission au réseau.",
    activeMembers:  lang === "en" ? "Active members" : "Membres actifs",
    activeOpps:     lang === "en" ? "Active opportunities" : "Opportunités actives",
    matchesCreated: lang === "en" ? "Matches created" : "Matches créés",
    ongoingRooms:   lang === "en" ? "Ongoing rooms" : "Rooms en cours",
    tabApplications: lang === "en" ? "Applications" : "Candidatures",
    tabMembers:     lang === "en" ? "Members" : "Membres",
    tabStats:       lang === "en" ? "Stats" : "Stats",
    filterAll:      lang === "en" ? "All" : "Tout",
    filterPending:  lang === "en" ? "Pending" : "En attente",
    filterApproved: lang === "en" ? "Approved" : "Approuvés",
    filterRejected: lang === "en" ? "Rejected" : "Refusés",
    noApplications: lang === "en" ? "No application in this category." : "Aucune candidature dans cette catégorie.",
    noMembers:      lang === "en" ? "No registered member." : "Aucun membre inscrit.",
    colApplicant:   lang === "en" ? "Applicant" : "Candidat",
    colRole:        lang === "en" ? "Role" : "Rôle",
    colTicket:      "Ticket",
    colStatus:      lang === "en" ? "Status" : "Statut",
    colDate:        lang === "en" ? "Date" : "Date",
    colMember:      lang === "en" ? "Member" : "Membre",
    colCompany:     lang === "en" ? "Company" : "Société",
    colKyc:         lang === "en" ? "KYC Verification" : "Vérification KYC",
    aiScore:        lang === "en" ? "AI Score" : "Score IA",
  };

  const STATUS_LABELS: Record<string, string> = lang === "en"
    ? { pending: "Pending", approved: "Approved", rejected: "Rejected" }
    : { pending: "En attente", approved: "Approuvé", rejected: "Refusé" };

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
    { data: allAdmissionsForStats },
    { data: allSubscriptions },
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
    admin
      .from("admission_requests")
      .select("id, tunnel, source, status, created_at"),
    admin
      .from("subscriptions")
      .select("user_id, plan, status, created_at"),
  ]);

  const requests = allRequests ?? [];
  const totalCount = (pendingCount ?? 0) + (approvedCount ?? 0) + (rejectedCount ?? 0);

  // ── Stats calculations ────────────────────────────────────────
  const admissions = allAdmissionsForStats ?? [];
  const subscriptions = allSubscriptions ?? [];

  // Inscriptions par tunnel
  const tunnelStats = {
    cedant:    admissions.filter((r) => r.tunnel === "cedant").length,
    repreneur: admissions.filter((r) => r.tunnel === "repreneur").length,
    fonds:     admissions.filter((r) => r.tunnel === "fonds").length,
    non_qualifie: admissions.filter((r) => !r.tunnel).length,
  };

  // Sources UTM
  const sourceMap: Record<string, number> = {};
  for (const r of admissions) {
    const src = r.source ?? "direct";
    sourceMap[src] = (sourceMap[src] ?? 0) + 1;
  }
  const sourceStats = Object.entries(sourceMap).sort((a, b) => b[1] - a[1]);

  // Entonnoir par source : { source -> { total, approved, rejected, pending } }
  const sourceFunnel: Record<string, { total: number; approved: number; rejected: number; pending: number }> = {};
  for (const r of admissions) {
    const src = r.source ?? "direct";
    if (!sourceFunnel[src]) sourceFunnel[src] = { total: 0, approved: 0, rejected: 0, pending: 0 };
    sourceFunnel[src].total++;
    if (r.status === "approved") sourceFunnel[src].approved++;
    else if (r.status === "rejected") sourceFunnel[src].rejected++;
    else sourceFunnel[src].pending++;
  }
  const sourceFunnelStats = Object.entries(sourceFunnel).sort((a, b) => b[1].total - a[1].total);

  // Matrice source × tunnel
  const sourceXTunnel: Record<string, { cedant: number; repreneur: number; fonds: number; none: number }> = {};
  for (const r of admissions) {
    const src = r.source ?? "direct";
    if (!sourceXTunnel[src]) sourceXTunnel[src] = { cedant: 0, repreneur: 0, fonds: 0, none: 0 };
    const t = r.tunnel as string | null;
    if (t === "cedant") sourceXTunnel[src].cedant++;
    else if (t === "repreneur") sourceXTunnel[src].repreneur++;
    else if (t === "fonds") sourceXTunnel[src].fonds++;
    else sourceXTunnel[src].none++;
  }
  const sourceXTunnelStats = Object.entries(sourceXTunnel).sort((a, b) => {
    const ta = a[1].cedant + a[1].repreneur + a[1].fonds + a[1].none;
    const tb = b[1].cedant + b[1].repreneur + b[1].fonds + b[1].none;
    return tb - ta;
  });

  // Conversion essai → payant
  const totalSubs = subscriptions.length;
  const paidSubs = subscriptions.filter((s) => s.plan !== "trial" && s.status === "active").length;
  const trialSubs = subscriptions.filter((s) => s.plan === "trial" && s.status === "active").length;
  const conversionRate = totalSubs > 0 ? Math.round((paidSubs / totalSubs) * 100) : 0;

  // Breakdown plans payants
  const planStats = {
    starter: subscriptions.filter((s) => s.plan === "starter").length,
    pro:     subscriptions.filter((s) => s.plan === "pro").length,
    scale:   subscriptions.filter((s) => s.plan === "scale").length,
  };

  // Timeline : inscriptions sur les 7 derniers jours
  const now = new Date();
  const timeline: { date: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString(dateLocale, { day: "2-digit", month: "short" });
    const count = admissions.filter((r) => r.created_at.slice(0, 10) === dayStr).length;
    timeline.push({ date: dayStr, label, count });
  }
  const maxTimelineCount = Math.max(...timeline.map((t) => t.count), 1);

  // Members (KYC view)
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

  // AI auto-analysis — runs AFTER response is sent, without blocking render
  const unanalyzed = requests
    .filter((r: { ai_score: number | null }) => r.ai_score === null || r.ai_score === undefined)
    .map((r: { id: string }) => r.id);
  if (unanalyzed.length > 0) {
    after(async () => {
      await runAiAnalysis(unanalyzed);
    });
  }

  const tabs = [
    { label: t.filterAll, value: undefined, count: totalCount },
    { label: t.filterPending, value: "pending", count: pendingCount ?? 0 },
    { label: t.filterApproved, value: "approved", count: approvedCount ?? 0 },
    { label: t.filterRejected, value: "rejected", count: rejectedCount ?? 0 },
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
          {t.breadcrumb}
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
          {t.heading}
        </h1>
        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 13,
          color: "#7A746E",
          margin: 0,
        }}>
          {t.subheading}
        </p>
      </div>

      <div style={{ borderTop: "2px solid #0A0A0A", marginBottom: 32 }} />

      {/* Global stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 40 }}>
        {[
          { label: t.activeMembers, value: membersCount ?? 0 },
          { label: t.activeOpps, value: activeOppsCount ?? 0 },
          { label: t.matchesCreated, value: matchesCount ?? 0 },
          { label: t.ongoingRooms, value: activeRoomsCount ?? 0 },
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

      {/* Match engine trigger */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32, padding: "16px 20px", border: "1px solid #E0DAD0" }}>
        <div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, fontWeight: 600, color: "#0A0A0A", marginBottom: 4 }}>
            Moteur de matching
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#7A746E" }}>
            Analyse toutes les opportunités actives et génère les matches.
          </div>
        </div>
        <MatchEngineButton />
      </div>

      {/* Seed engine — cold start */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "20px 24px", background: "#F0FDF4", border: "1px solid #86efac", borderRadius: 8, marginBottom: 24, gap: 24, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, fontWeight: 600, color: "#0A0A0A", marginBottom: 4 }}>
            Seed plateforme — cold start
          </div>
          <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#7A746E" }}>
            Injecte 12 dossiers réalistes avant les premiers vrais clients (Sowefund, experts-comptables).
          </div>
        </div>
        <SeedButton />
      </div>

      {/* Test email panel */}
      <TestEmailPanel />

      {/* View switcher */}
      <div style={{ display: "flex", gap: 0, marginBottom: 0, borderBottom: "1px solid #E0DAD0" }}>
        {[
          { label: t.tabApplications, href: "/app/admin", active: !isMembersView && !isStatsView },
          { label: t.tabMembers, href: "/app/admin?view=members", active: isMembersView },
          { label: t.tabStats, href: "/app/admin?view=stats", active: isStatsView },
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

      {isStatsView ? (
        /* ——— Stats view ——— */
        <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 32 }}>

          {/* Row 1 : Tunnels + Sources */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Inscriptions par tunnel */}
            <div style={{ border: "1px solid #E0DAD0", padding: "24px 28px" }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#7A746E",
                marginBottom: 20,
              }}>
                Inscriptions par tunnel
              </div>
              {([
                { key: "cedant",       label: "Cédant",        color: "#2D6A4F" },
                { key: "repreneur",    label: "Repreneur",     color: "#1A4A8A" },
                { key: "fonds",        label: "Fonds / FO",    color: "#7B2C6E" },
                { key: "non_qualifie", label: "Non qualifié",  color: "#C0392B" },
              ] as { key: keyof typeof tunnelStats; label: string; color: string }[]).map(({ key, label, color }) => {
                const val = tunnelStats[key];
                const pct = admissions.length > 0 ? Math.round((val / admissions.length) * 100) : 0;
                return (
                  <div key={key} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#0A0A0A" }}>{label}</span>
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 700, color: "#0A0A0A" }}>
                        {val} <span style={{ fontSize: 10, color: "#7A746E", fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 4, background: "#F0EBE3", borderRadius: 2 }}>
                      <div style={{ height: 4, width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                  </div>
                );
              })}
              <div style={{
                marginTop: 20,
                paddingTop: 16,
                borderTop: "1px solid #E0DAD0",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 11,
                color: "#7A746E",
              }}>
                Total : <strong style={{ color: "#0A0A0A" }}>{admissions.length}</strong> candidatures
              </div>
            </div>

            {/* Sources UTM */}
            <div style={{ border: "1px solid #E0DAD0", padding: "24px 28px" }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#7A746E",
                marginBottom: 20,
              }}>
                Sources d&apos;acquisition
              </div>
              {sourceStats.length === 0 ? (
                <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color: "#7A746E", fontStyle: "italic" }}>
                  Aucune donnée
                </div>
              ) : sourceStats.map(([src, count]) => {
                const pct = admissions.length > 0 ? Math.round((count / admissions.length) * 100) : 0;
                return (
                  <div key={src} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "#0A0A0A" }}>{src}</span>
                      <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 700, color: "#0A0A0A" }}>
                        {count} <span style={{ fontSize: 10, color: "#7A746E", fontWeight: 400 }}>({pct}%)</span>
                      </span>
                    </div>
                    <div style={{ height: 4, background: "#F0EBE3", borderRadius: 2 }}>
                      <div style={{ height: 4, width: `${pct}%`, background: "#0A0A0A", borderRadius: 2 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2 : Conversion + Plans */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

            {/* Conversion essai → payant */}
            <div style={{ border: "1px solid #E0DAD0", padding: "24px 28px" }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#7A746E",
                marginBottom: 20,
              }}>
                Conversion essai → payant
              </div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20 }}>
                <div style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 48,
                  fontWeight: 700,
                  color: conversionRate >= 10 ? "#2D6A4F" : conversionRate >= 5 ? "#B7791F" : "#0A0A0A",
                  lineHeight: 1,
                }}>
                  {conversionRate}%
                </div>
                <div style={{ paddingBottom: 6, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 12, color: "#7A746E" }}>
                  {paidSubs} payants<br />{trialSubs} en essai
                </div>
              </div>
              <div style={{ height: 8, background: "#F0EBE3", borderRadius: 4 }}>
                <div style={{ height: 8, width: `${conversionRate}%`, background: "#2D6A4F", borderRadius: 4 }} />
              </div>
              <div style={{ marginTop: 16, fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#7A746E" }}>
                {totalSubs} comptes au total
              </div>
            </div>

            {/* Breakdown plans */}
            <div style={{ border: "1px solid #E0DAD0", padding: "24px 28px" }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#7A746E",
                marginBottom: 20,
              }}>
                Plans actifs
              </div>
              {([
                { key: "starter" as const, label: "Starter — 290€/mois",  color: "#7A746E" },
                { key: "pro"     as const, label: "Pro — 590€/mois",      color: "#1A4A8A" },
                { key: "scale"   as const, label: "Scale — 1 490€/mois",  color: "#2D6A4F" },
              ]).map(({ key, label, color }) => {
                const val = planStats[key];
                const mrr = key === "starter" ? val * 290 : key === "pro" ? val * 590 : val * 1490;
                return (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #F0EBE3" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 13, color, fontWeight: 500 }}>{label}</div>
                      <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 11, color: "#7A746E" }}>
                        MRR : {mrr.toLocaleString("fr-FR")} €
                      </div>
                    </div>
                    <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 22, fontWeight: 700, color: "#0A0A0A" }}>
                      {val}
                    </div>
                  </div>
                );
              })}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                paddingTop: 4,
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                color: "#7A746E",
              }}>
                <span>MRR total estimé</span>
                <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontWeight: 700, color: "#2D6A4F", fontSize: 14 }}>
                  {(planStats.starter * 290 + planStats.pro * 590 + planStats.scale * 1490).toLocaleString("fr-FR")} €
                </span>
              </div>
            </div>
          </div>

          {/* Row 3 : Timeline 7 jours */}
          <div style={{ border: "1px solid #E0DAD0", padding: "24px 28px" }}>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 10,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#7A746E",
              marginBottom: 24,
            }}>
              Nouvelles candidatures — 7 derniers jours
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
              {timeline.map(({ label, count }) => (
                <div key={label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "#0A0A0A", fontWeight: count > 0 ? 700 : 400 }}>
                    {count > 0 ? count : ""}
                  </div>
                  <div style={{
                    width: "100%",
                    height: `${Math.max((count / maxTimelineCount) * 48, count > 0 ? 4 : 2)}px`,
                    background: count > 0 ? "#0A0A0A" : "#E0DAD0",
                    borderRadius: 2,
                    alignSelf: "flex-end",
                  }} />
                  <div style={{ fontFamily: "var(--font-dm-sans), sans-serif", fontSize: 10, color: "#7A746E", whiteSpace: "nowrap" }}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Row 4 : Entonnoir par source */}
          {sourceFunnelStats.length > 0 && (
            <div style={{ border: "1px solid #E0DAD0", padding: "24px 28px" }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#7A746E", marginBottom: 20,
              }}>
                Entonnoir par source — lead → approuvé
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                  <thead>
                    <tr>
                      {["Source", "Total", "Approuvés", "En attente", "Rejetés", "Taux approbation"].map((h) => (
                        <th key={h} style={{
                          textAlign: h === "Source" ? "left" : "right",
                          fontFamily: "var(--font-jetbrains), monospace",
                          fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                          color: "#7A746E", fontWeight: 400,
                          padding: "0 12px 12px", borderBottom: "1px solid #E0DAD0",
                          paddingLeft: h === "Source" ? 0 : 12,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sourceFunnelStats.map(([src, f]) => {
                      const approvalRate = f.total > 0 ? Math.round((f.approved / f.total) * 100) : 0;
                      return (
                        <tr key={src} style={{ borderBottom: "1px solid #F0EBE3" }}>
                          <td style={{ padding: "12px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "#0A0A0A" }}>
                            {src}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 700, color: "#0A0A0A" }}>
                            {f.total}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "#2D6A4F", fontWeight: 700 }}>
                            {f.approved}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "#B7791F" }}>
                            {f.pending}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right", fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, color: "#C0392B" }}>
                            {f.rejected}
                          </td>
                          <td style={{ padding: "12px", textAlign: "right" }}>
                            <span style={{
                              fontFamily: "var(--font-jetbrains), monospace",
                              fontSize: 13, fontWeight: 700,
                              color: approvalRate >= 50 ? "#2D6A4F" : approvalRate >= 25 ? "#B7791F" : "#7A746E",
                            }}>
                              {approvalRate}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Row 5 : Matrice source × tunnel */}
          {sourceXTunnelStats.length > 0 && (
            <div style={{ border: "1px solid #E0DAD0", padding: "24px 28px" }}>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
                color: "#7A746E", marginBottom: 20,
              }}>
                Source × Profil — quel canal amène quel type de membre
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-dm-sans), sans-serif" }}>
                  <thead>
                    <tr>
                      {["Source", "Cédants", "Repreneurs", "Fonds / FO", "Non qualifié"].map((h) => (
                        <th key={h} style={{
                          textAlign: h === "Source" ? "left" : "right",
                          fontFamily: "var(--font-jetbrains), monospace",
                          fontSize: 10, letterSpacing: "0.08em", textTransform: "uppercase",
                          color: "#7A746E", fontWeight: 400,
                          padding: "0 12px 12px", borderBottom: "1px solid #E0DAD0",
                          paddingLeft: h === "Source" ? 0 : 12,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sourceXTunnelStats.map(([src, t]) => {
                      const total = t.cedant + t.repreneur + t.fonds + t.none;
                      const cell = (val: number, color: string) => (
                        <td style={{ padding: "12px", textAlign: "right" }}>
                          {val > 0 ? (
                            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 13, fontWeight: 700, color }}>
                              {val}
                              <span style={{ fontSize: 10, fontWeight: 400, color: "#B0AA9E", marginLeft: 4 }}>
                                ({Math.round((val / total) * 100)}%)
                              </span>
                            </span>
                          ) : (
                            <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "#D0CAC0" }}>—</span>
                          )}
                        </td>
                      );
                      return (
                        <tr key={src} style={{ borderBottom: "1px solid #F0EBE3" }}>
                          <td style={{ padding: "12px 0", fontFamily: "var(--font-jetbrains), monospace", fontSize: 12, color: "#0A0A0A" }}>
                            {src}
                          </td>
                          {cell(t.cedant, "#2D6A4F")}
                          {cell(t.repreneur, "#1A4A8A")}
                          {cell(t.fonds, "#7B2C6E")}
                          {cell(t.none, "#9A9490")}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      ) : isMembersView ? (
        /* ——— Members view (KYC) ——— */
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
              {t.noMembers}
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
                {[t.colMember, t.colRole, t.colCompany, t.colKyc].map((h) => (
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
          {/* Application tabs */}
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
          {t.noApplications}
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
            {[t.colApplicant, t.colRole, t.colTicket, t.colStatus, t.colDate].map((h) => (
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
                  {formatDate(req.created_at, dateLocale)}
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

                {/* AI Score + Actions */}
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
                          {t.aiScore}
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
