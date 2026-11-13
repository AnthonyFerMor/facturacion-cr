# facturacion-cr

[Read in English](README.md)

App web de facturación electrónica de Costa Rica para trabajadores independientes que les cobran a clientes del exterior. Emite la factura electrónica de exportación (tipo 09, versión 4.4) en dólares, la envía a Hacienda, le da seguimiento hasta que la aceptan o la rechazan, y guarda el XML firmado, el PDF y la respuesta.

Estado: en desarrollo. Se entra con un enlace por correo y se guardan el emisor, los clientes del exterior y los servicios; todavía no emite facturas. El plan y las decisiones de diseño están en `docs/`, y el avance se sigue en los [milestones](https://github.com/AnthonyFerMor/facturacion-cr/milestones).

## Por qué existe

Es una implementación completa y abierta del ciclo de un comprobante sobre el SDK de código abierto [hacienda-cr](https://github.com/DojoCodingLabs/hacienda-cr): armarlo, firmarlo, enviarlo, seguirlo, entregarlo y archivarlo. Hacienda ya tiene un facturador gratuito, Tico Factura, y este proyecto no busca reemplazarlo.

## Cómo levantarlo

Hacen falta Node 24, npm y Docker.

```bash
npm install
npm run setup
npm run dev
```

`npm run setup` levanta Supabase local con Docker, aplica las migraciones y escribe `.env.local`. La app abre en http://localhost:3000. Para entrar se escribe un correo y se abre el enlace que llega al buzón local, en http://localhost:54724. La base trae una persona de ejemplo, `mariana@ejemplo.test`, con su emisor, dos clientes y dos servicios; cualquier otro correo entra sin emisor. El enlace apunta al puerto 3000, así que la app tiene que correr ahí.

Antes de abrir un PR se corren `npm run format:check`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run test:db`, `npm run build` y `npm run test:e2e`. Los recorridos de `npm run test:e2e` usan la app compilada, Supabase local, una API de Hacienda simulada y el Chrome instalado en la máquina.

## Documentos

- [Producto](docs/producto.md): problema, usuario, alcance de la primera versión y riesgos.
- [Arquitectura](docs/arquitectura.md): componentes, flujo de una factura, datos, errores y pruebas.
- [Modelo de amenazas](docs/seguridad.md): qué se protege, de quién y qué riesgo queda.
- [Plan de trabajo](docs/plan.md): etapas, tareas y forma de trabajo.
- [Decisiones](docs/decisiones/): una por archivo, con el contexto y las alternativas descartadas.
- [Diseño](docs/diseno.md): la dirección visual.
- [Referencias](docs/referencias.md): normativa y APIs, con sus fechas.

## Stack

Next.js y TypeScript en Vercel, Supabase (Postgres, Auth, Storage y pg_cron) y el SDK hacienda-cr para armar, validar, firmar y enviar los comprobantes.

## Licencia

[MIT](LICENSE)
