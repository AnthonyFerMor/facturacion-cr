-- Servicio: lo que el emisor factura, con su código CAByS, su unidad, su precio y su
-- moneda. Las reglas de cada columna están en la decisión 0013.
create table public.servicios (
  id uuid primary key default gen_random_uuid(),
  -- Quien crea un servicio no dice de qué emisor es: la base pone el suyo.
  emisor_id uuid not null default public.emisor_actual()
    references public.emisores (id) on delete cascade,
  -- Cómo sale en la línea de la factura: el campo Detalle del XSD.
  detalle text not null,
  -- 13 dígitos. Con un código de bienes (primer dígito de 0 a 4) la factura de
  -- exportación pide la partida arancelaria, y esta app factura solo servicios.
  codigo_cabys text not null check (codigo_cabys ~ '^[5-9][0-9]{12}$'),
  -- La descripción del catálogo con que se eligió el código.
  descripcion_cabys text not null,
  -- Las unidades de servicio de la nota 15 del Anexo.
  unidad_medida text not null check (unidad_medida in ('Sp', 'St', 'Spe', 'Os', 'h', 'D')),
  -- Decisión 0003: los montos van en numeric(18,5) y por debajo de diez mil millones.
  precio_unitario numeric(18, 5) not null
    check (precio_unitario > 0 and precio_unitario < 10000000000),
  moneda text not null check (moneda in ('USD', 'CRC')),
  creado_en timestamptz not null default now()
);

create index servicios_emisor_id_idx on public.servicios (emisor_id);

-- Los permisos van explícitos: solo un usuario con sesión llega a la tabla, y no puede borrar.
revoke all on table public.servicios from anon, authenticated;
grant select, insert, update on table public.servicios to authenticated;

alter table public.servicios enable row level security;

-- `(select ...)` hace que Postgres busque el emisor una vez por consulta y no una vez por fila.
create policy "El dueño ve los servicios de su emisor" on public.servicios
  for select to authenticated
  using (emisor_id = (select public.emisor_actual()));

create policy "El dueño crea servicios en su emisor" on public.servicios
  for insert to authenticated
  with check (emisor_id = (select public.emisor_actual()));

create policy "El dueño cambia los servicios de su emisor" on public.servicios
  for update to authenticated
  using (emisor_id = (select public.emisor_actual()))
  with check (emisor_id = (select public.emisor_actual()));
