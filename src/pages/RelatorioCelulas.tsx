import { useEffect, useState } from "react";

import { API_URL } from '../config/api';

function RelatorioCelulas() {
  const [dados, setDados] = useState<Record<string, unknown>[] | Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const schema = localStorage.getItem("schema") || "";

  useEffect(() => {
    setLoading(true);
    setErro("");
    fetch(`${API_URL}/api/relatorio-celulas`, { headers: { schema } })
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(() => setErro("Erro ao buscar relatório de células."))
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
                {cols.map(col => <td key={col}>{row[col] as React.ReactNode}</td>)}
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
    <div className="relatorio-celulas">
      <h2>Relatório de Células</h2>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      {!loading && renderTable()}
    </div>
  );
}

export default RelatorioCelulas;
