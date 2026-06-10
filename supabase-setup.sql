-- Misión Matemática — tabla de alumnos para el ranking
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run

create table public.students (
  id uuid primary key,
  name text not null,
  points integer not null default 0,
  stars integer not null default 0,
  missions integer not null default 0,
  exercises integer not null default 0,
  correct integer not null default 0,
  streak integer not null default 0,
  last_active timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- RLS activado sin políticas públicas: solo el service role (la API del
-- servidor) puede leer/escribir. El navegador nunca toca la base directamente.
alter table public.students enable row level security;
