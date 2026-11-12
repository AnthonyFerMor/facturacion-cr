import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";

import { SUPABASE_LLAVE_PUBLICA, SUPABASE_URL } from "../entorno";
import type { Database } from "./tipos";

/**
 * Cliente de Supabase para componentes del servidor, acciones y rutas.
 * Actúa con la sesión que viene en las cookies, así que las políticas RLS aplican.
 * Se crea uno por solicitud.
 */
export async function crearClienteSupabase() {
  // Validar la sesión compara el vencimiento del token con la hora actual, así que
  // esto solo puede correr cuando llega una solicitud, nunca al prerenderizar.
  await connection();
  const almacen = await cookies();

  return createServerClient<Database>(SUPABASE_URL, SUPABASE_LLAVE_PUBLICA, {
    cookies: {
      getAll: () => almacen.getAll(),
      setAll(nuevas) {
        try {
          for (const { name, value, options } of nuevas) {
            almacen.set(name, value, options);
          }
        } catch {
          // Un componente del servidor no puede escribir cookies. No hace falta:
          // el proxy ya renovó la sesión antes de renderizar.
        }
      },
    },
  });
}
