# 0005. Credenciales de Hacienda cifradas en la app

Fecha: 2026-11-06. Revisada: 2026-11-10. Estado: aceptada.

## Contexto

Para firmar y enviar, el servidor necesita, por emisor, el usuario y la contraseña del IdP de Hacienda, la llave .p12 y su PIN. Con esos cuatro datos cualquiera puede emitir comprobantes a nombre de esa persona. El PIN tiene cuatro dígitos (guía de credenciales de Hacienda), así que el archivo .p12 por sí solo protege poco: quien lo tenga puede probar los 10.000 PIN posibles.

## Decisión

Cifrado AES-256-GCM con `node:crypto`, un IV aleatorio por campo y el número de versión de la llave maestra, para poder rotarla. Cada cifrado lleva como datos autenticados el emisor, el ambiente, el nombre del campo y la versión: si alguien copia el texto cifrado a la fila de otro emisor, el descifrado falla.

La llave maestra está en una variable de entorno del servidor. La tabla `credenciales_hacienda` no tiene políticas RLS para usuarios: solo la lee el servidor con la service role, por una única función que antes comprueba que el usuario es dueño del emisor. El .p12 se descifra en memoria en el momento de firmar.

## Alternativas descartadas

- Supabase Vault: deja el cifrado dentro de Postgres y es más difícil de probar con Vitest.
- Guardar el .p12 en Storage sin cifrar: una fuga de la base o del bucket expondría las llaves.
- Un servicio de llaves externo (KMS): es lo que correspondería en producción, y es otro servicio con su costo.

## Consecuencias

Si se pierde la llave maestra, cada emisor tiene que volver a cargar sus credenciales. Los logs pasan por una función que oculta secretos.

El cifrado protege contra una fuga de la base. No protege contra alguien que obtenga a la vez la base y las variables de entorno del servidor. El [modelo de amenazas](../seguridad.md) dice qué riesgo queda.
