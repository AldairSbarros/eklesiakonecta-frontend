export interface CelulaLight {
  id: number;
  nome?: string;
}

export interface EnderecoLight {
  logradouro?: string;
  cidade?: string;
  uf?: string;
  cep?: string;
}

export interface Member {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  congregacaoId?: number;
  celula?: CelulaLight | null;
  endereco?: EnderecoLight | null;
  latitude?: number | null;
  longitude?: number | null;
}

// Payloads típicos no frontend
export type MemberCreateInput = Partial<Omit<Member, 'id' | 'celula' | 'endereco'>> & Pick<Member, 'nome'>;
export type MemberUpdateInput = Partial<Omit<Member, 'id' | 'celula' | 'endereco'>>;
