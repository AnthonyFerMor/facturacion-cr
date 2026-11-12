-- Datos inventados para desarrollo. Se cargan cuando se crea la base local: con
-- `npm run setup` en una máquina nueva o con `npx supabase db reset`.

-- Una persona de ejemplo. Entra con su correo y el enlace llega al buzón local.
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'authenticated', 'authenticated', 'mariana@ejemplo.test', '', now(),
  '{"provider": "email", "providers": ["email"]}', '{}', now(), now(),
  -- Supabase Auth espera texto vacío en estas cuatro columnas, no nulos.
  '', '', '', ''
);

insert into auth.identities (
  provider_id, user_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '{"sub": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", "email": "mariana@ejemplo.test", "email_verified": true}',
  'email', now(), now(), now()
);

-- Su emisor.
insert into public.emisores (
  usuario_id, tipo_identificacion, numero_identificacion,
  nombre, correo, actividad_economica
) values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '01', '100000042',
  'Mariana Solís Vargas', 'mariana@ejemplo.test', '6201.0'
);

-- Dos clientes del exterior de ese emisor.
insert into public.clientes (emisor_id, numero_identificacion, nombre, correo, otras_senas)
select id, cliente.numero_identificacion, cliente.nombre, cliente.correo, cliente.otras_senas
from public.emisores,
  (values
    ('US000000042', 'Northfield Ejemplo LLC', 'pagos@northfield-ejemplo.test',
     '500 Example Street, Suite 12, Austin, TX 78701, Estados Unidos'),
    ('DE000000017', 'Estudio Boreal Ejemplo GmbH', 'cuentas@boreal-ejemplo.test', null)
  ) as cliente (numero_identificacion, nombre, correo, otras_senas)
where usuario_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

-- Dos servicios de ese emisor, con códigos y descripciones del catálogo CAByS.
insert into public.servicios
  (emisor_id, detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario, moneda)
select id, servicio.detalle, servicio.codigo_cabys, servicio.descripcion_cabys,
  servicio.unidad_medida, servicio.precio_unitario, 'USD'
from public.emisores,
  (values
    ('Desarrollo de software', '8314300000000',
     'Servicios de diseño y desarrollo de software originales', 'h', 45.00),
    ('Consultoría mensual en software', '8313100000100',
     'Servicios de consultoría en software', 'Sp', 1200.00)
  ) as servicio (detalle, codigo_cabys, descripcion_cabys, unidad_medida, precio_unitario)
where usuario_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
