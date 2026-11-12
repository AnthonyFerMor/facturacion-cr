"use client";

import { useActionState } from "react";

import { Aviso } from "@/componentes/aviso";
import { Boton } from "@/componentes/boton";
import { AreaDeTexto, Campo } from "@/componentes/campo";
import forma from "@/componentes/formulario.module.css";
import { useFormulario } from "@/componentes/use-formulario";
import { EXTRANJERO_NO_DOMICILIADO } from "@/dominio/identificacion";
import {
  guardarCliente,
  type EstadoDelCliente,
} from "@/servidor/clientes/acciones";
import {
  revisarCliente,
  valoresDelFormulario,
  type ValoresDelCliente,
} from "@/servidor/clientes/esquema";

const SIN_ENVIAR: EstadoDelCliente = {};

// La misma revisión que hace el servidor, antes de enviar.
function erroresDelFormulario(datos: FormData) {
  const revision = revisarCliente(valoresDelFormulario(datos));
  return revision.ok ? null : revision.errores;
}

/** El formulario de un cliente. Con `id` cambia ese cliente; sin `id` crea uno. */
export function FormularioCliente({
  id = null,
  inicial,
}: {
  id?: string | null;
  inicial: ValoresDelCliente;
}) {
  const [estado, enviar, guardando] = useActionState(
    guardarCliente.bind(null, id),
    SIN_ENVIAR,
  );
  const { valores, cambiar, errorDe, respuestaVigente, alEnviar } =
    useFormulario({
      inicial,
      revisar: erroresDelFormulario,
      erroresDelServidor: estado.errores,
    });

  return (
    <form
      action={enviar}
      onSubmit={alEnviar}
      noValidate
      className={forma.formulario}
    >
      {/* Son los datos de otra persona: el navegador no tiene que proponer los propios. */}
      <div className={forma.campos}>
        <Campo
          name="nombre"
          etiqueta="Nombre"
          autoComplete="off"
          ayuda="El nombre o la razón social, como va a salir en la factura"
          value={valores.nombre}
          onChange={(evento) => cambiar("nombre", evento.target.value)}
          error={errorDe("nombre")}
        />
        <Campo
          name="numero_identificacion"
          etiqueta="Identificación"
          autoComplete="off"
          ayuda={`El número con que se identifica en su país: ${EXTRANJERO_NO_DOMICILIADO.formato}`}
          value={valores.numero_identificacion}
          onChange={(evento) =>
            cambiar("numero_identificacion", evento.target.value)
          }
          error={errorDe("numero_identificacion")}
        />
        <Campo
          name="correo"
          etiqueta="Correo"
          type="email"
          autoComplete="off"
          ayuda="A este correo se le envía cada factura"
          value={valores.correo}
          onChange={(evento) => cambiar("correo", evento.target.value)}
          error={errorDe("correo")}
        />
        <AreaDeTexto
          name="otras_senas"
          etiqueta="Dirección"
          autoComplete="off"
          ayuda="Opcional. La dirección en su país, como va a salir en la factura"
          value={valores.otras_senas}
          onChange={(evento) => cambiar("otras_senas", evento.target.value)}
          error={errorDe("otras_senas")}
        />
      </div>

      <div className={forma.pie}>
        <Boton type="submit" variante="principal" disabled={guardando}>
          {guardando ? "Guardando…" : "Guardar cliente"}
        </Boton>
      </div>
      {estado.error && respuestaVigente ? <Aviso>{estado.error}</Aviso> : null}
    </form>
  );
}
