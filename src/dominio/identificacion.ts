// Tipos de identificación y el formato de su número, según la nota 4 del Anexo
// de la versión 4.4. Un emisor tiene uno de los cuatro tipos locales; el cliente
// de una factura de exportación es un «Extranjero No Domiciliado».

export const TIPOS_DE_IDENTIFICACION = [
  {
    codigo: "01",
    nombre: "Cédula física",
    formato: "9 dígitos, sin guiones ni cero al inicio",
    patron: /^[1-9]\d{8}$/,
  },
  // El Anexo habla de «10 caracteres»: cuando el Registro Nacional emita cédulas
  // jurídicas con letras, cambia este patrón.
  {
    codigo: "02",
    nombre: "Cédula jurídica",
    formato: "10 dígitos, sin guiones",
    patron: /^\d{10}$/,
  },
  {
    codigo: "03",
    nombre: "DIMEX",
    formato: "11 o 12 dígitos, sin guiones ni cero al inicio",
    patron: /^[1-9]\d{10,11}$/,
  },
  {
    codigo: "04",
    nombre: "NITE",
    formato: "10 dígitos, sin guiones",
    patron: /^\d{10}$/,
  },
] as const;

export type TipoDeIdentificacion =
  (typeof TIPOS_DE_IDENTIFICACION)[number]["codigo"];

/** Los datos de un tipo de identificación, o `undefined` si el código no existe. */
export function tipoDeIdentificacion(codigo: string) {
  return TIPOS_DE_IDENTIFICACION.find((tipo) => tipo.codigo === codigo);
}

/** Dice si el número cumple el formato que el Anexo pide para ese tipo. */
export function numeroDeIdentificacionValido(
  codigo: string,
  numero: string,
): boolean {
  return tipoDeIdentificacion(codigo)?.patron.test(numero) ?? false;
}

/**
 * El tipo de identificación de un cliente del exterior. Hacienda no lo busca en
 * ningún padrón: el número es el que el cliente usa en su país.
 *
 * El Anexo dice «números y letras» sin más detalle. Se aceptan las letras del
 * alfabeto inglés: es la lectura más estrecha, así que un número que la cumple
 * cumple cualquier otra.
 */
export const EXTRANJERO_NO_DOMICILIADO = {
  codigo: "05",
  nombre: "Extranjero no domiciliado",
  formato: "hasta 20 letras y números, sin espacios ni guiones",
  patron: /^[A-Za-z0-9]{1,20}$/,
} as const;

/** Dice si el número sirve como identificación de un cliente del exterior. */
export function identificacionDeExtranjeroValida(numero: string): boolean {
  return EXTRANJERO_NO_DOMICILIADO.patron.test(numero);
}
