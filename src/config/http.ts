import { getApiUrl } from './api';

type HttpOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: BodyInit | null;
  token?: string | null;
  schema?: string | null;
};

const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);

function getSession() {
  const token = localStorage.getItem('eklesiakonecta_token') || localStorage.getItem('auth_token');
  const igreja = localStorage.getItem('eklesiakonecta_igreja');
  let schema: string | null = localStorage.getItem('church_schema');
  if (igreja && !schema) {
    try { schema = JSON.parse(igreja).schema || null; } catch { /* ignore parse error */ }
  }
  return { token, schema };
}

export async function http(path: string, opts: HttpOptions = {}) {
  const url = getApiUrl(ensureLeadingSlash(path));
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...opts.headers,
  };
  const { token, schema } = getSession();
  const authToken = opts.token ?? token;
  const tenantSchema = opts.schema ?? schema;
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (tenantSchema) headers['X-Church-Schema'] = tenantSchema; // alinhado ao backend

  const res = await fetch(url, {
    method: opts.method || 'GET',
    headers,
    body: opts.body ?? null,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status} - ${text || res.statusText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res;
}

export async function httpDownload(path: string, filename: string, opts: HttpOptions = {}) {
  const url = getApiUrl(ensureLeadingSlash(path));
  const headers: Record<string, string> = { ...opts.headers };
  const { token, schema } = getSession();
  const authToken = opts.token ?? token;
  const tenantSchema = opts.schema ?? schema;
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (tenantSchema) headers['X-Church-Schema'] = tenantSchema;

  const res = await fetch(url, { method: opts.method || 'GET', headers, credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status} - ${res.statusText}`);
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
}
