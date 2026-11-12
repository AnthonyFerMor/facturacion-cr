import { z } from "zod";

import { esCabysDeServicio, PATRON_CABYS } from "@/dominio/cabys";
import { esMoneda } from "@/dominio/monedas";
import { unidadDeServicio } from "@/dominio/unidades-de-medida";

import { erroresPorCampo, valoresDe } from "../formulario";

/** Los campos del formulario de un servicio, con el nombre de su columna. */
export const CAMPOS_DEL_SERVICIO = [
  "codigo_cabys",
  "descripcion_cabys",
  "detalle",
  "unidad_medida",
  "precio_unitario",
  "moneda",
] as const;

export type CampoDelServicio = (typeof CAMPOS_DEL_SERVICIO)[number];
export type ValoresDelServicio = Record<CampoDelServicio, string>;
export type ErroresDelServicio = Partial<Record<CampoDelServicio, string>>;

export const SERVICIO_NUEVO: ValoresDelServicio = {
  codigo_cabys: "",
  descripcion_cabys: "",
  detalle: "",
  unidad_medida: "Sp",
  precio_unitario: "",
  moneda: "USD",
};

/** La API de Hacienda pide al menos 3 caracteres para buscar en el catálogo. */
export const LARGO_MINIMO_DE_BUSQUEDA = 3;
/** Un texto más largo no es la descripción de un servicio: no se le manda a Hacienda. */
export const LARGO_MAXIMO_DE_BUSQUEDA = 100;

/** El detalle de una línea, según el campo Detalle del XSD 4.4. */
export const LARGO_MAXIMO_DEL_DETALLE = 200;

// El precio va con hasta 10 enteros y 5 decimales: el XSD admite 5 decimales y la
// decisión 0003 deja los montos por debajo de diez mil millones. Con esas 15 cifras,
// un número de JavaScript guarda el precio exacto.
const NUMERO = /^\d+(\.\d+)?$/;
const PRECIO = /^\d{1,10}(\.\d{1,5})?$/;
const CERO = /^0+(\.0+)?$/;

const esquemaServicio = z.object({
  codigo_cabys: z
    .string()
    .min(1, "Elija un código en la búsqueda o escríbalo")
    .regex(PATRON_CABYS, "El código CAByS lleva 13 dígitos")
    .refine(
      esCabysDeServicio,
      "Ese código es de un bien. Los de servicios empiezan con 5, 6, 7, 8 o 9",
    ),
  descripcion_cabys: z
    .string()
    .min(3, "Escriba la descripción del código, de 3 caracteres o más")
    .max(1000, "La descripción admite hasta 1000 caracteres"),
  detalle: z
    .string()
    .min(3, "Escriba el detalle, de 3 caracteres o más")
    .max(
      LARGO_MAXIMO_DEL_DETALLE,
      `El detalle admite hasta ${LARGO_MAXIMO_DEL_DETALLE} caracteres`,
    ),
  unidad_medida: z
    .string()
    .refine(
      (codigo) => unidadDeServicio(codigo) !== undefined,
      "Elija una unidad de la lista",
    ),
  precio_unitario: z
    .string()
    .min(1, "Escriba el precio")
    // En Costa Rica los decimales se separan con coma.
    .transform((texto) => texto.replace(",", "."))
    .refine(
      (texto) => NUMERO.test(texto),
      "Escriba el precio con números y sin separador de miles, como 45 o 45,50",
    )
    .refine(
      (texto) => PRECIO.test(texto),
      "El precio admite hasta 10 enteros y 5 decimales",
    )
    .refine(
      (texto) => !CERO.test(texto),
      "El precio tiene que ser mayor que cero",
    )
    .transform((texto) => Number(texto)),
  moneda: z.string().refine(esMoneda, "Elija la moneda"),
});

export type Servicio = z.infer<typeof esquemaServicio>;

export type RevisionDelServicio =
  { ok: true; servicio: Servicio } | { ok: false; errores: ErroresDelServicio };

/**
 * Revisa los datos de un servicio. La usan el formulario, antes de enviar, y la
 * acción del servidor, antes de guardar: las dos pasan por el mismo esquema.
 */
export function revisarServicio(
  valores: ValoresDelServicio,
): RevisionDelServicio {
  const resultado = esquemaServicio.safeParse(valores);
  return resultado.success
    ? { ok: true, servicio: resultado.data }
    : { ok: false, errores: erroresPorCampo(resultado.error) };
}

/** Lee del formulario los campos del servicio, sin espacios a los lados. */
export function valoresDelFormulario(datos: FormData): ValoresDelServicio {
  return valoresDe(datos, CAMPOS_DEL_SERVICIO);
}
