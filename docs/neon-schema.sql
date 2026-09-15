-- =============================================================
-- MA AMANATULLOH - SCHEMA DATABASE & TABEL SETTINGS
-- Fokus: tabel `settings` yang dipakai src/services/settingsRepository.ts
-- Jalankan di: Neon Dashboard → SQL Editor → New Query → Run
-- =============================================================

create table if not exists public.settings (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Trigger untuk memperbarui kolom updated_at otomatis saat data diubah
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

-- Fungsi untuk membaca ukuran database dari frontend dashboard CMS
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

-- =============================================================
-- SEED DATA AWAL: EKSTRAKURIKULER (ESKUL)
-- Disimpan pada key 'extracurricular_items' di tabel public.settings.
-- Semua perubahan CRUD eskul dari dashboard CMS otomatis tersimpan ke key ini.
-- =============================================================

insert into public.settings (key, value, updated_at)
values (
  'extracurricular_items',
  '[
    {
      "id": "eskul-1",
      "name": "Pramuka MA Amanatulloh",
      "category": "Kepemimpinan",
      "description": "Gerakan Pramuka Gugus Depan MA Amanatulloh melatih kedisiplinan, kemandirian, dan kepemimpinan berwawasan kebangsaan.",
      "schedule": "Jumat, 14:00 - 16:30 WIB",
      "location": "Lapangan Utama & Aula Madrasah",
      "coach": "Kak Ahmad Muzakki, S.Pd",
      "image": "",
      "achievements": ["Juara 1 Lomba Pionering 2024", "Juara Umum Perkemahan Songsong Ramadhan 2023"],
      "isActive": true,
      "order": 1
    },
    {
      "id": "eskul-2",
      "name": "Hadrah & Shalawat Al-Banjari",
      "category": "Keagamaan",
      "description": "Seni musik Islam rebana/hadrah khas Al-Banjari untuk melestarikan tradisi shalawat dan mengisi acara madrasah.",
      "schedule": "Rabu, 15:00 - 17:00 WIB",
      "location": "Musholla / Ruang Seni",
      "coach": "Ust. M. Ridwan",
      "image": "",
      "achievements": ["Juara 2 Festival Banjari Santri Jawa Timur 2023"],
      "isActive": true,
      "order": 2
    },
    {
      "id": "eskul-3",
      "name": "Futsal Club",
      "category": "Olahraga",
      "description": "Pembinaan bakat siswa dalam olahraga futsal, taktik bermain, fisik prima, dan sportivitas tim.",
      "schedule": "Sabtu, 07:30 - 10:00 WIB",
      "location": "Lapangan Futsal Fajar",
      "coach": "Coach Dimas Prasetyo",
      "image": "",
      "achievements": ["Juara 2 Turnamen Futsal Antar MA se-Banyuwangi 2025"],
      "isActive": true,
      "order": 3
    },
    {
      "id": "eskul-4",
      "name": "Tahfidz & Tilawah Al-Qur''an",
      "category": "Keagamaan",
      "description": "Program intensif bimbingan hafalan Al-Qur''an juz 30 dan juz pilihan serta seni baca tilawah.",
      "schedule": "Senin & Kamis, 06:15 - 07:00 WIB",
      "location": "Masjid Pondok Pesantren",
      "coach": "Ustadzah Nurul Hidayah, Al-Hafidzah",
      "image": "",
      "achievements": ["Juara 1 MTQ Pelajar Tingkat Kecamatan Gambiran"],
      "isActive": true,
      "order": 4
    },
    {
      "id": "eskul-5",
      "name": "Palang Merah Remaja (PMR Wira)",
      "category": "Kepemimpinan",
      "description": "Pelatihan pertolongan pertama pada kecelakaan (PPPK), donor darah, dan aksi tanggap darurat.",
      "schedule": "Selasa, 14:30 - 16:30 WIB",
      "location": "Ruang UKS Madrasah",
      "coach": "Ibu Siti Khodijah, S.Kep",
      "image": "",
      "achievements": ["Juara Harapan 1 Lomba Pertolongan Pertama PMI 2024"],
      "isActive": true,
      "order": 5
    },
    {
      "id": "eskul-6",
      "name": "Seni Kaligrafi Islam (Khat)",
      "category": "Seni & Budaya",
      "description": "Belajar kaidah berbagai jenis khat Arab (Naskhi, Tsuluts, Diwani, Riq''ah) dan lukisan kanvas kaligrafi.",
      "schedule": "Kamis, 14:30 - 16:30 WIB",
      "location": "Laboratorium Kesenian",
      "coach": "Ust. Fahrur Rozi",
      "image": "",
      "achievements": ["Juara 2 Lomba Kaligrafi Kontemporer PORSENI MA 2023"],
      "isActive": true,
      "order": 6
    }
  ]'::jsonb,
  now()
)
on conflict (key) do update 
set value = excluded.value, updated_at = excluded.updated_at;

-- Daftar key pengaturan yang didukung:
-- 1.  'school_identity'      -> Identitas terpusat (nama, logo, warna tema, kontak, dsb)
-- 2.  'extracurricular_items'-> Daftar kegiatan ekstrakurikuler madrasah (CRUD dari Dashboard)
-- 3.  'slider_items'         -> Slide banner hero di halaman utama (lengkap dengan overlay opacity)
-- 4.  'news_items'           -> Berita madrasah
-- 5.  'agenda_items'         -> Agenda kegiatan
-- 6.  'gallery_items'        -> Dokumentasi galeri & video YouTube
-- 7.  'teachers_data'        -> Data guru & tenaga kependidikan
-- 8.  'profile_data'         -> Profil visi misi & sambutan kepala madrasah
-- 9.  'stats_data'           -> Angka statistik madrasah
-- 10. 'download_documents'   -> Dokumen unduhan publik
-- 11. 'instagram_settings'   -> Feed & widget Instagram
-- 12. 'sponsors_data'        -> Mitra / sponsor madrasah
-- 13. 'smpb_button'          -> Tombol PPDB / SPMB
-- 14. 'auth_settings'        -> Akun login admin
-- 15. 'seo_data'             -> Pengaturan meta tag SEO
-- 16. 'analytics_data'       -> Pelacak kunjungan website
-- 17. 'brand_settings'       -> Logo & branding legacy
-- 18. 'contact_info'         -> Kontak legacy
-- 19. 'footer_credit'        -> Footer credit legacy
