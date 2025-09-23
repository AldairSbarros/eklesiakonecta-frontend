import { http } from '../../config/http';
import type { Celula, MembroDaCelula, CelulaCreateInput, CelulaUpdateInput } from '../../types/Celula';
export type { Celula, MembroDaCelula, CelulaCreateInput, CelulaUpdateInput } from '../../types/Celula';

export async function list(): Promise<Celula[]> {
  return http('/api/celulas');
}

export async function get(id: number | string): Promise<Celula> {
  return http(`/api/celulas/${id}`);
}

export async function create(input: CelulaCreateInput): Promise<Celula> {
  return http('/api/celulas', { method: 'POST', body: JSON.stringify(input) });
}

export async function update(id: number | string, input: CelulaUpdateInput): Promise<Celula> {
  return http(`/api/celulas/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export async function remove(id: number | string): Promise<{ message?: string } | Response> {
  return http(`/api/celulas/${id}`, { method: 'DELETE' });
}

// Membros da célula
export async function addMembro(celulaId: number | string, membroId: number | string) {
  return http(`/api/celulas/${celulaId}/membros`, { method: 'POST', body: JSON.stringify({ membroId }) });
}

export async function removeMembro(celulaId: number | string, membroId: number | string) {
  return http(`/api/celulas/${celulaId}/membros/${membroId}`, { method: 'DELETE' });
}

export async function listMembros(celulaId: number | string): Promise<MembroDaCelula[]> {
  return http(`/api/celulas/${celulaId}/membros`);
}
