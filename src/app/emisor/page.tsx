import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Aviso } from "@/componentes/aviso";
import { Pagina } from "@/componentes/pagina";
import { PorVisita } from "@/componentes/por-visita";
import { EMISOR_NUEVO, type ValoresDelEmisor } from "@/servidor/emisor/esquema";
import { crearClienteSupabase } from "@/servidor/supabase/cliente";

import estilos from "./emisor.module.css";
import { FormularioEmisor } from "./formulario";

export const metadata: Metadata = { title: "Emisor · Facturación CR" };

const COLUMNAS =
  "tipo_identificacion, numero_identificacion, nombre, correo, actividad_economica, sucursal, terminal";

export default function PaginaEmisor() {
  return (
    <Pagina
      titulo="Emisor"
      descripcion="Estos datos salen en cada factura que emita"
    >
      <Suspense fallback={<p className={estilos.texto}>Cargando el emisor…</p>}>
        <EmisorGuardado />
      </Suspense>
    </Pagina>
  );
}

// Lee el emisor en cada solicitud; por eso va dentro de <Suspense>.
async function EmisorGuardado() {
  const supabase = await crearClienteSupabase();
  const { data: sesion } = await supabase.auth.getClaims();
  if (!sesion) {
    redirect("/entrar");
  }

  // Las políticas RLS dejan ver solo el emisor propio: no hace falta filtrar.
  const { data: emisor, error } = await supabase
    .from("emisores")
    .select(COLUMNAS)
    .maybeSingle();
  if (error) {
    return (
      <Aviso>
        No se pudo cargar el emisor. Recargue la página en un momento.
      </Aviso>
    );
  }

  // Quien todavía no tiene emisor empieza con el correo con el que entró.
  const inicial: ValoresDelEmisor = emisor ?? {
    ...EMISOR_NUEVO,
    correo: sesion.claims.email ?? "",
  };
  return (
    <PorVisita>
      <FormularioEmisor inicial={inicial} />
    </PorVisita>
  );
}
