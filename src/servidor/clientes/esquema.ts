import { z } from "zod";

import { EXTRANJERO_NO_DOMICILIADO } from "@/dominio/identificacion";

import { erroresPorCampo, valoresDe } from "../formulario";

/** Los campos del formulario de un cliente, con el nombre de su columna. */
export const CAMPOS_DEL_CLIENTE = [
  "nombre",
  "numero_identificacion",
  "correo",
  "otras_senas",
] as const;

export type CampoDelCliente = (typeof CAMPOS_DEL_CLIENTE)[number];
export type ValoresDelCliente = Record<CampoDelCliente, string>;
export type ErroresDelCliente = Partial<Record<CampoDelCliente, string>>;

export const CLIENTE_NUEVO: ValoresDelCliente = {
  nombre: "",
  numero_identificacion: "",
  correo: "",
  otras_senas: "",
};

// Los largos salen del receptor de la factura de exportación en el XSD de la
// versión 4.4: Nombre de 3 a 100 caracteres, CorreoElectronico hasta 160 y
// OtrasSenasExtranjero de 5 a 300.
const esquemaCliente = z.object({
  nombre: z
    .string()
    .min(3, "Escriba el nombre, de 3 caracteres o más")
    .max(100, "El nombre admite hasta 100 caracteres"),
  numero_identificacion: z
    .string()
    .min(1, "Escriba la identificación del cliente")
    .regex(
      EXTRANJERO_NO_DOMICILIADO.patron,
      `La identificación lleva ${EXTRANJERO_NO_DOMICILIADO.formato}`,
    ),
  // El XSD no lo exige, pero a este correo se le entrega cada comprobante.
  correo: z
    .email("Escriba un correo válido, como nombre@ejemplo.com")
    .max(160, "El correo admite hasta 160 caracteres"),
  // La dirección es opcional. Vacía, se guarda como nulo y no va en el XML.
  otras_senas: z
    .string()
    .max(300, "La dirección admite hasta 300 caracteres")
    .refine(
      (texto) => texto === "" || texto.length >= 5,
      "Escriba la dirección con 5 caracteres o más, o deje el campo vacío",
    )
    .transform((texto) => texto || null),
});

export type Cliente = z.infer<typeof esquemaCliente>;

export type RevisionDelCliente =
  { ok: true; cliente: Cliente } | { ok: false; errores: ErroresDelCliente };

/**
 * Revisa los datos de un cliente. La usan el formulario, antes de enviar, y la
 * acción del servidor, antes de guardar: las dos pasan por el mismo esquema.
 */
export function revisarCliente(valores: ValoresDelCliente): RevisionDelCliente {
  const resultado = esquemaCliente.safeParse(valores);
  return resultado.success
    ? { ok: true, cliente: resultado.data }
    : { ok: false, errores: erroresPorCampo(resultado.error) };
}

/** Lee del formulario los campos del cliente, sin espacios a los lados. */
export function valoresDelFormulario(datos: FormData): ValoresDelCliente {
  return valoresDe(datos, CAMPOS_DEL_CLIENTE);
}
