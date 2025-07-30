import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/ColaboradorCadastro.scss';

interface Colaborador {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
}

export default function ColaboradorCadastro() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const fetchColaboradores = async () => {
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
      const response = await fetch(getApiUrl('/api/escola-lideres/colaboradores'), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) {
        setColaboradores(Array.isArray(data) ? data : []);
      } else {
        setErro(data.error || 'Erro ao buscar colaboradores.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColaboradores();
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
        response = await fetch(getApiUrl(`/api/escola-lideres/colaboradores/${editId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(form)
        });
      } else {
        response = await fetch(getApiUrl('/api/escola-lideres/colaboradores'), {
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
        fetchColaboradores();
      } else {
        setErro(result.error || 'Erro ao salvar colaborador.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (colaborador: Colaborador) => {
    setForm({ nome: colaborador.nome, email: colaborador.email || '', telefone: colaborador.telefone || '' });
    setEditId(colaborador.id);
    setSucesso(false);
    setErro('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este colaborador?')) return;
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
      const response = await fetch(getApiUrl(`/api/escola-lideres/colaboradores/${id}`), {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      if (response.ok) {
        fetchColaboradores();
      } else {
        setErro('Erro ao excluir colaborador.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="colaborador-cadastro-container">
      <h2>Cadastrar Colaborador</h2>
      <form onSubmit={handleSubmit} className="colaborador-cadastro-form" autoComplete="off">
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
            placeholder="Nome do colaborador"
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
            placeholder="E-mail do colaborador (opcional)"
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
            placeholder="Telefone do colaborador (opcional)"
          />
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Colaborador cadastrado com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-colaborador">
          {loading ? 'Salvando...' : (editId ? 'Salvar Edição' : 'Cadastrar')}
        </button>
        {editId && (
          <button type="button" className="btn-cancelar-edicao" onClick={() => { setEditId(null); setForm({ nome: '', email: '', telefone: '' }); setErro(''); setSucesso(false); }} disabled={loading}>
            Cancelar Edição
          </button>
        )}
      </form>
      <hr />
      <h3>Colaboradores Cadastrados</h3>
      {loading ? (
        <div className="loading">Carregando colaboradores...</div>
      ) : (
        <table className="colaboradores-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {colaboradores.length === 0 ? (
              <tr><td colSpan={4}>Nenhum colaborador cadastrado.</td></tr>
            ) : (
              colaboradores.map(c => (
                <tr key={c.id}>
                  <td>{c.nome}</td>
                  <td>{c.email}</td>
                  <td>{c.telefone}</td>
                  <td>
                    <button className="btn-acao-editar" onClick={() => handleEdit(c)} disabled={loading}>Editar</button>
                    <button className="btn-acao-excluir" onClick={() => handleDelete(c.id)} disabled={loading}>Excluir</button>
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
