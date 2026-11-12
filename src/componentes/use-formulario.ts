"use client";

import { type FormEvent, useState } from "react";

type Errores<Campo extends string> = Partial<Record<Campo, string>>;

/**
 * El estado de un formulario que se revisa en el navegador antes de enviarse:
 * lo que hay escrito y qué error se muestra junto a cada campo.
 */
export function useFormulario<Campo extends string>({
  inicial,
  revisar,
  erroresDelServidor,
}: {
  inicial: Record<Campo, string>;
  /** La misma revisión que hace el servidor. Devuelve los errores, o `null` si no hay. */
  revisar: (datos: FormData) => Errores<Campo> | null;
  /** Los errores que devolvió el servidor en el último envío. */
  erroresDelServidor: Errores<Campo> | undefined;
}) {
  const [valores, ponerValores] = useState(inicial);
  // Errores de la revisión hecha en el navegador. Mientras haya, tapan los que
  // devolvió el servidor en el envío anterior.
  const [erroresLocales, setErroresLocales] = useState<Errores<Campo> | null>(
    null,
  );
  // Campos cambiados desde el último envío: su error ya no habla de lo que hay escrito.
  const [cambiados, setCambiados] = useState<ReadonlySet<Campo>>(
    () => new Set(),
  );

  const errores: Errores<Campo> = erroresLocales ?? erroresDelServidor ?? {};

  return {
    valores,
    /** Para llenar un campo sin que cuente como un cambio de la persona. */
    ponerValores,

    /** El error que se muestra junto a un campo, si tiene uno. */
    errorDe: (campo: Campo) =>
      cambiados.has(campo) ? undefined : errores[campo],

    /**
     * La respuesta del último envío sigue hablando de lo que hay escrito: nada
     * cambió desde entonces y el envío pasó la revisión del navegador.
     */
    respuestaVigente: cambiados.size === 0 && erroresLocales === null,

    /**
     * Cambia un campo. `caducan` son otros campos cuyo error deja de valer con
     * este cambio, porque su regla depende de este.
     */
    cambiar(campo: Campo, valor: string, ...caducan: Campo[]) {
      ponerValores((actuales) => ({ ...actuales, [campo]: valor }));
      setCambiados((anteriores) => new Set([...anteriores, campo, ...caducan]));
    },

    /** Muestra un error junto a un campo sin esperar al envío. */
    marcarError(campo: Campo, mensaje: string) {
      setErroresLocales({ ...errores, [campo]: mensaje });
      setCambiados((anteriores) => {
        const ahora = new Set(anteriores);
        ahora.delete(campo);
        return ahora;
      });
    },

    /** Va en `onSubmit`: frena el envío si la revisión encuentra errores. */
    alEnviar(evento: FormEvent<HTMLFormElement>) {
      const encontrados = revisar(new FormData(evento.currentTarget));
      setErroresLocales(encontrados);
      setCambiados(new Set());
      if (encontrados) {
        evento.preventDefault();
      }
    },
  };
}
