import { describe, expect, it } from "vitest";

import { esCabysDeServicio } from "./cabys";

describe("códigos CAByS de servicios", () => {
  it.each(["5111000000000", "8314300000000", "9310205030501"])(
    "acepta el código de servicio %s",
    (codigo) => {
      expect(esCabysDeServicio(codigo)).toBe(true);
    },
  );

  // Con un código de bienes, la factura de exportación pediría la partida
  // arancelaria, que esta app no maneja.
  it.each(["0199099000200", "4781400000000"])(
    "rechaza el código de bienes %s",
    (codigo) => {
      expect(esCabysDeServicio(codigo)).toBe(false);
    },
  );

  it.each([
    "831430000000",
    "83143000000000",
    "831430000000A",
    " 8314300000000",
  ])("rechaza %j, que no son 13 dígitos", (codigo) => {
    expect(esCabysDeServicio(codigo)).toBe(false);
  });
});
