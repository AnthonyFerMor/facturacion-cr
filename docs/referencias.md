# Referencias

Fuentes del diseño. Primera revisión: 6 de noviembre de 2026. Segunda revisión, contra la fuente primaria: 10 de noviembre de 2026.

## Normativa de Hacienda

- [Anexos y estructuras, versión 4.4](https://www.hacienda.go.cr/docs/ANEXOS_Y_ESTRUCTURAS_V4.4.pdf). Documento de noviembre de 2024; su bitácora de cambios llega al 22/04/2026. No hay una versión posterior anunciada. Campos, validaciones, códigos, URLs de la API, formato de la firma y nombres de los archivos (nota 3).
- [Actualización de los Anexos y estructuras 4.4](https://www.hacienda.go.cr/docs/ActualizacionAnexosyEstructurasVersion4.4CEv2.pdf). Abril de 2026. Códigos de referencia nuevos, que los sistemas deben tener desde el 1 de noviembre de 2026 y que ya están activos en pruebas y en producción.
- [XSD de la factura de exportación](https://www.hacienda.go.cr/docs/FacturaElectronicaExportacion_V4.4.xsd). Modificado el 22/04/2026. Los demás XSD están en la misma carpeta.
- [Resolución MH-DGT-RES-0027-2024](https://www.hacienda.go.cr/docs/Resolucion_General_sobre_disposiciones_tecnicas_comprobantes_electronicos_para.pdf). 13/11/2024. Código QR (artículo 4, suspendido por un transitorio), requisitos de los sistemas de proveedores (artículo 7) y plazo de tres horas para la respuesta de Hacienda (artículo 11).
- [Comunicado CP-08-2025](https://www.hacienda.go.cr/docs/CP08-TRIBUTACION_AMPLIA%20PLAZO_PARA_IMPLEMENTAR_CAMBIOS_EN_COMPROBANTES_ELECTRONICOS.pdf). 11/02/2025. El 1 de setiembre de 2025 como fecha límite para implementar la versión 4.4.
- [Reglamento de comprobantes electrónicos, Decreto 44739-H](https://www.hacienda.go.cr/docs/REGLAMENTO_DE_COMPROBANTES_ELECTRONICOS.pdf). Firmado el 2 de octubre de 2024. Definición de la factura de exportación (artículo 2), proveedores de sistemas (artículo 5), requisitos de los sistemas de emisión (artículos 14 y 16), entrega al receptor (artículo 18), rechazos (artículo 19) y conservación por cinco años (artículo 22).
- [Guía de credenciales para el entorno de pruebas](https://www.hacienda.go.cr/docs/GuiaparaCredencialesEntornodepruebas.pdf). Fechada 02/05/2025. Exige estar inscrito con al menos una actividad económica. El usuario y la contraseña se piden en la oficina virtual de TRIBU-CR, y la llave de pruebas lleva un PIN de cuatro dígitos.
- [Guía del IdP](https://atv.hacienda.go.cr/ATV/ComprobanteElectronico/docs/esquemas/2024/v4.4/Guia_IdP.pdf). De 2018. Es la única fuente oficial del realm y del cliente del ambiente de pruebas.
- [Presentación «Comprobantes electrónicos y versión 4.4»](https://www.hacienda.go.cr/docs/ComprobantesElectronicos-GeneralidadesyVersion4.4.marzo2025.pdf). Marzo de 2025.
- [Preguntas y respuestas de TRIBU-CR](https://www.hacienda.go.cr/docs/dPreguntasYRespuestasDeTRIBU-CR.pdf). Sin fecha visible.

## APIs y SDK

- [API pública de Hacienda](https://api.hacienda.go.cr/docs). Actividades económicas (`/fe/ae`), CAByS (`/fe/cabys`) y tipo de cambio (`/indicadores/tc/dolar`). Límites: 100 solicitudes en 5 segundos o 1.200 en 2 minutos; pasarlos bloquea la IP diez minutos, aunque la IP la compartan varios clientes.
- API de recepción. El Anexo da `https://api.comprobanteselectronicos.go.cr/recepcion/v1/` para producción y `https://api.comprobanteselectronicos.go.cr/recepcion-sandbox/v1/` para pruebas. El SDK usa otra para pruebas: `https://api-sandbox.comprobanteselectronicos.go.cr/recepcion/v1`. Sin credenciales las dos responden lo mismo, así que no se puede saber cuál sirve.
- [SDK hacienda-cr](https://github.com/DojoCodingLabs/hacienda-cr). Versión 0.13.0, publicada el 01/11/2026. Licencia MIT.
- [Guía de integración del SDK](https://github.com/DojoCodingLabs/hacienda-cr/blob/main/docs/production-integration.md). Consecutivos, reintentos y resultados inciertos.
- [PR #126 del SDK](https://github.com/DojoCodingLabs/hacienda-cr/pull/126). 31/10/2026. Cambio de la URL del ambiente de pruebas.

## Tico Factura y el mercado

- [Aviso de Hacienda: Tico Factura disponible desde el 6 de octubre](https://www.hacienda.go.cr/docs/FacturadorGratuitoTICOFACTURADisponibleAPartirdel06deoctubre.pdf). 2025.
- Guías de Tico Factura de Hacienda: [emisión](https://www.hacienda.go.cr/docs/GuiaEmisiondecomprobanteselectronicos.pdf) (01/08/2025), [mantenimiento de clientes](https://www.hacienda.go.cr/docs/GuiaparaMantenimientodeClientesparaTicoFactura.pdf) (30/07/2025) y [consulta de comprobantes emitidos](https://www.hacienda.go.cr/docs/GuiaparaConsultasdecomprobantesemitidos-v01.pdf).
- [Tico Factura](https://siemprealdia.co/costa-rica/impuestos/tico-factura/). Siempre Al Día (de Alegra, un competidor), actualizado el 26/01/2026.
- [Falla en el sistema gratuito de facturación de Hacienda](https://www.crhoy.com/economia/contribuyentes-reportan-falla-en-sistema-gratuito-de-facturacion-de-hacienda/). CRHoy, 11/08/2026. Falló la generación de PDF el 10 de agosto; Hacienda informó que se restableció y que los XML salieron bien.
- Sistemas pagos, según sus propios sitios el 10/11/2026: [precios de Alegra](https://www.alegra.com/costarica/precios/), [precios de Factúrele](https://www.facturele.com/precios/) y [la página de factura de exportación de FACTURATica](https://facturatica.com/factura-de-exportacion-electronica/).

## Cambios entre el 6 y el 10 de noviembre de 2026

Lo que la segunda revisión corrigió en los documentos:

- Tico Factura. No hay fuente oficial de que guarde los comprobantes solo dos meses: el dato venía de un blog de Alegra sobre el facturador anterior. Lo que dice la norma es que todo sistema de emisión debe administrar la información de al menos dos meses (artículo 16 del reglamento y artículo 7 de la resolución) y que conservar cinco años le toca al emisor. Las guías de Hacienda muestran que Tico Factura sí guarda clientes, incluidos los extranjeros no domiciliados.
- Tarifa de la exportación. El Anexo reserva el código 01, «Tarifa 0%», para las ventas del artículo 32 del reglamento del IVA, y liga el código 10, «Tarifa Exenta», al artículo 8 de la Ley 9635. Los documentos hablaban de «IVA de 0 %».
- Tipo de cambio. El Anexo pide el tipo de cambio de venta de referencia del BCCR y dice que, si no, rechaza el comprobante. La única validación que describe es que el valor sea mayor que cero.
- Comprobante rechazado. El que lo reemplaza lo referencia con el código 16 de la nota 9, uno de los códigos nuevos de 2026. La nota de crédito sobre una factura de exportación usa el código 19 de la nota 10, también nuevo.
- XSD. El archivo que Hacienda publica hoy es idéntico, byte por byte, al de la carpeta `schemas/2026` del SDK, que es el que la versión 0.13.0 usa para validar. El PR #120 del SDK, abierto, propone volver al de 2024.
- SDK. Sigue en 0.13.0. El arreglo de redondeo (PR #124) sigue en borrador. El PR #122, abierto, agregaría la factura de exportación a la API de decimales. Hay nueve PRs abiertos de un mismo colaborador; el mantenedor mergeó por última vez el 5 de noviembre.
- Reglamento. El decreto se firmó el 2 de octubre de 2024, y el enlace ahora es el oficial.
- Representación gráfica. La resolución pide un código QR, pero un transitorio lo suspende hasta nuevo aviso.
- Next.js 16. Node es el runtime por defecto y ya no se declara.

Sin verificar todavía: que reenviar un comprobante ya recibido devuelva un error 400 (lo dice el código del SDK, no el Anexo), los límites de uso de la API de recepción y si Tico Factura emite la factura de exportación.
