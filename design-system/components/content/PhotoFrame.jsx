import React from "react";

export function PhotoFrame({ src, alt = "", ratio = "4 / 5", caption, veil = "soft", position = "50% 50%", contrast = 1.06, children }) {
  const veils = {
    none: null,
    soft: "var(--veil-soft)",
    side: "var(--veil-side)",
    flat: "var(--veil-flat)",
  };
  return (
    <figure style={{ position: "relative", margin: 0, aspectRatio: ratio, overflow: "hidden", background: "var(--ink-800)" }}>
      <img
        src={src}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: position,
          display: "block",
          filter: `contrast(${contrast}) saturate(0.96)`,
        }}
      />
      {veils[veil] && <span style={{ position: "absolute", inset: 0, background: veils[veil], pointerEvents: "none" }} />}
      {caption && (
        <figcaption
          style={{
            position: "absolute",
            left: "var(--sp-5)",
            bottom: "var(--sp-5)",
            fontFamily: "var(--font-display)",
            fontSize: "var(--type-label)",
            letterSpacing: "var(--ls-label)",
            textTransform: "uppercase",
            color: "var(--text-primary)",
          }}
        >
          {caption}
        </figcaption>
      )}
      {children}
    </figure>
  );
}
