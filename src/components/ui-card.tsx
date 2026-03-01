export function UICard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 14,
        padding: 16,
        background: "#fff",
        marginBottom: 16,
      }}
    >
      {children}
    </div>
  )
}
