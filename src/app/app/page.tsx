import { requireUser } from "@/lib/auth/require-user";
import Link from "next/link";

const PIPELINE_STEPS = [
  { code: "01", label: "Signal" },
  { code: "02", label: "Qualification" },
  { code: "03", label: "D-Score" },
  { code: "04", label: "Matching" },
  { code: "05", label: "MEMO" },
  { code: "06", label: "Intro" },
  { code: "07", label: "NDA" },
  { code: "08", label: "Secure Room" },
];

const METRICS = [
  { value: "100%", label: "Confidentiel" },
  { value: "IA", label: "Qualification moteur" },
  { value: "V1", label: "Build actif" },
];

export default async function AppPage() {
  const user = await requireUser();

  return (
    <div style={{ background: "#FFFFFF", minHeight: "calc(100vh - 56px)" }}>

      {/* Hero */}
      <section style={{
        borderBottom: "1px solid #E0DAD0",
        padding: "72px 64px 64px",
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {/* LIVE badge */}
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 32,
          padding: "6px 14px",
          border: "1px solid #E0DAD0",
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "#7A746E",
        }}>
          <span className="live-dot" />
          Moteur actif — Build V1
        </div>

        <h1 style={{
          fontFamily: "var(--font-playfair), 'Playfair Display', Georgia, serif",
          fontStyle: "italic",
          fontSize: "clamp(40px, 5vw, 72px)",
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          color: "#0A0A0A",
          maxWidth: 720,
          margin: "0 0 24px",
        }}>
          Un dossier brut.<br />Un signal investissable.
        </h1>

        <p style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 16,
          color: "#7A746E",
          maxWidth: 480,
          lineHeight: 1.7,
          margin: "0 0 40px",
        }}>
          CROCHET transforme vos dossiers en signaux qualifiés, les score et les route vers les investisseurs alignés.
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/app/matches" style={{
            padding: "12px 28px",
            background: "#0A0A0A",
            color: "#FFFFFF",
            textDecoration: "none",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Voir mes Matches
          </Link>
          <Link href="/app/opportunities/new" style={{
            padding: "12px 28px",
            background: "transparent",
            color: "#0A0A0A",
            border: "1px solid #E0DAD0",
            textDecoration: "none",
            fontFamily: "var(--font-dm-sans), sans-serif",
            fontSize: 13,
            fontWeight: 500,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}>
            Soumettre un dossier
          </Link>
        </div>
      </section>

      {/* Metrics strip */}
      <section style={{
        borderBottom: "1px solid #E0DAD0",
        display: "flex",
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        {METRICS.map((m, i) => (
          <div key={i} style={{
            flex: 1,
            padding: "28px 48px",
            borderRight: i < METRICS.length - 1 ? "1px solid #E0DAD0" : "none",
          }}>
            <div style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 28,
              fontWeight: 700,
              color: "#0A0A0A",
              letterSpacing: "-0.02em",
              marginBottom: 4,
            }}>
              {m.value}
            </div>
            <div style={{
              fontFamily: "var(--font-dm-sans), sans-serif",
              fontSize: 12,
              color: "#7A746E",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}>
              {m.label}
            </div>
          </div>
        ))}
      </section>

      {/* Pipeline */}
      <section style={{
        padding: "56px 64px",
        maxWidth: 1200,
        margin: "0 auto",
      }}>
        <div style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 11,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#7A746E",
          marginBottom: 32,
        }}>
          Pipeline transactionnel
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(8, 1fr)",
          gap: 0,
          border: "1px solid #E0DAD0",
        }}>
          {PIPELINE_STEPS.map((step, i) => (
            <div key={i} style={{
              padding: "20px 16px",
              borderRight: i < PIPELINE_STEPS.length - 1 ? "1px solid #E0DAD0" : "none",
              textAlign: "center",
            }}>
              <div style={{
                fontFamily: "var(--font-jetbrains), monospace",
                fontSize: 10,
                color: "#7A746E",
                letterSpacing: "0.08em",
                marginBottom: 8,
              }}>
                {step.code}
              </div>
              <div style={{
                fontFamily: "var(--font-dm-sans), sans-serif",
                fontSize: 12,
                fontWeight: 500,
                color: "#0A0A0A",
                letterSpacing: "0.02em",
              }}>
                {step.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* User footer */}
      <section style={{
        borderTop: "1px solid #E0DAD0",
        padding: "20px 64px",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <span style={{
          fontFamily: "var(--font-dm-sans), sans-serif",
          fontSize: 12,
          color: "#7A746E",
        }}>
          {user.email}
        </span>
        <span style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 11,
          color: "#7A746E",
          letterSpacing: "0.06em",
        }}>
          crochett.ai
        </span>
      </section>

    </div>
  );
}
