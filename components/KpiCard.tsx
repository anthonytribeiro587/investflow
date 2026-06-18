export function KpiCard({ label, value, variant = "blue", hint }: { label: string; value: string; variant?: "blue" | "green" | "orange" | "purple"; hint?: string }) {
  return <div className={`kpi-card ${variant}`}><span>{label}</span><strong>{value}</strong>{hint ? <small>{hint}</small> : null}</div>;
}
