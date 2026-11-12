"use server";

import { redirect } from "next/navigation";

import { numeroDeIdentificacionValido } from "@/dominio/identificacion";
import {
  consultarActividades,
  type ConsultaDeActividades,
} from "@/hacienda/api-publica";

import { crearClienteSupabase } from "../supabase/cliente";
import {
  revisarEmisor,
  valoresDelFormulario,
  type ErroresDelEmisor,
} from "./esquema";

export type EstadoDelEmisor = {
  guardado?: boolean;
  /** Errores que van junto a su campo. */
  errores?: ErroresDelEmisor;
  /** Un error que no es de ningún campo. */
  error?: string;
};

// Código de Postgres cuando un valor repite uno que tiene que ser único.
const VALOR_REPETIDO = "23505";

/**
 * Una acción se puede llamar desde cualquier ruta, también desde las públicas,
 * así que cada una comprueba la sesión por su cuenta.
 */
async function clienteConSesion() {
  const supabase = await crearClienteSupabase();
  const { data } = await supabase.auth.getClaims();
  if (!data) {
    redirect("/entrar");
  }
  return { supabase, usuario: data.claims.sub };
}

/** Crea el emisor del usuario o cambia el que ya tiene. */
export async function guardarEmisor(
  _anterior: EstadoDelEmisor,
  datos: FormData,
): Promise<EstadoDelEmisor> {
  const revision = revisarEmisor(valoresDelFormulario(datos));
  if (!revision.ok) {
    return { errores: revision.errores };
  }

  const { supabase, usuario } = await clienteConSesion();
  const { error } = await supabase
    .from("emisores")
    .upsert(
      { usuario_id: usuario, ...revision.emisor },
      { onConflict: "usuario_id" },
    );

  if (!error) {
    return { guardado: true };
  }
  // El usuario tiene un solo emisor y el guardado lo reemplaza, así que lo único
  // que puede repetirse es la identificación de otro emisor.
  if (error.code === VALOR_REPETIDO) {
    return {
      errores: {
        numero_identificacion: "Esa identificación ya es de otro emisor",
      },
    };
  }

  console.error("No se pudo guardar el emisor:", error.code);
  return {
    error: "No se pudo guardar el emisor. Intente de nuevo en un momento.",
  };
}

/** Busca en Hacienda las actividades económicas inscritas con una identificación. */
export async function buscarActividades(
  tipo: string,
  numero: string,
): Promise<ConsultaDeActividades> {
  await clienteConSesion();
  // Sin esta revisión, la acción serviría para mandar cualquier texto a la API.
  if (!numeroDeIdentificacionValido(tipo, numero)) {
    return { ok: false, motivo: "no-inscrita" };
  }
  return consultarActividades(numero);
}
