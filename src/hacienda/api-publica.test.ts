import { afterEach, describe, expect, it, vi } from "vitest";

import { consultarActividades } from "./api-publica";

/** Una respuesta con la forma que devuelve `/fe/ae`, con datos inventados. */
const RESPUESTA_DE_HACIENDA = {
  nombre: " MARIANA SOLIS VARGAS ",
  tipoIdentificacion: "01",
  regimen: { codigo: 1, descripcion: "Régimen general" },
  situacion: {
    moroso: "NO",
    omiso: "NO",
    estado: "Inscrito",
    administracionTributaria: "San José Oeste",
  },
  actividades: [
    {
      estado: "A",
      tipo: "S",
      codigo: "8549.0",
      descripcion: "Otros tipos  de enseñanza n.c.p.",
    },
    {
      estado: "I",
      tipo: "S",
      codigo: "4741.0",
      descripcion: "Venta al por menor de computadoras",
    },
    {
      estado: "A",
      tipo: "P",
      codigo: "6201.0",
      descripcion: "Actividades de programación informática",
    },
  ],
};

function hacerQueHaciendaResponda(estado: number, cuerpo: unknown) {
  const consulta = vi.fn(async () => Response.json(cuerpo, { status: estado }));
  vi.stubGlobal("fetch", consulta);
  return consulta;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("consulta de actividades económicas en Hacienda", () => {
  it("pide las actividades de la identificación", async () => {
    const consulta = hacerQueHaciendaResponda(200, RESPUESTA_DE_HACIENDA);

    await consultarActividades("100000042");

    expect(consulta).toHaveBeenCalledWith(
      "https://api.hacienda.go.cr/fe/ae?identificacion=100000042",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  // Con una actividad inactiva Hacienda rechazaría la factura, y la principal es
  // la que casi siempre corresponde: por eso va primero.
  it("devuelve solo las actividades activas, con la principal primero", async () => {
    hacerQueHaciendaResponda(200, RESPUESTA_DE_HACIENDA);

    expect(await consultarActividades("100000042")).toEqual({
      ok: true,
      nombre: "MARIANA SOLIS VARGAS",
      actividades: [
        {
          codigo: "6201.0",
          descripcion: "Actividades de programación informática",
          principal: true,
        },
        {
          codigo: "8549.0",
          descripcion: "Otros tipos de enseñanza n.c.p.",
          principal: false,
        },
      ],
    });
  });

  it.each([404, 400])(
    "con un %i dice que la identificación no está inscrita",
    async (estado) => {
      hacerQueHaciendaResponda(estado, { code: estado, status: "..." });

      expect(await consultarActividades("100000042")).toEqual({
        ok: false,
        motivo: "no-inscrita",
      });
    },
  );

  // La pantalla deja escribir la actividad a mano cuando la API no contesta, así
  // que ninguna falla de la API puede salir como una excepción.
  it("con un error del servidor de Hacienda dice que no hubo respuesta", async () => {
    hacerQueHaciendaResponda(503, "Service unavailable");

    expect(await consultarActividades("100000042")).toEqual({
      ok: false,
      motivo: "sin-respuesta",
    });
  });

  it("si la conexión falla o se agota el tiempo dice que no hubo respuesta", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("The operation timed out.", "TimeoutError");
      }),
    );

    expect(await consultarActividades("100000042")).toEqual({
      ok: false,
      motivo: "sin-respuesta",
    });
  });

  it("si la respuesta no trae la forma esperada dice que no hubo respuesta", async () => {
    hacerQueHaciendaResponda(200, { nombre: "SIN ACTIVIDADES" });

    expect(await consultarActividades("100000042")).toEqual({
      ok: false,
      motivo: "sin-respuesta",
    });
  });
});
