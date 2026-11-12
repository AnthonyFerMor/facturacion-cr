// Las cifras van con el formato de es-CR (docs/diseno.md): coma decimal y dos
// decimales. Un precio guardado con más decimales los muestra todos, hasta los
// cinco que admite el Anexo, para que lo que se ve sea lo que se factura.
const DECIMALES = {
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
} as const;

/** El precio con el código de su moneda, como en la lista: «USD 1 200,00». */
export function precioConMoneda(precio: number, moneda: string): string {
  return new Intl.NumberFormat("es-CR", {
    style: "currency",
    currency: moneda,
    currencyDisplay: "code",
    ...DECIMALES,
  }).format(precio);
}

/** El precio como se escribe en el formulario: «1200,00», sin separador de miles. */
export function precioParaEditar(precio: number): string {
  return new Intl.NumberFormat("es-CR", {
    ...DECIMALES,
    useGrouping: false,
  }).format(precio);
}
