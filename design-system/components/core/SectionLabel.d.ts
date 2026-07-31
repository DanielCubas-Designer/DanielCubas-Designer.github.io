import * as React from "react";

/** Rótulo de sección con filete. */
export interface SectionLabelProps {
  children?: React.ReactNode;
  rule?: boolean;
  ruleColor?: "accent" | "neutral";
}
export declare function SectionLabel(props: SectionLabelProps): JSX.Element;

/** Filete horizontal. `accent` produce la barra amarilla de 88×2px bajo los titulares. */
export interface RuleProps {
  accent?: boolean;
  width?: string;
}
export declare function Rule(props: RuleProps): JSX.Element;
