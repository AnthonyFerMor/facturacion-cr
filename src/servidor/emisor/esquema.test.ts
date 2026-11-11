import { describe, expect, it } from "vitest";

import {
  revisarEmisor,
  valoresDelFormulario,
  type ValoresDelEmisor,
} from "./esquema";

const VALIDO: ValoresDelEmisor = {
  tipo_identificacion: "01",
  numero_identificacion: "100000042",
  nombre: "Mariana Solís Vargas",
  correo: "mariana@ejemplo.test",
  actividad_economica: "6201.0",
  sucursal: "001",
  terminal: "00001",
};

// Estos datos van al XML de cada comprobante. Un dato que no cumple el XSD o el
// Anexo hace que Hacienda rechace la factura, así que no se guarda.
describe("revisión de los datos del emisor", () => {
  it("acepta un emisor completo y lo devuelve igual", () => {
    expect(revisarEmisor(VALIDO)).toEqual({ ok: true, emisor: VALIDO });
  });

  it.each([
    ["nombre", "Ana", "el XSD pide 5 caracteres o más"],
    ["nombre", "x".repeat(101), "el XSD admite hasta 100"],
    ["correo", "mariana", "no es un correo"],
    ["correo", `${"a".repeat(150)}@ejemplo.test`, "el XSD admite hasta 160"],
    ["actividad_economica", "6201", "el código tiene 6 caracteres"],
    ["actividad_economica", "6201.00", "el código tiene 6 caracteres"],
    ["actividad_economica", "62 1.0", "el código no lleva espacios"],
    ["sucursal", "1", "son 3 dígitos"],
    ["sucursal", "0A1", "son solo dígitos"],
    ["terminal", "0001", "son 5 dígitos"],
    ["tipo_identificacion", "05", "un emisor no es extranjero no domiciliado"],
  ])("marca el error en %s cuando vale «%s»: %s", (campo, valor) => {
    const revision = revisarEmisor({ ...VALIDO, [campo]: valor });

    expect(revision.ok).toBe(false);
    expect(revision.ok ? [] : Object.keys(revision.errores)).toEqual([campo]);
  });

  it("revisa el número con la regla del tipo elegido", () => {
    const fisicaComoJuridica = revisarEmisor({
      ...VALIDO,
      tipo_identificacion: "02",
    });

    expect(fisicaComoJuridica).toEqual({
      ok: false,
      errores: {
        numero_identificacion: "Revise el número: son 10 dígitos, sin guiones",
      },
    });
  });

  it("devuelve un error por cada campo que falla", () => {
    const revision = revisarEmisor({ ...VALIDO, nombre: "", sucursal: "" });

    expect(revision.ok ? [] : Object.keys(revision.errores).sort()).toEqual([
      "nombre",
      "sucursal",
    ]);
  });
});

describe("lectura del formulario del emisor", () => {
  it("quita los espacios a los lados y deja vacío lo que no vino", () => {
    const datos = new FormData();
    datos.set("numero_identificacion", " 100000042 ");
    datos.set("nombre", "  Mariana Solís Vargas");

    expect(valoresDelFormulario(datos)).toEqual({
      tipo_identificacion: "",
      numero_identificacion: "100000042",
      nombre: "Mariana Solís Vargas",
      correo: "",
      actividad_economica: "",
      sucursal: "",
      terminal: "",
    });
  });
});
