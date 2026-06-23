import type { ReactNode } from "react";

type DetailInfo = {
  label: string;
  value: ReactNode;
};

export function DetailInfoGrid({ items }: { items: DetailInfo[] }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: 12,
        margin: "22px 0",
      }}
    >
      {items.map((item) => (
        <div
          key={item.label}
          style={{
            minWidth: 0,
            border: "1px solid #e2e8f0",
            background: "#f8fafc",
            borderRadius: 14,
            padding: "12px 14px",
          }}
        >
          <strong
            style={{
              display: "block",
              marginBottom: 7,
              color: "#475569",
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: ".02em",
              textTransform: "uppercase",
            }}
          >
            {item.label}
          </strong>

          <span
            style={{
              display: "block",
              color: "#07111f",
              fontSize: 14,
              fontWeight: 760,
              lineHeight: 1.45,
              overflowWrap: "anywhere",
            }}
          >
            {item.value}
          </span>
        </div>
      ))}
    </div>
  );
}
