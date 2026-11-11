# 0004. Cola de trabajos en Postgres con pg_cron

Fecha: 2026-11-06. Revisada: 2026-11-10. Estado: aceptada.

## Contexto

El envío y la consulta no pueden pasar dentro del clic en «Emitir». Hacienda tiene hasta tres horas para responder, el token del IdP vence a los cinco minutos y una función de Vercel tiene un tiempo máximo. El SDK no trae una cola durable.

## Decisión

Una tabla `trabajos` en Postgres. El procesador, en `/api/trabajos/procesar`, llama a la función `tomar_trabajos`, que elige los trabajos vencidos con `FOR UPDATE SKIP LOCKED` y los marca como tomados por dos minutos. El procesador ejecuta un paso corto de cada uno y lo cierra o lo reprograma con una espera más larga. Si el procesador muere a la mitad, el plazo vence y otra ejecución toma el trabajo.

pg_cron llama al procesador cada minuto por pg_net, con un secreto en el encabezado que está guardado en Supabase Vault. pg_net corta una llamada a los dos segundos si no se le indica otra cosa, así que se le pasa un tiempo de espera mayor, menor que el minuto del cron. «Emitir» también llama al procesador apenas termina, para no esperar al minuto siguiente. En local, un script hace de cron.

## Alternativas descartadas

- Inngest o Trigger.dev: otro servicio, con su cuenta y su panel.
- `submitAndWait` del SDK dentro de la acción: bloquea la pantalla hasta 60 segundos y el trabajo se pierde si la función se corta.
- Supabase Queues (pgmq): trae la cola y el plazo de visibilidad, pero sus mensajes son JSON suelto. Con una tabla propia cada trabajo apunta a su comprobante y se consulta con SQL desde la pantalla de trabajos y desde las pruebas.
- Los cron de Vercel: en el plan gratuito corren una vez al día.

## Consecuencias

Un trabajo puede ejecutarse más de una vez, así que cada paso tiene que dar el mismo resultado si se repite ([decisión 0007](0007-emision-y-envio-idempotentes.md)). Hace falta una pantalla interna para ver los trabajos pendientes, vencidos y fallidos ([decisión 0008](0008-bitacora-en-la-base.md)).
