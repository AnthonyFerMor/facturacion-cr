import { defineConfig } from "@playwright/test";

// Los recorridos corren contra la app compilada (`npm run build`), Supabase local y
// una API pública de Hacienda simulada: no dependen de que Hacienda responda ni gastan
// su límite de consultas. Usan el Chrome instalado en la máquina, que los runners de
// GitHub Actions ya traen.
const PUERTO_APP = 3650;
const PUERTO_HACIENDA = 3651;

export default defineConfig({
  testDir: "pruebas",
  // Un recorrido completo entra dos veces con un enlace por correo.
  timeout: 120_000,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: "list",
  use: {
    baseURL: `http://localhost:${PUERTO_APP}`,
    channel: "chrome",
    trace: "retain-on-failure",
  },
  webServer: [
    {
      command: `node pruebas/hacienda-simulada.mjs ${PUERTO_HACIENDA}`,
      url: `http://127.0.0.1:${PUERTO_HACIENDA}/salud`,
    },
    {
      command: `npm run start -- -p ${PUERTO_APP}`,
      url: `http://localhost:${PUERTO_APP}/entrar`,
      env: { HACIENDA_API_URL: `http://127.0.0.1:${PUERTO_HACIENDA}` },
    },
  ],
});
