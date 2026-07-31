import React from "react";

export function EditorialHero({ eyebrow, title, lead, body, tags = [], media, mediaAlt = "", actions }) {
  return (
    <section
      style={{
        display: "grid",
        gridTemplateColumns: media ? "minmax(0, 1fr) minmax(0, 0.72fr)" : "minmax(0, 1fr)",
        gap: "var(--gutter)",
        alignItems: "center",
        padding: "var(--page-y) var(--page-x)",
        background: "var(--surface-page)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-7)" }}>
        {eyebrow && (
          <div style={{ display: "flex", alignItems: "center", gap: "var(--sp-5)" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-label)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>
              {eyebrow}
            </span>
            <span style={{ width: "70px", height: "1px", background: "var(--accent)" }} />
          </div>
        )}

        <h1
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontWeight: "var(--weight-semibold)",
            fontSize: "var(--type-display)",
            lineHeight: "var(--lh-display)",
            letterSpacing: "var(--ls-display)",
            textTransform: "uppercase",
            textWrap: "balance",
          }}
        >
          {title}
        </h1>

        {lead && (
          <p style={{ margin: 0, fontFamily: "var(--font-display)", fontWeight: "var(--weight-light)", fontStyle: "italic", fontSize: "var(--type-lead)", lineHeight: "var(--lh-lead)", maxWidth: "720px" }}>
            {lead}
          </p>
        )}

        {body && (
          <p style={{ margin: 0, fontSize: "var(--type-body)", fontWeight: "var(--weight-light)", lineHeight: "var(--lh-body)", color: "var(--text-muted)", maxWidth: "var(--max-measure)", textWrap: "pretty" }}>
            {body}
          </p>
        )}

        {tags.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--sp-2) var(--sp-5)" }}>
            {tags.map((t, i) => (
              <React.Fragment key={t}>
                <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-label)", letterSpacing: "var(--ls-label)", textTransform: "uppercase", color: "var(--text-secondary)" }}>{t}</span>
                {i < tags.length - 1 && <span style={{ color: "var(--accent)" }}>·</span>}
              </React.Fragment>
            ))}
          </div>
        )}

        {actions && <div style={{ display: "flex", gap: "var(--sp-4)", flexWrap: "wrap" }}>{actions}</div>}
      </div>

      {media && (
        <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4 / 5" }}>
          <img src={media} alt={mediaAlt} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "contrast(1.06) saturate(0.96)" }} />
        </div>
      )}
    </section>
  );
}
