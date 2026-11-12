// El CAByS (Catálogo de Bienes y Servicios) dice qué se vende en cada línea de un
// comprobante. Cada código tiene 13 dígitos, y el primero separa los bienes (0 a 4)
// de los servicios (5 a 9).

/** La forma de un código CAByS: 13 dígitos. */
export const PATRON_CABYS = /^\d{13}$/;

// Con un código de bienes, la factura de exportación pide la partida arancelaria
// (campo PartidaArancelaria del Anexo 4.4). Esta app factura solo servicios
// (decisión 0013).
const PRIMER_DIGITO_DE_SERVICIO = /^[5-9]/;

/** Dice si un código CAByS es de un servicio. */
export function esCabysDeServicio(codigo: string): boolean {
  return PATRON_CABYS.test(codigo) && PRIMER_DIGITO_DE_SERVICIO.test(codigo);
}
