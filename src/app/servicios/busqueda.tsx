"use client";

import { useEffect, useRef, useState, useTransition } from "react";

import { Campo } from "@/componentes/campo";
import { Opciones } from "@/componentes/opciones";
import type { CodigoCabys } from "@/hacienda/api-publica";
import {
  buscarCabys,
  type BusquedaDeServicios,
} from "@/servidor/servicios/acciones";
import { LARGO_MINIMO_DE_BUSQUEDA } from "@/servidor/servicios/esquema";

import estilos from "./servicios.module.css";

// Se busca cuando la persona deja de escribir y no en cada tecla: la API de Hacienda
// bloquea la IP diez minutos si recibe demasiadas consultas.
const ESPERA_ANTES_DE_BUSCAR_MS = 400;

type Respuesta = { consulta: string; busqueda: BusquedaDeServicios };

/**
 * Busca en el catálogo CAByS mientras se escribe. Elegir un resultado llena el
 * código y su descripción.
 */
export function BusquedaDeCabys({
  elegido,
  alElegir,
}: {
  /** El código que tiene el formulario. */
  elegido: string;
  alElegir: (codigo: CodigoCabys) => void;
}) {
  const [texto, setTexto] = useState("");
  const [respuesta, setRespuesta] = useState<Respuesta | null>(null);
  const [buscando, iniciarBusqueda] = useTransition();
  // La última consulta enviada: la respuesta de una anterior que llega tarde no la pisa.
  const ultima = useRef("");

  const consulta = texto.trim();
  const buscable = consulta.length >= LARGO_MINIMO_DE_BUSQUEDA;

  useEffect(() => {
    if (!buscable) {
      return;
    }
    const espera = setTimeout(() => {
      ultima.current = consulta;
      iniciarBusqueda(async () => {
        const busqueda = await buscarCabys(consulta);
        if (ultima.current === consulta) {
          setRespuesta({ consulta, busqueda });
        }
      });
    }, ESPERA_ANTES_DE_BUSCAR_MS);
    return () => clearTimeout(espera);
  }, [buscable, consulta]);

  const busqueda = buscable ? respuesta?.busqueda : undefined;
  const resultados = busqueda?.ok ? busqueda.resultados : [];

  function elegir(codigo: string) {
    const resultado = resultados.find((opcion) => opcion.codigo === codigo);
    if (resultado) {
      alElegir(resultado);
    }
  }

  return (
    <div className={estilos.busqueda}>
      <Campo
        etiqueta="Buscar en el catálogo CAByS"
        type="search"
        autoComplete="off"
        ayuda="Escriba 3 letras o más del servicio, o los 13 dígitos del código"
        value={texto}
        onChange={(evento) => setTexto(evento.target.value)}
        onKeyDown={(evento) => {
          // La búsqueda corre sola: Enter no tiene que enviar el formulario.
          if (evento.key === "Enter") {
            evento.preventDefault();
          }
        }}
      />
      <div aria-live="polite">
        {buscable ? (
          <p className={estilos.texto}>{mensaje(buscando, busqueda)}</p>
        ) : null}
      </div>
      <Opciones
        etiqueta="Resultados del catálogo CAByS"
        opciones={resultados.map((resultado) => ({
          valor: resultado.codigo,
          codigo: resultado.codigo,
          descripcion: resultado.descripcion,
          nota: resultado.codigo === elegido ? "Elegido" : undefined,
        }))}
        elegida={elegido}
        alElegir={elegir}
      />
    </div>
  );
}

function mensaje(
  buscando: boolean,
  busqueda: BusquedaDeServicios | undefined,
): string {
  if (buscando || !busqueda) {
    return "Buscando en el catálogo de Hacienda…";
  }
  if (!busqueda.ok) {
    return "Hacienda no respondió. Escriba el código y su descripción a mano.";
  }
  if (busqueda.total === 0) {
    return "No hay códigos de servicios con esas palabras. Pruebe con otras.";
  }
  if (busqueda.total > busqueda.resultados.length) {
    return `Hay ${busqueda.total} códigos de servicios. Se muestran los primeros ${busqueda.resultados.length}: agregue palabras para acotar la búsqueda.`;
  }
  return busqueda.total === 1
    ? "Un código de servicio. Elíjalo para llenar los campos."
    : `${busqueda.total} códigos de servicios. Elija uno para llenar los campos.`;
}
