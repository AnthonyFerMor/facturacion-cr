"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { crearClienteSupabase } from "./supabase/cliente";

export type EstadoEntrar =
  | { paso: "formulario"; correo: string; error?: string }
  | { paso: "enviado"; correo: string };

const esquemaCorreo = z.email();

// Supabase responde así cuando el correo no tiene cuenta y el registro está cerrado.
// La pantalla contesta igual que si hubiera enviado el enlace, para no revelar
// qué correos tienen cuenta.
const CODIGOS_SIN_CUENTA = new Set(["otp_disabled", "signup_disabled"]);

const CODIGOS_DE_LIMITE = new Set([
  "over_email_send_rate_limit",
  "over_request_rate_limit",
]);

export async function pedirEnlace(
  _anterior: EstadoEntrar,
  datos: FormData,
): Promise<EstadoEntrar> {
  const escrito = String(datos.get("correo") ?? "").trim();
  const correo = esquemaCorreo.safeParse(escrito);
  if (!correo.success) {
    return {
      paso: "formulario",
      correo: escrito,
      error: "Escriba un correo válido, como nombre@ejemplo.com.",
    };
  }

  const supabase = await crearClienteSupabase();
  const { error } = await supabase.auth.signInWithOtp({ email: correo.data });
  const codigo = error?.code ?? "";

  if (!error || CODIGOS_SIN_CUENTA.has(codigo)) {
    return { paso: "enviado", correo: correo.data };
  }
  if (CODIGOS_DE_LIMITE.has(codigo)) {
    return {
      paso: "formulario",
      correo: correo.data,
      error:
        "Ya se pidió un enlace hace poco. Espere un minuto y vuelva a intentar.",
    };
  }

  console.error(
    "No se pudo enviar el enlace de entrada:",
    codigo || error.name,
  );
  return {
    paso: "formulario",
    correo: correo.data,
    error: "No se pudo enviar el enlace. Intente de nuevo en un momento.",
  };
}

export async function salir() {
  const supabase = await crearClienteSupabase();
  await supabase.auth.signOut();
  redirect("/entrar");
}
