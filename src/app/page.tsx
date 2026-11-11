import { redirect } from "next/navigation";
import { Suspense } from "react";

import { salir } from "@/servidor/sesion";
import { crearClienteSupabase } from "@/servidor/supabase/cliente";

export default function Inicio() {
  return (
    <main>
      <h1>Facturación CR</h1>
      <Suspense fallback={<p>Cargando la sesión…</p>}>
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
    <>
      <p>Sesión iniciada como {data.claims.email}.</p>
      <form action={salir}>
        <button type="submit">Salir</button>
      </form>
    </>
  );
}
