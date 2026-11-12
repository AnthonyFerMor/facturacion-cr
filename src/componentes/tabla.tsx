import { type ReactNode, useId } from "react";

import estilos from "./tabla.module.css";

/**
 * Una tabla de datos. El título no se ve, pero le da nombre a la tabla para los
 * lectores de pantalla. Adentro van `<thead>` y `<tbody>` comunes; una celda con
 * `data-alinear="derecha"` queda a la derecha y con cifras tabulares.
 * Si no cabe a lo ancho, se desplaza la tabla y no la página.
 */
export function Tabla({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  const idTitulo = useId();

  return (
    // La caja recibe el foco para que se pueda desplazar con el teclado.
    <div
      className={estilos.envoltura}
      role="region"
      aria-labelledby={idTitulo}
      tabIndex={0}
    >
      <table className={estilos.tabla}>
        <caption id={idTitulo} className={estilos.titulo}>
          {titulo}
        </caption>
        {children}
      </table>
    </div>
  );
}
