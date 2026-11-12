import type { Metadata } from "next";
import { Suspense } from "react";

import { Aviso } from "@/componentes/aviso";
import { Pagina } from "@/componentes/pagina";
import { PorVisita } from "@/componentes/por-visita";
import { esId } from "@/servidor/formulario";
import { clienteConSesion } from "@/servidor/supabase/cliente";

import { FormularioServicio } from "../formulario";
import { precioParaEditar } from "../precio";
import estilos from "../servicios.module.css";

export const metadata: Metadata = { title: "Editar servicio · Facturación CR" };

export default function PaginaEditarServicio({
  params,
}: PageProps<"/servicios/[id]">) {
  return (
    <Pagina
      titulo="Editar servicio"
      volver={{ href: "/servicios", texto: "Volver a servicios" }}
    >
      <Suspense
        fallback={<p className={estilos.texto}>Cargando el servicio…</p>}
      >
        <ServicioGuardado params={params} />
      </Suspense>
    </Pagina>
  );
}

// Lee el servicio en cada solicitud; por eso va dentro de <Suspense>.
async function ServicioGuardado({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await clienteConSesion();
  if (!esId(id)) {
    return <NoExiste />;
  }

  // Las políticas RLS esconden los servicios de otro emisor: para quien pregunta, no existen.
  const { data: servicio, error } = await supabase
    .from("servicios")
    .select(
      "codigo_cabys, descripcion_cabys, detalle, unidad_medida, precio_unitario, moneda",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    return (
      <Aviso>
        No se pudo cargar el servicio. Recargue la página en un momento.
      </Aviso>
    );
  }
  if (!servicio) {
    return <NoExiste />;
  }

  return (
    <PorVisita>
      <FormularioServicio
        id={id}
        inicial={{
          ...servicio,
          precio_unitario: precioParaEditar(servicio.precio_unitario),
        }}
      />
    </PorVisita>
  );
}

function NoExiste() {
  return <Aviso>Ese servicio no existe. Vuelva a la lista de servicios.</Aviso>;
}
