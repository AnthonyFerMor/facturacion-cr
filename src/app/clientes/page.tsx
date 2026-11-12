import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Aviso } from "@/componentes/aviso";
import { EnlaceBoton } from "@/componentes/boton";
import { Listado } from "@/componentes/listado";
import { Pagina } from "@/componentes/pagina";
import { Tabla } from "@/componentes/tabla";
import { Vacio } from "@/componentes/vacio";
import { clienteConSesion } from "@/servidor/supabase/cliente";

import estilos from "./clientes.module.css";

export const metadata: Metadata = { title: "Clientes · Facturación CR" };

export default function PaginaClientes() {
  return (
    <Pagina
      titulo="Clientes"
      descripcion="Las personas y empresas del exterior a las que les factura"
    >
      <Suspense
        fallback={<p className={estilos.texto}>Cargando los clientes…</p>}
      >
        <ListaDeClientes />
      </Suspense>
    </Pagina>
  );
}

// Lee los clientes en cada solicitud; por eso va dentro de <Suspense>.
async function ListaDeClientes() {
  const { supabase } = await clienteConSesion();

  // Las políticas RLS dejan ver solo los clientes del emisor propio: no hace falta filtrar.
  const { data: clientes, error } = await supabase
    .from("clientes")
    .select("id, nombre, numero_identificacion, correo")
    .order("nombre");
  if (error) {
    return (
      <Aviso>
        No se pudieron cargar los clientes. Recargue la página en un momento.
      </Aviso>
    );
  }

  if (clientes.length === 0) {
    return (
      <Vacio titulo="Todavía no hay clientes">
        <p>
          Guarde acá a quien le factura fuera de Costa Rica. Sus datos salen en
          cada factura que le emita.
        </p>
        <EnlaceBoton href="/clientes/nuevo" variante="principal">
          Nuevo cliente
        </EnlaceBoton>
      </Vacio>
    );
  }

  return (
    <Listado
      accion={
        <EnlaceBoton href="/clientes/nuevo" variante="principal">
          Nuevo cliente
        </EnlaceBoton>
      }
    >
      <Tabla titulo="Clientes">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Identificación</th>
            <th>Correo</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((cliente) => (
            <tr key={cliente.id}>
              <td>
                <Link href={`/clientes/${cliente.id}`}>{cliente.nombre}</Link>
              </td>
              <td>{cliente.numero_identificacion}</td>
              <td>{cliente.correo}</td>
            </tr>
          ))}
        </tbody>
      </Tabla>
    </Listado>
  );
}
