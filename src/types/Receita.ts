export interface Receita {
  id: number;
  descricao?: string | null;
  valor?: number | null;
  data?: string | null; // YYYY-MM-DD
  categoria?: string | null;
  origem?: string | null;
}

// Payloads comuns no frontend
export type ReceitaCreateInput = Required<Pick<Receita, 'valor' | 'data' | 'descricao' | 'categoria' | 'origem'>>;
export type ReceitaUpdateInput = Partial<Omit<Receita, 'id'>>;
