import { useEffect, useState } from 'react';
import { API_URL } from '../config/api';
import '../styles/SecretarioCadastro.scss';

interface Secretario {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
}

export default function SecretarioCadastro() {
  const [secretarios, setSecretarios] = useState<Secretario[]>([]);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const fetchSecretarios = async () => {
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
      const response = await fetch(`${API_URL}/api/escola-lideres/secretarios`, {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) {
        setSecretarios(Array.isArray(data) ? data : []);
      } else {
        setErro(data.error || 'Erro ao buscar secretários.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecretarios();
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
        response = await fetch(`${API_URL}/api/escola-lideres/secretarios/${editId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(form)
        });
      } else {
        response = await fetch(`${API_URL}/api/escola-lideres/secretarios`, {
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
        fetchSecretarios();
      } else {
        setErro(result.error || 'Erro ao salvar secretário.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (secretario: Secretario) => {
    setForm({ nome: secretario.nome, email: secretario.email || '', telefone: secretario.telefone || '' });
    setEditId(secretario.id);
    setSucesso(false);
    setErro('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este secretário?')) return;
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
      const response = await fetch(`${API_URL}/api/escola-lideres/secretarios/${id}`, {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      if (response.ok) {
        fetchSecretarios();
      } else {
        setErro('Erro ao excluir secretário.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="secretario-cadastro-container">
      <h2>Cadastrar Secretário</h2>
      <form onSubmit={handleSubmit} className="secretario-cadastro-form" autoComplete="off">
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
            placeholder="Nome do secretário"
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
            placeholder="E-mail do secretário (opcional)"
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
            placeholder="Telefone do secretário (opcional)"
          />
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Secretário cadastrado com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-secretario">
          {loading ? 'Salvando...' : (editId ? 'Salvar Edição' : 'Cadastrar')}
        </button>
        {editId && (
          <button type="button" className="btn-cancelar-edicao" onClick={() => { setEditId(null); setForm({ nome: '', email: '', telefone: '' }); setErro(''); setSucesso(false); }} disabled={loading}>
            Cancelar Edição
          </button>
        )}
      </form>
      <hr />
      <h3>Secretários Cadastrados</h3>
      {loading ? (
        <div className="loading">Carregando secretários...</div>
      ) : (
        <table className="secretarios-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {secretarios.length === 0 ? (
              <tr><td colSpan={4}>Nenhum secretário cadastrado.</td></tr>
            ) : (
              secretarios.map(s => (
                <tr key={s.id}>
                  <td>{s.nome}</td>
                  <td>{s.email}</td>
                  <td>{s.telefone}</td>
                  <td>
                    <button className="btn-acao-editar" onClick={() => handleEdit(s)} disabled={loading}>Editar</button>
                    <button className="btn-acao-excluir" onClick={() => handleDelete(s.id)} disabled={loading}>Excluir</button>
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
