import { z } from "zod";

import {
  numeroDeIdentificacionValido,
  tipoDeIdentificacion,
} from "@/dominio/identificacion";

/** Los campos del formulario del emisor, con el nombre de su columna. */
export const CAMPOS_DEL_EMISOR = [
  "tipo_identificacion",
  "numero_identificacion",
  "nombre",
  "correo",
  "actividad_economica",
  "sucursal",
  "terminal",
] as const;

export type CampoDelEmisor = (typeof CAMPOS_DEL_EMISOR)[number];
export type ValoresDelEmisor = Record<CampoDelEmisor, string>;
export type ErroresDelEmisor = Partial<Record<CampoDelEmisor, string>>;

/** Un emisor sin datos: la sucursal y la terminal de quien no tiene sucursales. */
export const EMISOR_NUEVO: ValoresDelEmisor = {
  tipo_identificacion: "01",
  numero_identificacion: "",
  nombre: "",
  correo: "",
  actividad_economica: "",
  sucursal: "001",
  terminal: "00001",
};

// Los largos salen del XSD de la versión 4.4: Nombre de 5 a 100 caracteres,
// CorreoElectronico hasta 160 y CodigoActividadEmisor de 6. La sucursal y la
// terminal son los primeros 3 y 5 dígitos del consecutivo.
const esquemaEmisor = z
  .object({
    tipo_identificacion: z.string(),
    numero_identificacion: z.string(),
    nombre: z
      .string()
      .min(5, "Escriba el nombre completo, de 5 caracteres o más")
      .max(100, "El nombre admite hasta 100 caracteres"),
    correo: z
      .email("Escriba un correo válido, como nombre@ejemplo.com")
      .max(160, "El correo admite hasta 160 caracteres"),
    actividad_economica: z
      .string()
      .regex(
        /^\S{6}$/,
        "El código de actividad tiene 6 caracteres, como 6201.0",
      ),
    sucursal: z
      .string()
      .regex(/^\d{3}$/, "La sucursal son 3 dígitos, como 001"),
    terminal: z
      .string()
      .regex(/^\d{5}$/, "La terminal son 5 dígitos, como 00001"),
  })
  .superRefine((emisor, contexto) => {
    const tipo = tipoDeIdentificacion(emisor.tipo_identificacion);
    if (!tipo) {
      contexto.addIssue({
        code: "custom",
        path: ["tipo_identificacion"],
        message: "Elija el tipo de identificación",
      });
      return;
    }
    const error = errorDelNumero(tipo.codigo, emisor.numero_identificacion);
    if (error) {
      contexto.addIssue({
        code: "custom",
        path: ["numero_identificacion"],
        message: error,
      });
    }
  });

/** El error del número de identificación para su tipo, o `undefined` si cumple. */
export function errorDelNumero(
  codigoDeTipo: string,
  numero: string,
): string | undefined {
  if (numeroDeIdentificacionValido(codigoDeTipo, numero)) {
    return undefined;
  }
  return `Revise el número: son ${tipoDeIdentificacion(codigoDeTipo)?.formato}`;
}

export type Emisor = z.infer<typeof esquemaEmisor>;

export type RevisionDelEmisor =
  { ok: true; emisor: Emisor } | { ok: false; errores: ErroresDelEmisor };

/**
 * Revisa los datos del emisor. La usan el formulario, antes de enviar, y la
 * acción del servidor, antes de guardar: las dos pasan por el mismo esquema.
 */
export function revisarEmisor(valores: ValoresDelEmisor): RevisionDelEmisor {
  const resultado = esquemaEmisor.safeParse(valores);
  if (resultado.success) {
    return { ok: true, emisor: resultado.data };
  }
  const errores: ErroresDelEmisor = {};
  for (const problema of resultado.error.issues) {
    const campo = problema.path[0] as CampoDelEmisor;
    // Se muestra un error por campo: el primero.
    errores[campo] ??= problema.message;
  }
  return { ok: false, errores };
}

/** Lee del formulario los campos del emisor, sin espacios a los lados. */
export function valoresDelFormulario(datos: FormData): ValoresDelEmisor {
  return Object.fromEntries(
    CAMPOS_DEL_EMISOR.map((campo) => [
      campo,
      String(datos.get(campo) ?? "").trim(),
    ]),
  ) as ValoresDelEmisor;
}
