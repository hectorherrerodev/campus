-- ============================================================
-- Campus DAW · esquema para Supabase
-- Pégalo entero en Supabase → SQL Editor → New query → Run
-- ============================================================

-- 1) Tabla única de datos: cada fila es un registro de la app
--    (asignatura, clase, entrega, test, nota, progreso…)
create table if not exists public.items (
  user_id    uuid        not null default auth.uid() references auth.users (id) on delete cascade,
  id         text        not null,
  coleccion  text        not null,
  data       jsonb       not null,
  deleted    boolean     not null default false,
  updated_at timestamptz not null default now(),
  server_at  timestamptz not null default now(),
  primary key (user_id, id)
);

create index if not exists items_user_server_at on public.items (user_id, server_at);

-- server_at lo pone siempre el servidor: así la sincronización
-- no depende de que el reloj de cada dispositivo esté bien.
create or replace function public.items_set_server_at()
returns trigger language plpgsql as $$
begin
  new.server_at := clock_timestamp();
  return new;
end $$;

drop trigger if exists items_server_at on public.items;
create trigger items_server_at
  before insert or update on public.items
  for each row execute function public.items_set_server_at();

-- 2) Seguridad: cada usuario solo ve y toca sus propias filas
alter table public.items enable row level security;

drop policy if exists "items: leer lo mío" on public.items;
create policy "items: leer lo mío" on public.items
  for select using (auth.uid() = user_id);

drop policy if exists "items: crear lo mío" on public.items;
create policy "items: crear lo mío" on public.items
  for insert with check (auth.uid() = user_id);

drop policy if exists "items: cambiar lo mío" on public.items;
create policy "items: cambiar lo mío" on public.items
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "items: borrar lo mío" on public.items;
create policy "items: borrar lo mío" on public.items
  for delete using (auth.uid() = user_id);

-- 3) Almacenamiento de documentos (PDF…): bucket privado
insert into storage.buckets (id, name, public, file_size_limit)
values ('documentos', 'documentos', false, 52428800)
on conflict (id) do nothing;

-- Cada usuario solo accede a la carpeta con su id: documentos/<user_id>/...
drop policy if exists "docs: leer lo mío" on storage.objects;
create policy "docs: leer lo mío" on storage.objects
  for select using (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "docs: subir lo mío" on storage.objects;
create policy "docs: subir lo mío" on storage.objects
  for insert with check (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "docs: cambiar lo mío" on storage.objects;
create policy "docs: cambiar lo mío" on storage.objects
  for update using (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "docs: borrar lo mío" on storage.objects;
create policy "docs: borrar lo mío" on storage.objects
  for delete using (bucket_id = 'documentos' and (storage.foldername(name))[1] = auth.uid()::text);
