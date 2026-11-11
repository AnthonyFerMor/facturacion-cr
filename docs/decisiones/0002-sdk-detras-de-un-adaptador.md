# 0002. El SDK hacienda-cr detrás de un adaptador propio, con un simulador

Fecha: 2026-11-06. Revisada: 2026-11-10. Estado: aceptada.

## Contexto

El SDK arma el XML de los siete tipos de comprobante, lo valida contra el XSD, lo firma con XAdES-EPES, lo envía y consulta el estado. Está en la versión 0.13.0 (1 de noviembre de 2026) y tiene dos API en paralelo: la «legacy», con números de JavaScript, y la «exact», con decimales. La factura de exportación solo existe en la legacy; el PR #122, abierto, la agregaría a la exact. Sin credenciales del ambiente de pruebas no hay forma de hablar con Hacienda.

## Decisión

`src/hacienda/` tiene dos partes:

- Armado y firma. Funciones que reciben el comprobante ya calculado y devuelven el XML firmado. Usan siempre el SDK, también en modo simulado, donde firman con una llave de prueba.
- Pasarela. Una interfaz `PasarelaHacienda` con tres operaciones: enviar un XML firmado, consultar el estado por clave y probar la conexión. Tiene dos implementaciones: `sdk`, contra el ambiente de pruebas, y `simulado`.

El simulador valida el XML contra el XSD y verifica la firma antes de recibirlo, y pasa por `recibido` y `procesando` hasta `aceptado` en unos segundos. Para probar lo demás tiene casos fijos y documentados, que se eligen con el cliente de la factura: uno provoca un rechazo con su motivo, otro deja el comprobante en proceso varios minutos y otro simula un envío que no responde.

El resto de la app solo conoce esas funciones y la interfaz. El SDK se fija en una versión exacta y se actualiza a propósito, con las pruebas de XML de referencia corriendo.

## Alternativas descartadas

- Llamar al SDK directo desde las acciones: cada cambio del SDK tocaría toda la app, y sin credenciales no habría demo.
- Escribir un cliente propio de Hacienda: repetiría trabajo que el SDK ya tiene probado, y la idea es aportarle a ese proyecto.
- Simular a Hacienda a nivel HTTP, pasándole al SDK un `fetch` falso: prueba más código del SDK, pero ata el simulador a la forma en que el SDK hace sus llamadas. El SDK tiene un simulador así en su repo, sin publicar.

## Consecuencias

Las pruebas de contrato de la pasarela corren siempre contra el simulador, y contra el SDK cuando hay credenciales. Que el simulador acepte un comprobante no prueba que Hacienda lo acepte: eso solo lo dice el ambiente de pruebas.

Los XML de ejemplo del SDK sirven para la estructura, no como referencia fiscal: su factura de exportación de ejemplo trae un receptor con cédula jurídica y una tarifa del 13 %. Los XML de referencia de este repo se arman con las reglas del Anexo.
