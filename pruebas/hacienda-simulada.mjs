// Una API pública de Hacienda de mentira para los recorridos. Responde `/fe/cabys`
// con la misma forma que la real: por texto, los códigos dentro de `cabys`; por
// código, la lista sola.
// Uso: node pruebas/hacienda-simulada.mjs <puerto>
import { createServer } from "node:http";

const CODIGOS = [
  {
    codigo: "8314300000000",
    descripcion: "Servicios de diseño y desarrollo de software originales",
  },
  // Uno de bienes: la búsqueda de la app no lo tiene que mostrar.
  {
    codigo: "4781400000000",
    descripcion:
      "Paquete de software de herramientas de desarrollo y lenguajes de programación",
  },
  {
    codigo: "8313100000100",
    descripcion: "Servicios de consultoría en software",
  },
];

const puerto = Number(process.argv[2]);

createServer((solicitud, respuesta) => {
  const url = new URL(solicitud.url ?? "/", "http://localhost");
  const responder = (estado, cuerpo) => {
    respuesta.writeHead(estado, { "content-type": "application/json" });
    respuesta.end(JSON.stringify(cuerpo));
  };

  if (url.pathname === "/salud") {
    return responder(200, { ok: true });
  }
  if (url.pathname !== "/fe/cabys") {
    return responder(404, { code: 404 });
  }
  const codigo = url.searchParams.get("codigo");
  if (codigo) {
    return responder(
      200,
      CODIGOS.filter((cabys) => cabys.codigo === codigo),
    );
  }
  const texto = (url.searchParams.get("q") ?? "").toLowerCase();
  const encontrados = CODIGOS.filter((cabys) =>
    cabys.descripcion.toLowerCase().includes(texto),
  );
  return responder(200, {
    total: encontrados.length,
    cantidad: encontrados.length,
    cabys: encontrados,
  });
}).listen(puerto, "127.0.0.1");
