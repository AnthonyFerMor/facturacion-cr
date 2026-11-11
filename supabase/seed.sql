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
