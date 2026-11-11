-- Un usuario solo llega a su propio emisor. Si esto falla, un emisor podría leer
-- los datos fiscales de otro o emitir a su nombre.
begin;
select plan(8);

-- Dos usuarios y sus emisores, con datos inventados.
insert into auth.users (id, email) values
  ('11111111-1111-4111-8111-111111111111', 'ana@ejemplo.test'),
  ('22222222-2222-4222-8222-222222222222', 'beto@ejemplo.test');

insert into public.emisores
  (usuario_id, tipo_identificacion, numero_identificacion, nombre, correo, actividad_economica)
values
  ('11111111-1111-4111-8111-111111111111', '01', '000000001', 'Ana Ejemplo', 'ana@ejemplo.test', '000000'),
  ('22222222-2222-4222-8222-222222222222', '01', '000000002', 'Beto Ejemplo', 'beto@ejemplo.test', '000000');

-- Sesión de Ana.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}',
  true
);

select results_eq(
  'select nombre from public.emisores',
  array['Ana Ejemplo'],
  'Ana ve su emisor y ningún otro'
);

select lives_ok(
  $$ update public.emisores set nombre = 'Ana Ejemplo Mora'
     where usuario_id = '11111111-1111-4111-8111-111111111111' $$,
  'Ana cambia su emisor'
);

select is_empty(
  $$ update public.emisores set nombre = 'Cambiado'
     where usuario_id = '22222222-2222-4222-8222-222222222222' returning id $$,
  'Ana no cambia el emisor de Beto'
);

select throws_ok(
  $$ update public.emisores set usuario_id = '22222222-2222-4222-8222-222222222222' $$,
  '42501',
  null,
  'Ana no le pasa su emisor a Beto'
);

select throws_ok(
  $$ insert into public.emisores
       (usuario_id, tipo_identificacion, numero_identificacion, nombre, correo, actividad_economica)
     values
       ('22222222-2222-4222-8222-222222222222', '02', '0000000003', 'Otra', 'otra@ejemplo.test', '000000') $$,
  '42501',
  null,
  'Ana no crea un emisor a nombre de Beto'
);

select throws_ok(
  'delete from public.emisores',
  '42501',
  null,
  'Un usuario no borra emisores'
);

-- El emisor de Beto sigue igual después de los intentos de Ana.
reset role;
select results_eq(
  $$ select nombre from public.emisores
     where usuario_id = '22222222-2222-4222-8222-222222222222' $$,
  array['Beto Ejemplo'],
  'El emisor de Beto no cambió'
);

-- Sin sesión no se llega a la tabla.
set local role anon;
select throws_ok(
  'select 1 from public.emisores',
  '42501',
  null,
  'Sin sesión no se lee ningún emisor'
);

select * from finish();
rollback;
