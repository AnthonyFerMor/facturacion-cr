"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { esId } from "../formulario";
import { clienteConSesion } from "../supabase/cliente";
import {
  revisarCliente,
  valoresDelFormulario,
  type ErroresDelCliente,
} from "./esquema";

export type EstadoDelCliente = {
  /** Errores que van junto a su campo. */
  errores?: ErroresDelCliente;
  /** Un error que no es de ningún campo. */
  error?: string;
};

// Código de Postgres cuando una política RLS no deja pasar la fila.
const SIN_PERMISO = "42501";

const NO_SE_GUARDO =
  "No se pudo guardar el cliente. Intente de nuevo en un momento.";
const YA_NO_EXISTE = "Ese cliente ya no existe. Vuelva a la lista de clientes.";

/**
 * Crea un cliente o, si llega un `id`, cambia ese. Cuando queda guardado lleva
 * a la lista de clientes.
 */
export async function guardarCliente(
  id: string | null,
  _anterior: EstadoDelCliente,
  datos: FormData,
): Promise<EstadoDelCliente> {
  const revision = revisarCliente(valoresDelFormulario(datos));
  if (!revision.ok) {
    return { errores: revision.errores };
  }

  const { supabase } = await clienteConSesion();

  if (id === null) {
    // El cliente no dice de qué emisor es: la base pone el del usuario.
    const { error } = await supabase.from("clientes").insert(revision.cliente);
    if (error?.code === SIN_PERMISO) {
      // La política solo frena a quien todavía no tiene emisor.
      return {
        error: "Antes de guardar un cliente, complete los datos del emisor.",
      };
    }
    if (error) {
      console.error("No se pudo crear el cliente:", error.code);
      return { error: NO_SE_GUARDO };
    }
  } else {
    if (!esId(id)) {
      return { error: YA_NO_EXISTE };
    }
    // Las políticas RLS esconden los clientes de otro emisor: el cambio no
    // encuentra la fila y no devuelve ninguna.
    const { data, error } = await supabase
      .from("clientes")
      .update(revision.cliente)
      .eq("id", id)
      .select("id");
    if (error) {
      console.error("No se pudo cambiar el cliente:", error.code);
      return { error: NO_SE_GUARDO };
    }
    if (data.length === 0) {
      return { error: YA_NO_EXISTE };
    }
  }

  // El navegador guarda las pantallas ya visitadas. Sin esto, la lista o el
  // formulario de este cliente podrían volver a salir con los datos de antes.
  revalidatePath("/clientes", "layout");
  redirect("/clientes");
}
