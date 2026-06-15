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

-- Seed key awal agar semua modul langsung jalan saat pertama deploy
insert into public.settings (key, value)
values
  ('news_items', '[]'::jsonb),
  ('agenda_items', '[]'::jsonb),
  ('gallery_items', '[]'::jsonb),
  ('contact_info', '{
    "address": "Jl. Sriwijaya No. 12, Gambiran, Kec. Gambiran, Kab. Banyuwangi, Jawa Timur",
    "phone": "",
    "email": "",
    "hours": "Senin - Jumat: 07:00 - 14:00 WIB",
    "mapQuery": "MA+Amanatulloh+Gambiran+Banyuwangi",
    "mapEmbedUrl": "",
    "mapDirectionsUrl": "",
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "youtube": "https://youtube.com"
  }'::jsonb),
  ('slider_items', '[]'::jsonb),
  ('profile_data', '{}'::jsonb),
  ('stats_data', '{
    "siswaAktif": "0",
    "tenagaPendidik": "0",
    "prestasi": "0",
    "akreditasi": "C"
  }'::jsonb),
  ('school_identity', '{
    "schemaVersion": 1,
    "revision": 1,
    "updatedAt": "2026-01-01T00:00:00.000Z",
    "themePreset": "ocean",
    "schoolName": "MA Amanatulloh",
    "schoolShortName": "MA Amanatulloh",
    "schoolTagline": "Kabupaten Banyuwangi",
    "legalName": "MA Amanatulloh",
    "schoolLogo": "",
    "showLogo": true,
    "footerDescription": "Madrasah Aliyah yang mencetak generasi beriman, berilmu, dan berakhlak mulia.",
    "address": "JL. Sriwijaya No. 12, Gambiran, Kec. Gambiran, Kab. Banyuwangi, Jawa Timur",
    "phone": "",
    "email": "",
    "hours": "Senin - Jumat: 07:00 - 14:00 WIB",
    "mapQuery": "MA+Amanatulloh+Gambiran+Banyuwangi",
    "mapEmbedUrl": "",
    "mapDirectionsUrl": "",
    "facebook": "https://facebook.com",
    "instagram": "https://instagram.com",
    "youtube": "https://youtube.com",
    "primaryColor": "#0f766e",
    "secondaryColor": "#0f5aa6",
    "accentColor": "#f59e0b",
    "footerBackgroundColor": "#082f49",
    "legalNotice": "Dibuat dengan sepenuh hati untuk pendidikan Indonesia",
    "copyrightText": "",
    "showCurrentYear": true,
    "developerName": "",
    "developerUrl": ""
  }'::jsonb),
  ('brand_settings', '{
    "schoolLogo": "",
    "showLogo": true,
    "schoolName": "MA Amanatulloh",
    "schoolTagline": "Kabupaten Banyuwangi"
  }'::jsonb),
  ('download_documents', '{
    "pageTitle": "Download Dokumen",
    "pageDescription": "Silakan pilih dokumen yang dibutuhkan lalu buka atau unduh melalui tautan Google Drive yang tersedia.",
    "showPage": true,
    "documents": []
  }'::jsonb),
  ('footer_credit', '{
    "copyrightText": "",
    "rightText": "Dibuat dengan penuh dedikasi untuk pendidikan Indonesia",
    "showYear": true,
    "schoolName": "MA Amanatulloh",
    "developerName": "",
    "developerUrl": ""
  }'::jsonb),
  ('seo_data', '{
    "metaTitle": "MA Amanatulloh - Website Resmi",
    "metaDescription": "Website resmi MA Amanatulloh, Kecamatan Gambiran, Kabupaten Banyuwangi, Jawa Timur.",
    "metaKeywords": "MA Amanatulloh, MAN, madrasah aliyah, sekolah Banyuwangi, pendidikan Gambiran, madrasah swasta",
    "ogImage": "",
    "ogType": "website",
    "robots": "index, follow",
    "canonicalUrl": "",
    "googleVerification": "",
    "bingVerification": "",
    "googleAnalyticsId": ""
  }'::jsonb),
  ('analytics_data', '{
    "totalPageViews": 0,
    "totalSessions": 0,
    "dailyViews": [],
    "pageViews": {},
    "referrers": {},
    "lastUpdated": "2026-01-01T00:00:00.000Z"
  }'::jsonb),
  ('instagram_settings', '{
    "username": "@ma_amanatulloh",
    "profileUrl": "https://www.instagram.com/ma_amanatulloh",
    "showSection": true,
    "sectionTitle": "Instagram Madrasah",
    "embedType": "widget",
    "widgetCode": "",
    "posts": []
  }'::jsonb),
  ('sponsors_data', '{
    "showSection": true,
    "title": "Didukung Oleh",
    "sponsors": []
  }'::jsonb),
  ('smpb_button', '{
    "isActive": false,
    "year": "2026",
    "link": "",
    "openInNewTab": true
  }'::jsonb),
  ('auth_settings', '{"username":"admin","password":"admin123","showDemoCredentials":true}'::jsonb)
on conflict (key) do nothing;
