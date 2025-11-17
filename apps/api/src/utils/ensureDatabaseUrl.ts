import fs from 'node:fs';
import path from 'node:path';

let cachedUrl: string | undefined;

function resolveSqlitePath(preferred?: string): string {
  const attempt = (p: string) => {
    try {
      return fs.existsSync(p) ? p : undefined;
    } catch {
      return undefined;
    }
  };

  const normalized = preferred?.trim();
  if (normalized) {
    const absolute = path.isAbsolute(normalized) ? normalized : path.resolve(process.cwd(), normalized);
    return absolute;
  }

  const candidates = [
    path.resolve(process.cwd(), 'prisma', 'dev.db'),
    path.resolve(__dirname, '../../prisma/dev.db'),
    path.resolve(__dirname, '../../../prisma/dev.db'),
  ];

  const found = candidates.map(attempt).find((p): p is string => Boolean(p));
  return found ?? candidates[0];
}

export function ensureDatabaseUrl(): string {
  if (cachedUrl) {
    return cachedUrl;
  }

  let url = process.env.DATABASE_URL?.trim();

  if (!url) {
    const sqlitePath = resolveSqlitePath();
    url = `file:${sqlitePath}`;
  } else if (url.startsWith('file:')) {
    const remainder = url.slice(5);
    const [rawPath, query] = remainder.split('?', 2);
    const absolute = resolveSqlitePath(rawPath || undefined);
    url = `file:${absolute}${query ? `?${query}` : ''}`;
  }

  if (url) {
    process.env.DATABASE_URL = url;
    cachedUrl = url;
    return url;
  }

  throw new Error('DATABASE_URL is not configured');
}
