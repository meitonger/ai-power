// apps/web/lib/api.ts
// Base host for the API (no trailing /api here)
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const API_ROOT = `${API_URL}/api`;
export const GRAPHQL_URL = `${API_URL}/api/graphql`;

type Opts = {
  method?: 'GET'|'POST'|'PATCH'|'PUT'|'DELETE';
  body?: any;
  headers?: Record<string,string>;
  timeoutMs?: number;
};

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j?.message || j?.error || msg; } catch {}
    throw new Error(`${res.status} ${msg}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) as T : (null as any);
}

function normalizePath(path: string): string {
  if (!path) return '';
  // Allow callers to pass paths with or without /api prefix
  const p = path.startsWith('/api/') ? path.slice(4) : path;
  return p.startsWith('/') ? p : `/${p}`;
}

export async function apiFetch<T=any>(path: string, opts: Opts = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), opts.timeoutMs ?? 15000);
  try {
    const res = await fetch(`${API_ROOT}${normalizePath(path)}`, {
      method: opts.method || 'GET',
      headers: { 'Content-Type': 'application/json', ...(opts.headers||{}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      cache: 'no-store',
      signal: controller.signal,
    });
    return await handle<T>(res);
  } catch (e:any) {
    if (e?.name === 'AbortError') throw new Error('Request timed out');
    throw e;
  } finally {
    clearTimeout(timeout);
  }
}

export const apiGet = <T=any>(path: string, opts: Omit<Opts,'method'|'body'> = {}) =>
  apiFetch<T>(path, { ...opts, method: 'GET' });

export const apiPost = <T=any>(path: string, body?: any, opts: Omit<Opts,'method'|'body'> = {}) =>
  apiFetch<T>(path, { ...opts, method: 'POST', body });

export const apiPatch = <T=any>(path: string, body?: any, opts: Omit<Opts,'method'|'body'> = {}) =>
  apiFetch<T>(path, { ...opts, method: 'PATCH', body });

export const apiPut = <T=any>(path: string, body?: any, opts: Omit<Opts,'method'|'body'> = {}) =>
  apiFetch<T>(path, { ...opts, method: 'PUT', body });

export const apiDelete = <T=any>(path: string, opts: Omit<Opts,'method'|'body'> = {}) =>
  apiFetch<T>(path, { ...opts, method: 'DELETE' });
