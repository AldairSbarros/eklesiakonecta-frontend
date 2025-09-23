import { http } from '../../config/http';

export interface Encontro {
  id: number;
  titulo?: string | null;
  data?: string | null; // YYYY-MM-DD
  local?: string | null;
  descricao?: string | null;
}

export type EncontroInput = Omit<Encontro, 'id'>;

export async function list(): Promise<Encontro[]> {
  return http('/api/encontros');
}

export async function get(id: number | string): Promise<Encontro> {
  return http(`/api/encontros/${id}`);
}

export async function create(input: Partial<EncontroInput>): Promise<Encontro> {
  return http('/api/encontros', { method: 'POST', body: JSON.stringify(input) });
}

export async function update(id: number | string, input: Partial<EncontroInput>): Promise<Encontro> {
  return http(`/api/encontros/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export async function remove(id: number | string): Promise<{ message?: string } | Response> {
  return http(`/api/encontros/${id}`, { method: 'DELETE' });
}
