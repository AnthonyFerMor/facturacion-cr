# Producto

## Problema

Un trabajador independiente que vive en Costa Rica y le cobra a una empresa del exterior emite una factura electrónica de exportación (tipo 09) por cada cobro. El reglamento la define para «la prestación de servicios o venta de bienes intangibles que se realicen desde el territorio nacional hacia el exterior». En la versión 4.4 esa factura tiene reglas propias:

- El receptor lleva el tipo de identificación 05, «Extranjero No Domiciliado». No lleva ubicación: la dirección va en otras señas.
- Cada línea lleva su código CAByS y el nodo de impuesto.
- Si la moneda es el dólar, el Anexo pide el tipo de cambio de venta de referencia del BCCR y advierte que, si no, rechaza el comprobante.

Después de emitir, Hacienda tiene hasta tres horas para responder, el comprobante se le entrega al cliente aunque la respuesta no haya llegado y el emisor tiene que conservarlo cinco años. El reglamento solo obliga a los sistemas de emisión a administrar la información de al menos dos meses; guardar los cinco años le toca al emisor.

Hoy esa persona tiene dos caminos:

- Tico Factura, el facturador gratuito de Hacienda dentro de TRIBU-CR, en uso desde el 6 de octubre de 2025. Según las guías de Hacienda, guarda clientes (también extranjeros no domiciliados), tiene campos de moneda y tipo de cambio, envía los archivos por correo y deja descargarlos. Hacienda no publica cuánto tiempo conserva los comprobantes. No encontramos una fuente oficial que confirme que emite la factura de exportación; Alegra, un competidor, dice que sí.
- Sistemas pagos. Alegra tiene un plan para independientes, Factúrele uno para profesionales y freelancers, y FACTURATica una página sobre la factura de exportación de software, diseño y consultoría. Todos son sistemas generales, con contabilidad, inventario o punto de venta.

## Qué es este proyecto

Es una implementación completa y abierta del ciclo de un comprobante sobre el SDK hacienda-cr: armarlo, firmarlo, enviarlo, seguirlo hasta la respuesta, entregarlo y archivarlo. Resuelve un solo caso, la factura de exportación en dólares de un independiente, con el archivo de cinco años y el resumen del mes en colones para declarar. No busca reemplazar a Tico Factura, que es gratis y cubre la emisión a mano.

## Usuario

Una persona que trabaja por su cuenta, por ejemplo en desarrollo de software o en diseño, y emite entre una y diez facturas al mes, casi todas en dólares a empresas de afuera. No es contadora. Quiere facturar rápido y tener todo guardado para declarar.

## Primera versión

1. Guarda el perfil del emisor y sus credenciales de Hacienda, cifradas.
2. Guarda clientes del exterior y servicios con su código CAByS.
3. Emite la factura electrónica de exportación en dólares con el tipo de cambio del BCCR del día.
4. Envía el comprobante a Hacienda, consulta el estado hasta que llega la respuesta y muestra el motivo si lo rechazan.
5. Le entrega al cliente el XML firmado y el PDF al emitir, y la respuesta de Hacienda cuando llega.
6. Guarda XML, respuesta y PDF, deja descargar el mes completo y arma un resumen mensual con los montos en colones.
7. Anula una factura aceptada con una nota de crédito y reemite una rechazada como comprobante nuevo que la referencia.
8. Tiene un modo simulado que imita a Hacienda, para la demo pública y para las pruebas.

La factura electrónica para clientes locales (tipo 01, con IVA del 13 %) queda como última etapa y es opcional: se hace si el resto está terminado.

## Fuera de la primera versión

- Producción. Exige estar inscrito en Hacienda. Si otras personas usan la app, quien la ofrece pasa a ser proveedor de sistemas y tiene que cumplir los artículos 5, 14 y 16 del reglamento. Se decide después de la versión 1, con un contador.
- Registro abierto. En la nube solo entran la demo anónima y la cuenta del dueño ([decisión 0009](decisiones/0009-demo-anonima-y-registro-cerrado.md)).
- Tiquete, nota de débito, factura de compra, recibo electrónico de pago y confirmación de comprobantes recibidos.
- Nota de crédito parcial.
- Contabilidad, inventario, punto de venta, cobros y suscripciones.
- Varios usuarios por emisor.

## Criterios de éxito

- Cualquier persona recorre la demo pública sin registrarse: emite una factura de exportación, la ve aceptada y descarga sus archivos.
- Cada comprobante tiene guardados su XML firmado, la respuesta de Hacienda y el PDF.
- El XML de una factura de exportación pasa el XSD que Hacienda publica hoy, y su firma se verifica.
- La integración continua corre en cada PR y cada decisión de diseño está escrita en `docs/decisiones/`.
- Un aporte enviado al SDK hacienda-cr, con su issue y sus pruebas. Que lo acepten depende del mantenedor.
- Cuando haya credenciales: una factura de exportación llega a «aceptado» en el ambiente de pruebas de Hacienda.

## Lo que la app no decide

Si un servicio cuenta como exportación depende de dónde se usa el servicio, según el artículo 8 de la Ley del IVA. La app no lo decide ni da asesoría tributaria: la persona elige el tipo de comprobante y la tarifa, y la pantalla enlaza a la norma. Para la factura de exportación la app propone el código de tarifa 10, «Tarifa Exenta», que el Anexo liga a ese artículo 8. El código 01, «Tarifa 0%», está reservado en el Anexo para las ventas del artículo 32 del reglamento del IVA, como las ventas a la CCSS. Esa lectura hay que confirmarla con un contador y con el ambiente de pruebas.

## Riesgos

| Riesgo | Qué hacemos |
| --- | --- |
| Las credenciales del ambiente de pruebas exigen estar inscrito en Hacienda con al menos una actividad económica (guía oficial fechada 02/05/2025). | Todo se construye primero contra el modo simulado. El ambiente de pruebas se conecta cuando haya credenciales. |
| Que el simulador acepte un comprobante no prueba que Hacienda lo acepte. | El XML se valida contra el XSD oficial y la firma se verifica en cada prueba. El README dice qué se probó contra Hacienda y qué no. |
| El SDK está en versión 0.x. La factura de exportación solo existe en su API de números de JavaScript, y hay un PR abierto que volvería al XSD de 2024. | Versión fija, el SDK detrás de un adaptador propio, XML de referencia en las pruebas y una prueba de concepto antes de construir encima. |
| La URL del ambiente de pruebas que da el Anexo y la que usa el SDK son distintas, y sin credenciales no se puede saber cuál responde. | La URL va en una variable de entorno. |
| Las APIs públicas de Hacienda bloquean la IP diez minutos si se pasa el límite, y avisan que el bloqueo cuenta aunque varios clientes compartan la IP, como pasa en Vercel. | El tipo de cambio se guarda al consultarlo, y el tipo de cambio, el CAByS y la actividad económica se pueden escribir a mano si la API no responde. |
| La app guarda llaves criptográficas y contraseñas. | Cifrado en la app ligado a cada emisor, acceso solo desde el servidor y nada de eso en los logs ([modelo de amenazas](seguridad.md)). |
| El plan gratuito de Supabase pausa un proyecto tras siete días de poca actividad, y la demo dejaría de responder. | Un chequeo diario recorre la demo y avisa si falla. |
