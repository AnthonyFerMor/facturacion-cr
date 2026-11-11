# 0008. Bitácora en la base y un chequeo diario de la demo

Fecha: 2026-11-10. Estado: aceptada.

## Contexto

Cuando un comprobante no llega a «aceptado», hay que poder contestar qué pasó y cuándo, también una semana después. Los logs de la plataforma sirven para depurar en el momento, no como archivo. La app todavía no tiene usuarios reales, y su demo pública tiene que estar arriba cuando alguien abra el enlace.

## Decisión

- `eventos_comprobante` guarda cada cambio de estado y cada llamada a Hacienda que trae algo nuevo o falla, con la fecha y el detalle. La pantalla de detalle la muestra como línea de tiempo.
- Los logs del servidor son JSON con el comprobante, el trabajo y el intento, y pasan por una función que oculta secretos.
- Una pantalla interna lista los trabajos pendientes, vencidos y fallidos.
- Un workflow programado de GitHub Actions recorre la demo desplegada una vez al día: entra, emite una factura y espera a verla aceptada. Si falla, GitHub le avisa al dueño del repo.

## Alternativas descartadas

- Sentry u otro servicio de errores: otra cuenta y otra librería. Se revisa cuando haya usuarios reales.
- Solo logs: no contestan qué pasó con una factura de la semana pasada.

## Consecuencias

La bitácora suma pocas filas por comprobante. El chequeo diario crea datos de demo, que la limpieza diaria borra, y de paso mantiene en uso el proyecto de Supabase ([decisión 0001](0001-nextjs-supabase-runtime-node.md)).
