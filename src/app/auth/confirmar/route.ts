import { type NextRequest, NextResponse } from "next/server";

import { crearClienteSupabase } from "@/servidor/supabase/cliente";

/** Canjea el token del enlace del correo por una sesión. */
export async function GET(solicitud: NextRequest) {
  const token = solicitud.nextUrl.searchParams.get("token_hash");
  const tipo = solicitud.nextUrl.searchParams.get("type");

  if (token && tipo === "email") {
    const supabase = await crearClienteSupabase();
    const { error } = await supabase.auth.verifyOtp({
      type: "email",
      token_hash: token,
    });
    if (!error) {
      return NextResponse.redirect(new URL("/", solicitud.url));
    }
  }

  return NextResponse.redirect(new URL("/entrar?error=enlace", solicitud.url));
}
