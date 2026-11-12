import type { ReactNode } from "react";

import estilos from "./aviso.module.css";

/** Un error que no es de ningún campo: algo no se pudo cargar o no se pudo guardar. */
export function Aviso({ children }: { children: ReactNode }) {
  return (
    <p className={estilos.aviso} role="alert">
      {children}
    </p>
  );
}
