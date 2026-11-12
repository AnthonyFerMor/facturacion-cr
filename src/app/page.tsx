import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Boton } from "@/componentes/boton";
import { tipoDeIdentificacion } from "@/dominio/identificacion";
import { salir } from "@/servidor/sesion";
import { crearClienteSupabase } from "@/servidor/supabase/cliente";

import estilos from "./inicio.module.css";

export default function Inicio() {
  return (
    <main className={estilos.pagina}>
      <h1 className={estilos.marca}>Facturación CR</h1>
      <Suspense
        fallback={<p className={estilos.apagado}>Cargando la sesión…</p>}
      >
        <Sesion />
      </Suspense>
    </main>
  );
}

// Lee la sesión en cada solicitud; por eso va dentro de <Suspense>.
async function Sesion() {
  const supabase = await crearClienteSupabase();
  const { data } = await supabase.auth.getClaims();
  if (!data) {
    redirect("/entrar");
  }

  // Las políticas RLS dejan ver solo el emisor propio.
  const { data: emisor } = await supabase
    .from("emisores")
    .select("nombre, tipo_identificacion, numero_identificacion")
    .maybeSingle();

  return (
    <div className={estilos.sesion}>
      <p>Sesión iniciada como {data.claims.email}</p>
      {emisor ? (
        <>
          <p>
            Emisor: {emisor.nombre},{" "}
            {tipoDeIdentificacion(
              emisor.tipo_identificacion,
            )?.nombre.toLowerCase()}{" "}
            {emisor.numero_identificacion}.{" "}
            <Link href="/emisor">Editar el emisor</Link>
          </p>
          <p>
            <Link href="/clientes">Clientes</Link>
          </p>
          <p>
            <Link href="/servicios">Servicios</Link>
          </p>
        </>
      ) : (
        <p>
          Todavía no hay un emisor. <Link href="/emisor">Crear el emisor</Link>
        </p>
      )}
      <form action={salir}>
        <Boton type="submit">Salir</Boton>
      </form>
    </div>
  );
}
