import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';

dns.setDefaultResultOrder('ipv4first');

async function run() {
  const envContent = fs.readFileSync(path.resolve('.env'), 'utf8');
  const match = envContent.match(/VITE_DATABASE_URL=([^\r\n]+)/);
  if (!match) {
    throw new Error('VITE_DATABASE_URL not found in .env');
  }
  const dbUrl = match[1].trim();
  const sql = neon(dbUrl);

  console.log('Membaca daftar key dari Neon PostgreSQL...');
  const keyRows = await sql`SELECT key FROM settings ORDER BY key`;
  console.log(`Ditemukan ${keyRows.length} keys.`);

  const backup = {
    _meta: {
      version: '2.0',
      date: new Date().toISOString(),
      app: 'MA Amanatulloh CMS',
      source: 'Neon PostgreSQL (production)',
      totalRows: keyRows.length,
      keys: keyRows.map(r => r.key),
    },
  };

  for (const { key } of keyRows) {
    process.stdout.write(`Mengunduh "${key}"... `);
    const start = Date.now();
    const rows = await sql`SELECT value FROM settings WHERE key = ${key}`;
    if (rows && rows.length > 0) {
      backup[key] = rows[0].value;
      const sizeStr = (JSON.stringify(rows[0].value).length / 1024).toFixed(1);
      console.log(`OK (${sizeStr} KB, ${Date.now() - start}ms)`);
    } else {
      console.log('KOSONG');
    }
  }

  const jsonStr = JSON.stringify(backup, null, 2);
  const nowStr = new Date().toISOString().split('T')[0];
  const outPath = path.resolve(`backup-ma-amanatulloh-${nowStr}.json`);
  const downloadsPath = '/home/darkverst/Downloads/backup-ma-amanatulloh.json';

  fs.writeFileSync(outPath, jsonStr, 'utf8');
  console.log(`\n✅ Backup berhasil disimpan di: ${outPath}`);

  try {
    fs.writeFileSync(downloadsPath, jsonStr, 'utf8');
    console.log(`✅ Backup juga disalin ke Downloads: ${downloadsPath}`);
  } catch (err) {
    console.warn('Gagal menyalin ke folder Downloads:', err.message);
  }

  const stat = fs.statSync(outPath);
  console.log(`📦 Ukuran total file: ${(stat.size / 1024 / 1024).toFixed(2)} MB (${stat.size} bytes)`);
}

run().catch((err) => {
  console.error('Error saat membuat backup:', err);
  process.exit(1);
});
