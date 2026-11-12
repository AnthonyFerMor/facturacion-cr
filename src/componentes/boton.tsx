import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import estilos from "./boton.module.css";

/** La acción principal de la pantalla lleva el acento. Hay una sola por pantalla. */
type Variante = "principal" | "secundario";

// Sin `className`: el aspecto del botón sale solo de sus variantes.
type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
  variante?: Variante;
  /** Ocupa todo el ancho y es más alto: para el botón de un formulario corto. */
  ancho?: boolean;
};

export function Boton({
  variante = "secundario",
  ancho = false,
  type = "button",
  ...resto
}: Props) {
  return <button type={type} className={clases(variante, ancho)} {...resto} />;
}

/** Un enlace con el aspecto de un botón, para una acción que lleva a otra pantalla. */
export function EnlaceBoton({
  href,
  variante = "secundario",
  children,
}: {
  href: string;
  variante?: Variante;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={clases(variante)}>
      {children}
    </Link>
  );
}

function clases(variante: Variante, ancho = false) {
  return [
    estilos.boton,
    variante === "principal" ? estilos.principal : "",
    ancho ? estilos.ancho : "",
  ]
    .filter(Boolean)
    .join(" ");
}
