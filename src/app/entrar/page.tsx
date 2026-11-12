import type { Metadata } from "next";
import { Suspense } from "react";

import { FormularioEntrar } from "./formulario";

export const metadata: Metadata = { title: "Entrar a Facturación CR" };

type Parametros = PageProps<"/entrar">["searchParams"];

export default function PaginaEntrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <main>
      <h1>Entrar a Facturación CR</h1>
      <p>Escriba su correo y le llega un enlace para entrar, sin contraseña.</p>
      <Suspense>
        <AvisoDeEnlace parametros={searchParams} />
      </Suspense>
      <FormularioEntrar />
    </main>
  );
}

// Los parámetros de la URL se conocen en cada solicitud; por eso va dentro de <Suspense>.
async function AvisoDeEnlace({ parametros }: { parametros: Parametros }) {
  const { error } = await parametros;
  if (error !== "enlace") {
    return null;
  }
  return <p role="alert">Ese enlace venció o ya se usó. Pida uno nuevo.</p>;
}
