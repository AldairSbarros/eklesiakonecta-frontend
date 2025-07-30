export interface OfertaDizimo {
  id: string;
  tipo: 'oferta' | 'dizimo';
  valor: number;
  data: string;
  membro: string;
  congregacao: string;
  observacao?: string;
  comprovante?: string; // url ou nome do arquivo
}
