import * as React from "react";

export interface NavItem { id: string; label: string; href?: string; }

/**
 * Cabecera del sitio: nombre con tracking amplio a la izquierda, navegación en versalitas a la derecha.
 * @startingPoint section="Navigation" subtitle="Cabecera del portafolio" viewport="1280x110"
 */
export interface SiteHeaderProps {
  name?: string;
  items?: NavItem[];
  /** id del item activo — recibe subrayado amarillo */
  active?: string;
  onNavigate?: (id: string) => void;
  /** micro-dato a la derecha del nombre, en amarillo */
  locale?: string;
}
export declare function SiteHeader(props: SiteHeaderProps): JSX.Element;
