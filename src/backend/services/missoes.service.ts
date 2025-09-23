import { http } from '../../config/http';

export interface MissaoInput {
  nome: string;
  descricao?: string;
  congregacaoId: number | string;
  liderId?: number | string;
  membrosIds?: Array<number | string>;
  memberIds?: Array<number | string>;
}

export async function list() {
  return http('/api/missoes');
}

export async function get(id: number | string) {
  return http(`/api/missoes/${id}`);
}

export async function create(input: MissaoInput) {
  return http('/api/missoes', { method: 'POST', body: JSON.stringify(input) });
}

export async function update(id: number | string, input: Partial<MissaoInput>) {
  return http(`/api/missoes/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export async function remove(id: number | string) {
  return http(`/api/missoes/${id}`, { method: 'DELETE' });
}
