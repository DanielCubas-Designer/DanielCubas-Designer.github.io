import * as React from "react";

/**
 * Pie de página: nota de disponibilidad a la izquierda, contacto en Oswald a la derecha.
 * @startingPoint section="Navigation" subtitle="Pie del portafolio" viewport="1280x220"
 */
export interface SiteFooterProps {
  note?: string;
  handle?: string;
  phone?: string;
}
export declare function SiteFooter(props: SiteFooterProps): JSX.Element;
