"use client";

import { useRouter } from "next/navigation";
import { Fragment, type ReactNode } from "react";

/**
 * Lo que va adentro empieza de cero cada vez que se llega a la pantalla.
 *
 * Next.js no desmonta una pantalla al salir de ella: la deja oculta, con su
 * estado, por si se vuelve. Un formulario que edita datos guardados tiene que
 * abrir con lo que hay en la base y no con lo que se escribió la vez anterior.
 * Al volver con el botón Atrás del navegador sí se recupera lo escrito.
 */
export function PorVisita({ children }: { children: ReactNode }) {
  const { bfcacheId } = useRouter();
  return <Fragment key={bfcacheId}>{children}</Fragment>;
}
