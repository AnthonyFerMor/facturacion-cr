-- Un usuario solo llega a los servicios de su emisor, y cada servicio queda listo
-- para una línea de la factura de exportación. Si esto falla, un emisor podría ver
-- o cambiar los precios de otro, o guardar un servicio que Hacienda rechazaría.
begin;
select plan(17);

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

insert into public.servicios
  (emisor_id, detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
values
  ('aaaaaaaa-0000-4000-8000-000000000001', 'Servicio de Ana', '8314300000000',
   'Servicios de diseño y desarrollo de software originales', 'h', 40, 'USD'),
  ('bbbbbbbb-0000-4000-8000-000000000002', 'Servicio de Beto', '8313100000100',
   'Servicios de consultoría en software', 'Sp', 900, 'USD');

-- Sesión de Ana.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "11111111-1111-4111-8111-111111111111", "role": "authenticated"}',
  true
);

select results_eq(
  'select detalle from public.servicios',
  array['Servicio de Ana'],
  'Ana ve sus servicios y ninguno de Beto'
);

-- Quien crea un servicio no dice de qué emisor es: la base pone el suyo.
select lives_ok(
  $$ insert into public.servicios (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('Otro servicio de Ana', '8313200000100', 'Asistencia técnica para solucionar problemas de software', 'St', 55.5, 'CRC') $$,
  'Ana crea un servicio'
);

select results_eq(
  $$ select emisor_id from public.servicios where detalle = 'Otro servicio de Ana' $$,
  $$ values ('aaaaaaaa-0000-4000-8000-000000000001'::uuid) $$,
  'El servicio nuevo queda en el emisor de Ana'
);

select throws_ok(
  $$ insert into public.servicios (emisor_id, detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('bbbbbbbb-0000-4000-8000-000000000002', 'Colado', '8314300000000', 'Servicios de diseño', 'h', 1, 'USD') $$,
  '42501',
  null,
  'Ana no crea un servicio en el emisor de Beto'
);

select is_empty(
  $$ update public.servicios set precio_unitario = 1
     where emisor_id = 'bbbbbbbb-0000-4000-8000-000000000002' returning id $$,
  'Ana no cambia el precio de un servicio de Beto'
);

select throws_ok(
  $$ update public.servicios set emisor_id = 'bbbbbbbb-0000-4000-8000-000000000002' $$,
  '42501',
  null,
  'Ana no le pasa sus servicios a Beto'
);

-- Un cambio sin WHERE no pasa por la política de lectura: solo la de cambio frena
-- que Ana se quede con los servicios de Beto.
update public.servicios set emisor_id = 'aaaaaaaa-0000-4000-8000-000000000001';
reset role;
select results_eq(
  $$ select detalle from public.servicios where emisor_id = 'bbbbbbbb-0000-4000-8000-000000000002' $$,
  array['Servicio de Beto'],
  'Ana no se queda con los servicios de Beto'
);
set local role authenticated;

-- Con un código de bienes, la factura de exportación pediría la partida arancelaria.
select throws_ok(
  $$ insert into public.servicios (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('Un paquete de software', '4781400000000', 'Paquete de software de herramientas de desarrollo', 'Sp', 10, 'USD') $$,
  '23514',
  null,
  'Un servicio no se guarda con un código CAByS de bienes'
);

select throws_ok(
  $$ insert into public.servicios (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('Código corto', '831430000000', 'Doce dígitos', 'h', 10, 'USD') $$,
  '23514',
  null,
  'El código CAByS lleva 13 dígitos'
);

select throws_ok(
  $$ insert into public.servicios (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('Por kilo', '8314300000000', 'Servicios de diseño', 'Kg', 10, 'USD') $$,
  '23514',
  null,
  'Un servicio no se mide en una unidad de mercancías'
);

select throws_ok(
  $$ insert into public.servicios (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('En euros', '8314300000000', 'Servicios de diseño', 'h', 10, 'EUR') $$,
  '23514',
  null,
  'La moneda es dólares o colones'
);

select throws_ok(
  $$ insert into public.servicios (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('Gratis', '8314300000000', 'Servicios de diseño', 'h', 0, 'USD') $$,
  '23514',
  null,
  'El precio no puede ser cero'
);

select lives_ok(
  $$ insert into public.servicios (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('El más caro', '8314300000000', 'Servicios de diseño', 'h', 9999999999.99999, 'USD') $$,
  'El precio llega hasta 9.999.999.999,99999'
);

select throws_ok(
  $$ insert into public.servicios (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('Demasiado caro', '8314300000000', 'Servicios de diseño', 'h', 10000000000, 'USD') $$,
  '23514',
  null,
  'El precio no llega a diez mil millones'
);

select throws_ok(
  'delete from public.servicios',
  '42501',
  null,
  'Un usuario no borra servicios'
);

-- Carla tiene sesión pero no emisor: no tiene dónde guardar un servicio.
select set_config(
  'request.jwt.claims',
  '{"sub": "33333333-3333-4333-8333-333333333333", "role": "authenticated"}',
  true
);

select throws_ok(
  $$ insert into public.servicios (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
     values ('Sin emisor', '8314300000000', 'Servicios de diseño', 'h', 10, 'USD') $$,
  '42501',
  null,
  'Quien no tiene emisor no crea servicios'
);

-- Sin sesión no se llega a la tabla.
set local role anon;
select throws_ok(
  'select 1 from public.servicios',
  '42501',
  null,
  'Sin sesión no se lee ningún servicio'
);

select * from finish();
rollback;
