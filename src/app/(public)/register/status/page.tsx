import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerClient } from "@/lib/supabase/server";

type AdmissionStatus = "pending" | "approved" | "rejected" | "unknown";

function getStatusLabel(status: AdmissionStatus) {
  if (status === "approved") return "Approuvée";
  if (status === "rejected") return "Refusée";
  if (status === "pending") return "En attente";
  return "En cours d'analyse";
}

function getStatusText(status: AdmissionStatus) {
  if (status === "approved") return "Votre accès est validé. Vous pouvez vous connecter à l'espace privé.";
  if (status === "rejected") return "Votre candidature n'a pas été retenue pour le moment.";
  if (status === "pending") return "Votre dossier est bien reçu et en cours de revue par l'équipe.";
  return "Nous préparons votre dossier. Revenez dans quelques minutes.";
}

function getStatusColor(status: AdmissionStatus) {
  if (status === "approved") return "#2D6A4F";
  if (status === "rejected") return "#B91C1C";
  return "#7A746E";
}

export default async function RegisterStatusPage({
  searchParams,
}: {
  searchParams: Promise<{ submitted?: string }>;
}) {
  const { submitted } = await searchParams;

  let status: AdmissionStatus = submitted ? "pending" : "unknown";
  let email: string | null = null;

  try {
    const supabase = await createServerClient();
    const { data: { session } } = await supabase.auth.getSession();
    email = session?.user?.email ?? null;

    if (email) {
      const adminEmails = (process.env.ADMIN_EMAILS ?? "")
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean);

      if (adminEmails.includes(email)) {
        status = "approved";
      } else {
        const admin = createAdminClient();
        const { data } = await admin
          .from("admission_requests")
          .select("status")
          .eq("email", email)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (data?.status === "approved" || data?.status === "rejected" || data?.status === "pending") {
          status = data.status;
        } else if (submitted) {
          status = "pending";
        }
      }
    }
  } catch {
    if (submitted) status = "pending";
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F2EE",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 24px",
    }}>
      <div style={{ maxWidth: 620, width: "100%", background: "#FFFFFF", border: "1px solid #E0DAD0", padding: "40px 36px" }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 16,
        }}>
          État de ma candidature
        </div>

        <h1 style={{
          fontFamily: "var(--font-playfair), Georgia, serif",
          fontSize: 38,
          margin: "0 0 10px",
          lineHeight: 1.1,
          color: "#0A0A0A",
        }}>
          {getStatusLabel(status)}
        </h1>

        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 14,
          color: "#4A443D",
          lineHeight: 1.7,
          margin: "0 0 22px",
        }}>
          {getStatusText(status)}
        </p>

        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          border: "1px solid #E0DAD0",
          marginBottom: 18,
        }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: getStatusColor(status) }} />
          <span style={{
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            color: getStatusColor(status),
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}>
            {getStatusLabel(status)}
          </span>
        </div>

        {email && (
          <p style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 11,
            color: "#7A746E",
            margin: "0 0 24px",
            wordBreak: "break-all",
          }}>
            Compte connecté: {email}
          </p>
        )}

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/login" style={{
            padding: "10px 18px",
            border: "1px solid #0A0A0A",
            textDecoration: "none",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#0A0A0A",
          }}>
            Se connecter
          </Link>
          <Link href="/register" style={{
            padding: "10px 18px",
            border: "1px solid #E0DAD0",
            textDecoration: "none",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 12,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#7A746E",
          }}>
            Modifier ma candidature
          </Link>
        </div>
      </div>
    </div>
  );
}
