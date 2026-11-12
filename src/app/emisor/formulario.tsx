"use client";

import { type FormEvent, useActionState, useState, useTransition } from "react";

import { Boton } from "@/componentes/boton";
import { Campo } from "@/componentes/campo";
import { Seleccion } from "@/componentes/seleccion";
import {
  TIPOS_DE_IDENTIFICACION,
  tipoDeIdentificacion,
} from "@/dominio/identificacion";
import type { Actividad, ConsultaDeActividades } from "@/hacienda/api-publica";
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
  type ErroresDelEmisor,
  type ValoresDelEmisor,
} from "@/servidor/emisor/esquema";

import estilos from "./emisor.module.css";

const SIN_ENVIAR: EstadoDelEmisor = {};

const OPCIONES_DE_TIPO = TIPOS_DE_IDENTIFICACION.map((tipo) => ({
  valor: tipo.codigo,
  texto: tipo.nombre,
}));

export function FormularioEmisor({ inicial }: { inicial: ValoresDelEmisor }) {
  const [valores, setValores] = useState(inicial);
  const [estado, enviar, guardando] = useActionState(guardarEmisor, SIN_ENVIAR);
  // Errores de la revisión que se hace en el navegador. Mientras haya, tapan los
  // que devolvió el servidor en el envío anterior.
  const [erroresLocales, setErroresLocales] = useState<ErroresDelEmisor | null>(
    null,
  );
  // Campos cambiados desde el último envío: su error ya no habla de lo que hay escrito.
  const [cambiados, setCambiados] = useState<ReadonlySet<CampoDelEmisor>>(
    () => new Set(),
  );
  const [consulta, setConsulta] = useState<ConsultaDeActividades | null>(null);
  const [consultando, iniciarConsulta] = useTransition();

  const erroresDelEnvio = erroresLocales ?? estado.errores ?? {};
  const errorDe = (campo: CampoDelEmisor) =>
    cambiados.has(campo) ? undefined : erroresDelEnvio[campo];
  const sinCambios = cambiados.size === 0;
  const tipo = tipoDeIdentificacion(valores.tipo_identificacion);
  const actividades = consulta?.ok ? consulta.actividades : [];

  function cambiar(campo: CampoDelEmisor, valor: string) {
    setValores((actuales) => ({ ...actuales, [campo]: valor }));
    setCambiados((anteriores) => {
      const ahora = new Set(anteriores).add(campo);
      // La regla del número depende del tipo.
      return campo === "tipo_identificacion"
        ? ahora.add("numero_identificacion")
        : ahora;
    });
    // Las actividades son de la identificación consultada: si cambia, ya no valen.
    if (campo === "tipo_identificacion" || campo === "numero_identificacion") {
      setConsulta(null);
    }
  }

  // La misma revisión que hace el servidor, antes de enviar.
  function revisarAntesDeEnviar(evento: FormEvent<HTMLFormElement>) {
    const revision = revisarEmisor(
      valoresDelFormulario(new FormData(evento.currentTarget)),
    );
    setErroresLocales(revision.ok ? null : revision.errores);
    setCambiados(new Set());
    if (!revision.ok) {
      evento.preventDefault();
    }
  }

  function consultar() {
    const numero = valores.numero_identificacion.trim();
    const error = errorDelNumero(valores.tipo_identificacion, numero);
    if (error) {
      setErroresLocales({ ...erroresDelEnvio, numero_identificacion: error });
      setCambiados((anteriores) => {
        const ahora = new Set(anteriores);
        ahora.delete("numero_identificacion");
        return ahora;
      });
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
        setValores((actuales) =>
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
      onSubmit={revisarAntesDeEnviar}
      noValidate
      className={estilos.formulario}
    >
      <fieldset className={estilos.grupo}>
        <legend className={estilos.leyenda}>Identificación</legend>
        <div className={estilos.campos}>
          <Seleccion
            id="tipo_identificacion"
            name="tipo_identificacion"
            etiqueta="Tipo de identificación"
            opciones={OPCIONES_DE_TIPO}
            value={valores.tipo_identificacion}
            onChange={(evento) =>
              cambiar("tipo_identificacion", evento.target.value)
            }
          />
          <Campo
            id="numero_identificacion"
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

      <fieldset className={estilos.grupo}>
        <legend className={estilos.leyenda}>Nombre y correo</legend>
        <div className={estilos.campos}>
          <Campo
            id="nombre"
            name="nombre"
            etiqueta="Nombre"
            autoComplete="name"
            ayuda="Como está inscrito en Hacienda"
            value={valores.nombre}
            onChange={(evento) => cambiar("nombre", evento.target.value)}
            error={errorDe("nombre")}
          />
          <Campo
            id="correo"
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

      <fieldset className={estilos.grupo}>
        <legend className={estilos.leyenda}>Actividad económica</legend>
        <div className={estilos.campos}>
          <ListaDeActividades
            actividades={actividades}
            elegida={valores.actividad_economica}
            alElegir={(codigo) => cambiar("actividad_economica", codigo)}
          />
          <Campo
            id="actividad_economica"
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

      <fieldset className={estilos.grupo}>
        <legend className={estilos.leyenda}>Numeración</legend>
        <div className={estilos.campos}>
          <div className={estilos.dos}>
            <Campo
              id="sucursal"
              name="sucursal"
              etiqueta="Sucursal"
              inputMode="numeric"
              autoComplete="off"
              value={valores.sucursal}
              onChange={(evento) => cambiar("sucursal", evento.target.value)}
              error={errorDe("sucursal")}
            />
            <Campo
              id="terminal"
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

      <div className={estilos.pie}>
        <Boton type="submit" variante="principal" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar emisor"}
        </Boton>
        <div role="status">
          {estado.guardado && sinCambios && !erroresLocales ? (
            <p className={estilos.guardado}>Emisor guardado</p>
          ) : null}
        </div>
      </div>
      {estado.error && sinCambios ? (
        <p className={estilos.aviso} role="alert">
          {estado.error}
        </p>
      ) : null}
    </form>
  );
}

/** Las actividades que devolvió Hacienda. Elegir una llena el código de actividad. */
function ListaDeActividades({
  actividades,
  elegida,
  alElegir,
}: {
  actividades: Actividad[];
  elegida: string;
  alElegir: (codigo: string) => void;
}) {
  if (actividades.length === 0) {
    return null;
  }
  return (
    <div
      className={estilos.actividades}
      role="group"
      aria-label="Actividades inscritas en Hacienda"
    >
      {actividades.map((actividad) => {
        const esLaElegida = actividad.codigo === elegida;
        return (
          <button
            key={actividad.codigo}
            type="button"
            className={estilos.actividad}
            aria-pressed={esLaElegida}
            onClick={() => alElegir(actividad.codigo)}
          >
            <span className={estilos.codigo}>{actividad.codigo}</span>
            <span className={estilos.descripcion}>{actividad.descripcion}</span>
            <span className={estilos.nota}>
              {esLaElegida
                ? "Elegida"
                : actividad.principal
                  ? "Principal"
                  : "Secundaria"}
            </span>
          </button>
        );
      })}
    </div>
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
