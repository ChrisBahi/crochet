import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F2EE",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "serif",
    }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1rem" }}>
        CROCHET.
      </h1>
      <p style={{ color: "#555", marginBottom: "2rem", textAlign: "center", maxWidth: 360 }}>
        Votre accès n&apos;a pas encore été validé. Vous recevrez un email dès que votre candidature sera approuvée.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <Link href="/register/status" style={{ color: "#333", textDecoration: "underline", fontSize: "0.875rem" }}>
          Voir l&apos;état de ma candidature
        </Link>
        <Link href="/login" style={{ color: "#333", textDecoration: "underline", fontSize: "0.875rem" }}>
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
