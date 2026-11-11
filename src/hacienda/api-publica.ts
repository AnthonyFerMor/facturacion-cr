import { z } from "zod";

// Consultas a la API pública de Hacienda (https://api.hacienda.go.cr/docs).
// Hacienda bloquea la IP diez minutos si se pasa el límite de solicitudes, y la API
// a veces no contesta: quien llama tiene que poder seguir sin la respuesta.

const ORIGEN = process.env.HACIENDA_API_URL ?? "https://api.hacienda.go.cr";
const ESPERA_MAXIMA_MS = 5000;
// Valores vistos en las respuestas de `/fe/ae`: estado «A» en las actividades
// activas y tipo «P» en la principal («S» en las secundarias).
const ACTIVIDAD_ACTIVA = "A";
const ACTIVIDAD_PRINCIPAL = "P";

export type Actividad = {
  codigo: string;
  descripcion: string;
  principal: boolean;
};

export type ConsultaDeActividades =
  | { ok: true; nombre: string; actividades: Actividad[] }
  | { ok: false; motivo: "no-inscrita" | "sin-respuesta" };

const esquemaRespuesta = z.object({
  nombre: z.string(),
  actividades: z.array(
    z.object({
      estado: z.string(),
      tipo: z.string(),
      codigo: z.string(),
      descripcion: z.string(),
    }),
  ),
});

/**
 * Las actividades económicas activas que una identificación tiene inscritas en
 * Hacienda, con la principal primero.
 */
export async function consultarActividades(
  identificacion: string,
): Promise<ConsultaDeActividades> {
  let respuesta: Response;
  try {
    respuesta = await fetch(
      `${ORIGEN}/fe/ae?identificacion=${encodeURIComponent(identificacion)}`,
      { signal: AbortSignal.timeout(ESPERA_MAXIMA_MS) },
    );
  } catch {
    return { ok: false, motivo: "sin-respuesta" };
  }

  // 404: Hacienda no tiene esa identificación. 400: no le reconoce el formato.
  if (respuesta.status === 404 || respuesta.status === 400) {
    return { ok: false, motivo: "no-inscrita" };
  }
  if (!respuesta.ok) {
    return { ok: false, motivo: "sin-respuesta" };
  }

  const datos = esquemaRespuesta.safeParse(
    await respuesta.json().catch(() => null),
  );
  if (!datos.success) {
    return { ok: false, motivo: "sin-respuesta" };
  }

  const actividades = datos.data.actividades
    .filter((actividad) => actividad.estado === ACTIVIDAD_ACTIVA)
    .map((actividad) => ({
      codigo: actividad.codigo,
      // Hacienda manda algunas descripciones con espacios repetidos.
      descripcion: actividad.descripcion.replace(/\s+/g, " ").trim(),
      principal: actividad.tipo === ACTIVIDAD_PRINCIPAL,
    }))
    .sort((a, b) => Number(b.principal) - Number(a.principal));

  return { ok: true, nombre: datos.data.nombre.trim(), actividades };
}
