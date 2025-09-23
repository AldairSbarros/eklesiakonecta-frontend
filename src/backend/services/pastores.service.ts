import { http } from '../../config/http';

export interface Pastor {
  id: number;
  nome?: string | null;
  telefone?: string | null;
  email?: string | null;
}

export async function list(): Promise<Pastor[]> {
  return http('/api/pastores');
}

export async function get(id: number | string): Promise<Pastor> {
  return http(`/api/pastores/${id}`);
}

export async function create(input: Partial<Pastor>): Promise<Pastor> {
  return http('/api/pastores', { method: 'POST', body: JSON.stringify(input) });
}

export async function update(id: number | string, input: Partial<Pastor>): Promise<Pastor> {
  return http(`/api/pastores/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export async function remove(id: number | string): Promise<{ message?: string } | Response> {
  return http(`/api/pastores/${id}`, { method: 'DELETE' });
}
