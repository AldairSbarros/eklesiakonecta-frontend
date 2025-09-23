// Item usado para criação individual e em lote
export type DespesaItem = {
  codigo: string;
  descricao: string;
  valor: string | number;
  categoria?: string;
  data?: string; // opcional; backend pode defaultar
  congregacaoId?: number; // opcional
};

export interface Despesa {
  id: number;
  descricao?: string | null;
  valor?: number | null;
  data?: string | null; // YYYY-MM-DD
  categoria?: string | null;
}

export type DespesaCreateInput = Partial<DespesaItem>;
export type DespesaUpdateInput = Partial<DespesaItem | Despesa>;
