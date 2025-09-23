export interface Celula {
  id: number;
  nome?: string;
  descricao?: string | null;
  liderId?: number | null;
  endereco?: string | null;
}

export interface CelulaLight {
  id: number;
  nome?: string;
}

export interface MembroDaCelula {
  id: number;
  nome?: string;
}

export type CelulaCreateInput = Partial<Omit<Celula, 'id'>>;
export type CelulaUpdateInput = Partial<Omit<Celula, 'id'>>;
