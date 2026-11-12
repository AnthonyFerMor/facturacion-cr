import { describe, expect, it } from "vitest";

import {
  esIdDeCliente,
  revisarCliente,
  valoresDelFormulario,
  type ValoresDelCliente,
} from "./esquema";

const VALIDO: ValoresDelCliente = {
  nombre: "Estudio Boreal Ejemplo GmbH",
  numero_identificacion: "DE000000017",
  correo: "pagos@estudio-boreal.test",
  otras_senas: "Musterstrasse 12, 10115 Berlín, Alemania",
};

// Estos datos son el receptor de cada factura de exportación. Un dato que no
// cumple el XSD o el Anexo hace que Hacienda rechace la factura, así que no se guarda.
describe("revisión de los datos de un cliente", () => {
  it("acepta un cliente completo y lo devuelve igual", () => {
    expect(revisarCliente(VALIDO)).toEqual({ ok: true, cliente: VALIDO });
  });

  // Una dirección vacía no puede ir al XML: el XSD pide 5 caracteres o más.
  it("guarda como nulo una dirección vacía", () => {
    const revision = revisarCliente({ ...VALIDO, otras_senas: "" });

    expect(revision).toEqual({
      ok: true,
      cliente: { ...VALIDO, otras_senas: null },
    });
  });

  it.each([
    ["nombre", "AB", "el XSD pide 3 caracteres o más"],
    ["nombre", "x".repeat(101), "el XSD admite hasta 100"],
    ["numero_identificacion", "", "la factura de exportación la exige"],
    ["numero_identificacion", "DE-000000017", "no lleva guiones"],
    ["numero_identificacion", "A".repeat(21), "el Anexo admite hasta 20"],
    ["correo", "", "ahí se entrega el comprobante"],
    ["correo", "pagos", "no es un correo"],
    ["correo", `${"a".repeat(150)}@ejemplo.test`, "el XSD admite hasta 160"],
    ["otras_senas", "Rue", "el XSD pide 5 caracteres o más"],
    ["otras_senas", "x".repeat(301), "el XSD admite hasta 300"],
  ])("marca el error en %s cuando vale «%s»: %s", (campo, valor) => {
    const revision = revisarCliente({ ...VALIDO, [campo]: valor });

    expect(revision.ok).toBe(false);
    expect(revision.ok ? [] : Object.keys(revision.errores)).toEqual([campo]);
  });

  it.each([
    ["nombre", "x".repeat(100)],
    ["numero_identificacion", "A".repeat(20)],
    ["otras_senas", "x".repeat(300)],
  ])("acepta %s en su largo máximo", (campo, valor) => {
    expect(revisarCliente({ ...VALIDO, [campo]: valor }).ok).toBe(true);
  });

  it("dice qué forma tiene la identificación cuando no la cumple", () => {
    const revision = revisarCliente({
      ...VALIDO,
      numero_identificacion: "DE 000000017",
    });

    expect(revision).toEqual({
      ok: false,
      errores: {
        numero_identificacion:
          "La identificación lleva hasta 20 letras y números, sin espacios ni guiones",
      },
    });
  });
});

describe("lectura del formulario de un cliente", () => {
  it("quita los espacios a los lados y deja vacío lo que no vino", () => {
    const datos = new FormData();
    datos.set("nombre", "  Estudio Boreal Ejemplo GmbH ");
    datos.set("numero_identificacion", " DE000000017");

    expect(valoresDelFormulario(datos)).toEqual({
      nombre: "Estudio Boreal Ejemplo GmbH",
      numero_identificacion: "DE000000017",
      correo: "",
      otras_senas: "",
    });
  });
});

// El `id` llega en la dirección de la pantalla. Si no tiene forma de `id`, no se
// le pregunta a la base: Postgres contestaría con un error y no con «no existe».
describe("forma del id de un cliente", () => {
  it("acepta un UUID", () => {
    expect(esIdDeCliente("cccccccc-0000-4000-8000-000000000001")).toBe(true);
  });

  it.each(["nuevo", "", "1", "cccccccc-0000-4000-8000-00000000000"])(
    "rechaza «%s»",
    (texto) => {
      expect(esIdDeCliente(texto)).toBe(false);
    },
  );
});
