-- Migración 1: nombres únicos + respaldo completo del progreso
-- Ejecutar en: Supabase Dashboard → SQL Editor → New query → Run

-- Guarda el progreso completo (días completados, insignias, etc.)
-- para poder restaurarlo cuando un alumno vuelve a entrar con su nombre.
alter table public.students add column if not exists extra jsonb;

-- Un nombre no se puede repetir (sin distinguir mayúsculas/minúsculas).
create unique index if not exists students_name_unique
  on public.students (lower(name));
