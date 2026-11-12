-- Emisor: la persona que emite los comprobantes. En la versión 1 cada usuario tiene un solo emisor.
create table public.emisores (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null unique references auth.users (id) on delete cascade,
  -- Nota 4 del Anexo: 01 cédula física, 02 cédula jurídica, 03 DIMEX, 04 NITE.
  tipo_identificacion text not null check (tipo_identificacion in ('01', '02', '03', '04')),
  numero_identificacion text not null,
  nombre text not null,
  correo text not null,
  -- CodigoActividadEmisor del XSD: seis caracteres.
  actividad_economica text not null check (char_length(actividad_economica) = 6),
  -- Sucursal y terminal son los primeros 3 y 5 dígitos del consecutivo.
  sucursal text not null default '001' check (sucursal ~ '^[0-9]{3}$'),
  terminal text not null default '00001' check (terminal ~ '^[0-9]{5}$'),
  ambiente text not null default 'simulado' check (ambiente in ('simulado', 'pruebas')),
  creado_en timestamptz not null default now(),
  unique (tipo_identificacion, numero_identificacion)
);

-- Los permisos van explícitos: solo un usuario con sesión llega a la tabla, y no puede borrar.
revoke all on table public.emisores from anon, authenticated;
grant select, insert, update on table public.emisores to authenticated;

alter table public.emisores enable row level security;

create policy "El dueño ve su emisor" on public.emisores
  for select to authenticated
  using ((select auth.uid()) = usuario_id);

create policy "El dueño crea su emisor" on public.emisores
  for insert to authenticated
  with check ((select auth.uid()) = usuario_id);

create policy "El dueño cambia su emisor" on public.emisores
  for update to authenticated
  using ((select auth.uid()) = usuario_id)
  with check ((select auth.uid()) = usuario_id);
