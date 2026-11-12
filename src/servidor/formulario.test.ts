import { describe, expect, it } from "vitest";

import { esId } from "./formulario";

// El `id` llega en la dirección de la pantalla. Si no tiene forma de `id`, no se
// le pregunta a la base: Postgres contestaría con un error y no con «no existe».
describe("forma del id de una fila", () => {
  it("acepta un UUID", () => {
    expect(esId("cccccccc-0000-4000-8000-000000000001")).toBe(true);
  });

  it.each(["nuevo", "", "1", "cccccccc-0000-4000-8000-00000000000"])(
    "rechaza «%s»",
    (texto) => {
      expect(esId(texto)).toBe(false);
    },
  );
});
