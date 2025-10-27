// apps/web/lib/api.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

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

export async function apiFetch<T=any>(path: string, opts: Opts = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(()=>controller.abort(), opts.timeoutMs ?? 15000);
  try {
    const res = await fetch(`${API_URL}${path}`, {
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
