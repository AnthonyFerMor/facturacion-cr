import type { ButtonHTMLAttributes } from "react";

import estilos from "./boton.module.css";

// Sin `className`: el aspecto del botón sale solo de sus variantes.
type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  /** La acción principal de la pantalla lleva el acento. Hay una sola por pantalla. */
  variante?: "principal" | "secundario";
  /** Ocupa todo el ancho y es más alto: para el botón de un formulario corto. */
  ancho?: boolean;
};

export function Boton({
  variante = "secundario",
  ancho = false,
  type = "button",
  ...resto
}: Props) {
  const clases = [
    estilos.boton,
    variante === "principal" ? estilos.principal : "",
    ancho ? estilos.ancho : "",
  ]
    .filter(Boolean)
    .join(" ");

  return <button type={type} className={clases} {...resto} />;
}
