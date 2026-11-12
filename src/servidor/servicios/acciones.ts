"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { esCabysDeServicio } from "@/dominio/cabys";
import { buscarEnCabys, type CodigoCabys } from "@/hacienda/api-publica";

import { esId } from "../formulario";
import { clienteConSesion } from "../supabase/cliente";
import {
  LARGO_MAXIMO_DE_BUSQUEDA,
  LARGO_MINIMO_DE_BUSQUEDA,
  revisarServicio,
  valoresDelFormulario,
  type ErroresDelServicio,
} from "./esquema";

export type EstadoDelServicio = {
  /** Errores que van junto a su campo. */
  errores?: ErroresDelServicio;
  /** Un error que no es de ningún campo. */
  error?: string;
};

// Código de Postgres cuando una política RLS no deja pasar la fila.
const SIN_PERMISO = "42501";

const NO_SE_GUARDO =
  "No se pudo guardar el servicio. Intente de nuevo en un momento.";
const YA_NO_EXISTE =
  "Ese servicio ya no existe. Vuelva a la lista de servicios.";

/**
 * Crea un servicio o, si llega un `id`, cambia ese. Cuando queda guardado lleva
 * a la lista de servicios.
 */
export async function guardarServicio(
  id: string | null,
  _anterior: EstadoDelServicio,
  datos: FormData,
): Promise<EstadoDelServicio> {
  const revision = revisarServicio(valoresDelFormulario(datos));
  if (!revision.ok) {
    return { errores: revision.errores };
  }

  const { supabase } = await clienteConSesion();

  if (id === null) {
    // El servicio no dice de qué emisor es: la base pone el del usuario.
    const { error } = await supabase
      .from("servicios")
      .insert(revision.servicio);
    if (error?.code === SIN_PERMISO) {
      // La política solo frena a quien todavía no tiene emisor.
      return {
        error: "Antes de guardar un servicio, complete los datos del emisor.",
      };
    }
    if (error) {
      console.error("No se pudo crear el servicio:", error.code);
      return { error: NO_SE_GUARDO };
    }
  } else {
    if (!esId(id)) {
      return { error: YA_NO_EXISTE };
    }
    // Las políticas RLS esconden los servicios de otro emisor: el cambio no
    // encuentra la fila y no devuelve ninguna.
    const { data, error } = await supabase
      .from("servicios")
      .update(revision.servicio)
      .eq("id", id)
      .select("id");
    if (error) {
      console.error("No se pudo cambiar el servicio:", error.code);
      return { error: NO_SE_GUARDO };
    }
    if (data.length === 0) {
      return { error: YA_NO_EXISTE };
    }
  }

  // El navegador guarda las pantallas ya visitadas. Sin esto, la lista o el
  // formulario de este servicio podrían volver a salir con los datos de antes.
  revalidatePath("/servicios", "layout");
  redirect("/servicios");
}

/** Cuántos códigos devuelve una búsqueda. Si hay más, la pantalla pide acotarla. */
const MAXIMO_DE_RESULTADOS = 10;

export type BusquedaDeServicios =
  | { ok: true; resultados: CodigoCabys[]; total: number }
  | { ok: false; motivo: "sin-respuesta" };

/**
 * Busca en el catálogo CAByS de Hacienda, por palabras o por código, y devuelve
 * solo los códigos de servicios: los de bienes no se pueden guardar en un servicio
 * (decisión 0013).
 */
export async function buscarCabys(texto: string): Promise<BusquedaDeServicios> {
  await clienteConSesion();
  const consulta = texto.trim();
  // Sin estos límites, la acción serviría para mandarle cualquier texto a la API.
  if (
    consulta.length < LARGO_MINIMO_DE_BUSQUEDA ||
    consulta.length > LARGO_MAXIMO_DE_BUSQUEDA
  ) {
    return { ok: true, resultados: [], total: 0 };
  }

  const busqueda = await buscarEnCabys(consulta);
  if (!busqueda.ok) {
    return busqueda;
  }
  const servicios = busqueda.resultados.filter((resultado) =>
    esCabysDeServicio(resultado.codigo),
  );
  return {
    ok: true,
    resultados: servicios.slice(0, MAXIMO_DE_RESULTADOS),
    total: servicios.length,
  };
}
