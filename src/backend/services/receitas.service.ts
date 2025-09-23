import { http } from '../../config/http';
import type { Receita, ReceitaCreateInput, ReceitaUpdateInput } from '../../types/Receita';

export async function list(): Promise<Receita[]> {
  return http('/api/receitas');
}

export async function get(id: number | string): Promise<Receita> {
  return http(`/api/receitas/${id}`);
}

export async function create(input: ReceitaCreateInput): Promise<Receita> {
  return http('/api/receitas', { method: 'POST', body: JSON.stringify(input) });
}

export async function update(id: number | string, input: ReceitaUpdateInput): Promise<Receita> {
  return http(`/api/receitas/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export async function remove(id: number | string): Promise<{ message?: string } | Response> {
  return http(`/api/receitas/${id}`, { method: 'DELETE' });
}
