import { neon } from '@neondatabase/serverless';

function normalizeEnvValue(raw?: string): string {
  if (!raw) return '';
  return raw.trim().replace(/^['"`\s]+|['"`\s]+$/g, '');
}

const databaseUrl = normalizeEnvValue(import.meta.env.VITE_DATABASE_URL);

export const isNeonConfigured = Boolean(databaseUrl);

export const sql = isNeonConfigured ? neon(databaseUrl!) : null;
