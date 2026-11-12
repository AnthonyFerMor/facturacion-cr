import { describe, expect, it } from "vitest";

import {
  revisarServicio,
  valoresDelFormulario,
  type ValoresDelServicio,
} from "./esquema";

const VALIDO: ValoresDelServicio = {
  codigo_cabys: "8314300000000",
  descripcion_cabys: "Servicios de diseño y desarrollo de software originales",
  detalle: "Desarrollo de software",
  unidad_medida: "h",
  precio_unitario: "45,50",
  moneda: "USD",
};

const errorDe = (cambios: Partial<ValoresDelServicio>) => {
  const revision = revisarServicio({ ...VALIDO, ...cambios });
  return revision.ok ? null : revision.errores;
};

describe("revisión de un servicio", () => {
  it("acepta un servicio completo y deja el precio como número", () => {
    expect(revisarServicio(VALIDO)).toEqual({
      ok: true,
      servicio: { ...VALIDO, precio_unitario: 45.5 },
    });
  });

  // Con un código de bienes, la factura de exportación pediría la partida
  // arancelaria, que esta app no maneja (decisión 0013).
  it("rechaza un código CAByS de bienes", () => {
    expect(errorDe({ codigo_cabys: "4781400000000" })).toEqual({
      codigo_cabys:
        "Ese código es de un bien. Los de servicios empiezan con 5, 6, 7, 8 o 9",
    });
  });

  it("pide un código CAByS de 13 dígitos", () => {
    expect(errorDe({ codigo_cabys: "" })).toEqual({
      codigo_cabys: "Elija un código en la búsqueda o escríbalo",
    });
    expect(errorDe({ codigo_cabys: "831430000000" })).toEqual({
      codigo_cabys: "El código CAByS lleva 13 dígitos",
    });
  });

  // El campo Detalle del XSD 4.4 va de 3 a 200 caracteres: fuera de eso, Hacienda
  // rechaza la factura.
  it("acepta un detalle de 3 a 200 caracteres", () => {
    expect(errorDe({ detalle: "abc" })).toBeNull();
    expect(errorDe({ detalle: "x".repeat(200) })).toBeNull();
    expect(errorDe({ detalle: "ab" })).toEqual({
      detalle: "Escriba el detalle, de 3 caracteres o más",
    });
    expect(errorDe({ detalle: "x".repeat(201) })).toEqual({
      detalle: "El detalle admite hasta 200 caracteres",
    });
  });

  it("acepta solo las unidades de servicio de la nota 15", () => {
    for (const unidad of ["Sp", "St", "Spe", "Os", "h", "D"]) {
      expect(errorDe({ unidad_medida: unidad })).toBeNull();
    }
    expect(errorDe({ unidad_medida: "Kg" })).toEqual({
      unidad_medida: "Elija una unidad de la lista",
    });
  });

  it("acepta dólares y colones", () => {
    expect(errorDe({ moneda: "CRC" })).toBeNull();
    expect(errorDe({ moneda: "EUR" })).toEqual({ moneda: "Elija la moneda" });
  });
});

describe("precio de un servicio", () => {
  const precio = (texto: string) => {
    const revision = revisarServicio({ ...VALIDO, precio_unitario: texto });
    return revision.ok ? revision.servicio.precio_unitario : revision.errores;
  };

  // En Costa Rica se escribe la coma decimal; el punto también se acepta.
  it.each([
    ["45", 45],
    ["45,5", 45.5],
    ["45.50", 45.5],
    ["0,00001", 0.00001],
    ["9999999999,99999", 9999999999.99999],
  ])("lee «%s» como %s", (texto, numero) => {
    expect(precio(texto)).toBe(numero);
  });

  // «1.500,00» puede ser mil quinientos o uno y medio: sin separador de miles no
  // hay dudas.
  it.each(["1.500,00", "1 500", "45,5,0", "abc", "-45", "45,"])(
    "rechaza «%s»",
    (texto) => {
      expect(precio(texto)).toEqual({
        precio_unitario:
          "Escriba el precio con números y sin separador de miles, como 45 o 45,50",
      });
    },
  );

  // Decisión 0003: los montos van por debajo de diez mil millones, con 5 decimales.
  it.each(["10000000000", "45,123456"])("rechaza «%s» por largo", (texto) => {
    expect(precio(texto)).toEqual({
      precio_unitario: "El precio admite hasta 10 enteros y 5 decimales",
    });
  });

  it.each(["0", "0,00"])("rechaza un precio de cero: «%s»", (texto) => {
    expect(precio(texto)).toEqual({
      precio_unitario: "El precio tiene que ser mayor que cero",
    });
  });

  it("pide el precio", () => {
    expect(precio("")).toEqual({ precio_unitario: "Escriba el precio" });
  });
});

describe("lectura del formulario de un servicio", () => {
  it("lee los campos sin espacios a los lados", () => {
    const datos = new FormData();
    datos.set("codigo_cabys", " 8314300000000 ");
    datos.set("descripcion_cabys", "Servicios de diseño");
    datos.set("detalle", "  Desarrollo de software ");
    datos.set("unidad_medida", "h");
    datos.set("precio_unitario", " 45,50 ");
    datos.set("moneda", "USD");

    expect(valoresDelFormulario(datos)).toEqual({
      codigo_cabys: "8314300000000",
      descripcion_cabys: "Servicios de diseño",
      detalle: "Desarrollo de software",
      unidad_medida: "h",
      precio_unitario: "45,50",
      moneda: "USD",
    });
  });
});
