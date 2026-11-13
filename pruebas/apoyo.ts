import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page } from "@playwright/test";

// El buzón local de Supabase (Mailpit), donde llegan los enlaces de entrada.
const MAILPIT = "http://127.0.0.1:54724";
// Los enlaces apuntan a la dirección del sitio que tiene configurada Supabase
// (`site_url`); el recorrido los abre en la app que levantó Playwright.
const SITIO_DE_SUPABASE = "http://localhost:3000";

// WCAG 2.2 en los niveles A y AA, y las buenas prácticas de axe.
const REGLAS_DE_AXE = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
  "best-practice",
];

async function ultimoCorreoPara(correo: string): Promise<string | undefined> {
  const respuesta = await fetch(
    `${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:${correo}`)}`,
  );
  const { messages } = (await respuesta.json()) as {
    messages: { ID: string }[];
  };
  return messages[0]?.ID;
}

/** Pide el enlace de entrada, lo saca del buzón local y lo abre. */
export async function entrar(pagina: Page, correo: string) {
  const anterior = await ultimoCorreoPara(correo);
  await pagina.goto("/entrar");
  await pagina.getByLabel("Correo").fill(correo);
  await pagina.keyboard.press("Enter");
  await expect(
    pagina.getByRole("heading", { name: "Revise su correo" }),
  ).toBeVisible();

  let nuevo: string | undefined;
  await expect
    .poll(
      async () => {
        nuevo = await ultimoCorreoPara(correo);
        return nuevo !== undefined && nuevo !== anterior;
      },
      { message: `no llegó el correo de ${correo}`, timeout: 15_000 },
    )
    .toBe(true);

  const { HTML } = (await (
    await fetch(`${MAILPIT}/api/v1/message/${nuevo}`)
  ).json()) as { HTML: string };
  const enlace = HTML.match(/href="([^"]+)"/)?.[1] ?? "";
  await pagina.goto(
    enlace.replaceAll("&amp;", "&").replace(SITIO_DE_SUPABASE, ""),
  );
  await expect(
    pagina.getByText(`Sesión iniciada como ${correo}`),
  ).toBeVisible();
}

/** Corre axe sobre la pantalla y falla con la lista de lo que encuentre. */
export async function revisarAxe(pagina: Page) {
  const { violations } = await new AxeBuilder({ page: pagina })
    .withTags(REGLAS_DE_AXE)
    .analyze();
  expect(
    violations.map(
      (falla) => `${falla.id}: ${falla.nodes[0]?.target.join(" ")}`,
    ),
  ).toEqual([]);
}

/** Aprieta Tab hasta que el foco llega al control. */
export async function tabHasta(pagina: Page, control: Locator) {
  const MAXIMO_DE_TABS = 20;
  for (let i = 0; i < MAXIMO_DE_TABS; i++) {
    if (await control.evaluate((e) => e === document.activeElement)) {
      return;
    }
    await pagina.keyboard.press("Tab");
  }
  throw new Error("El Tab no llegó al control");
}
