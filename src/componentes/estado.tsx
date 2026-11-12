import type { ReactNode } from "react";

import estilos from "./estado.module.css";

export type TonoEstado = "ok" | "mal" | "espera" | "neutro";

/**
 * El estado de algo, como un punto de color con su texto.
 * El texto siempre va: el color solo no alcanza para quien no lo distingue.
 */
export function Estado({
  tono,
  children,
}: {
  tono: TonoEstado;
  children: ReactNode;
}) {
  return (
    <span className={estilos.estado}>
      <span
        className={`${estilos.punto} ${estilos[tono]}`}
        aria-hidden="true"
      />
      {children}
    </span>
  );
}
