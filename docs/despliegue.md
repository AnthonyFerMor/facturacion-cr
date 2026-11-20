# Despliegue

La app corre en Vercel y la base en un proyecto de Supabase en la nube, en `us-east-1`, la misma región de las funciones de Vercel (`iad1`). Todo se hace por CLI y Vercel no está conectado con GitHub: un merge a `main` no despliega nada ([arquitectura](arquitectura.md#entornos)).

Hacen falta las sesiones de las dos CLIs (`npx supabase login` y `npx vercel@latest login`) y una API key de Resend con permiso de envío, que los comandos de Auth leen de la variable `RESEND_API_KEY`.

## Primera vez

1. Crear el proyecto de Supabase y enlazar el repo con él:

   ```bash
   npx supabase orgs list
   npx supabase projects create facturacion-cr --org-id <org> --region us-east-1 --db-password <contraseña>
   npx supabase link --project-ref <ref>
   ```

2. Aplicar las migraciones: `npx supabase db push --remote`. Sin `--remote`, la CLI las aplica en la base local.
3. Crear el proyecto de Vercel y desconectar GitHub. Cuando `vercel link --yes` crea el proyecto, también conecta el repo de GitHub, y con esa conexión cada push a `main` desplegaría:

   ```bash
   npx vercel@latest link --yes --project facturacion-cr
   npx vercel@latest git disconnect --yes
   ```

   El link también escribe en `.env.local` un token de Vercel que la app no usa.

4. Cargar las variables y desplegar:

   ```bash
   npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL production
   npx vercel@latest env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
   npx vercel@latest deploy --prod
   ```

   La URL y la llave pública salen de `npx supabase projects api-keys`.

5. Configurar Auth con `RESEND_API_KEY` cargada: `npx supabase config diff` muestra qué cambia y `npx supabase config push` lo aplica. El bloque `[remotes.nube]` de `supabase/config.toml` vale solo para el proyecto de la nube: pone la URL de Vercel como `site_url`, cierra el registro y manda los correos por Resend. Sin ese SMTP, Supabase rechaza el push entero en el plan gratis (400 `entitlement_required`), porque no deja usar plantillas propias con su correo incorporado.
6. Crear la cuenta del dueño en el panel de Supabase: Authentication, Users, Add user, Create new user, con Auto Confirm User. Sin dominio propio, Resend solo entrega al correo de su cuenta, así que la cuenta del dueño usa ese correo. Con el registro cerrado nadie más puede crearse una cuenta.

## Cada despliegue

Desde `main` al día y sin cambios pendientes, porque la CLI de Vercel sube la carpeta como está:

1. Si hay migraciones nuevas: `npx supabase db push --remote --dry-run` para ver cuáles se aplican, y después sin `--dry-run`.
2. Si cambió `supabase/config.toml`: `npx supabase config diff` y `npx supabase config push`, con `RESEND_API_KEY` cargada.
3. `npx vercel@latest deploy --prod`.

En un checkout nuevo, primero `npx supabase link --project-ref <ref>` y `npx vercel@latest link --yes --project facturacion-cr`. Enlazar un proyecto de Vercel que ya existe no conecta GitHub.

## Comprobar

- La app responde en su URL de Vercel.
- La cuenta del dueño pide un enlace, lo abre y entra.
- Un correo sin cuenta ve la misma pantalla que uno con cuenta y no recibe nada.
