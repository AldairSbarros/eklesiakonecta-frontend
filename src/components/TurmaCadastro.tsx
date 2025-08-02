import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import '../styles/TurmaCadastro.scss';

interface Turma {
  id: number;
  nome: string;
  periodo: string;
  observacao?: string;
}

export default function TurmaCadastro() {
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [form, setForm] = useState({ nome: '', periodo: '', observacao: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const fetchTurmas = async () => {
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
      const response = await fetch(`${API_URL}/api/escola-lideres/turmas`, {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) {
        setTurmas(Array.isArray(data) ? data : []);
      } else {
        setErro(data.error || 'Erro ao buscar turmas.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurmas();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setLoading(true);
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) {
      setErro('Schema da igreja não encontrado. Faça login novamente.');
      setLoading(false);
      return;
    }
    try {
      let response;
      if (editId) {
        response = await fetch(`${API_URL}/api/escola-lideres/turmas/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(form)
        });
      } else {
        response = await fetch(`${API_URL}/api/escola-lideres/turmas`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(form)
        });
      }
      const result = await response.json();
      if (response.ok) {
        setSucesso(true);
        setForm({ nome: '', periodo: '', observacao: '' });
        setEditId(null);
        fetchTurmas();
      } else {
        setErro(result.error || 'Erro ao salvar turma.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (turma: Turma) => {
    setForm({ nome: turma.nome, periodo: turma.periodo, observacao: turma.observacao || '' });
    setEditId(turma.id);
    setSucesso(false);
    setErro('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta turma?')) return;
    setLoading(true);
    setErro('');
    setSucesso(false);
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) {
      setErro('Schema da igreja não encontrado. Faça login novamente.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`${API_URL}/api/escola-lideres/turmas/${id}`, {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      if (response.ok) {
        fetchTurmas();
      } else {
        setErro('Erro ao excluir turma.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="turma-cadastro-container">
      <h2>Cadastrar Turma</h2>
      <form onSubmit={handleSubmit} className="turma-cadastro-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="nome">Nome *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={form.nome}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Nome da turma"
          />
        </div>
        <div className="form-group">
          <label htmlFor="periodo">Período *</label>
          <input
            type="text"
            id="periodo"
            name="periodo"
            value={form.periodo}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Ex: 2025/1"
          />
        </div>
        <div className="form-group">
          <label htmlFor="observacao">Observação</label>
          <textarea
            id="observacao"
            name="observacao"
            value={form.observacao}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="Observações (opcional)"
            rows={2}
          />
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Turma cadastrada com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-turma">
          {loading ? 'Salvando...' : (editId ? 'Salvar Edição' : 'Cadastrar')}
        </button>
        {editId && (
          <button type="button" className="btn-cancelar-edicao" onClick={() => { setEditId(null); setForm({ nome: '', periodo: '', observacao: '' }); setErro(''); setSucesso(false); }} disabled={loading}>
            Cancelar Edição
          </button>
        )}
      </form>
      <hr />
      <h3>Turmas Cadastradas</h3>
      {loading ? (
        <div className="loading">Carregando turmas...</div>
      ) : (
        <table className="turmas-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Período</th>
              <th>Observação</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {turmas.length === 0 ? (
              <tr><td colSpan={4}>Nenhuma turma cadastrada.</td></tr>
            ) : (
              turmas.map(t => (
                <tr key={t.id}>
                  <td>{t.nome}</td>
                  <td>{t.periodo}</td>
                  <td>{t.observacao}</td>
                  <td>
                    <button className="btn-acao-editar" onClick={() => handleEdit(t)} disabled={loading}>Editar</button>
                    <button className="btn-acao-excluir" onClick={() => handleDelete(t.id)} disabled={loading}>Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
