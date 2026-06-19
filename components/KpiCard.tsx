export function KpiCard({
  label,
  value,
  variant = "blue",
  hint,
  progress
}: {
  label: string;
  value: string;
  variant?: "blue" | "green" | "orange" | "purple";
  hint?: string;
  progress?: number;
}) {
  return (
    <div className={`kpi-card ${variant}`}>
      <span>{label}</span>

      <strong>{value}</strong>

      {hint ? <small>{hint}</small> : null}

      {progress !== undefined && (
        <div className="kpi-progress">
          <div
            className="kpi-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}