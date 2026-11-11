# Modelo de amenazas

Qué protege la app, de quién, con qué medida y qué riesgo queda. Vale para la versión 1, que no emite comprobantes reales.

## Qué se protege

- La llave criptográfica (.p12) y su PIN. Con ellos se firman comprobantes a nombre del emisor. El PIN tiene cuatro dígitos, así que el archivo se trata como una llave sin protección propia.
- El usuario y la contraseña del IdP de Hacienda. Con ellos se envían comprobantes a nombre del emisor.
- Los secretos del servidor: la llave maestra de cifrado, la service role de Supabase y el secreto del procesador de trabajos.
- Los comprobantes y sus archivos, que tienen los datos fiscales del emisor y los nombres y montos de sus clientes.

## Amenazas y medidas

| Amenaza | Medida |
| --- | --- |
| Un usuario, o un visitante de la demo, intenta leer o usar datos de otro emisor. | RLS en todas las tablas, con una prueba pgTAP por tabla. La tabla de credenciales no tiene políticas para usuarios. El servidor comprueba que el usuario es dueño del emisor antes de usar la service role. Los archivos se bajan con URLs firmadas que se generan después de esa comprobación. |
| Se filtra la base: un respaldo, una consulta mal hecha o un acceso al panel. | Las credenciales están cifradas con AES-256-GCM y la llave maestra no está en la base ([decisión 0005](decisiones/0005-credenciales-cifradas.md)). |
| Alguien que puede escribir en la base copia las credenciales cifradas de un emisor a la fila de otro, para firmar con una llave ajena. | Cada cifrado está ligado a su emisor, su ambiente y su campo. Descifrarlo en otra fila falla. |
| Un secreto termina en un log o en un mensaje de error. | Los logs pasan por una función que oculta secretos, con pruebas. No se registran cuerpos de solicitudes ni encabezados. |
| Alguien llama al procesador de trabajos desde afuera. | La ruta exige un secreto en el encabezado y lo compara en tiempo constante. No recibe datos: solo procesa trabajos que ya existen. |
| Abuso de la demo: llenar la base, usar el servidor para consultar las APIs de Hacienda o subir una llave real. | Sesiones anónimas con límite por IP y tope de comprobantes. La demo no deja cargar credenciales, no manda correos y busca el CAByS en una lista corta propia. Sus datos se borran cada día ([decisión 0009](decisiones/0009-demo-anonima-y-registro-cerrado.md)). |
| Un archivo .p12 armado para romper el lector. | Tamaño máximo, se procesa solo en el servidor y el error que ve la persona no trae detalles internos. |
| Un secreto o una llave entra al repo. | `.env.example` sin valores, el bloqueo de secretos de GitHub al hacer push y llaves de prueba que se generan en local y no se guardan en el repo. |
| Una dependencia comprometida o con fallas. | Versiones exactas con lockfile, alertas de Dependabot y actualizaciones hechas a propósito. El SDK usa node-forge, que tiene un aviso abierto (GHSA-86w9-cpqp-85rv) sobre la verificación de firmas RSA; el SDK lo sigue en su issue #69. |
| Texto de Hacienda o de un cliente que se muestra en pantalla. | Se muestra como texto, nunca como HTML. |

## Riesgo que queda

- Quien obtenga a la vez la base y las variables de entorno del servidor descifra todas las credenciales. El cifrado en la app no lo evita.
- La llave descifrada está en la memoria del servidor mientras se firma.
- Los proveedores (Vercel, Supabase y Resend) ven los datos que pasan por ellos.

## Antes de producción

Este modelo no alcanza para emitir comprobantes reales. Antes haría falta un servicio de llaves externo, un registro de cada uso de una credencial, una revisión de seguridad hecha por otra persona y, si la app la usan terceros, cumplir las obligaciones de proveedor de sistemas del reglamento.
