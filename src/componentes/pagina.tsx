import Link from "next/link";
import type { ReactNode } from "react";

import estilos from "./pagina.module.css";

/**
 * El marco de una pantalla con sesión: la marca, que lleva al inicio, el título
 * y, debajo, el contenido. `volver` es la pantalla de la que cuelga esta.
 */
export function Pagina({
  titulo,
  descripcion,
  volver,
  children,
}: {
  titulo: string;
  descripcion?: string;
  volver?: { href: string; texto: string };
  children: ReactNode;
}) {
  return (
    <main className={estilos.pagina}>
      <Link href="/" className={estilos.marca}>
        Facturación CR
      </Link>
      <div className={estilos.cabeza}>
        {volver ? (
          <Link href={volver.href} className={estilos.volver}>
            {volver.texto}
          </Link>
        ) : null}
        <h1 className={estilos.titulo}>{titulo}</h1>
        {descripcion ? (
          <p className={estilos.descripcion}>{descripcion}</p>
        ) : null}
      </div>
      {children}
    </main>
  );
}
