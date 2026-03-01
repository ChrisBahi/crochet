export function PageHeader({
  title,
  subtitle,
  right,
}: {
  title: string
  subtitle?: string
  right?: React.ReactNode
}) {
  return (
    <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
      <div>
        <h1 style={{ margin: 0 }}>{title}</h1>
        {subtitle ? <p style={{ margin: "6px 0 0 0", opacity: 0.7 }}>{subtitle}</p> : null}
      </div>
      <div style={{ marginLeft: "auto" }}>{right}</div>
    </div>
  )
}
