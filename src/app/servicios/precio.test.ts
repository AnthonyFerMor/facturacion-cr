import { describe, expect, it } from "vitest";

import { revisarServicio, SERVICIO_NUEVO } from "@/servidor/servicios/esquema";

import { precioConMoneda, precioParaEditar } from "./precio";

// Intl separa los miles con un espacio que no corta la línea.
const conEspacios = (texto: string) => texto.replace(/\s/g, " ");

describe("precio en la lista de servicios", () => {
  it("muestra el código de la moneda y dos decimales", () => {
    expect(conEspacios(precioConMoneda(1200, "USD"))).toBe("USD 1 200,00");
    expect(conEspacios(precioConMoneda(45.5, "CRC"))).toBe("CRC 45,50");
  });

  it("no esconde los decimales que pasan de dos", () => {
    expect(conEspacios(precioConMoneda(0.12345, "USD"))).toBe("USD 0,12345");
  });
});

describe("precio en el formulario de un servicio", () => {
  it("se escribe con coma decimal y sin separador de miles", () => {
    expect(precioParaEditar(1200)).toBe("1200,00");
    expect(precioParaEditar(45.125)).toBe("45,125");
  });

  // Lo que muestra el formulario al editar tiene que poder guardarse de nuevo
  // sin que cambie el precio.
  it.each([45.5, 0.00001, 9999999999.99999])(
    "%s vuelve igual después de pasar por el formulario",
    (precio) => {
      const revision = revisarServicio({
        ...SERVICIO_NUEVO,
        codigo_cabys: "8314300000000",
        descripcion_cabys: "Servicios de diseño y desarrollo de software",
        detalle: "Desarrollo de software",
        precio_unitario: precioParaEditar(precio),
      });

      expect(revision.ok && revision.servicio.precio_unitario).toBe(precio);
    },
  );
});
