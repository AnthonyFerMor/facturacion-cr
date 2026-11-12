"use client";

import { useActionState, useState, useTransition } from "react";

import { Aviso } from "@/componentes/aviso";
import { Boton } from "@/componentes/boton";
import { Campo } from "@/componentes/campo";
import forma from "@/componentes/formulario.module.css";
import { Opciones } from "@/componentes/opciones";
import { Seleccion } from "@/componentes/seleccion";
import { useFormulario } from "@/componentes/use-formulario";
import {
  TIPOS_DE_IDENTIFICACION,
  tipoDeIdentificacion,
} from "@/dominio/identificacion";
import type { ConsultaDeActividades } from "@/hacienda/api-publica";
import {
  buscarActividades,
  guardarEmisor,
  type EstadoDelEmisor,
} from "@/servidor/emisor/acciones";
import {
  errorDelNumero,
  revisarEmisor,
  valoresDelFormulario,
  type CampoDelEmisor,
  type ValoresDelEmisor,
} from "@/servidor/emisor/esquema";

import estilos from "./emisor.module.css";

const SIN_ENVIAR: EstadoDelEmisor = {};

const OPCIONES_DE_TIPO = TIPOS_DE_IDENTIFICACION.map((tipo) => ({
  valor: tipo.codigo,
  texto: tipo.nombre,
}));

// La misma revisión que hace el servidor, antes de enviar.
function erroresDelFormulario(datos: FormData) {
  const revision = revisarEmisor(valoresDelFormulario(datos));
  return revision.ok ? null : revision.errores;
}

export function FormularioEmisor({ inicial }: { inicial: ValoresDelEmisor }) {
  const [estado, enviar, guardando] = useActionState(guardarEmisor, SIN_ENVIAR);
  const formulario = useFormulario({
    inicial,
    revisar: erroresDelFormulario,
    erroresDelServidor: estado.errores,
  });
  const [consulta, setConsulta] = useState<ConsultaDeActividades | null>(null);
  const [consultando, iniciarConsulta] = useTransition();

  const { valores, errorDe, respuestaVigente } = formulario;
  const tipo = tipoDeIdentificacion(valores.tipo_identificacion);
  const actividades = consulta?.ok ? consulta.actividades : [];

  function cambiar(campo: CampoDelEmisor, valor: string) {
    if (campo === "tipo_identificacion") {
      // La regla del número depende del tipo.
      formulario.cambiar(campo, valor, "numero_identificacion");
    } else {
      formulario.cambiar(campo, valor);
    }
    // Las actividades son de la identificación consultada: si cambia, ya no valen.
    if (campo === "tipo_identificacion" || campo === "numero_identificacion") {
      setConsulta(null);
    }
  }

  function consultar() {
    const numero = valores.numero_identificacion.trim();
    const error = errorDelNumero(valores.tipo_identificacion, numero);
    if (error) {
      formulario.marcarError("numero_identificacion", error);
      return;
    }
    iniciarConsulta(async () => {
      const resultado = await buscarActividades(
        valores.tipo_identificacion,
        numero,
      );
      setConsulta(resultado);
      if (resultado.ok) {
        // El nombre de Hacienda sirve de punto de partida si todavía no hay uno.
        formulario.ponerValores((actuales) =>
          actuales.nombre
            ? actuales
            : { ...actuales, nombre: resultado.nombre },
        );
      }
    });
  }

  return (
    <form
      action={enviar}
      onSubmit={formulario.alEnviar}
      noValidate
      className={forma.formulario}
    >
      <fieldset className={forma.grupo}>
        <legend className={forma.leyenda}>Identificación</legend>
        <div className={forma.campos}>
          <Seleccion
            name="tipo_identificacion"
            etiqueta="Tipo de identificación"
            opciones={OPCIONES_DE_TIPO}
            value={valores.tipo_identificacion}
            onChange={(evento) =>
              cambiar("tipo_identificacion", evento.target.value)
            }
          />
          <Campo
            name="numero_identificacion"
            etiqueta="Número"
            inputMode="numeric"
            autoComplete="off"
            ayuda={tipo?.formato}
            value={valores.numero_identificacion}
            onChange={(evento) =>
              cambiar("numero_identificacion", evento.target.value)
            }
            error={errorDe("numero_identificacion")}
          />
          <div className={estilos.consulta}>
            <Boton onClick={consultar} disabled={consultando}>
              {consultando ? "Consultando…" : "Consultar en Hacienda"}
            </Boton>
            <div aria-live="polite">
              <ResultadoDeLaConsulta consulta={consulta} />
            </div>
          </div>
        </div>
      </fieldset>

      <fieldset className={forma.grupo}>
        <legend className={forma.leyenda}>Nombre y correo</legend>
        <div className={forma.campos}>
          <Campo
            name="nombre"
            etiqueta="Nombre"
            autoComplete="name"
            ayuda="Como está inscrito en Hacienda"
            value={valores.nombre}
            onChange={(evento) => cambiar("nombre", evento.target.value)}
            error={errorDe("nombre")}
          />
          <Campo
            name="correo"
            etiqueta="Correo"
            type="email"
            autoComplete="email"
            ayuda="Va en la factura como el correo de quien emite"
            value={valores.correo}
            onChange={(evento) => cambiar("correo", evento.target.value)}
            error={errorDe("correo")}
          />
        </div>
      </fieldset>

      <fieldset className={forma.grupo}>
        <legend className={forma.leyenda}>Actividad económica</legend>
        <div className={forma.campos}>
          {/* Las actividades que devolvió Hacienda. Elegir una llena el código. */}
          <Opciones
            etiqueta="Actividades inscritas en Hacienda"
            opciones={actividades.map((actividad) => ({
              valor: actividad.codigo,
              codigo: actividad.codigo,
              descripcion: actividad.descripcion,
              nota:
                actividad.codigo === valores.actividad_economica
                  ? "Elegida"
                  : actividad.principal
                    ? "Principal"
                    : "Secundaria",
            }))}
            elegida={valores.actividad_economica}
            alElegir={(codigo) => cambiar("actividad_economica", codigo)}
          />
          <Campo
            name="actividad_economica"
            etiqueta="Código de actividad"
            autoComplete="off"
            ayuda="6 caracteres, como 6201.0"
            value={valores.actividad_economica}
            onChange={(evento) =>
              cambiar("actividad_economica", evento.target.value)
            }
            error={errorDe("actividad_economica")}
          />
        </div>
      </fieldset>

      <fieldset className={forma.grupo}>
        <legend className={forma.leyenda}>Numeración</legend>
        <div className={forma.campos}>
          <div className={forma.dos}>
            <Campo
              name="sucursal"
              etiqueta="Sucursal"
              inputMode="numeric"
              autoComplete="off"
              value={valores.sucursal}
              onChange={(evento) => cambiar("sucursal", evento.target.value)}
              error={errorDe("sucursal")}
            />
            <Campo
              name="terminal"
              etiqueta="Terminal"
              inputMode="numeric"
              autoComplete="off"
              value={valores.terminal}
              onChange={(evento) => cambiar("terminal", evento.target.value)}
              error={errorDe("terminal")}
            />
          </div>
          <p className={estilos.ayuda}>
            Con estos dígitos empieza el número de cada factura. Con una sola
            oficina van 001 y 00001.
          </p>
        </div>
      </fieldset>

      <div className={forma.pie}>
        <Boton type="submit" variante="principal" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar emisor"}
        </Boton>
        <div role="status">
          {estado.guardado && respuestaVigente ? (
            <p className={estilos.guardado}>Emisor guardado</p>
          ) : null}
        </div>
      </div>
      {estado.error && respuestaVigente ? <Aviso>{estado.error}</Aviso> : null}
    </form>
  );
}

function ResultadoDeLaConsulta({
  consulta,
}: {
  consulta: ConsultaDeActividades | null;
}) {
  if (!consulta) {
    return null;
  }
  if (!consulta.ok) {
    return (
      <p className={estilos.texto}>
        {consulta.motivo === "no-inscrita"
          ? "Hacienda no tiene inscrita esa identificación. Revise el número, o escriba el código de la actividad a mano."
          : "Hacienda no respondió. Puede escribir el código de la actividad a mano y consultar más tarde."}
      </p>
    );
  }
  return (
    <p className={estilos.texto}>
      Inscrita en Hacienda como {consulta.nombre}.{" "}
      {consulta.actividades.length > 0
        ? "Elija la actividad más abajo."
        : "No tiene actividades activas: escriba el código a mano."}
    </p>
  );
}
