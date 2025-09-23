import { http } from '../../config/http';

export interface CongregacaoLight { id: number; nome: string }

export async function list(): Promise<CongregacaoLight[]> {
  const res = await http('/api/congregacoes');
  if (!Array.isArray(res)) return [];
  type Raw = { id: number; nome?: string };
  const raws: Raw[] = res.filter((c: unknown): c is Raw => {
    return !!c && typeof (c as Record<string, unknown>).id === 'number';
  });
  return raws.map((c) => ({ id: c.id, nome: c.nome || `Congregação #${c.id}` }));
}
