import type { Metadata } from "next";
import { Suspense } from "react";

import estilos from "./entrar.module.css";
import { FormularioEntrar } from "./formulario";

export const metadata: Metadata = { title: "Entrar a Facturación CR" };

type Parametros = PageProps<"/entrar">["searchParams"];

export default function PaginaEntrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <main className={estilos.pagina}>
      <div className={estilos.hoja}>
        <div className={estilos.membrete}>
          <p className={estilos.marca}>Facturación CR</p>
          <p className={estilos.descripcion}>
            Factura electrónica de exportación
          </p>
        </div>
        <FormularioEntrar>
          <Suspense>
            <AvisoDeEnlace parametros={searchParams} />
          </Suspense>
        </FormularioEntrar>
      </div>
    </main>
  );
}

// Los parámetros de la URL se conocen en cada solicitud; por eso va dentro de <Suspense>.
async function AvisoDeEnlace({ parametros }: { parametros: Parametros }) {
  const { error } = await parametros;
  if (error !== "enlace") {
    return null;
  }
  return (
    <p className={estilos.aviso} role="alert">
      Ese enlace venció o ya se usó. Pida uno nuevo.
    </p>
  );
}
