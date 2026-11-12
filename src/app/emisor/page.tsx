import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { EMISOR_NUEVO, type ValoresDelEmisor } from "@/servidor/emisor/esquema";
import { crearClienteSupabase } from "@/servidor/supabase/cliente";

import estilos from "./emisor.module.css";
import { FormularioEmisor } from "./formulario";

export const metadata: Metadata = { title: "Emisor · Facturación CR" };

const COLUMNAS =
  "tipo_identificacion, numero_identificacion, nombre, correo, actividad_economica, sucursal, terminal";

export default function PaginaEmisor() {
  return (
    <main className={estilos.pagina}>
      <Link href="/" className={estilos.marca}>
        Facturación CR
      </Link>
      <div className={estilos.cabeza}>
        <h1 className={estilos.titulo}>Emisor</h1>
        <p className={estilos.texto}>
          Estos datos salen en cada factura que emita
        </p>
      </div>
      <Suspense fallback={<p className={estilos.texto}>Cargando el emisor…</p>}>
        <EmisorGuardado />
      </Suspense>
    </main>
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
      <p className={estilos.aviso} role="alert">
        No se pudo cargar el emisor. Recargue la página en un momento.
      </p>
    );
  }

  // Quien todavía no tiene emisor empieza con el correo con el que entró.
  const inicial: ValoresDelEmisor = emisor ?? {
    ...EMISOR_NUEVO,
    correo: sesion.claims.email ?? "",
  };
  return <FormularioEmisor inicial={inicial} />;
}
