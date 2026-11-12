import { z } from "zod";

import { PATRON_CABYS } from "@/dominio/cabys";

// Consultas a la API pública de Hacienda (https://api.hacienda.go.cr/docs).
// Hacienda bloquea la IP diez minutos si se pasa el límite de solicitudes, y la API
// a veces no contesta: quien llama tiene que poder seguir sin la respuesta.

const ORIGEN = process.env.HACIENDA_API_URL ?? "https://api.hacienda.go.cr";
const ESPERA_MAXIMA_MS = 5000;
// Valores vistos en las respuestas de `/fe/ae`: estado «A» en las actividades
// activas y tipo «P» en la principal («S» en las secundarias).
const ACTIVIDAD_ACTIVA = "A";
const ACTIVIDAD_PRINCIPAL = "P";

/** Pide una ruta de la API. Devuelve `null` si Hacienda no contesta a tiempo. */
async function pedir(ruta: string): Promise<Response | null> {
  try {
    return await fetch(`${ORIGEN}${ruta}`, {
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
    });
  } catch {
    return null;
  }
}

// Hacienda manda algunas descripciones con espacios repetidos.
const limpiar = (descripcion: string) =>
  descripcion.replace(/\s+/g, " ").trim();

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
  const respuesta = await pedir(
    `/fe/ae?identificacion=${encodeURIComponent(identificacion)}`,
  );
  if (!respuesta) {
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
      descripcion: limpiar(actividad.descripcion),
      principal: actividad.tipo === ACTIVIDAD_PRINCIPAL,
    }))
    .sort((a, b) => Number(b.principal) - Number(a.principal));

  return { ok: true, nombre: datos.data.nombre.trim(), actividades };
}

export type CodigoCabys = { codigo: string; descripcion: string };

export type BusquedaEnCabys =
  | { ok: true; resultados: CodigoCabys[] }
  | { ok: false; motivo: "sin-respuesta" };

const esquemaCodigoCabys = z.object({
  codigo: z.string(),
  descripcion: z.string(),
});
// Por texto, `/fe/cabys` devuelve los códigos dentro de `cabys`; por código, la lista
// sola. Sin resultados responde 200 con la lista vacía, no 404.
const esquemaBusquedaPorTexto = z
  .object({ cabys: z.array(esquemaCodigoCabys) })
  .transform((datos) => datos.cabys);
const esquemaBusquedaPorCodigo = z.array(esquemaCodigoCabys);

/**
 * Busca en el catálogo CAByS: por código si recibe 13 dígitos y, si no, por las
 * palabras de la descripción.
 */
export async function buscarEnCabys(texto: string): Promise<BusquedaEnCabys> {
  const porCodigo = PATRON_CABYS.test(texto);
  const respuesta = await pedir(
    porCodigo
      ? `/fe/cabys?codigo=${texto}`
      : `/fe/cabys?q=${encodeURIComponent(texto)}`,
  );
  if (!respuesta?.ok) {
    return { ok: false, motivo: "sin-respuesta" };
  }

  const esquema = porCodigo
    ? esquemaBusquedaPorCodigo
    : esquemaBusquedaPorTexto;
  const datos = esquema.safeParse(await respuesta.json().catch(() => null));
  if (!datos.success) {
    return { ok: false, motivo: "sin-respuesta" };
  }

  return {
    ok: true,
    resultados: datos.data.map((resultado) => ({
      codigo: resultado.codigo,
      descripcion: limpiar(resultado.descripcion),
    })),
  };
}
