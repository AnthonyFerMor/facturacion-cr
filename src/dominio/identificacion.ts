// Tipos de identificación de un emisor y el formato de su número, según la nota 4
// del Anexo de la versión 4.4.

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
