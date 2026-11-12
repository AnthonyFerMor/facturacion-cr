import {
  type InputHTMLAttributes,
  type ReactNode,
  type TextareaHTMLAttributes,
  useId,
} from "react";

import estilos from "./campo.module.css";

type Comunes = {
  etiqueta: string;
  /** Texto fijo debajo del campo. */
  ayuda?: string;
  /** Mensaje de error. Queda asociado al campo para los lectores de pantalla. */
  error?: string;
};

type PropsDeCampo = Comunes & Omit<InputHTMLAttributes<HTMLInputElement>, "id">;

type PropsDeArea = Comunes &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">;

// El `id` de cada control sale de `useId` y no de quien lo usa. Next.js deja en
// el documento, ocultas, las pantallas recién visitadas: con un `id` escrito a
// mano, dos pantallas con un campo «nombre» compartirían la etiqueta.

/** Un campo de texto con su etiqueta, su ayuda y su error. */
export function Campo({ etiqueta, ayuda, error, ...resto }: PropsDeCampo) {
  const id = useId();
  return (
    <Marco id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      <input id={id} {...descripcion(id, ayuda, error)} {...resto} />
    </Marco>
  );
}

/** Un campo de varias líneas, para un texto largo como una dirección. */
export function AreaDeTexto({ etiqueta, ayuda, error, ...resto }: PropsDeArea) {
  const id = useId();
  return (
    <Marco id={id} etiqueta={etiqueta} ayuda={ayuda} error={error}>
      <textarea id={id} {...descripcion(id, ayuda, error)} {...resto} />
    </Marco>
  );
}

const idDeAyuda = (id: string) => `${id}-ayuda`;
const idDeError = (id: string) => `${id}-error`;

/** La etiqueta, la ayuda y el error que rodean a un control. */
function Marco({
  id,
  etiqueta,
  ayuda,
  error,
  children,
}: Comunes & { id: string; children: ReactNode }) {
  return (
    <div className={estilos.campo}>
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {ayuda ? (
        <p id={idDeAyuda(id)} className={estilos.ayuda}>
          {ayuda}
        </p>
      ) : null}
      {error ? (
        <p id={idDeError(id)} className={estilos.error} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Los atributos que le dicen a un lector de pantalla cuál es la ayuda del control y cuál su error. */
function descripcion(id: string, ayuda?: string, error?: string) {
  const descritoPor = [ayuda && idDeAyuda(id), error && idDeError(id)]
    .filter(Boolean)
    .join(" ");

  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": descritoPor || undefined,
  } as const;
}
