import * as React from "react";

/**
 * Portada editorial: titular condensado a la izquierda, fotografía vertical a la derecha.
 * Es la traducción directa de la propuesta 03 del flyer.
 * @startingPoint section="Content" subtitle="Portada editorial del sitio" viewport="1280x760"
 */
export interface EditorialHeroProps {
  /** rótulo pequeño sobre el titular, con filete amarillo */
  eyebrow?: string;
  title?: React.ReactNode;
  /** subtítulo en Oswald light itálica */
  lead?: string;
  /** párrafo en Inter light, gris */
  body?: string;
  tags?: string[];
  /** ruta de la fotografía de la columna derecha; si se omite, el titular ocupa todo el ancho */
  media?: string;
  mediaAlt?: string;
  actions?: React.ReactNode;
}
export declare function EditorialHero(props: EditorialHeroProps): JSX.Element;
