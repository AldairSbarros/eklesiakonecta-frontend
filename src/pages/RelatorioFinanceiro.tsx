import { useEffect, useState } from "react";
import { http, httpDownload } from '../config/http';
import { EXPORTS } from '../config/exports';

function RelatorioFinanceiro() {
  type RelatorioFinanceiroData = Record<string, unknown>; // Adjust this type as needed for your data shape
  const [dados, setDados] = useState<RelatorioFinanceiroData | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
  const schema = (() => {
    try { return (igrejaData && JSON.parse(igrejaData).schema) || localStorage.getItem('church_schema') || ""; } catch { return localStorage.getItem('church_schema') || ""; }
  })();

  useEffect(() => {
    setLoading(true);
    setErro("");
    http('/api/relatorio-financeiro', { schema })
      .then(data => setDados(data as RelatorioFinanceiroData))
      .catch(() => setErro("Erro ao buscar relatório financeiro."))
      .finally(() => setLoading(false));
  }, [schema]);

  // Renderização evoluída: tabela se dados forem array, senão JSON
  const renderTable = () => {
    if (Array.isArray(dados) && dados.length > 0) {
      const cols = Object.keys(dados[0]);
      return (
        <table className="relatorio-table">
          <thead>
            <tr>
              {cols.map(col => <th key={col}>{col}</th>)}
            </tr>
          </thead>
          <tbody>
            {dados.map((row: Record<string, unknown>, idx: number) => (
              <tr key={idx}>
                {cols.map(col => <td key={col}>{String(row[col])}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    if (dados && typeof dados === 'object') {
      return <pre>{JSON.stringify(dados, null, 2)}</pre>;
    }
    return <p>Nenhum dado encontrado.</p>;
  };

  return (
    <div className="relatorio-financeiro">
      <h2>Relatório Financeiro</h2>
      <div style={{display:'flex', gap:8, margin:'8px 0'}}>
        <button onClick={() => httpDownload(EXPORTS.relatorioFinanceiro.excel, 'RelatorioFinanceiro.xlsx')}>
          Exportar Excel
        </button>
        <button onClick={() => httpDownload(EXPORTS.relatorioFinanceiro.pdf, 'RelatorioFinanceiro.pdf')}>
          Exportar PDF
        </button>
      </div>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      {!loading && renderTable()}
    </div>
  );
}

export default RelatorioFinanceiro;
