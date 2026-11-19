# Despliegue

La app corre en Vercel y la base en un proyecto de Supabase en la nube, en `us-east-1`, la misma región de las funciones de Vercel (`iad1`). Todo se hace por CLI y Vercel no está conectado con GitHub: un merge a `main` no despliega nada ([arquitectura](arquitectura.md#entornos)).

Hacen falta las sesiones de las dos CLIs: `npx supabase login` y `npx vercel@latest login`.

## Primera vez

1. Crear el proyecto de Supabase y enlazar el repo con él:

   ```bash
   npx supabase orgs list
   npx supabase projects create facturacion-cr --org-id <org> --region us-east-1 --db-password <contraseña>
   npx supabase link --project-ref <ref>
   ```

2. Aplicar las migraciones: `npx supabase db push --remote`.
3. Configurar Auth. El bloque `[remotes.nube]` de `supabase/config.toml` cambia, solo en la nube, la dirección del enlace del correo y cierra el registro. `npx supabase config diff` muestra qué cambia y `npx supabase config push` lo aplica.
4. Crear la cuenta del dueño en el panel de Supabase: Authentication, Users, Add user, Create new user, con Auto Confirm User. Con el registro cerrado nadie más puede crearse una cuenta.
5. Enlazar Vercel, cargar las variables y desplegar:

   ```bash
   npx vercel@latest link --yes --project facturacion-cr
   npx vercel@latest env add NEXT_PUBLIC_SUPABASE_URL production
   npx vercel@latest env add NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY production
   npx vercel@latest deploy --prod
   ```

   La URL y la llave pública salen de `npx supabase projects api-keys`.

## Cada despliegue

Desde `main` al día:

1. Si hay migraciones nuevas: `npx supabase db push --remote --dry-run` para ver cuáles se aplican, y después sin `--dry-run`.
2. Si cambió `supabase/config.toml`: `npx supabase config diff` y `npx supabase config push`.
3. `npx vercel@latest deploy --prod`.

## Comprobar

- La app responde en su URL de Vercel.
- La cuenta del dueño pide un enlace, lo abre y entra.
- Un correo sin cuenta ve la misma pantalla que uno con cuenta y no recibe nada.
