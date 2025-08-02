import { useEffect, useState } from 'react';
import EncontroCadastro from '../components/EncontroCadastro';
import { API_URL } from '../config/api';
import '../styles/Encontros.scss';

interface Encontro {
  id: number;
  titulo: string;
  data: string;
  local: string;
  descricao?: string;
}

export default function Encontros() {
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const fetchEncontros = async () => {
    setLoading(true);
    setErro('');
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) {
      setErro('Schema da igreja não encontrado. Faça login novamente.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/encontros`, {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) {
        setEncontros(Array.isArray(data) ? data : []);
      } else {
        setErro(data.error || 'Erro ao buscar encontros.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEncontros();
  }, []);

  return (
    <div className="encontros-page">
      <h1>Encontros</h1>
      <EncontroCadastro onSuccess={fetchEncontros} />
      <hr />
      <h2>Lista de Encontros</h2>
      {erro && <div className="erro-message">{erro}</div>}
      {loading ? (
        <div className="loading">Carregando encontros...</div>
      ) : (
        <table className="encontros-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Data</th>
              <th>Local</th>
              <th>Descrição</th>
            </tr>
          </thead>
          <tbody>
            {encontros.length === 0 ? (
              <tr><td colSpan={4}>Nenhum encontro cadastrado.</td></tr>
            ) : (
              encontros.map(e => (
                <tr key={e.id}>
                  <td>{e.titulo}</td>
                  <td>{new Date(e.data).toLocaleDateString()}</td>
                  <td>{e.local}</td>
                  <td>{e.descricao}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
