import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { SUPABASE_LLAVE_PUBLICA, SUPABASE_URL } from "@/servidor/entorno";

const RUTAS_SIN_SESION = ["/entrar", "/auth/confirmar"];

/**
 * Corre antes de cada pantalla. Renueva la sesión si el token venció y manda
 * a /entrar a quien no tiene sesión.
 */
export async function proxy(solicitud: NextRequest) {
  let respuesta = NextResponse.next({ request: solicitud });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_LLAVE_PUBLICA, {
    cookies: {
      getAll: () => solicitud.cookies.getAll(),
      // Supabase llama a setAll cuando renueva el token. Las cookies nuevas van a la
      // solicitud, para que la pantalla las lea, y a la respuesta, para el navegador.
      setAll(nuevas, encabezados) {
        for (const { name, value } of nuevas) {
          solicitud.cookies.set(name, value);
        }
        respuesta = NextResponse.next({ request: solicitud });
        for (const { name, value, options } of nuevas) {
          respuesta.cookies.set(name, value, options);
        }
        // Una respuesta que lleva la sesión no se puede guardar en una caché compartida.
        for (const [nombre, valor] of Object.entries(encabezados)) {
          respuesta.headers.set(nombre, valor);
        }
      },
    },
  });

  // getClaims comprueba la firma del token. getSession solo leería la cookie,
  // y una cookie se puede falsificar.
  const { data } = await supabase.auth.getClaims();

  // La comparación es exacta: una ruta que solo empieza igual que una pública pide sesión.
  const pideSesion = !RUTAS_SIN_SESION.includes(solicitud.nextUrl.pathname);
  if (!data && pideSesion) {
    const destino = solicitud.nextUrl.clone();
    destino.pathname = "/entrar";
    destino.search = "";
    return conCookiesDe(respuesta, NextResponse.redirect(destino));
  }

  return respuesta;
}

/** Copia a otra respuesta las cookies y los encabezados de caché que dejó Supabase. */
function conCookiesDe(origen: NextResponse, destino: NextResponse) {
  for (const cookie of origen.cookies.getAll()) {
    destino.cookies.set(cookie);
  }
  for (const nombre of ["cache-control", "expires", "pragma"]) {
    const valor = origen.headers.get(nombre);
    if (valor) {
      destino.headers.set(nombre, valor);
    }
  }
  return destino;
}

export const config = {
  // Todo menos los archivos estáticos de Next.js y las imágenes.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
