import * as React from "react";

/**
 * Contenedor de fotografía: recorte por proporción, veladura y pie en versalitas.
 * @startingPoint section="Content" subtitle="Foto con veladura y pie" viewport="700x420"
 */
export interface PhotoFrameProps {
  src: string;
  alt?: string;
  /** proporción CSS, p. ej. "4 / 5", "3 / 2", "16 / 9" */
  ratio?: string;
  caption?: string;
  /** soft = degradado inferior · side = degradado lateral para texto encima · flat = velo plano */
  veil?: "none" | "soft" | "side" | "flat";
  position?: string;
  contrast?: number;
  children?: React.ReactNode;
}
export declare function PhotoFrame(props: PhotoFrameProps): JSX.Element;
