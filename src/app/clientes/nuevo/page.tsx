import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Aviso } from "@/componentes/aviso";
import { Pagina } from "@/componentes/pagina";
import { PorVisita } from "@/componentes/por-visita";
import { CLIENTE_NUEVO } from "@/servidor/clientes/esquema";
import { clienteConSesion } from "@/servidor/supabase/cliente";

import estilos from "../clientes.module.css";
import { FormularioCliente } from "../formulario";

export const metadata: Metadata = { title: "Nuevo cliente · Facturación CR" };

export default function PaginaNuevoCliente() {
  return (
    <Pagina
      titulo="Nuevo cliente"
      volver={{ href: "/clientes", texto: "Volver a clientes" }}
    >
      <Suspense fallback={<p className={estilos.texto}>Cargando…</p>}>
        <FormularioSiHayEmisor />
      </Suspense>
    </Pagina>
  );
}

// Un cliente cuelga de un emisor: quien todavía no creó el suyo no tiene dónde guardarlo.
async function FormularioSiHayEmisor() {
  const { supabase } = await clienteConSesion();

  // Las políticas RLS dejan ver solo el emisor propio.
  const { data: emisor, error } = await supabase
    .from("emisores")
    .select("id")
    .maybeSingle();
  if (error) {
    return (
      <Aviso>No se pudo cargar la página. Recárguela en un momento.</Aviso>
    );
  }
  if (!emisor) {
    return (
      <p className={estilos.texto}>
        Antes de guardar un cliente, complete los datos del emisor.{" "}
        <Link href="/emisor">Crear el emisor</Link>
      </p>
    );
  }

  return (
    <PorVisita>
      <FormularioCliente inicial={CLIENTE_NUEVO} />
    </PorVisita>
  );
}
