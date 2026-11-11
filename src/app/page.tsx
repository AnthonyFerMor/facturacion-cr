import { redirect } from "next/navigation";
import { Suspense } from "react";

import { Boton } from "@/componentes/boton";
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

  return (
    <div className={estilos.sesion}>
      <p>Sesión iniciada como {data.claims.email}</p>
      <form action={salir}>
        <Boton type="submit">Salir</Boton>
      </form>
    </div>
  );
}
