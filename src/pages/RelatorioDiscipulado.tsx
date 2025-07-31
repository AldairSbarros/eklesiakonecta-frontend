import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function RelatorioDiscipulado() {
  type RelatorioDiscipuladoData = Record<string, unknown>; // Replace with a more specific type if known
  const [dados, setDados] = useState<RelatorioDiscipuladoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const schema = localStorage.getItem("schema") || "";

  useEffect(() => {
    setLoading(true);
    setErro("");
    fetch(`${API_URL}/relatorio-discipulado`, { headers: { schema } })
      .then(res => res.json())
      .then(data => setDados(data))
      .catch(() => setErro("Erro ao buscar relatório de discipulado."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relatorio-discipulado">
      <h2>Relatório de Discipulado por Discipulador</h2>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      {dados && (
        <pre>{JSON.stringify(dados, null, 2)}</pre>
      )}
    </div>
  );
}

export default RelatorioDiscipulado;
