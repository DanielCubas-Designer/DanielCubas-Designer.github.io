import React from "react";

export function Button({ children, variant = "solid", size = "md", href, onClick, disabled = false, style }) {
  const pad = size === "sm" ? "10px 20px" : size === "lg" ? "18px 44px" : "14px 32px";
  const fs = size === "sm" ? "12px" : size === "lg" ? "15px" : "13px";

  const base = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--sp-3)",
    padding: pad,
    fontFamily: "var(--font-display)",
    fontSize: fs,
    fontWeight: "var(--weight-medium)",
    letterSpacing: "var(--ls-nav)",
    textTransform: "uppercase",
    textDecoration: "none",
    whiteSpace: "nowrap",
    flexShrink: 0,
    borderRadius: "var(--radius-none)",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.35 : 1,
    transition: "background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out), border-color var(--dur-base) var(--ease-out)",
    ...style,
  };

  const variants = {
    solid: { background: "var(--bone-100)", color: "var(--ink-900)", border: "1px solid var(--bone-100)" },
    outline: { background: "transparent", color: "var(--text-primary)", border: "1px solid var(--rule)" },
    accent: { background: "var(--accent)", color: "var(--ink-900)", border: "1px solid var(--accent)" },
    ghost: { background: "transparent", color: "var(--text-muted)", border: "1px solid transparent", padding: 0 },
  };

  const Tag = href ? "a" : "button";
  return (
    <Tag
      href={href}
      onClick={disabled ? undefined : onClick}
      disabled={Tag === "button" ? disabled : undefined}
      style={{ ...base, ...variants[variant] }}
    >
      {children}
    </Tag>
  );
}
