# facturacion-cr

[Read in English](README.md)

App web de facturación electrónica de Costa Rica para trabajadores independientes que les cobran a clientes del exterior. Emite la factura electrónica de exportación (tipo 09, versión 4.4) en dólares, la envía a Hacienda, le da seguimiento hasta que la aceptan o la rechazan, y guarda el XML firmado, el PDF y la respuesta.

Estado: en planificación. Todavía no hay código. El plan y las decisiones de diseño están en `docs/`.

## Por qué existe

Es una implementación completa y abierta del ciclo de un comprobante sobre el SDK de código abierto [hacienda-cr](https://github.com/DojoCodingLabs/hacienda-cr): armarlo, firmarlo, enviarlo, seguirlo, entregarlo y archivarlo. Hacienda ya tiene un facturador gratuito, Tico Factura, y este proyecto no busca reemplazarlo.

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
