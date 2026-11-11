# 0009. Demo anónima y registro cerrado

Fecha: 2026-11-10. Estado: aceptada.

## Contexto

Cualquier persona tiene que poder probar la app sin registrarse. Abrir el registro, en cambio, tiene dos costos:

- El correo incorporado de Supabase Auth manda dos correos por hora y solo a miembros del equipo del proyecto. Mandarle un enlace de acceso a cualquier dirección exige un servicio de correo propio con un dominio verificado.
- Significa guardar credenciales de Hacienda de otras personas y ofrecerles un sistema de emisión, con las obligaciones de proveedor de sistemas del reglamento.

## Decisión

En la nube hay dos formas de entrar:

- La demo. Una sesión anónima de Supabase con un emisor de demostración, datos inventados y el simulador. No deja cargar credenciales ni cambiar de ambiente, muestra los correos en pantalla sin mandarlos y sus datos se borran cada día.
- La cuenta del dueño, que entra con un enlace por correo. El registro de cuentas nuevas está deshabilitado.

Las políticas RLS distinguen la sesión anónima con el claim `is_anonymous` del token.

## Alternativas descartadas

- Registro abierto: los dos costos de arriba.
- Una demo con usuario y contraseña compartidos: todos los visitantes verían y cambiarían los mismos datos.

## Consecuencias

Quien quiera probar la app con sus credenciales del ambiente de pruebas clona el repo y la corre en local. Las sesiones anónimas tienen el límite de Supabase de 30 por hora por IP y un tope de comprobantes por sesión. Si hay abuso, se agrega un CAPTCHA al entrar a la demo.
