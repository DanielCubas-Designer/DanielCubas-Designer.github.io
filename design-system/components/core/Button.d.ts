import * as React from "react";

/**
 * Botón editorial: rectangular, tipografía condensada en versalitas.
 * @startingPoint section="Core" subtitle="Botones del sistema" viewport="700x180"
 */
export interface ButtonProps {
  children?: React.ReactNode;
  /** solid = acción principal · outline = secundaria · accent = única por pantalla · ghost = enlace */
  variant?: "solid" | "outline" | "accent" | "ghost";
  size?: "sm" | "md" | "lg";
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  style?: React.CSSProperties;
}
export declare function Button(props: ButtonProps): JSX.Element;
