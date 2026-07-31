import * as React from "react";

/** Etiqueta de disciplina en versalitas. */
export interface TagProps {
  children?: React.ReactNode;
  tone?: "default" | "muted" | "accent";
}
export declare function Tag(props: TagProps): JSX.Element;

/** Lista de etiquetas separadas por punto medio amarillo — el patrón firma del sistema. */
export interface TagListProps {
  items?: string[];
  tone?: "default" | "muted" | "accent";
}
export declare function TagList(props: TagListProps): JSX.Element;
