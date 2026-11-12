-- El emisor de quien hace la consulta, o nulo si todavía no creó uno. Las políticas
-- de las tablas que cuelgan de un emisor comparan con esta función, así que la regla
-- de a quién le pertenece cada fila está escrita una sola vez.
create function public.emisor_actual() returns uuid
language sql
stable
-- Corre con los permisos de quien la llama: las políticas de `emisores` siguen aplicando.
security invoker
set search_path = ''
as $$
  select id from public.emisores where usuario_id = (select auth.uid())
$$;

revoke all on function public.emisor_actual() from public, anon, authenticated;
grant execute on function public.emisor_actual() to authenticated;

-- Cliente: a quien el emisor le factura. En la versión 1 todos son del exterior.
create table public.clientes (
  id uuid primary key default gen_random_uuid(),
  -- Quien crea un cliente no dice de qué emisor es: la base pone el suyo.
  emisor_id uuid not null default public.emisor_actual()
    references public.emisores (id) on delete cascade,
  -- Nota 4 del Anexo: 05 es «Extranjero No Domiciliado», el receptor de una factura de exportación.
  tipo_identificacion text not null default '05' check (tipo_identificacion = '05'),
  -- Para el tipo 05 el Anexo admite hasta 20 caracteres, números y letras.
  numero_identificacion text not null check (numero_identificacion ~ '^[A-Za-z0-9]{1,20}$'),
  nombre text not null,
  correo text not null,
  -- La dirección en el extranjero. Un receptor del tipo 05 no lleva provincia, cantón ni distrito.
  otras_senas text,
  creado_en timestamptz not null default now()
);

create index clientes_emisor_id_idx on public.clientes (emisor_id);

-- Los permisos van explícitos: solo un usuario con sesión llega a la tabla, y no puede borrar.
revoke all on table public.clientes from anon, authenticated;
grant select, insert, update on table public.clientes to authenticated;

alter table public.clientes enable row level security;

-- `(select ...)` hace que Postgres busque el emisor una vez por consulta y no una vez por fila.
create policy "El dueño ve los clientes de su emisor" on public.clientes
  for select to authenticated
  using (emisor_id = (select public.emisor_actual()));

create policy "El dueño crea clientes en su emisor" on public.clientes
  for insert to authenticated
  with check (emisor_id = (select public.emisor_actual()));

create policy "El dueño cambia los clientes de su emisor" on public.clientes
  for update to authenticated
  using (emisor_id = (select public.emisor_actual()))
  with check (emisor_id = (select public.emisor_actual()));
