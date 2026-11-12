import type { z } from "zod";

/** Lee de un formulario los campos pedidos, sin espacios a los lados. */
export function valoresDe<Campo extends string>(
  datos: FormData,
  campos: readonly Campo[],
): Record<Campo, string> {
  return Object.fromEntries(
    campos.map((campo) => [campo, String(datos.get(campo) ?? "").trim()]),
  ) as Record<Campo, string>;
}

/** Los errores de una revisión, uno por campo: el primero que encontró el esquema. */
export function erroresPorCampo<Campo extends string>(
  error: z.ZodError,
): Partial<Record<Campo, string>> {
  const errores: Partial<Record<Campo, string>> = {};
  for (const problema of error.issues) {
    const campo = problema.path[0] as Campo;
    errores[campo] ??= problema.message;
  }
  return errores;
}
