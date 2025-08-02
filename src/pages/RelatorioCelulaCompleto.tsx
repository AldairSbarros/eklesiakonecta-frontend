import { useState } from "react";

import { API_URL } from '../config/api';

interface Membro {
  id: number;
  nome: string;
  // Add other known properties here if needed, or remove the index signature
  // [key: string]: string | number | undefined; // Example: restrict to string, number, or undefined
}
interface Presenca {
  data: string;
  presentes: number;
  [key: string]: string | number;
}
interface RankingItem {
  nome: string;
  presencas: number;
}
interface Aniversariante {
  nome: string;
  dataNascimento: string;
}

interface RelatorioCompleto {
  membros: Membro[];
  presencas: Presenca[];
  media: number;
  ranking: RankingItem[];
  aniversariantes: Aniversariante[];
}

function RelatorioCelulaCompleto() {
  const [dados, setDados] = useState<RelatorioCompleto | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [celulaId, setCelulaId] = useState<string>("");
  const [mes, setMes] = useState<string>("");
  const [ano, setAno] = useState<string>("");
  const schema = localStorage.getItem("schema") || "";

  const buscarRelatorio = () => {
    if (!celulaId) return setErro("Informe o ID da célula.");
    setLoading(true);
    setErro("");
    const params = new URLSearchParams({ mes, ano });
    fetch(`${API_URL}/api/celulas/${celulaId}/relatorio-completo?${params.toString()}`, { headers: { schema } })
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(() => setErro("Erro ao buscar relatório completo."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="relatorio-celula-completo">
      <h2>Relatório Completo da Célula</h2>
      <div style={{marginBottom:16}}>
        <input placeholder="ID da célula" value={celulaId} onChange={e => setCelulaId(e.target.value)} />
        <input placeholder="Mês (opcional)" value={mes} onChange={e => setMes(e.target.value)} style={{marginLeft:8}} />
        <input placeholder="Ano (opcional)" value={ano} onChange={e => setAno(e.target.value)} style={{marginLeft:8}} />
        <button onClick={buscarRelatorio} style={{marginLeft:8}}>Buscar</button>
      </div>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      {dados && (
        <div>
          <h3>Membros</h3>
          {dados.membros?.length ? (
            <table className="relatorio-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nome</th>
                </tr>
              </thead>
              <tbody>
                {dados.membros.map(m => (
                  <tr key={m.id}>
                    <td>{m.id}</td>
                    <td>{m.nome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhum membro encontrado.</p>}

          <h3>Presenças por Reunião</h3>
          {dados.presencas?.length ? (
            <table className="relatorio-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Presentes</th>
                </tr>
              </thead>
              <tbody>
                {dados.presencas.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.data}</td>
                    <td>{p.presentes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhuma presença encontrada.</p>}

          <h3>Média de Presença no Mês</h3>
          <p>{dados.media ?? "N/A"}</p>

          <h3>Ranking de Presença</h3>
          {dados.ranking?.length ? (
            <table className="relatorio-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Presenças</th>
                </tr>
              </thead>
              <tbody>
                {dados.ranking.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.nome}</td>
                    <td>{r.presencas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p>Nenhum ranking encontrado.</p>}

          <h3>Aniversariantes do Mês</h3>
          {dados.aniversariantes?.length ? (
            <ul>
              {dados.aniversariantes.map((a, idx) => (
                <li key={idx}>{a.nome} - {a.dataNascimento}</li>
              ))}
            </ul>
          ) : <p>Nenhum aniversariante encontrado.</p>}
        </div>
      )}
    </div>
  );
}

export default RelatorioCelulaCompleto;
