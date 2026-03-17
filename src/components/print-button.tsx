"use client"

export function PrintButton({ label = "Imprimer / PDF" }: { label?: string }) {
  return (
    <button
      onClick={() => window.print()}
      style={{
        fontFamily: "var(--font-dm-sans), sans-serif",
        fontSize: 11,
        color: "#FFFFFF",
        background: "transparent",
        border: "1px solid #3A3A3A",
        padding: "6px 16px",
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        cursor: "pointer",
      }}
    >
      {label}
    </button>
  )
}
