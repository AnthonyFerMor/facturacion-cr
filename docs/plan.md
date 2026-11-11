# Plan de trabajo

## Etapas

Al terminar cada etapa, la app se puede probar de punta a punta. Cada etapa tiene un issue paraguas con el recorrido de prueba y un issue por tarea, y cada tarea es una rama y un PR. Las horas son una estimación para una persona que escribe todo.

| Etapa | Al terminar se puede | Horas |
| --- | --- | --- |
| 0. Base | Entrar a la app desplegada, con la integración continua en cada PR y el SDK probado | 17 a 24 |
| 1. Emisor y credenciales | Crear el emisor y cargar una llave que queda cifrada | 8 a 11 |
| 2. Clientes y servicios | Guardar un cliente del exterior y un servicio con CAByS | 5 a 8 |
| 3. Factura de exportación | Llenar una factura en dólares, emitirla y descargar su XML firmado y válido | 27 a 40 |
| 4. Envío y seguimiento | Ver la factura pasar a aceptada en modo simulado, y ver el motivo de un rechazo | 26 a 37 |
| 5. Demo pública | Recorrer la app sin registrarse | 10 a 14 |
| 6. Entrega al cliente | Recibir el XML, el PDF y la respuesta de Hacienda por correo | 10 a 15 |
| 7. Historial y cierre del mes | Buscar comprobantes, ver el resumen del mes en colones y bajar el mes en ZIP | 8 a 12 |
| 8. Nota de crédito y reemisión | Anular una factura aceptada y reemitir una rechazada | 8 a 12 |
| 9. Factura local (opcional) | Facturarle en colones, con IVA, a un cliente local | 10 a 14 |

Las etapas 0 a 8 suman de 119 a 173 horas. La app ya se puede mostrar al terminar la etapa 5: de 93 a 134 horas.

Al cerrar cada etapa se anotan las horas reales en su issue paraguas y se ajusta la estimación de las que faltan.

## Tareas por etapa

### 0. Base

- Repo público, con la regla de `main` y el bloqueo de secretos al hacer push ([decisión 0010](decisiones/0010-repo-publico-con-licencia-mit.md)).
- Proyecto Next.js 16 con TypeScript estricto, ESLint, Prettier y Vitest, la estructura de carpetas de la arquitectura, `.env.example` y dos comandos para levantarlo: `npm run setup` (levanta Supabase local, aplica las migraciones y carga los datos de prueba) y `npm run dev`.
- Supabase local: migración de `emisores`, entrada con enlace por correo en Mailpit, RLS con pruebas pgTAP y tipos de TypeScript generados desde el esquema.
- Integración continua en GitHub Actions: formato, lint, tipos, Vitest, pgTAP y build en cada PR.
- Prueba de concepto del SDK. Con datos inventados y las reglas del Anexo, armar una factura de exportación, validarla contra el XSD que Hacienda publica hoy, firmarla con una llave de prueba generada en local y verificar la firma. Comprobar que los montos calculados llegan iguales al XML. El resultado queda escrito como decisión: qué funciones del SDK se usan y con qué límites.
- Base visual según [el diseño](diseno.md): colores, tipografía y los componentes mínimos (botón, campo, tabla y estado), con la pantalla de entrada.
- Despliegue: proyecto de Supabase en la nube y Vercel por CLI, con la entrada funcionando.

Recorrido: clonar el repo, correr los dos comandos y entrar en local; entrar en la app desplegada; ver la integración continua en verde en un PR.

### 1. Emisor y credenciales

- Perfil del emisor: identificación, nombre, correo, actividad económica (con consulta a `/fe/ae` o escrita a mano), sucursal y terminal.
- Módulo de cifrado AES-256-GCM, ligado al emisor y con versión de llave, con sus pruebas.
- Carga de credenciales (usuario, contraseña, .p12 y PIN): valida la llave (RSA de 2048 bits o más, vencimiento y tamaño del archivo) y la guarda cifrada. Incluye el script que genera una llave .p12 de prueba.

Recorrido: crear el emisor, cargar la llave de prueba y comprobar en la base que quedó cifrada.

### 2. Clientes y servicios

- Clientes del exterior: nombre, identificación (tipo 05, hasta 20 caracteres), correo y otras señas.
- Servicios: búsqueda de CAByS en `/fe/cabys` o código escrito a mano, unidad de medida, precio y moneda.
- Primer recorrido con Playwright, con axe, sobre estas pantallas.

Recorrido: crear un cliente del exterior y un servicio con su CAByS usando solo el teclado.

### 3. Factura de exportación: del borrador al XML firmado

- Módulo de montos con `BigInt`, 5 decimales y HALF_UP.
- Cálculo de líneas y resumen de la factura de exportación según el Anexo.
- Clave de 50 dígitos, consecutivo de 20 y fechas en hora de Costa Rica.
- `emitir_comprobante`: reserva del consecutivo, paso de borrador a emitido y comprobante que ya no se puede editar, con la prueba de concurrencia.
- Tipo de cambio de venta de referencia: consulta a `/indicadores/tc/dolar`, guardado en `tipos_cambio` y entrada a mano si la API no responde.
- Armado y firma: del comprobante guardado al XML del SDK, validación contra el XSD, firma, XML de referencia y guardado de `clave.xml` en el bucket privado.
- Pantalla de nueva factura: borrador, líneas, totales con su equivalente en colones, y emitir. En esta etapa el XML se arma y se firma al emitir; en la etapa 4 ese paso pasa al trabajo `enviar`.

Recorrido: llenar una factura de exportación en dólares, emitirla, descargar su XML firmado y comprobar que pasa el XSD.

### 4. Envío a Hacienda y seguimiento

- Estados del comprobante y sus transiciones.
- Pasarela de Hacienda: la interfaz y su implementación con el SDK (enviar, consultar y probar la conexión).
- Simulador y pruebas de contrato de la pasarela.
- Cola de trabajos: tabla, `tomar_trabajos`, procesador, reintentos con espera creciente y llamada desde pg_cron.
- Trabajos `enviar` y `consultar` con los caminos de la [decisión 0007](decisiones/0007-emision-y-envio-idempotentes.md), y la bitácora de eventos.
- Lista de comprobantes con su estado, detalle con la respuesta de Hacienda y la línea de tiempo, y el botón «Probar conexión».
- Pantalla interna de trabajos.

Recorrido: emitir en modo simulado y ver la factura pasar a aceptada. Con el cliente de prueba que provoca un rechazo, ver el motivo. Cortar el procesador a la mitad de un envío y ver que el comprobante llega igual a su estado final.

### 5. Demo pública

- Modo demo: sesión anónima, emisor de demostración con datos inventados y llave de prueba, sin carga de credenciales, con tope de comprobantes y limpieza diaria.
- README en inglés y en español: qué es, enlace a la demo, capturas, cómo levantarlo, diagrama, qué se probó contra Hacienda y qué no, y las decisiones principales.
- Chequeo diario de la demo desplegada.
- Revisión en el teléfono y de accesibilidad de todas las pantallas hechas hasta acá.

Recorrido: una persona sin cuenta, desde su teléfono, emite una factura, la ve aceptada y descarga el XML.

Desde acá el repo se puede fijar en el perfil y enlazar desde el currículum.

### 6. Entrega al cliente

- PDF. Primero una prueba corta de @react-pdf/renderer en una ruta del servidor; si falla, pdfmake. Después, la representación gráfica, con la marca «Simulado» cuando corresponde, guardada como `clave.pdf`.
- Correos: XML y PDF al emitir, la respuesta de Hacienda cuando llega y reenvío manual, anotados en `entregas`. Resend en la nube y Mailpit en local.
- Descarga de los tres archivos desde el detalle.

Recorrido: emitir una factura, ver los dos correos en Mailpit y abrir el PDF.

### 7. Historial y cierre del mes

- Filtros por mes, cliente y estado, y búsqueda por clave.
- Resumen mensual: los montos en colones por tipo de comprobante y tarifa, con el tipo de cambio de cada factura.
- Descarga del mes en ZIP con los XML, las respuestas y los PDF.

Recorrido: cerrar un mes de prueba, comparar el resumen con las facturas y descargar el ZIP.

### 8. Nota de crédito y reemisión

- Reglas de referencia. La nota de crédito que anula una factura de exportación aceptada usa el código 01 de la nota 9 del Anexo y el 19 de la nota 10. El comprobante que reemplaza a uno rechazado usa el 16 de la nota 9 y el 10 de la nota 10.
- Pantallas: anular con nota de crédito desde el detalle, y corregir y reemitir un rechazado.

Recorrido: anular una factura aceptada con una nota de crédito. Después, provocar un rechazo en el simulador, corregir la factura y reemitirla.

### 9. Factura local (opcional)

- Clientes locales: cédula física, jurídica, DIMEX o NITE.
- IVA del 13 % en el cálculo de líneas y del resumen.
- Factura electrónica (tipo 01): armado, XML de referencia y pantalla.

Recorrido: facturarle en colones, con IVA, a un cliente local.

## Aportes al SDK hacienda-cr

Van en paralelo a las etapas. Antes de cada PR se abre un issue en el repo del SDK, para no hacer trabajo que el mantenedor no quiera. El 31 de octubre de 2026 el mantenedor mergeó el mismo día un PR chico de una persona externa (#126); los PRs grandes llevan semanas sin revisión. Por eso los candidatos van de menor a mayor:

- Consulta del tipo de cambio de referencia (`/indicadores/tc/dolar`), que el SDK no tiene.
- Leer el motivo de rechazo con el parser de XML en lugar de una expresión regular.
- Un ejemplo de factura de exportación de servicios armado con las reglas del Anexo. El ejemplo actual mezcla datos que no corresponden a una exportación.
- En el PR #120, que propone volver al XSD de 2024: el dato, con su fuente, de que el XSD de 2026 es el que Hacienda publica hoy y de que los códigos nuevos ya están activos.
- Datos sobre los algoritmos de las llaves .p12 de pruebas (issue #119 del SDK), cuando haya credenciales.

El SDK pide Node 22.13 o superior, pnpm, `pnpm verify` en verde, xmllint instalado, pruebas de comportamiento y un changeset.

## Forma de trabajo

- Un issue, una rama y un PR. El PR se abre en borrador, la integración continua tiene que pasar y se mergea con squash.
- Commits con el formato de Conventional Commits, en español: `feat: cálculo del resumen de la factura de exportación`.
- El idioma de cada cosa está en la [decisión 0011](decisiones/0011-idioma-del-repo.md).
- Toda decisión de diseño nueva se escribe en `docs/decisiones/` antes de implementarla.
- Los datos de prueba son inventados. En el repo no va ninguna cédula, nombre ni correo real, ni ninguna llave.
- Una tarea está terminada cuando tiene las pruebas de su capa, se recorrió a mano y los documentos quedaron al día. Si tiene pantalla, además: se usa completa con el teclado, el foco se ve, cada campo tiene etiqueta y su error, hay estado vacío y de carga, y axe no reporta fallas.
- Etiquetas: `tipo/paraguas`, `tipo/funcionalidad`, `tipo/tarea`, `tipo/prueba-de-concepto`, `area/dominio`, `area/hacienda`, `area/datos`, `area/ui` y `area/infra`. Cada etapa es un milestone.

## Antes de producción

No entra en la versión 1, pero hace falta antes de emitir comprobantes reales:

- Estar inscrito en Hacienda con la actividad económica que corresponda.
- Revisar con un contador las reglas de exportación de servicios y el código de tarifa.
- Probar todos los caminos contra el ambiente de pruebas de Hacienda.
- Lo que pide el [modelo de amenazas](seguridad.md) antes de producción.
- Si otras personas usan la app: cumplir las obligaciones de proveedor de sistemas del reglamento, abrir el registro con un servicio de correo propio y pasar a un plan pago de Vercel, porque el gratuito es para uso sin fines comerciales.
