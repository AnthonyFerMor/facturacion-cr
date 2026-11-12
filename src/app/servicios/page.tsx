import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { Aviso } from "@/componentes/aviso";
import { EnlaceBoton } from "@/componentes/boton";
import { Listado } from "@/componentes/listado";
import { Pagina } from "@/componentes/pagina";
import { Tabla } from "@/componentes/tabla";
import { Vacio } from "@/componentes/vacio";
import { unidadDeServicio } from "@/dominio/unidades-de-medida";
import { clienteConSesion } from "@/servidor/supabase/cliente";

import { precioConMoneda } from "./precio";
import estilos from "./servicios.module.css";

export const metadata: Metadata = { title: "Servicios · Facturación CR" };

export default function PaginaServicios() {
  return (
    <Pagina
      titulo="Servicios"
      descripcion="Lo que factura, con su código CAByS, su unidad y su precio"
    >
      <Suspense
        fallback={<p className={estilos.texto}>Cargando los servicios…</p>}
      >
        <ListaDeServicios />
      </Suspense>
    </Pagina>
  );
}

// Lee los servicios en cada solicitud; por eso va dentro de <Suspense>.
async function ListaDeServicios() {
  const { supabase } = await clienteConSesion();

  // Las políticas RLS dejan ver solo los servicios del emisor propio: no hace falta filtrar.
  const { data: servicios, error } = await supabase
    .from("servicios")
    .select("id, detalle, codigo_cabys, unidad_medida, precio_unitario, moneda")
    .order("detalle");
  if (error) {
    return (
      <Aviso>
        No se pudieron cargar los servicios. Recargue la página en un momento.
      </Aviso>
    );
  }

  if (servicios.length === 0) {
    return (
      <Vacio titulo="Todavía no hay servicios">
        <p>
          Guarde acá lo que factura. El código CAByS, la unidad y el precio
          quedan listos para cada factura.
        </p>
        <EnlaceBoton href="/servicios/nuevo" variante="principal">
          Nuevo servicio
        </EnlaceBoton>
      </Vacio>
    );
  }

  return (
    <Listado
      accion={
        <EnlaceBoton href="/servicios/nuevo" variante="principal">
          Nuevo servicio
        </EnlaceBoton>
      }
    >
      <Tabla titulo="Servicios">
        <thead>
          <tr>
            <th>Detalle</th>
            <th>CAByS</th>
            <th>Unidad</th>
            <th data-alinear="derecha">Precio</th>
          </tr>
        </thead>
        <tbody>
          {servicios.map((servicio) => (
            <tr key={servicio.id}>
              <td>
                <Link href={`/servicios/${servicio.id}`}>
                  {servicio.detalle}
                </Link>
              </td>
              <td>{servicio.codigo_cabys}</td>
              <td>
                {unidadDeServicio(servicio.unidad_medida)?.nombre ??
                  servicio.unidad_medida}
              </td>
              <td data-alinear="derecha">
                {precioConMoneda(servicio.precio_unitario, servicio.moneda)}
              </td>
            </tr>
          ))}
        </tbody>
      </Tabla>
    </Listado>
  );
}
