import { http } from '../../config/http';
import type { Member } from '../../types/Member';
export type MembroLight = Pick<Member, 'id' | 'nome'>;

export async function list(): Promise<MembroLight[]> {
  const res = await http('/api/membros');
  if (!Array.isArray(res)) return [];
  type Raw = { id: number; nome?: string };
  const raws: Raw[] = res.filter((m: unknown): m is Raw => {
    return !!m && typeof (m as Record<string, unknown>).id === 'number';
  });
  return raws.map((m) => ({ id: m.id, nome: m.nome || `Membro #${m.id}` }));
}
