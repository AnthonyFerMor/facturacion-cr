import type { SelectHTMLAttributes } from "react";

import estilos from "./campo.module.css";

type Props = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  id: string;
  etiqueta: string;
  opciones: readonly { valor: string; texto: string }[];
};

/** Una lista desplegable con su etiqueta. Se ve igual que un campo de texto. */
export function Seleccion({ id, etiqueta, opciones, ...resto }: Props) {
  return (
    <div className={estilos.campo}>
      <label htmlFor={id}>{etiqueta}</label>
      <select id={id} {...resto}>
        {opciones.map((opcion) => (
          <option key={opcion.valor} value={opcion.valor}>
            {opcion.texto}
          </option>
        ))}
      </select>
    </div>
  );
}
