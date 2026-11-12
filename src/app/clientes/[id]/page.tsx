import type { Metadata } from "next";
import { Suspense } from "react";

import { Aviso } from "@/componentes/aviso";
import { Pagina } from "@/componentes/pagina";
import { PorVisita } from "@/componentes/por-visita";
import { esIdDeCliente } from "@/servidor/clientes/esquema";
import { clienteConSesion } from "@/servidor/supabase/cliente";

import estilos from "../clientes.module.css";
import { FormularioCliente } from "../formulario";

export const metadata: Metadata = { title: "Editar cliente · Facturación CR" };

export default function PaginaEditarCliente({
  params,
}: PageProps<"/clientes/[id]">) {
  return (
    <Pagina
      titulo="Editar cliente"
      volver={{ href: "/clientes", texto: "Volver a clientes" }}
    >
      <Suspense
        fallback={<p className={estilos.texto}>Cargando el cliente…</p>}
      >
        <ClienteGuardado params={params} />
      </Suspense>
    </Pagina>
  );
}

// Lee el cliente en cada solicitud; por eso va dentro de <Suspense>.
async function ClienteGuardado({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase } = await clienteConSesion();
  if (!esIdDeCliente(id)) {
    return <NoExiste />;
  }

  // Las políticas RLS esconden los clientes de otro emisor: para quien pregunta, no existen.
  const { data: cliente, error } = await supabase
    .from("clientes")
    .select("nombre, numero_identificacion, correo, otras_senas")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    return (
      <Aviso>
        No se pudo cargar el cliente. Recargue la página en un momento.
      </Aviso>
    );
  }
  if (!cliente) {
    return <NoExiste />;
  }

  return (
    <PorVisita>
      <FormularioCliente
        id={id}
        inicial={{ ...cliente, otras_senas: cliente.otras_senas ?? "" }}
      />
    </PorVisita>
  );
}

function NoExiste() {
  return <Aviso>Ese cliente no existe. Vuelva a la lista de clientes.</Aviso>;
}
