# 0001. Next.js y Supabase, con todo lo de Hacienda en el runtime de Node

Fecha: 2026-11-06. Revisada: 2026-11-10. Estado: aceptada.

## Contexto

El SDK hacienda-cr se publica solo como ESM, pide Node 22 o superior y usa `node:crypto`, `node:fs`, `Buffer` y xmllint-wasm con workers. El repo no menciona soporte para Deno, runtimes Edge ni el navegador.

## Decisión

Next.js 16 (App Router, TypeScript estricto) desplegado en Vercel, y Supabase para Postgres, Auth, Storage y pg_cron. En Next.js 16 las rutas y las acciones del servidor corren en Node por defecto, así que el runtime no se declara. Node 24 queda fijado en `engines`: es el mismo en local, en la integración continua y en Vercel.

La app usa Cache Components, el modo que la plantilla de Next.js 16 trae activado y que, según su documentación, será el único en la próxima versión mayor. Los datos se leen en cada solicitud salvo que se pida guardarlos en caché, y lo que depende de la sesión se muestra dentro de un `<Suspense>`.

## Alternativas descartadas

- Supabase Edge Functions: corren en Deno, y nada en el SDK indica que funcione ahí.
- Un backend aparte, por ejemplo con Fastify: es otro servicio que desplegar y vigilar, sin una ventaja concreta para este alcance.

## Consecuencias

Hay un solo despliegue. El diseño respeta tres límites del plan gratuito de Vercel:

- Una función corre hasta 300 segundos, así que cada paso del envío a Hacienda tiene que ser corto ([decisión 0004](0004-cola-de-trabajos-en-postgres.md)).
- Una respuesta no pasa de 4,5 MB, así que los archivos se bajan con URLs firmadas de Storage.
- El plan es para uso personal sin fines comerciales. Cobrar por la app obliga a cambiar de plan.

El plan gratuito de Supabase pausa un proyecto tras siete días de poca actividad. Según su documentación bastan unas pocas consultas al día para evitarlo, y el chequeo diario de la demo las hace ([decisión 0008](0008-bitacora-en-la-base.md)).
