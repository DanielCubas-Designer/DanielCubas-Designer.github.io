import React from "react";

export function Tag({ children, tone = "default" }) {
  const color =
    tone === "accent" ? "var(--accent)" : tone === "muted" ? "var(--text-muted)" : "var(--text-secondary)";
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontSize: "var(--type-label)",
        fontWeight: "var(--weight-regular)",
        letterSpacing: "var(--ls-label)",
        textTransform: "uppercase",
        color,
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

export function TagList({ items = [], tone = "default" }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--sp-2) var(--sp-5)" }}>
      {items.map((it, i) => (
        <React.Fragment key={it}>
          <Tag tone={tone}>{it}</Tag>
          {i < items.length - 1 && <span style={{ color: "var(--accent)", fontSize: "13px" }}>·</span>}
        </React.Fragment>
      ))}
    </div>
  );
}
