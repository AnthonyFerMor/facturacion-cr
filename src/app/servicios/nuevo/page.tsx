import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Aviso } from "@/componentes/aviso";
import { Pagina } from "@/componentes/pagina";
import { PorVisita } from "@/componentes/por-visita";
import { SERVICIO_NUEVO } from "@/servidor/servicios/esquema";
import { clienteConSesion } from "@/servidor/supabase/cliente";

import { FormularioServicio } from "../formulario";
import estilos from "../servicios.module.css";

export const metadata: Metadata = { title: "Nuevo servicio · Facturación CR" };

export default function PaginaNuevoServicio() {
  return (
    <Pagina
      titulo="Nuevo servicio"
      volver={{ href: "/servicios", texto: "Volver a servicios" }}
    >
      <Suspense fallback={<p className={estilos.texto}>Cargando…</p>}>
        <FormularioSiHayEmisor />
      </Suspense>
    </Pagina>
  );
}

// Un servicio cuelga de un emisor: quien todavía no creó el suyo no tiene dónde guardarlo.
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
        Antes de guardar un servicio, complete los datos del emisor.{" "}
        <Link href="/emisor">Crear el emisor</Link>
      </p>
    );
  }

  return (
    <PorVisita>
      <FormularioServicio inicial={SERVICIO_NUEVO} />
    </PorVisita>
  );
}
