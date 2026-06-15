import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve('.env'), 'utf8');
const match = envContent.match(/VITE_DATABASE_URL=(.+)/);
if (!match) { console.error('VITE_DATABASE_URL not found in .env'); process.exit(1); }
const databaseUrl = match[1].trim();
const sql = neon(databaseUrl);

const now = new Date().toISOString();

const newsItems = [
  {
    id: 'news1', title: 'Penerimaan Peserta Didik Baru TA 2026/2027 Telah Dibuka',
    excerpt: 'MA Amanatulloh membuka pendaftaran peserta didik baru untuk tahun ajaran 2026/2027. Informasi lengkap dapat diakses melalui website resmi atau datang langsung ke sekretariat madrasah.',
    content: '<p>Pendaftaran PPDB MA Amanatulloh Gambiran Tahun Ajaran 2026/2027 telah resmi dibuka mulai Januari 2026.</p><p>Persyaratan Pendaftaran:</p><ul><li>Lulusan MTs/SMP sederajat</li><li>Mengisi formulir pendaftaran</li><li>Fotokopi ijazah/SKHUN (legalisir)</li><li>Fotokopi KK dan Akta Kelahiran</li><li>Pas foto 3x4 (2 lembar)</li></ul>',
    category: 'Akademik', image: '', date: '2026-01-15', author: 'Admin',
  },
  {
    id: 'news2', title: 'Peringatan Hari Santri Nasional 2025',
    excerpt: 'MA Amanatulloh menggelar upacara peringatan Hari Santri Nasional. Acara dimeriahkan dengan berbagai penampilan dari siswa-siswi.',
    content: '<p>Peringatan Hari Santri Nasional diperingati dengan khidmat di halaman MA Amanatulloh. Seluruh siswa, guru, dan staf madrasah mengikuti upacara bendera yang dilanjutkan dengan berbagai kegiatan.</p>',
    category: 'Kegiatan', image: '', date: '2025-10-22', author: 'Admin',
  },
  {
    id: 'news3', title: 'Tim Futsal MA Amanatulloh Juara 2 Turnamen Antar Sekolah',
    excerpt: 'Prestasi membanggakan diraih oleh tim futsal MA Amanatulloh yang berhasil meraih juara 2 dalam turnamen futsal antar sekolah se-Kabupaten Banyuwangi.',
    content: '<p>Tim futsal MA Amanatulloh berhasil meraih juara 2 dalam turnamen futsal antar Madrasah Aliyah se-Kabupaten Banyuwangi yang digelar di GOR Tawang Alun.</p><p>Selamat kepada seluruh pemain dan pelatih atas prestasi yang membanggakan ini.</p>',
    category: 'Prestasi', image: '', date: '2025-11-05', author: 'Admin',
  },
  {
    id: 'news4', title: 'Workshop Literasi Digital bagi Siswa',
    excerpt: 'MA Amanatulloh mengadakan workshop literasi digital untuk meningkatkan kemampuan siswa dalam memanfaatkan teknologi secara bijak.',
    content: '<p>Workshop literasi digital diikuti oleh seluruh siswa kelas X dan XI. Materi yang disampaikan meliputi etika bermedia sosial, keamanan data pribadi, dan teknik pencarian informasi yang efektif di era digital.</p>',
    category: 'Akademik', image: '', date: '2025-11-20', author: 'Admin',
  },
];

const agendaItems = [
  { id: 'ag1', title: 'Ujian Tengah Semester Genap', date: '2026-03-15', endDate: '2026-03-22', time: '07:30 - 12:00', location: 'Ruang Kelas', description: 'Pelaksanaan Ujian Tengah Semester Genap Tahun Ajaran 2025/2026', type: 'Ujian' },
  { id: 'ag2', title: 'Pembagian Raport Semester Ganjil', date: '2026-01-10', endDate: '2026-01-10', time: '08:00 - 11:00', location: 'Aula Madrasah', description: 'Pembagian hasil belajar semester ganjil tahun ajaran 2025/2026 kepada wali murid.', type: 'Kegiatan' },
  { id: 'ag3', title: 'Kegiatan Class Meeting', date: '2026-06-15', endDate: '2026-06-20', time: '08:00 - 13:00', location: 'Lapangan & Kelas', description: 'Kegiatan class meeting setelah pelaksanaan ujian akhir semester. Berbagai lomba dan pertandingan antar kelas.', type: 'Ekstrakurikuler' },
  { id: 'ag4', title: 'Libur Akhir Tahun Pelajaran', date: '2026-06-27', endDate: '2026-07-13', time: '', location: '-', description: 'Libur akhir tahun pelajaran 2025/2026', type: 'Libur' },
];

const galleryItems = [
  { id: 'gal1', title: 'Upacara Hari Santri Nasional', image: '', category: 'Event', date: '2025-10-22', mediaType: 'image', youtubeUrl: '' },
  { id: 'gal2', title: 'Kegiatan Belajar Mengajar', image: '', category: 'Akademik', date: '2025-11-01', mediaType: 'image', youtubeUrl: '' },
  { id: 'gal3', title: 'Pertandingan Futsal', image: '', category: 'Olahraga', date: '2025-11-05', mediaType: 'image', youtubeUrl: '' },
];

const documents = [
  { id: 'doc1', title: 'Brosur PPDB 2026/2027', description: 'Informasi pendaftaran peserta didik baru tahun ajaran 2026/2027', category: 'PPDB', googleDriveLink: '', fileType: 'pdf', publishedAt: '2026-01-01', isActive: true },
  { id: 'doc2', title: 'Kalender Akademik 2026/2027', description: 'Kalender akademik tahun ajaran 2026/2027', category: 'Akademik', googleDriveLink: '', fileType: 'pdf', publishedAt: '2026-01-01', isActive: true },
  { id: 'doc3', title: 'Formulir Pendaftaran', description: 'Formulir pendaftaran peserta didik baru', category: 'PPDB', googleDriveLink: '', fileType: 'pdf', publishedAt: '2026-01-01', isActive: true },
];

const seed = [
  { key: 'contact_info', value: {
    address: 'Jl. Sriwijaya No. 12, Gambiran, Kabupaten Banyuwangi, Jawa Timur 68462',
    phone: '(0333) 845123', email: 'info@ma-amanatulloh.sch.id',
    hours: 'Senin - Sabtu: 07:00 - 15:00 WIB',
    mapQuery: 'MA+Amanatulloh+Gambiran+Banyuwangi', mapEmbedUrl: '', mapDirectionsUrl: '',
    facebook: 'https://facebook.com/ma.amanatulloh',
    instagram: 'https://instagram.com/ma_amanatulloh',
    youtube: 'https://youtube.com/@maamanatulloh',
  }},
  { key: 'slider_items', value: [
    { id: '1', title: 'Berilmu, Beramal, Bertakwa', subtitle: 'Membentuk generasi muda yang cerdas, berkarakter, berakhlak mulia, dan siap menghadapi tantangan masa depan.', image: '', backgroundColor: '#16a34a', buttonText: 'Profil Madrasah', buttonLink: '/profil' },
    { id: '2', title: 'Pendaftaran Peserta Didik Baru', subtitle: 'Bergabunglah bersama keluarga besar MA Amanatulloh. Raih masa depan cemerlang bersama kami.', image: '', backgroundColor: '#059669', buttonText: 'Info Selengkapnya', buttonLink: '/kontak' },
    { id: '3', title: 'Prestasi di Berbagai Bidang', subtitle: 'Siswa-siswi MA Amanatulloh terus menorehkan prestasi membanggakan di berbagai kompetisi.', image: '', backgroundColor: '#15803d', buttonText: 'Lihat Berita', buttonLink: '/berita' },
  ]},
  { key: 'profile_data', value: {
    about: '<p>MA Amanatulloh merupakan salah satu Madrasah Aliyah swasta di Kecamatan Gambiran, Kabupaten Banyuwangi, Provinsi Jawa Timur. Berdiri sejak tahun 2017 di bawah naungan Kementerian Agama, madrasah kami berkomitmen untuk memberikan pendidikan yang berkualitas dengan berbasis nilai-nilai keislaman.</p><p>Dengan tenaga pendidik yang kompeten dan lingkungan belajar yang kondusif, MA Amanatulloh berupaya mencetak generasi muda yang berilmu, beramal, dan bertakwa kepada Allah SWT.</p>',
    visi: 'Mewujudkan peserta didik yang berilmu, beramal, bertakwa, unggul dalam prestasi, dan berakhlakul karimah.',
    misi: [
      'Menyelenggarakan pendidikan yang berkualitas dengan berbasis nilai-nilai Islam Ahlussunnah Wal Jamaah.',
      'Mengembangkan potensi akademik dan non-akademik peserta didik secara optimal.',
      'Membentuk karakter peserta didik yang beriman, bertakwa, dan berakhlak mulia.',
      'Menumbuhkan semangat belajar dan berkompetisi yang sehat.',
      'Menciptakan lingkungan madrasah yang bersih, nyaman, dan kondusif bagi pembelajaran.',
      'Menjalin kerjasama yang harmonis dengan orang tua, masyarakat, dan stakeholder terkait.',
    ],
    sambutanKepsek: '<p>Assalamualaikum Wr. Wb. Alhamdulillah, puji syukur kita panjatkan kehadirat Allah SWT atas segala rahmat dan karunia-Nya. Selamat datang di website resmi MA Amanatulloh, Gambiran, Kabupaten Banyuwangi.</p><p>Website ini hadir sebagai media informasi dan komunikasi bagi seluruh civitas akademika, alumni, wali murid, serta masyarakat umum.</p>',
    namaKepsek: 'Moh. Zahid, S.Pd.I', jabatanKepsek: 'Kepala MA Amanatulloh',
    fotoKepsek: '',
    facilities: [
      'Ruang Kelas (6 Ruang)', 'Laboratorium Komputer', 'Perpustakaan', 'Musholla',
      'Lapangan Olahraga', 'Kantin Sehat', 'UKS', 'Ruang OSIS',
      'Toilet', 'Ruang Guru', 'Ruang Tata Usaha', 'Koperasi Siswa',
    ],
  }},
  { key: 'stats_data', value: { siswaAktif: '180+', tenagaPendidik: '18', prestasi: '50+', akreditasi: 'C' }},
  { key: 'school_identity', value: {
    schemaVersion: 1, revision: 1, updatedAt: now, themePreset: 'forest',
    schoolName: 'MA Amanatulloh', schoolShortName: 'MA Amanatulloh',
    schoolTagline: 'Madrasah Aliyah Swasta', legalName: 'MA Amanatulloh',
    schoolLogo: '', showLogo: true,
    footerDescription: 'Berilmu, Beramal, Bertakwa. Membentuk generasi cerdas, berkarakter, dan berakhlak mulia.',
    address: 'Jl. Sriwijaya No. 12, Gambiran, Kabupaten Banyuwangi, Jawa Timur 68462',
    phone: '(0333) 845123', email: 'info@ma-amanatulloh.sch.id',
    hours: 'Senin - Sabtu: 07:00 - 15:00 WIB',
    mapQuery: 'MA+Amanatulloh+Gambiran+Banyuwangi', mapEmbedUrl: '', mapDirectionsUrl: '',
    facebook: 'https://facebook.com/ma.amanatulloh',
    instagram: 'https://instagram.com/ma_amanatulloh',
    youtube: 'https://youtube.com/@maamanatulloh',
    primaryColor: '#16a34a', secondaryColor: '#059669', accentColor: '#eab308',
    footerBackgroundColor: '#064e3b',
    legalNotice: 'Dibuat dengan sepenuh hati untuk pendidikan Indonesia',
    copyrightText: '', showCurrentYear: true, developerName: '', developerUrl: '',
  }},
  { key: 'brand_settings', value: { schoolLogo: '', showLogo: true, schoolName: 'MA Amanatulloh', schoolTagline: 'Gambiran, Banyuwangi' }},
  { key: 'footer_credit', value: { copyrightText: '', rightText: 'Dibuat dengan sepenuh hati untuk pendidikan Indonesia', showYear: true, schoolName: 'MA Amanatulloh', developerName: '', developerUrl: '' }},
  { key: 'seo_data', value: {
    metaTitle: 'MA Amanatulloh - Website Resmi',
    metaDescription: 'Website resmi MA Amanatulloh, Gambiran Banyuwangi - Madrasah Aliyah Swasta. Informasi PPDB, berita kegiatan, agenda sekolah, dan galeri.',
    metaKeywords: 'MA Amanatulloh, Madrasah Aliyah Amanatulloh, sekolah Gambiran Banyuwangi, MA Swasta Banyuwangi, pendidikan Gambiran, PPDB Banyuwangi',
    ogImage: '', ogType: 'website', robots: 'index, follow',
    canonicalUrl: '', googleVerification: '', bingVerification: '', googleAnalyticsId: '',
  }},
  { key: 'analytics_data', value: { totalPageViews: 0, totalSessions: 0, dailyViews: [], pageViews: {}, referrers: {}, lastUpdated: now }},
  { key: 'instagram_settings', value: { username: '@ma_amanatulloh', profileUrl: 'https://www.instagram.com/ma_amanatulloh', showSection: true, sectionTitle: 'Instagram Madrasah', embedType: 'widget', widgetCode: '', posts: [] }},
  { key: 'sponsors_data', value: { showSection: false, title: 'Didukung Oleh', sponsors: [] }},
  { key: 'smpb_button', value: { isActive: true, year: '2026', link: '#', openInNewTab: true }},
  { key: 'auth_settings', value: { username: 'admin', password: 'admin123', showDemoCredentials: true }},
  { key: 'download_documents', value: { pageTitle: 'Download Dokumen', pageDescription: 'Silakan pilih dokumen yang dibutuhkan lalu buka atau unduh melalui tautan Google Drive yang tersedia.', showPage: true, documents }},
  { key: 'news_items', value: newsItems },
  { key: 'agenda_items', value: agendaItems },
  { key: 'gallery_items', value: galleryItems },
];

async function main() {
  for (const { key, value } of seed) {
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}::jsonb, ${now})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    `;
  }
  const result = await sql`SELECT count(*)::int as cnt FROM settings`;
  console.log(`Seed berhasil: ${result[0].cnt} baris settings ditulis.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
