import { expect, test } from "@playwright/test";

import { entrar, revisarAxe, tabHasta } from "./apoyo";

// El recorrido de la etapa 2: un cliente del exterior creado solo con el teclado y un
// servicio con su CAByS, editados los dos, y otra persona que no los ve. Los nombres
// llevan la hora, para que el recorrido se pueda repetir sobre la misma base.
const marca = Date.now();
const CLIENTE = `Recorrido ${marca} Ltd`;
const CLIENTE_EDITADO = `Recorrido ${marca} Inc`;
const SERVICIO = `Revisión de código ${marca}`;

test("un cliente y un servicio se crean y se editan, y otra persona no los ve", async ({
  page: pagina,
  browser,
  baseURL,
}) => {
  let urlDelCliente = "";
  let urlDelServicio = "";

  await test.step("entra la persona de ejemplo", async () => {
    await entrar(pagina, "mariana@ejemplo.test");
    await revisarAxe(pagina);
  });

  await test.step("crea un cliente del exterior solo con el teclado", async () => {
    await tabHasta(
      pagina,
      pagina.getByRole("link", { name: "Clientes", exact: true }),
    );
    await pagina.keyboard.press("Enter");
    await expect(pagina).toHaveURL("/clientes");
    await revisarAxe(pagina);

    await tabHasta(pagina, pagina.getByRole("link", { name: "Nuevo cliente" }));
    await pagina.keyboard.press("Enter");
    await expect(pagina).toHaveURL("/clientes/nuevo");
    const nombre = pagina.getByRole("textbox", { name: "Nombre", exact: true });
    await revisarAxe(pagina);

    await tabHasta(pagina, nombre);
    await pagina.keyboard.type(CLIENTE);
    await pagina.keyboard.press("Tab");
    await pagina.keyboard.type("GB000000099");
    await pagina.keyboard.press("Tab");
    await pagina.keyboard.type("cuentas@recorrido-ejemplo.test");
    await pagina.keyboard.press("Tab");
    await pagina.keyboard.type("1 Example Road, Londres, Reino Unido");
    await pagina.keyboard.press("Tab");
    await pagina.keyboard.press("Enter");

    await expect(pagina).toHaveURL("/clientes");
    await expect(pagina.getByRole("link", { name: CLIENTE })).toBeVisible();
  });

  await test.step("crea un servicio con el CAByS que eligió en la búsqueda", async () => {
    await pagina.goto("/servicios");
    await revisarAxe(pagina);
    await pagina.getByRole("link", { name: "Nuevo servicio" }).click();
    await expect(pagina).toHaveURL("/servicios/nuevo");

    await pagina
      .getByRole("searchbox", { name: "Buscar en el catálogo CAByS" })
      .fill("software");
    const resultados = pagina.getByRole("group", {
      name: "Resultados del catálogo CAByS",
    });
    // La API simulada devuelve tres códigos; el de bienes no se muestra.
    await expect(resultados.getByRole("button")).toHaveCount(2);
    await revisarAxe(pagina);

    await resultados
      .getByRole("button", { name: /Servicios de consultoría en software/ })
      .click();
    await expect(
      pagina.getByRole("textbox", { name: "Código", exact: true }),
    ).toHaveValue("8313100000100");
    await pagina
      .getByRole("textbox", { name: "Detalle", exact: true })
      .fill(SERVICIO);
    await pagina
      .getByRole("combobox", { name: "Unidad de medida" })
      .selectOption("h");
    await pagina
      .getByRole("textbox", { name: "Precio unitario" })
      .fill("52,50");
    await pagina.getByRole("button", { name: "Guardar servicio" }).click();

    await expect(pagina).toHaveURL("/servicios");
    const fila = pagina.getByRole("row", { name: new RegExp(SERVICIO) });
    await expect(fila).toContainText("8313100000100");
    await expect(fila).toContainText("Hora");
    await expect(fila).toContainText(/USD\s52,50/);
  });

  await test.step("edita el servicio y el cambio queda guardado", async () => {
    await pagina.getByRole("link", { name: SERVICIO }).click();
    await expect(pagina).toHaveURL(/\/servicios\/[0-9a-f-]{36}$/);
    urlDelServicio = pagina.url();
    await revisarAxe(pagina);

    const precio = pagina.getByRole("textbox", { name: "Precio unitario" });
    await expect(precio).toHaveValue("52,50");
    await precio.fill("60");
    await pagina.getByRole("combobox", { name: "Moneda" }).selectOption("CRC");
    await pagina.getByRole("button", { name: "Guardar servicio" }).click();
    await expect(pagina).toHaveURL("/servicios");
    await expect(
      pagina.getByRole("row", { name: new RegExp(SERVICIO) }),
    ).toContainText(/CRC\s60,00/);

    await pagina.getByRole("link", { name: SERVICIO }).click();
    await expect(precio).toHaveValue("60,00");
    await expect(pagina.getByRole("combobox", { name: "Moneda" })).toHaveValue(
      "CRC",
    );
  });

  await test.step("edita el cliente y el cambio queda guardado", async () => {
    await pagina.goto("/clientes");
    await pagina.getByRole("link", { name: CLIENTE }).click();
    await expect(pagina).toHaveURL(/\/clientes\/[0-9a-f-]{36}$/);
    urlDelCliente = pagina.url();
    await revisarAxe(pagina);

    const nombre = pagina.getByRole("textbox", { name: "Nombre", exact: true });
    await expect(nombre).toHaveValue(CLIENTE);
    await nombre.fill(CLIENTE_EDITADO);
    await pagina.getByRole("button", { name: "Guardar cliente" }).click();
    await expect(pagina).toHaveURL("/clientes");

    await pagina.getByRole("link", { name: CLIENTE_EDITADO }).click();
    await expect(nombre).toHaveValue(CLIENTE_EDITADO);
  });

  await test.step("otra persona no ve ni abre ese cliente ni ese servicio", async () => {
    const contexto = await browser.newContext({ baseURL });
    const otra = await contexto.newPage();
    await entrar(otra, `otra-${marca}@ejemplo.test`);

    await otra.goto("/clientes");
    await expect(
      otra.getByRole("heading", { name: "Todavía no hay clientes" }),
    ).toBeVisible();
    await revisarAxe(otra);
    await otra.goto("/servicios");
    await expect(
      otra.getByRole("heading", { name: "Todavía no hay servicios" }),
    ).toBeVisible();
    await revisarAxe(otra);

    await otra.goto(urlDelCliente);
    await expect(otra.getByText("Ese cliente no existe")).toBeVisible();
    await otra.goto(urlDelServicio);
    await expect(otra.getByText("Ese servicio no existe")).toBeVisible();
    await revisarAxe(otra);
    await contexto.close();
  });
});
