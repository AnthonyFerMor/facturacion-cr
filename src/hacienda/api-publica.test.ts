import { afterEach, describe, expect, it, vi } from "vitest";

import { buscarEnCabys, consultarActividades } from "./api-publica";

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

/** Un código con la forma que devuelve `/fe/cabys`. */
const DESARROLLO_DE_SOFTWARE = {
  codigo: "8314300000000",
  descripcion: "Servicios de diseño y  desarrollo de software originales ",
  categorias: ["Servicios prestados a las empresas y servicios de producción"],
  impuesto: 13,
  uri: "https://api.hacienda.go.cr/fe/cabys?codigo=8314300000000",
  estado: "",
};

const ENCONTRADO = {
  ok: true,
  resultados: [
    {
      codigo: "8314300000000",
      descripcion: "Servicios de diseño y desarrollo de software originales",
    },
  ],
};

describe("búsqueda en el catálogo CAByS", () => {
  it("busca por las palabras de la descripción", async () => {
    const consulta = hacerQueHaciendaResponda(200, {
      total: 1,
      cantidad: 1,
      cabys: [DESARROLLO_DE_SOFTWARE],
    });

    expect(await buscarEnCabys("desarrollo de software")).toEqual(ENCONTRADO);
    expect(consulta).toHaveBeenCalledWith(
      "https://api.hacienda.go.cr/fe/cabys?q=desarrollo%20de%20software",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  // Por código, Hacienda devuelve la lista sin el objeto que la envuelve.
  it("con 13 dígitos busca por código", async () => {
    const consulta = hacerQueHaciendaResponda(200, [DESARROLLO_DE_SOFTWARE]);

    expect(await buscarEnCabys("8314300000000")).toEqual(ENCONTRADO);
    expect(consulta).toHaveBeenCalledWith(
      "https://api.hacienda.go.cr/fe/cabys?codigo=8314300000000",
      expect.anything(),
    );
  });

  it("sin resultados devuelve la lista vacía", async () => {
    hacerQueHaciendaResponda(200, { total: 0, cantidad: 0, cabys: [] });

    expect(await buscarEnCabys("zzqxwv")).toEqual({ ok: true, resultados: [] });
  });

  // La pantalla deja escribir el código a mano cuando la API no contesta, así que
  // ninguna falla de la API puede salir como una excepción. El 429 es el aviso de
  // que se pasó el límite de solicitudes.
  it.each([429, 500, 503])(
    "con un %i dice que Hacienda no respondió",
    async (estado) => {
      hacerQueHaciendaResponda(estado, { message: "..." });

      expect(await buscarEnCabys("desarrollo")).toEqual({
        ok: false,
        motivo: "sin-respuesta",
      });
    },
  );

  it("si la conexión falla o se agota el tiempo dice que Hacienda no respondió", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new DOMException("The operation timed out.", "TimeoutError");
      }),
    );

    expect(await buscarEnCabys("desarrollo")).toEqual({
      ok: false,
      motivo: "sin-respuesta",
    });
  });

  it("si la respuesta no trae la forma esperada dice que Hacienda no respondió", async () => {
    hacerQueHaciendaResponda(200, [DESARROLLO_DE_SOFTWARE]);

    expect(await buscarEnCabys("desarrollo")).toEqual({
      ok: false,
      motivo: "sin-respuesta",
    });
  });
});
