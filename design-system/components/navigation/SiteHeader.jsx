import React from "react";

export function SiteHeader({ name = "Daniel Cubas", items = [], active, onNavigate, locale = "MX" }) {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "var(--sp-7)",
        padding: "var(--sp-7) var(--page-x)",
        borderBottom: "1px solid var(--rule-soft)",
        background: "var(--surface-page)",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--sp-5)" }}>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--type-brand)",
            fontWeight: "var(--weight-medium)",
            letterSpacing: "var(--ls-brand)",
            textTransform: "uppercase",
          }}
        >
          {name}
        </span>
        <span
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "var(--type-label)",
            letterSpacing: "4px",
            color: "var(--accent)",
          }}
        >
          {locale}
        </span>
      </div>

      <nav style={{ display: "flex", gap: "var(--sp-8)" }}>
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <a
              key={it.id}
              href={it.href || "#"}
              onClick={(e) => {
                if (onNavigate) { e.preventDefault(); onNavigate(it.id); }
              }}
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "var(--type-label)",
                letterSpacing: "var(--ls-nav)",
                textTransform: "uppercase",
                textDecoration: "none",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                paddingBottom: "4px",
                borderBottom: isActive ? "1px solid var(--accent)" : "1px solid transparent",
                transition: "color var(--dur-base) var(--ease-out)",
              }}
            >
              {it.label}
            </a>
          );
        })}
      </nav>
    </header>
  );
}
