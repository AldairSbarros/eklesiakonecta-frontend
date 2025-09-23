import { http } from '../../config/http';
import type { Despesa, DespesaItem, DespesaCreateInput, DespesaUpdateInput } from '../../types/Despesa';

// Criação em lote (quando o frontend envia várias despesas em uma única requisição)
export async function createMany(despesas: DespesaItem[]) {
  return http('/api/despesas', {
    method: 'POST',
    body: JSON.stringify({ despesas }),
  });
}

// Lista despesas, opcionalmente com paginação simples
export async function list(params?: { page?: number; pageSize?: number }): Promise<Despesa[]> {
  const qs = params ? `?${new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)]))}` : '';
  return http(`/api/despesas${qs}`);
}

export async function get(id: number | string): Promise<Despesa> {
  return http(`/api/despesas/${id}`);
}

export async function create(input: DespesaCreateInput): Promise<Despesa> {
  return http('/api/despesas', { method: 'POST', body: JSON.stringify(input) });
}

export async function update(id: number | string, data: DespesaUpdateInput): Promise<Despesa> {
  return http(`/api/despesas/${id}`, { method: 'PUT', body: JSON.stringify(data) });
}

export async function remove(id: number | string): Promise<{ message?: string } | Response> {
  return http(`/api/despesas/${id}`, { method: 'DELETE' });
}
