import estilos from "./opciones.module.css";

export type Opcion = {
  /** Lo que recibe `alElegir`. */
  valor: string;
  codigo: string;
  descripcion: string;
  /** Un texto corto a la derecha, como «Principal» o «Elegido». */
  nota?: string;
};

/**
 * Opciones que se eligen con un botón cada una, también con el teclado. La elegida
 * queda marcada con `aria-pressed` y con el borde; su nota lo dice con texto.
 */
export function Opciones({
  etiqueta,
  opciones,
  elegida,
  alElegir,
}: {
  /** El nombre del grupo para los lectores de pantalla. */
  etiqueta: string;
  opciones: readonly Opcion[];
  elegida: string;
  alElegir: (valor: string) => void;
}) {
  if (opciones.length === 0) {
    return null;
  }
  return (
    <div className={estilos.opciones} role="group" aria-label={etiqueta}>
      {opciones.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          className={estilos.opcion}
          aria-pressed={opcion.valor === elegida}
          onClick={() => alElegir(opcion.valor)}
        >
          <span className={estilos.codigo}>{opcion.codigo}</span>
          <span className={estilos.descripcion}>{opcion.descripcion}</span>
          {opcion.nota ? (
            <span className={estilos.nota}>{opcion.nota}</span>
          ) : null}
        </button>
      ))}
    </div>
  );
}
