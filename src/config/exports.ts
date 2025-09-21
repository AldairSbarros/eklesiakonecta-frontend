// Endpoints de exportação (ajuste conforme o backend disponível)
export const EXPORTS = {
  // Resumo financeiro por congregação/mês/ano
  resumo: {
    excel: '/api/financeiro/resumo/excel',
    pdf: '/api/financeiro/resumo/pdf',
  },
  // Relatório financeiro geral
  relatorioFinanceiro: {
    excel: '/api/relatorio-financeiro/excel',
    pdf: '/api/relatorio-financeiro/pdf',
  },
};
