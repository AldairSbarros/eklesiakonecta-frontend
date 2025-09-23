// Tipo usado na UI. Mantém compatibilidade com os componentes atuais
// mas agora mapeado a partir do modelo Offering da API.
export interface OfertaDizimo {
  id: string | number;
  tipo: 'oferta' | 'dizimo' | string; // mapeia de Offering.type
  valor: number; // mapeia de Offering.value
  data: string; // ISO date (YYYY-MM-DD)
  membro?: string; // derivado de memberId (pode ser resolvido depois)
  memberId?: number | null;
  congregacao?: string; // derivado de congregacaoId (pode ser resolvido depois)
  congregacaoId?: number | null;
  observacao?: string; // sem mapeamento direto – pode vir de metadata.service/numeroRecibo
  comprovante?: string; // mapeia de Offering.receiptPhoto
  comprovanteFile?: File; // arquivo selecionado no formulário (não enviado ao backend via JSON)
  service?: string | null;
  numeroRecibo?: string | null;
  external_reference?: string | null;
  psp?: string | null;
  status?: string | null;
}

// Funções auxiliares de mapeamento
export type ApiOffering = import('../backend/services/offering.service').ApiOffering;

export function mapApiToUi(o: ApiOffering): OfertaDizimo {
  return {
    id: o.id,
    tipo: (o.type ?? 'oferta'),
    valor: Number(o.value),
    data: o.date ? String(o.date).substring(0, 10) : '',
    memberId: o.memberId ?? o.Member?.id ?? null,
    congregacaoId: o.congregacaoId ?? o.Congregacao?.id ?? null,
    membro: o.Member?.nome,
    congregacao: o.Congregacao?.nome,
    comprovante: o.receiptPhoto ?? undefined,
    service: o.service ?? null,
    numeroRecibo: o.numeroRecibo ?? null,
    external_reference: o.external_reference ?? null,
    psp: o.psp ?? null,
    status: o.status ?? null,
  };
}

