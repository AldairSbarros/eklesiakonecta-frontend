import { http } from '../../config/http';
import { getApiUrl } from '../../config/api';

export type ApiOffering = {
  id: number;
  value: number;
  type: 'dizimo' | 'oferta' | string | null;
  memberId?: number | null;
  congregacaoId?: number | null;
  date?: string | null;
  service?: string | null;
  receiptPhoto?: string | null;
  numeroRecibo?: string | null;
  external_reference?: string | null;
  psp?: string | null;
  status?: string | null;
  metadata?: unknown | null;
  Member?: { id: number; nome?: string } | null;
  Congregacao?: { id: number; nome?: string } | null;
  e2eid?: string | null;
};

type ListParams = {
  congregacaoId?: number;
  memberId?: number;
  type?: string;
  mes?: number;
  ano?: number;
};

export async function list(params: ListParams = {}): Promise<ApiOffering[]> {
  const usp = new URLSearchParams();
  if (params.congregacaoId) usp.set('congregacaoId', String(params.congregacaoId));
  if (params.memberId) usp.set('memberId', String(params.memberId));
  if (params.type) usp.set('type', params.type);
  if (params.mes) usp.set('mes', String(params.mes));
  if (params.ano) usp.set('ano', String(params.ano));
  const path = `/api/offerings${usp.toString() ? `?${usp.toString()}` : ''}`;
  return http(path);
}

type CreateInput = {
  valor: number; // requerido pelo controller
  data: string; // YYYY-MM-DD
  memberId: number;
  congregacaoId: number;
  type?: 'dizimo' | 'oferta';
  service?: string | null;
  receiptPhoto?: string | null;
  numeroRecibo?: string | null;
};

export async function create(input: CreateInput): Promise<ApiOffering> {
  return http('/api/offerings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

type UpdateInput = Partial<CreateInput> & { type?: 'dizimo' | 'oferta' };

export async function update(id: number, input: UpdateInput): Promise<ApiOffering> {
  return http(`/api/offerings/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
}

export async function remove(id: number): Promise<{ message: string }> {
  return http(`/api/offerings/${id}`, { method: 'DELETE' });
}

export async function listReceipts(params: { congregacaoId: number; mes?: number; ano?: number }) {
  const usp = new URLSearchParams({ congregacaoId: String(params.congregacaoId) });
  if (params.mes) usp.set('mes', String(params.mes));
  if (params.ano) usp.set('ano', String(params.ano));
  return http(`/api/offerings/comprovantes/list?${usp.toString()}`);
}

export async function uploadReceipt(id: number, file: File): Promise<{ message: string; path: string }> {
  const form = new FormData();
  form.append('comprovante', file);
  // Usando fetch direto para multipart, mas preservando headers automáticos do http.ts requer adaptação.
  // Vamos replicar lógica mínima: apenas Authorization e X-Church-Schema.
  const { token, schema } = (function getSession() {
    const token = localStorage.getItem('eklesiakonecta_token') || localStorage.getItem('auth_token');
    const igreja = localStorage.getItem('eklesiakonecta_igreja');
    let schema: string | null = localStorage.getItem('church_schema');
    if (igreja && !schema) { try { schema = JSON.parse(igreja).schema || null; } catch { /* noop */ } }
    return { token, schema };
  })();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (schema) headers['X-Church-Schema'] = schema;
  const url = getApiUrl(`/api/offerings/${id}/upload-comprovante`);
  const res = await fetch(url, { method: 'POST', body: form, headers, credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function downloadReceipt(id: number): Promise<void> {
  const { token, schema } = (function getSession() {
    const token = localStorage.getItem('eklesiakonecta_token') || localStorage.getItem('auth_token');
    const igreja = localStorage.getItem('eklesiakonecta_igreja');
    let schema: string | null = localStorage.getItem('church_schema');
    if (igreja && !schema) { try { schema = JSON.parse(igreja).schema || null; } catch { /* noop */ } }
    return { token, schema };
  })();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (schema) headers['X-Church-Schema'] = schema;
  const url = getApiUrl(`/api/offerings/${id}/download-comprovante`);
  const res = await fetch(url, { method: 'GET', headers, credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const blob = await res.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `comprovante_${id}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export async function deleteReceipt(id: number): Promise<{ message: string }> {
  const { token, schema } = (function getSession() {
    const token = localStorage.getItem('eklesiakonecta_token') || localStorage.getItem('auth_token');
    const igreja = localStorage.getItem('eklesiakonecta_igreja');
    let schema: string | null = localStorage.getItem('church_schema');
    if (igreja && !schema) { try { schema = JSON.parse(igreja).schema || null; } catch { /* noop */ } }
    return { token, schema };
  })();
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (schema) headers['X-Church-Schema'] = schema;
  const url = getApiUrl(`/api/offerings/${id}/comprovante`);
  const res = await fetch(url, { method: 'DELETE', headers, credentials: 'include' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function get(id: number): Promise<ApiOffering> {
  return http(`/api/offerings/${id}`);
}
