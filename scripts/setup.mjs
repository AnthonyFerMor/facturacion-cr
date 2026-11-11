// Deja el entorno local listo: levanta Supabase, aplica las migraciones pendientes
// y escribe en .env.local las variables que salen de la instancia local.
// Uso: npm run setup

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const ARCHIVO_ENV = ".env.local";

function supabase(argumentos, { capturar = false } = {}) {
  return execFileSync("npx", ["supabase", ...argumentos], {
    encoding: "utf8",
    stdio: ["ignore", capturar ? "pipe" : "inherit", "inherit"],
  });
}

/** Cambia o agrega cada variable y deja igual el resto del archivo. */
function escribirVariables(variables) {
  const lineas = existsSync(ARCHIVO_ENV)
    ? readFileSync(ARCHIVO_ENV, "utf8").split("\n")
    : [];
  for (const [nombre, valor] of Object.entries(variables)) {
    const linea = `${nombre}=${valor}`;
    const posicion = lineas.findIndex((l) => l.startsWith(`${nombre}=`));
    if (posicion === -1) {
      lineas.push(linea);
    } else {
      lineas[posicion] = linea;
    }
  }
  writeFileSync(ARCHIVO_ENV, `${lineas.join("\n").trimEnd()}\n`);
}

supabase(["start"]);
supabase(["migration", "up"]);

const estado = JSON.parse(
  supabase(["status", "--output", "json"], { capturar: true }),
);
escribirVariables({
  NEXT_PUBLIC_SUPABASE_URL: estado.API_URL,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: estado.PUBLISHABLE_KEY,
});

console.log(`
Listo. Variables escritas en ${ARCHIVO_ENV}.
  App:     npm run dev
  Correos: ${estado.MAILPIT_URL}
  Base:    ${estado.STUDIO_URL}
`);
