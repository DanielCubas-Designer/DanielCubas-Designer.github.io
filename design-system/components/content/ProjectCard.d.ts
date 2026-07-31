import * as React from "react";

/**
 * Tarjeta de proyecto para la retícula del portafolio.
 * @startingPoint section="Content" subtitle="Tarjeta de proyecto" viewport="700x520"
 */
export interface ProjectCardProps {
  title: string;
  year?: string | number;
  category?: string;
  /** ruta de la portada dentro de /contenido/proyectos/<carpeta>/ */
  cover: string;
  ratio?: string;
  /** número correlativo; se dibuja sobre la imagen en 01, 02, … */
  index?: number;
  onOpen?: () => void;
}
export declare function ProjectCard(props: ProjectCardProps): JSX.Element;
