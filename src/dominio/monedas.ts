// Las monedas en que se le pone precio a un servicio (decisión 0013). La factura de
// exportación de la versión 1 va en dólares, y el colón es la moneda de la factura
// local de la última etapa. El Anexo admite cualquier código ISO 4217.
export const MONEDAS = [
  { codigo: "USD", nombre: "Dólares" },
  { codigo: "CRC", nombre: "Colones" },
] as const;

/** Dice si un código es de una de las monedas de la app. */
export function esMoneda(codigo: string): boolean {
  return MONEDAS.some((moneda) => moneda.codigo === codigo);
}
