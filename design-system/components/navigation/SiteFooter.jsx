import React from "react";

export function SiteFooter({ note = "Disponible para proyectos, colaboraciones y desarrollo de marca.", handle = "@DanyCub", phone = "477 284 3551" }) {
  return (
    <footer
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-end",
        justifyContent: "space-between",
        gap: "var(--sp-7)",
        padding: "var(--sp-10) var(--page-x) var(--sp-9)",
        borderTop: "1px solid var(--rule)",
        background: "var(--surface-page)",
      }}
    >
      <p
        style={{
          margin: 0,
          maxWidth: "330px",
          fontSize: "var(--type-small)",
          fontWeight: "var(--weight-light)",
          lineHeight: 1.55,
          color: "var(--text-muted)",
        }}
      >
        {note}
      </p>
      <div style={{ display: "flex", gap: "var(--sp-8)", fontFamily: "var(--font-display)", fontSize: "21px", letterSpacing: "var(--ls-meta)" }}>
        <span>{handle}</span>
        <span>{phone}</span>
      </div>
    </footer>
  );
}
