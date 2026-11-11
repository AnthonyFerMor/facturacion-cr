# 0007. Emisión y envío que se pueden repetir sin duplicar

Fecha: 2026-11-10. Estado: aceptada.

## Contexto

Hay tres momentos en que repetir una operación puede hacer daño:

- El clic en «Emitir». Un doble clic o un reintento después de un error de red crearía dos facturas con consecutivos distintos.
- El trabajo `enviar`. La cola puede ejecutarlo más de una vez ([decisión 0004](0004-cola-de-trabajos-en-postgres.md)), o puede morir entre firmar y enviar.
- El envío a Hacienda. Si la llamada se corta o devuelve un error del servidor, no se sabe si Hacienda recibió el comprobante.

Hacienda identifica cada comprobante por su clave de 50 dígitos. El SDK no reintenta el envío por su cuenta, y su guía de integración advierte que una consulta que responde «no existe» justo después de enviar no prueba que el comprobante no llegó. Según el código del SDK (PR #129), reenviar un comprobante que Hacienda ya recibió devuelve un error 400; el Anexo no lo documenta.

## Decisión

Emitir actúa sobre un borrador que ya existe. La función `emitir_comprobante` lo pasa a `en_cola` solo si sigue en `borrador`, y en la misma transacción reserva el consecutivo y crea el trabajo. Si se llama dos veces, la segunda no cambia nada y devuelve el comprobante ya emitido.

El trabajo `enviar` guarda el XML firmado antes de enviarlo. Si se repite, encuentra el archivo y envía ese mismo, sin volver a armar ni a firmar.

El envío a Hacienda se hace una vez por intento, y cada resultado tiene su camino:

| Resultado | Qué se hace |
| --- | --- |
| Recibido (202) | El comprobante pasa a `enviado` y empieza la consulta del estado. |
| Error 400 o 409 | Se consulta el estado por la clave. Si Hacienda ya lo tiene, sigue como recibido. Si no, el comprobante pasa a `error` con el detalle: el XML está mal y reintentar no lo arregla. |
| Credenciales rechazadas (401 o 403) | El comprobante pasa a `error` con el mensaje «Hacienda rechazó las credenciales». Se reintenta a mano después de corregirlas. |
| Sin respuesta o error del servidor | Se consulta el estado por la clave cinco veces a lo largo de diez minutos. Si aparece, sigue como recibido. Si no, se reenvía el mismo XML. Después de tres reenvíos sin éxito pasa a `error`. |

La consulta del estado espera cada vez más: de cinco segundos a diez minutos durante las tres horas del plazo de Hacienda, y después una vez por hora hasta completar un día. Si no hubo respuesta, el comprobante pasa a `error` y se puede volver a consultar a mano.

Cada correo se manda con una clave de idempotencia (comprobante y tipo de entrega) que el proveedor respeta por 24 horas, y queda anotado en `entregas`.

Un comprobante en `error` se reintenta desde la pantalla con la misma clave y el mismo XML. Nunca se le asigna otro consecutivo.

## Alternativas descartadas

- Reintentar el envío a ciegas: si Hacienda ya lo había recibido, el reintento falla y el comprobante quedaría marcado con error estando recibido.
- Dar por perdido el comprobante y emitir otro: deja un consecutivo sin usar y puede terminar en dos facturas por el mismo cobro.
- El aviso de Hacienda (`callbackUrl`). El Anexo lo documenta: Hacienda llama a una URL con la respuesta. Obliga a exponer una ruta pública cuyo contenido habría que verificar, y la consulta sigue haciendo falta por si el aviso no llega. Puede agregarse después como señal para consultar antes.

## Consecuencias

El simulador tiene que poder imitar cada fila de la tabla: recibir y no contestar, devolver un error del servidor y rechazar un duplicado. Cada camino tiene su prueba de integración. Los tiempos y la cantidad de reintentos son constantes con nombre en un solo archivo.
