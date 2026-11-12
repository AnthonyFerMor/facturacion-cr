import type { ReactNode } from "react";

import estilos from "./listado.module.css";

/** La lista de una pantalla: arriba, la acción para crear; abajo, la tabla en su tarjeta. */
export function Listado({
  accion,
  children,
}: {
  accion: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className={estilos.listado}>
      <div className={estilos.acciones}>{accion}</div>
      <div className={estilos.tarjeta}>{children}</div>
    </div>
  );
}
