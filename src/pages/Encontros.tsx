import { useEffect, useState, useCallback } from 'react';
import EncontroCadastro from '../components/EncontroCadastro';
import * as encontrosApi from '../backend/services/encontros.service';
import type { Encontro as EncontroModel } from '../backend/services/encontros.service';
import '../styles/Encontros.scss';

type Encontro = EncontroModel;

export default function Encontros() {
  const [encontros, setEncontros] = useState<Encontro[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const fetchEncontros = useCallback(async () => {
    setLoading(true);
    setErro('');
    try {
  const data = await encontrosApi.list();
  setEncontros(Array.isArray(data) ? (data as Encontro[]) : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao buscar encontros.';
      setErro(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEncontros(); }, [fetchEncontros]);

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
                  <td>{e.data ? new Date(e.data).toLocaleDateString() : '-'}</td>
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
