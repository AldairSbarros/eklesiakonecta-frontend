import { useEffect, useState } from "react";

import { API_URL } from '../config/api';

function RelatorioFinanceiro() {
  type RelatorioFinanceiroData = Record<string, unknown>; // Adjust this type as needed for your data shape
  const [dados, setDados] = useState<RelatorioFinanceiroData | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const schema = localStorage.getItem("schema") || "";

  useEffect(() => {
    setLoading(true);
    setErro("");
    fetch(`${API_URL}/api/relatorio-financeiro`, { headers: { schema } })
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(() => setErro("Erro ao buscar relatório financeiro."))
      .finally(() => setLoading(false));
  }, []);

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
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      {!loading && renderTable()}
    </div>
  );
}

export default RelatorioFinanceiro;
