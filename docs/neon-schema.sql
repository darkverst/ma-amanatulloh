-- =============================================================
-- MA AMANATULLOH - MINIMAL SCHEMA UNTUK PROJECT SAAT INI
-- Fokus: tabel `settings` yang dipakai src/services/settingsRepository.ts
-- Jalankan di: Neon Dashboard → SQL Editor → New Query → Run
-- =============================================================

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists tr_settings_updated_at on public.settings;
create trigger tr_settings_updated_at
before update on public.settings
for each row
execute function public.set_updated_at();

-- Fungsi untuk membaca ukuran database dari frontend dashboard.
create or replace function public.get_database_storage_stats()
returns table (
  database_bytes bigint,
  database_size text,
  settings_bytes bigint,
  settings_size text,
  settings_rows bigint
)
language sql
security definer
set search_path = public
as $$
  select
    pg_database_size(current_database())::bigint as database_bytes,
    pg_size_pretty(pg_database_size(current_database()))::text as database_size,
    pg_total_relation_size('public.settings')::bigint as settings_bytes,
    pg_size_pretty(pg_total_relation_size('public.settings'))::text as settings_size,
    (select count(*) from public.settings)::bigint as settings_rows;
$$;

-- Key settings akan dibuat otomatis oleh ensureDefaultSettings()
-- saat aplikasi pertama kali dimuat, dengan nilai default kosong.
-- Lihat: src/constants/defaultSettings.ts
--
-- Untuk seed data awal yang lebih lengkap (berita contoh, agenda, galeri, guru, dll),
-- jalankan: node scripts/seed-db.mjs
