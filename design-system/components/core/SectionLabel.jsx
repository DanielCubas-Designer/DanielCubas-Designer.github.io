import React from "react";

export function SectionLabel({ children, rule = true, ruleColor = "accent" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-5)" }}>
      <span
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--type-label)",
          fontWeight: "var(--weight-medium)",
          letterSpacing: "var(--ls-label)",
          textTransform: "uppercase",
          color: "var(--text-secondary)",
          whiteSpace: "nowrap",
        }}
      >
        {children}
      </span>
      {rule && (
        <span
          style={{
            flex: 1,
            height: "1px",
            background: ruleColor === "accent" ? "var(--accent)" : "var(--rule)",
            maxWidth: ruleColor === "accent" ? "70px" : "none",
          }}
        />
      )}
    </div>
  );
}

export function Rule({ accent = false, width = "100%" }) {
  return (
    <span
      style={{
        display: "block",
        width: accent ? "var(--accent-bar-w)" : width,
        height: accent ? "var(--rule-accent)" : "1px",
        background: accent ? "var(--accent)" : "var(--rule)",
      }}
    />
  );
}
