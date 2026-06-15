import { isNeonConfigured, sql } from '../lib/neon';

const SETTINGS_CACHE_TTL_MS = 60_000;
const settingsCache = new Map<string, { value: unknown; expiresAt: number }>();

export interface DatabaseStorageStats {
  databaseBytes: number;
  databaseSize: string;
  settingsBytes: number;
  settingsSize: string;
  settingsRows: number;
}

export interface DatabaseConnectionStatus {
  isConnected: boolean;
  source: 'neon' | 'environment' | 'unknown';
  message: string;
}

export interface ResetSettingsResult {
  success: boolean;
  resetCount: number;
  removedCount: number;
  message?: string;
}

function formatSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function getCachedSettings(keys: string[]): Record<string, unknown> | null {
  const now = Date.now();
  const cached: Record<string, unknown> = {};

  for (const key of keys) {
    const entry = settingsCache.get(key);
    if (!entry || entry.expiresAt < now) {
      if (entry && entry.expiresAt < now) {
        settingsCache.delete(key);
      }
      return null;
    }
    cached[key] = entry.value;
  }

  return cached;
}

function cacheSettings(settings: Record<string, unknown>) {
  const expiresAt = Date.now() + SETTINGS_CACHE_TTL_MS;
  for (const [key, value] of Object.entries(settings)) {
    settingsCache.set(key, { value, expiresAt });
  }
}

export function invalidateSettingsCache(keys?: string[]) {
  if (!keys || keys.length === 0) {
    settingsCache.clear();
    return;
  }

  for (const key of keys) {
    settingsCache.delete(key);
  }
}

async function fetchSettingsRows(keys: string[]): Promise<{
  success: boolean;
  settings: Record<string, unknown>;
  errorMessage?: string;
}> {
  if (!isNeonConfigured || !sql) {
    return {
      success: false,
      settings: {},
      errorMessage: 'Database belum dikonfigurasi.',
    };
  }

  try {
    const rows = await sql`SELECT key, value FROM settings WHERE key = ANY(${keys})` as { key: string; value: unknown }[];
    const settings: Record<string, unknown> = {};
    for (const row of rows ?? []) {
      if (typeof row.key === 'string') {
        settings[row.key] = row.value;
      }
    }

    return { success: true, settings };
  } catch (error) {
    return {
      success: false,
      settings: {},
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function loadSettings(keys: string[]): Promise<Record<string, unknown>> {
  if (!isNeonConfigured || !sql) {
    console.error('[DB] Database belum dikonfigurasi. Data tidak dapat dimuat dari database.');
    return {};
  }

  const cached = getCachedSettings(keys);
  if (cached) {
    return cached;
  }

  const result = await fetchSettingsRows(keys);
  if (!result.success) {
    console.error('[DB] Gagal memuat settings:', result.errorMessage);
    return {};
  }

  cacheSettings(result.settings);
  return result.settings;
}

export async function ensureDefaultSettings(defaultSettings: Record<string, unknown>): Promise<Record<string, unknown>> {
  const keys = Object.keys(defaultSettings);
  if (keys.length === 0) return {};

  if (!isNeonConfigured || !sql) {
    console.error('[DB] Database belum dikonfigurasi. Menggunakan default lokal untuk settings.');
    return { ...defaultSettings };
  }

  const existingResult = await fetchSettingsRows(keys);
  if (!existingResult.success) {
    throw new Error(`Gagal membaca settings dari database: ${existingResult.errorMessage || 'unknown error'}`);
  }

  const existingSettings = existingResult.settings;
  const missingPayload = keys
    .filter((key) => existingSettings[key] === undefined)
    .map((key) => ({
      key,
      value: JSON.stringify(defaultSettings[key]),
      updated_at: new Date().toISOString(),
    }));

  if (missingPayload.length > 0) {
    try {
      for (const item of missingPayload) {
        await sql`
          INSERT INTO settings (key, value, updated_at)
          VALUES (${item.key}, ${item.value}, ${item.updated_at})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
        `;
      }
    } catch (error) {
      throw new Error(`Gagal membuat key settings yang belum ada: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  const merged = {
    ...defaultSettings,
    ...existingSettings,
  };
  cacheSettings(merged);

  return merged;
}

export async function saveSetting(key: string, value: unknown): Promise<boolean> {
  if (!isNeonConfigured || !sql) {
    console.error(`[DB] Database belum dikonfigurasi. Setting "${key}" tidak tersimpan.`);
    return false;
  }

  try {
    await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${JSON.stringify(value)}, ${new Date().toISOString()})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
    `;

    cacheSettings({ [key]: value });
    return true;
  } catch (error) {
    console.error(`[DB] Gagal menyimpan setting "${key}":`, error);
    return false;
  }
}

export async function checkDatabaseConnection(): Promise<DatabaseConnectionStatus> {
  if (!isNeonConfigured || !sql) {
    return {
      isConnected: false,
      source: 'environment',
      message: 'Environment database belum valid. Periksa VITE_DATABASE_URL.',
    };
  }

  try {
    const rows = await sql`SELECT key, value FROM settings LIMIT 1` as { key: string; value: unknown }[];
    const existingRow = rows?.[0];
    const countResult = await sql`SELECT count(*)::int as cnt FROM settings` as { cnt: number }[];
    const count = countResult?.[0]?.cnt ?? 0;

    if (existingRow?.key && typeof existingRow.key === 'string') {
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${existingRow.key}, ${JSON.stringify(existingRow.value ?? {})}, ${new Date().toISOString()})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
      `;
    } else {
      const probeKey = '__connection_probe__';
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${probeKey}, ${JSON.stringify({ checkedAt: new Date().toISOString() })}, ${new Date().toISOString()})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
      `;

      await sql`DELETE FROM settings WHERE key = ${probeKey}`;
    }

    return {
      isConnected: true,
      source: 'neon',
      message: `Terhubung ke Neon database. Baca/tulis tabel settings aktif (${count} baris).`,
    };
  } catch (error) {
    return {
      isConnected: false,
      source: 'neon',
      message: `Gagal terhubung ke tabel settings: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function resetSettingsToDefault(defaultSettings: Record<string, unknown>): Promise<ResetSettingsResult> {
  if (!isNeonConfigured || !sql) {
    return {
      success: false,
      resetCount: 0,
      removedCount: 0,
      message: 'Database belum dikonfigurasi.',
    };
  }

  const defaultEntries = Object.entries(defaultSettings);
  const defaultKeys = defaultEntries.map(([key]) => key);

  try {
    const existingRows = await sql`SELECT key FROM settings` as { key: string }[];

    const keysToRemove = (existingRows ?? [])
      .map((row) => row.key)
      .filter((key): key is string => typeof key === 'string' && !defaultKeys.includes(key));

    let removedCount = 0;
    if (keysToRemove.length > 0) {
      await sql`DELETE FROM settings WHERE key = ANY(${keysToRemove})`;
      removedCount = keysToRemove.length;
    }

    for (const [key, value] of defaultEntries) {
      await sql`
        INSERT INTO settings (key, value, updated_at)
        VALUES (${key}, ${JSON.stringify(value)}, ${new Date().toISOString()})
        ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = EXCLUDED.updated_at
      `;
    }

    cacheSettings(defaultSettings);
    return {
      success: true,
      resetCount: defaultEntries.length,
      removedCount,
    };
  } catch (error) {
    return {
      success: false,
      resetCount: 0,
      removedCount: 0,
      message: `Gagal reset ke default: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

export async function getDatabaseStorageStats(): Promise<DatabaseStorageStats | null> {
  if (!isNeonConfigured || !sql) {
    console.error('[DB] Database belum dikonfigurasi. Statistik database tidak tersedia.');
    return null;
  }

  try {
    const rpcRows = await sql`
      SELECT
        pg_database_size(current_database())::bigint as database_bytes,
        pg_size_pretty(pg_database_size(current_database()))::text as database_size,
        pg_total_relation_size('settings')::bigint as settings_bytes,
        pg_size_pretty(pg_total_relation_size('settings'))::text as settings_size,
        (SELECT count(*) FROM settings)::bigint as settings_rows
    ` as {
      database_bytes: number;
      database_size: string;
      settings_bytes: number;
      settings_size: string;
      settings_rows: number;
    }[];

    const row = rpcRows?.[0];
    if (row) {
      return {
        databaseBytes: Number(row.database_bytes ?? 0),
        databaseSize: typeof row.database_size === 'string' ? row.database_size : formatSize(Number(row.database_bytes ?? 0)),
        settingsBytes: Number(row.settings_bytes ?? 0),
        settingsSize: typeof row.settings_size === 'string' ? row.settings_size : formatSize(Number(row.settings_bytes ?? 0)),
        settingsRows: Number(row.settings_rows ?? 0),
      };
    }
  } catch (error) {
    console.warn('[DB] Query statistik database gagal, menggunakan fallback:', error instanceof Error ? error.message : 'Unknown error');
  }

  try {
    const rows = await sql`SELECT key, value FROM settings` as { key: string; value: unknown }[];
    const settingsRows = (rows ?? []).length;
    const settingsBytes = (rows ?? []).reduce((total, item) => {
      const keyPart = typeof item.key === 'string' ? item.key : '';
      const valuePart = JSON.stringify(item.value ?? '');
      return total + new Blob([keyPart, valuePart]).size;
    }, 0);

    return {
      databaseBytes: settingsBytes,
      databaseSize: `${formatSize(settingsBytes)} (estimasi)`,
      settingsBytes,
      settingsSize: `${formatSize(settingsBytes)} (estimasi)`,
      settingsRows,
    };
  } catch (error) {
    console.error('[DB] Gagal memuat statistik fallback settings:', error);
    return null;
  }
}
