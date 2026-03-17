export default function LoadingNdaPage() {
  return (
    <div style={{
      minHeight: "70vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 12,
      background: "#FAF7F2",
    }}>
      <div style={{
        width: 28,
        height: 28,
        borderRadius: "50%",
        border: "2px solid #D6D0C8",
        borderTopColor: "#0A0A0A",
        animation: "spin-nda 0.8s linear infinite",
      }} />
      <div style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 12,
        color: "#7A746E",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}>
        Préparation du NDA…
      </div>
      <style>{`
        @keyframes spin-nda {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
