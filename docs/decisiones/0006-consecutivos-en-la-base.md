# 0006. Consecutivos reservados en la base

Fecha: 2026-11-06. Revisada: 2026-11-10. Estado: aceptada.

## Contexto

El consecutivo de 20 dígitos cuenta desde 1 por sucursal, terminal y tipo de comprobante, y un número no se puede repetir. El contador del SDK es un archivo local (`sequences.json`) cuya clave es tipo, sucursal y terminal: no separa por emisor ni por ambiente, y no sirve en funciones sin disco persistente ni con varios procesos a la vez. La guía de integración del SDK recomienda reservar el número en la base de la aplicación.

## Decisión

Una tabla `consecutivos` con clave única (emisor, ambiente, tipo, sucursal, terminal). La función `emitir_comprobante` le suma uno al contador con `INSERT ... ON CONFLICT DO UPDATE ... RETURNING`, en la misma transacción que saca el comprobante de borrador. Si la transacción se revierte, el número vuelve atrás con ella. Dos emisiones a la vez no chocan: la segunda espera a que la primera termine.

Un número de un comprobante ya emitido no se reutiliza, aunque el envío falle: ese comprobante se reenvía con su mismo número.

## Alternativas descartadas

- El contador del SDK: los problemas descritos arriba.
- Un `SEQUENCE` de Postgres por emisor: no retrocede cuando la transacción se revierte, así que deja huecos en la numeración.

## Consecuencias

Una prueba de integración lanza veinte emisiones a la vez para el mismo emisor y comprueba que los números no se repiten ni dejan huecos. No es una prueba pgTAP porque pgTAP corre en una sola sesión y no puede abrir dos transacciones a la vez.
