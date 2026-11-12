"use client";

import { useActionState } from "react";

import { Aviso } from "@/componentes/aviso";
import { Boton } from "@/componentes/boton";
import { Campo } from "@/componentes/campo";
import forma from "@/componentes/formulario.module.css";
import { Seleccion } from "@/componentes/seleccion";
import { useFormulario } from "@/componentes/use-formulario";
import { MONEDAS } from "@/dominio/monedas";
import { UNIDADES_DE_SERVICIO } from "@/dominio/unidades-de-medida";
import type { CodigoCabys } from "@/hacienda/api-publica";
import {
  guardarServicio,
  type EstadoDelServicio,
} from "@/servidor/servicios/acciones";
import {
  LARGO_MAXIMO_DEL_DETALLE,
  revisarServicio,
  valoresDelFormulario,
  type ValoresDelServicio,
} from "@/servidor/servicios/esquema";

import { BusquedaDeCabys } from "./busqueda";

const SIN_ENVIAR: EstadoDelServicio = {};

const OPCIONES_DE_UNIDAD = UNIDADES_DE_SERVICIO.map((unidad) => ({
  valor: unidad.codigo,
  texto: `${unidad.nombre} (${unidad.codigo})`,
}));

const OPCIONES_DE_MONEDA = MONEDAS.map((moneda) => ({
  valor: moneda.codigo,
  texto: `${moneda.nombre} (${moneda.codigo})`,
}));

// La misma revisión que hace el servidor, antes de enviar.
function erroresDelFormulario(datos: FormData) {
  const revision = revisarServicio(valoresDelFormulario(datos));
  return revision.ok ? null : revision.errores;
}

/** El formulario de un servicio. Con `id` cambia ese servicio; sin `id` crea uno. */
export function FormularioServicio({
  id = null,
  inicial,
}: {
  id?: string | null;
  inicial: ValoresDelServicio;
}) {
  const [estado, enviar, guardando] = useActionState(
    guardarServicio.bind(null, id),
    SIN_ENVIAR,
  );
  const { valores, cambiar, errorDe, respuestaVigente, alEnviar } =
    useFormulario({
      inicial,
      revisar: erroresDelFormulario,
      erroresDelServidor: estado.errores,
    });

  function elegir(codigo: CodigoCabys) {
    cambiar("codigo_cabys", codigo.codigo);
    cambiar("descripcion_cabys", codigo.descripcion);
    // La descripción del catálogo sirve de punto de partida si todavía no hay detalle.
    if (!valores.detalle) {
      cambiar("detalle", codigo.descripcion.slice(0, LARGO_MAXIMO_DEL_DETALLE));
    }
  }

  return (
    <form
      action={enviar}
      onSubmit={alEnviar}
      noValidate
      className={forma.formulario}
    >
      <fieldset className={forma.grupo}>
        <legend className={forma.leyenda}>Código CAByS</legend>
        <div className={forma.campos}>
          <BusquedaDeCabys elegido={valores.codigo_cabys} alElegir={elegir} />
          <Campo
            name="codigo_cabys"
            etiqueta="Código"
            inputMode="numeric"
            autoComplete="off"
            ayuda="13 dígitos. Se llena al elegir un resultado; si Hacienda no responde, escríbalo"
            value={valores.codigo_cabys}
            onChange={(evento) => cambiar("codigo_cabys", evento.target.value)}
            error={errorDe("codigo_cabys")}
          />
          <Campo
            name="descripcion_cabys"
            etiqueta="Descripción del código"
            autoComplete="off"
            ayuda="La del catálogo de Hacienda"
            value={valores.descripcion_cabys}
            onChange={(evento) =>
              cambiar("descripcion_cabys", evento.target.value)
            }
            error={errorDe("descripcion_cabys")}
          />
        </div>
      </fieldset>

      <fieldset className={forma.grupo}>
        <legend className={forma.leyenda}>En la factura</legend>
        <div className={forma.campos}>
          <Campo
            name="detalle"
            etiqueta="Detalle"
            autoComplete="off"
            ayuda="Como sale en la línea de la factura"
            value={valores.detalle}
            onChange={(evento) => cambiar("detalle", evento.target.value)}
            error={errorDe("detalle")}
          />
          <Seleccion
            name="unidad_medida"
            etiqueta="Unidad de medida"
            opciones={OPCIONES_DE_UNIDAD}
            value={valores.unidad_medida}
            onChange={(evento) => cambiar("unidad_medida", evento.target.value)}
          />
          <div className={forma.dos}>
            <Campo
              name="precio_unitario"
              etiqueta="Precio unitario"
              inputMode="decimal"
              autoComplete="off"
              ayuda="Sin separador de miles, como 45,50"
              value={valores.precio_unitario}
              onChange={(evento) =>
                cambiar("precio_unitario", evento.target.value)
              }
              error={errorDe("precio_unitario")}
            />
            <Seleccion
              name="moneda"
              etiqueta="Moneda"
              opciones={OPCIONES_DE_MONEDA}
              value={valores.moneda}
              onChange={(evento) => cambiar("moneda", evento.target.value)}
            />
          </div>
        </div>
      </fieldset>

      <div className={forma.pie}>
        <Boton type="submit" variante="principal" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar servicio"}
        </Boton>
      </div>
      {estado.error && respuestaVigente ? <Aviso>{estado.error}</Aviso> : null}
    </form>
  );
}
