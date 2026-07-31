import React from "react";
import { PhotoFrame } from "./PhotoFrame.jsx";

export function ProjectCard({ title, year, category, cover, ratio = "4 / 5", index, onOpen }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onOpen && onOpen(); }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ display: "block", textDecoration: "none", color: "inherit" }}
    >
      <div style={{ position: "relative", overflow: "hidden" }}>
        <div
          style={{
            transform: hover ? "scale(1.03)" : "scale(1)",
            filter: hover ? "none" : "grayscale(0.15)",
            transition: "transform var(--dur-slow) var(--ease-out), filter var(--dur-base) var(--ease-out)",
          }}
        >
          <PhotoFrame src={cover} alt={title} ratio={ratio} veil="none" />
        </div>
        {index != null && (
          <span
            style={{
              position: "absolute",
              top: "var(--sp-4)",
              left: "var(--sp-4)",
              fontFamily: "var(--font-display)",
              fontSize: "var(--type-label)",
              letterSpacing: "var(--ls-label)",
              color: "var(--bone-100)",
              mixBlendMode: "difference",
            }}
          >
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--sp-5)", marginTop: "var(--sp-5)" }}>
        <h3
          style={{
            margin: 0,
            fontFamily: "var(--font-display)",
            fontSize: "var(--type-h3)",
            fontWeight: "var(--weight-medium)",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            lineHeight: "var(--lh-tight)",
            color: hover ? "var(--accent)" : "var(--text-primary)",
            transition: "color var(--dur-base) var(--ease-out)",
          }}
        >
          {title}
        </h3>
        <span style={{ fontFamily: "var(--font-display)", fontSize: "var(--type-label)", letterSpacing: "var(--ls-meta)", color: "var(--text-muted)" }}>
          {year}
        </span>
      </div>
      {category && (
        <p style={{ margin: "var(--sp-2) 0 0", fontSize: "var(--type-small)", fontWeight: "var(--weight-light)", color: "var(--text-muted)" }}>
          {category}
        </p>
      )}
    </a>
  );
}
