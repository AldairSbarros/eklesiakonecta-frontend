import { http } from '../../config/http';

export type ManualCodigo = {
  codigo: string;
  descricao: string;
  categoria?: string;
};

// Fallback local mínimo enquanto a API dedicada não estiver exposta no backend
const FALLBACK_DESPESAS: ManualCodigo[] = [
  { codigo: '1001', descricao: 'Água', categoria: 'Utilidades' },
  { codigo: '1002', descricao: 'Energia', categoria: 'Utilidades' },
  { codigo: '1003', descricao: 'Internet', categoria: 'Utilidades' },
  { codigo: '1004', descricao: 'Material de Limpeza', categoria: 'Materiais' },
  { codigo: '1005', descricao: 'Manutenção', categoria: 'Serviços' },
  { codigo: '2001', descricao: 'Salário Funcionário', categoria: 'Pessoal' },
  { codigo: '3001', descricao: 'Imposto', categoria: 'Tributos' },
  { codigo: '4001', descricao: 'Outros', categoria: 'Diversos' },
];

function filterList(list: ManualCodigo[], q?: string): ManualCodigo[] {
  if (!q) return list;
  const s = q.trim().toLowerCase();
  if (!s) return list;
  return list.filter(
    (i) => i.codigo.includes(s) || i.descricao.toLowerCase().includes(s)
  );
}

export async function listCodigos(
  tipo: 'despesa' | 'receita',
  q?: string
): Promise<ManualCodigo[]> {
  // Tenta API oficial, se disponível
  try {
    const query = q ? `&q=${encodeURIComponent(q)}` : '';
    const data = await http(`/api/manual/manual-codigos?tipo=${tipo}${query}`);
    if (Array.isArray(data)) return data as ManualCodigo[];
  } catch {
    // ignora e usa fallback
  }

  // Fallback por tipo
  if (tipo === 'despesa') return filterList(FALLBACK_DESPESAS, q);
  return [];
}

export async function validarCodigo(
  tipo: 'despesa' | 'receita',
  codigo: string
): Promise<ManualCodigo | null> {
  const lista = await listCodigos(tipo);
  const found = lista.find((i) => i.codigo === codigo.trim());
  return found ?? null;
}
