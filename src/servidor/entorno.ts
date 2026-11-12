// Variables de entorno que la app necesita para arrancar. Si falta una, este módulo
// falla al cargarse y el mensaje dice cuál es.

function requerida(nombre: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(
      `Falta la variable de entorno ${nombre}. En local la escribe "npm run setup"; la lista está en .env.example.`,
    );
  }
  return valor;
}

export const SUPABASE_URL = requerida(
  "NEXT_PUBLIC_SUPABASE_URL",
  process.env.NEXT_PUBLIC_SUPABASE_URL,
);

export const SUPABASE_LLAVE_PUBLICA = requerida(
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);
