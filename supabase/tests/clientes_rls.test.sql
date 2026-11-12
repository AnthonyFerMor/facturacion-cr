-- Un usuario solo llega a los clientes de su emisor. Si esto falla, un emisor
-- podría leer la cartera de clientes de otro o cambiar a quién le factura.
begin;
select plan(12);

-- Dos usuarios con emisor y uno sin emisor, con datos inventados.
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'ana@ejemplo.test'),
  ('22222222-2222-4222-8222-222222222222', 'beto@ejemplo.test'),
  ('33333333-3333-4333-8333-333333333333', 'carla@ejemplo.test');

insert into public.emisores
  (id, usuario_id, tipo_identificacion, numero_identificacion, nombre, correo, actividad_economica)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111',
   '01', '000000001', 'Ana Ejemplo', 'ana@ejemplo.test', '000000'),
  ('bbbbbbbb-0000-4000-8000-000000000002', '22222222-2222-4222-8222-222222222222',
   '01', '000000002', 'Beto Ejemplo', 'beto@ejemplo.test', '000000');

insert into public.clientes (emisor_id, numero_identificacion, nombre, correo) values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'US000000001', 'Cliente de Ana', 'pagos@cliente-de-ana.test'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'DE000000002', 'Cliente de Beto', 'pagos@cliente-de-beto.test');

-- Sesión de Ana.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}',
  true
);

select results_eq(
  'select nombre from public.clientes',
  array['Cliente de Ana'],
  'Ana ve sus clientes y ninguno de Beto'
);

-- Quien crea un cliente no dice de qué emisor es: la base pone el suyo.
select lives_ok(
  $$ insert into public.clientes (numero_identificacion, nombre, correo)
     values ('GB000000003', 'Otro cliente de Ana', 'cuentas@otro-cliente.test') $$,
  'Ana crea un cliente'
);

select results_eq(
  $$ select emisor_id, tipo_identificacion from public.clientes
     where numero_identificacion = 'GB000000003' $$,
  $$ values ('aaaaaaaa-0000-4000-8000-000000000001'::uuid, '05') $$,
  'El cliente nuevo queda en el emisor de Ana, como extranjero no domiciliado'
);

select throws_ok(
  $$ insert into public.clientes (emisor_id, numero_identificacion, nombre, correo)
     values ('bbbbbbbb-0000-4000-8000-000000000002', 'FR000000004', 'Colado', 'colado@ejemplo.test') $$,
  '42501',
  null,
  'Ana no crea un cliente en el emisor de Beto'
);

select is_empty(
  $$ update public.clientes set nombre = 'Cambiado'
     where emisor_id = 'bbbbbbbb-0000-4000-8000-000000000002' returning id $$,
  'Ana no cambia un cliente de Beto'
);

select throws_ok(
  $$ update public.clientes set emisor_id = 'bbbbbbbb-0000-4000-8000-000000000002' $$,
  '42501',
  null,
  'Ana no le pasa sus clientes a Beto'
);

-- El receptor de una factura de exportación va con el tipo 05 y hasta 20 letras y números.
select throws_ok(
  $$ insert into public.clientes (tipo_identificacion, numero_identificacion, nombre, correo)
     values ('01', '100000042', 'Cliente local', 'local@ejemplo.test') $$,
  '23514',
  null,
  'Un cliente no se guarda con un tipo de identificación local'
);

select lives_ok(
  $$ insert into public.clientes (numero_identificacion, nombre, correo)
     values ('AB123456789012345678', 'Veinte', 'veinte@ejemplo.test') $$,
  'La identificación acepta 20 caracteres'
);

select throws_ok(
  $$ insert into public.clientes (numero_identificacion, nombre, correo)
     values ('AB1234567890123456789', 'Veintiuno', 'veintiuno@ejemplo.test') $$,
  '23514',
  null,
  'La identificación no acepta 21 caracteres'
);

select throws_ok(
  'delete from public.clientes',
  '42501',
  null,
  'Un usuario no borra clientes'
);

-- Carla tiene sesión pero no emisor: no tiene dónde guardar un cliente.
select set_config(
  'request.jwt.claims',
  '{"sub": "33333333-3333-4333-8333-333333333333", "role": "authenticated"}',
  true
);

select throws_ok(
  $$ insert into public.clientes (numero_identificacion, nombre, correo)
     values ('IT000000005', 'Sin emisor', 'sin-emisor@ejemplo.test') $$,
  '42501',
  null,
  'Quien no tiene emisor no crea clientes'
);

-- Sin sesión no se llega a la tabla.
set local role anon;
select throws_ok(
  'select 1 from public.clientes',
  '42501',
  null,
  'Sin sesión no se lee ningún cliente'
);

select * from finish();
rollback;
