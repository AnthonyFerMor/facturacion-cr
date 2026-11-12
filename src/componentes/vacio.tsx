import type { ReactNode } from "react";

import estilos from "./vacio.module.css";

/**
 * Lo que se muestra en lugar de una lista que todavía no tiene nada: qué va a
 * haber ahí y la acción para crear lo primero.
 */
export function Vacio({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className={estilos.vacio}>
      <h2 className={estilos.titulo}>{titulo}</h2>
      {children}
    </div>
  );
}
