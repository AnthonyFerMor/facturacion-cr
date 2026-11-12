// Las unidades de medida de la nota 15 del Anexo 4.4 que sirven para un servicio
// (decisión 0013). Las demás miden mercancías, como kilos o litros, o servicios que
// esta app no factura, como alquileres, comisiones o intereses.
export const UNIDADES_DE_SERVICIO = [
  { codigo: "Sp", nombre: "Servicios profesionales" },
  { codigo: "St", nombre: "Servicios técnicos" },
  { codigo: "Spe", nombre: "Servicios personales" },
  { codigo: "Os", nombre: "Otro tipo de servicio" },
  { codigo: "h", nombre: "Hora" },
  { codigo: "D", nombre: "Día" },
] as const;

/** La unidad de servicio con ese código, o `undefined` si no es una de ellas. */
export function unidadDeServicio(codigo: string) {
  return UNIDADES_DE_SERVICIO.find((unidad) => unidad.codigo === codigo);
}
