import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function RegisterStatusPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let status: string | null = null;
  let requestEmail: string | null = null;

  if (user?.email) {
    requestEmail = user.email;
    const { data } = await supabase
      .from("admission_requests")
      .select("status")
      .eq("email", user.email)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();
    status = data?.status ?? null;
  }

  const statusConfig: Record<string, { label: string; title: string; description: string; dotColor: string }> = {
    approved: {
      label: "Approuvée",
      title: "Approuvée",
      description: "Votre accès est validé. Vous pouvez vous connecter à l'espace privé.",
      dotColor: "#276749",
    },
    pending: {
      label: "En cours d'examen",
      title: "En attente de validation.",
      description: "Votre profil est en cours d'examen par l'équipe CROCHET. Vous recevrez un email dès que votre candidature sera traitée.",
      dotColor: "#B7791F",
    },
    rejected: {
      label: "Non retenue",
      title: "Candidature non retenue.",
      description: "Votre candidature n'a pas été retenue à ce stade. Pour toute question, contactez-nous à contact@crochett.ai.",
      dotColor: "#C53030",
    },
  };

  const current = status ? (statusConfig[status] ?? statusConfig.pending) : statusConfig.pending;

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F2EE",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Header */}
      <header style={{
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 64,
        paddingInline: 48,
        flexShrink: 0,
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <span style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 20,
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
          }}>
            CROCHET.
          </span>
        </Link>
      </header>

      {/* Content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "64px 24px",
      }}>
        <div style={{ maxWidth: 520, width: "100%" }}>

          {/* Label */}
          <div style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 10,
            letterSpacing: "0.14em",
            textTransform: "uppercase" as const,
            color: "#7A746E",
            marginBottom: 20,
          }}>
            État de ma candidature
          </div>

          {/* Title */}
          <h1 style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
            fontSize: 42,
            fontWeight: 700,
            fontStyle: "italic",
            color: "#0A0A0A",
            margin: "0 0 16px",
            lineHeight: 1.15,
          }}>
            {current.title}
          </h1>

          {/* Description */}
          <p style={{
            fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif",
            fontSize: 14,
            color: "#7A746E",
            lineHeight: 1.75,
            margin: "0 0 32px",
          }}>
            {current.description}
          </p>

          {/* Status badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            border: "1px solid #E0DAD0",
            padding: "8px 16px",
            marginBottom: 16,
          }}>
            <span style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: current.dotColor,
              flexShrink: 0,
              display: "inline-block",
            }} />
            <span style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              color: "#0A0A0A",
            }}>
              {current.label}
            </span>
          </div>

          {/* Connected account */}
          {requestEmail && (
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              color: "#7A746E",
              marginBottom: 36,
            }}>
              Compte connecté : {requestEmail}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" as const }}>
            {status === "approved" && (
              <Link href="/app" style={{
                display: "inline-block",
                background: "#0A0A0A",
                color: "#FFFFFF",
                padding: "14px 32px",
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.1em",
                textTransform: "uppercase" as const,
                textDecoration: "none",
              }}>
                Se connecter
              </Link>
            )}
            <Link href="/register" style={{
              display: "inline-block",
              border: "1px solid #E0DAD0",
              color: "#0A0A0A",
              padding: "14px 32px",
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              textDecoration: "none",
            }}>
              Modifier ma candidature
            </Link>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: "20px 48px",
        borderTop: "1px solid #E0DAD0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 10,
          color: "#C8C2B8",
          letterSpacing: "0.08em",
          textTransform: "uppercase" as const,
        }}>
          CROCHET. · Infrastructure privée de transactions
        </span>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10,
          color: "#C8C2B8",
        }}>
          crochett.ai
        </span>
      </footer>

    </div>
  );
}
