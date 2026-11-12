import type { InputHTMLAttributes } from "react";

import estilos from "./campo.module.css";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  etiqueta: string;
  /** Texto fijo debajo del campo. */
  ayuda?: string;
  /** Mensaje de error. Queda asociado al campo para los lectores de pantalla. */
  error?: string;
};

/** Un campo de texto con su etiqueta, su ayuda y su error. */
export function Campo({ id, etiqueta, ayuda, error, ...resto }: Props) {
  const idAyuda = ayuda ? `${id}-ayuda` : undefined;
  const idError = error ? `${id}-error` : undefined;
  const descritoPor = [idAyuda, idError].filter(Boolean).join(" ");

  return (
    <div className={estilos.campo}>
      <label htmlFor={id}>{etiqueta}</label>
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={descritoPor || undefined}
        {...resto}
      />
      {ayuda ? (
        <p id={idAyuda} className={estilos.ayuda}>
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={idError} className={estilos.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
