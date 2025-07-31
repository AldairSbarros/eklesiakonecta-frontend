import { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/ProfessorCadastro.scss';

interface Professor {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
}

export default function ProfessorCadastro() {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const fetchProfessores = async () => {
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
      const response = await fetch(getApiUrl('/api/escola-lideres/professores'), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) {
        setProfessores(Array.isArray(data) ? data : []);
      } else {
        setErro(data.error || 'Erro ao buscar professores.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        response = await fetch(getApiUrl(`/api/escola-lideres/professores/${editId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(form)
        });
      } else {
        response = await fetch(getApiUrl('/api/escola-lideres/professores'), {
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
        setForm({ nome: '', email: '', telefone: '' });
        setEditId(null);
        fetchProfessores();
      } else {
        setErro(result.error || 'Erro ao salvar professor.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (professor: Professor) => {
    setForm({ nome: professor.nome, email: professor.email || '', telefone: professor.telefone || '' });
    setEditId(professor.id);
    setSucesso(false);
    setErro('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este professor?')) return;
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
      const response = await fetch(getApiUrl(`/api/escola-lideres/professores/${id}`), {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      if (response.ok) {
        fetchProfessores();
      } else {
        setErro('Erro ao excluir professor.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="professor-cadastro-container">
      <h2>Cadastrar Professor</h2>
      <form onSubmit={handleSubmit} className="professor-cadastro-form" autoComplete="off">
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
            placeholder="Nome do professor"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="E-mail do professor (opcional)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="text"
            id="telefone"
            name="telefone"
            value={form.telefone}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="Telefone do professor (opcional)"
          />
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Professor cadastrado com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-professor">
          {loading ? 'Salvando...' : (editId ? 'Salvar Edição' : 'Cadastrar')}
        </button>
        {editId && (
          <button type="button" className="btn-cancelar-edicao" onClick={() => { setEditId(null); setForm({ nome: '', email: '', telefone: '' }); setErro(''); setSucesso(false); }} disabled={loading}>
            Cancelar Edição
          </button>
        )}
      </form>
      <hr />
      <h3>Professores Cadastrados</h3>
      {loading ? (
        <div className="loading">Carregando professores...</div>
      ) : (
        <table className="professores-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {professores.length === 0 ? (
              <tr><td colSpan={4}>Nenhum professor cadastrado.</td></tr>
            ) : (
              professores.map(p => (
                <tr key={p.id}>
                  <td>{p.nome}</td>
                  <td>{p.email}</td>
                  <td>{p.telefone}</td>
                  <td>
                    <button className="btn-acao-editar" onClick={() => handleEdit(p)} disabled={loading}>Editar</button>
                    <button className="btn-acao-excluir" onClick={() => handleDelete(p.id)} disabled={loading}>Excluir</button>
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
