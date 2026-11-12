import { describe, expect, it } from "vitest";

import {
  identificacionDeExtranjeroValida,
  numeroDeIdentificacionValido,
  tipoDeIdentificacion,
} from "./identificacion";

// Hacienda rechaza un comprobante cuyo emisor no cumple el formato de la nota 4
// del Anexo, así que el número se revisa antes de guardarlo.
describe("número de identificación del emisor", () => {
  it.each([
    ["01", "100000042", "cédula física de 9 dígitos"],
    ["02", "3101000042", "cédula jurídica de 10 dígitos"],
    ["03", "10000000042", "DIMEX de 11 dígitos"],
    ["03", "100000000042", "DIMEX de 12 dígitos"],
    ["04", "1000000042", "NITE de 10 dígitos"],
  ])("acepta %s %s: %s", (tipo, numero) => {
    expect(numeroDeIdentificacionValido(tipo, numero)).toBe(true);
  });

  it.each([
    ["01", "010000042", "la cédula física no empieza con cero"],
    ["01", "1-0000-0042", "no lleva guiones"],
    ["01", "10000004", "le falta un dígito"],
    ["01", "1000000420", "le sobra un dígito"],
    ["02", "310100004", "la jurídica tiene 10 dígitos, no 9"],
    ["02", "31010000A2", "la jurídica todavía no lleva letras"],
    ["03", "1000000042", "el DIMEX tiene 11 o 12 dígitos, no 10"],
    ["03", "1000000000042", "el DIMEX no tiene 13 dígitos"],
    ["03", "01000000042", "el DIMEX no empieza con cero"],
    ["04", "100000042", "el NITE tiene 10 dígitos, no 9"],
    ["01", " 100000042", "no lleva espacios"],
    ["01", "", "no puede ir vacío"],
  ])("rechaza %s «%s»: %s", (tipo, numero) => {
    expect(numeroDeIdentificacionValido(tipo, numero)).toBe(false);
  });

  // El 05 (extranjero no domiciliado) es solo para receptores.
  it("rechaza un tipo que un emisor no puede tener", () => {
    expect(tipoDeIdentificacion("05")).toBeUndefined();
    expect(numeroDeIdentificacionValido("05", "ABC123")).toBe(false);
  });
});

// El receptor de una factura de exportación lleva el número que usa en su país.
// El Anexo lo limita a 20 caracteres, números y letras; con otra cosa, Hacienda
// rechaza el comprobante.
describe("identificación de un cliente del exterior", () => {
  it.each([
    ["US000000042", "letras y números"],
    ["000000042", "solo números"],
    ["A", "un solo carácter"],
    ["AB123456789012345678", "20 caracteres, el máximo"],
  ])("acepta «%s»: %s", (numero) => {
    expect(identificacionDeExtranjeroValida(numero)).toBe(true);
  });

  it.each([
    ["AB1234567890123456789", "21 caracteres"],
    ["00-0000042", "no lleva guiones"],
    ["US 000000042", "no lleva espacios"],
    ["ÑU000000042", "solo letras sin tilde ni eñe"],
    ["", "no puede ir vacía"],
  ])("rechaza «%s»: %s", (numero) => {
    expect(identificacionDeExtranjeroValida(numero)).toBe(false);
  });
});
