import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/AlunoCadastro.scss';

interface Aluno {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  turmaId?: number;
  turma?: { id: number; nome: string };
}

interface Turma {
  id: number;
  nome: string;
}

export default function AlunoCadastro() {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', turmaId: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  // Buscar turmas para o select
  const fetchTurmas = async () => {
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) return;
    try {
      const response = await fetch(getApiUrl('/api/escola-lideres/turmas'), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) setTurmas(Array.isArray(data) ? data : []);
    } catch {
      // Erro ao buscar turmas, pode adicionar lógica de tratamento se necessário
    }
  };

  const fetchAlunos = async () => {
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
      const response = await fetch(getApiUrl('/api/escola-lideres/alunos'), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) {
        setAlunos(Array.isArray(data) ? data : []);
      } else {
        setErro(data.error || 'Erro ao buscar alunos.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
    fetchTurmas();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const payload = { ...form, turmaId: form.turmaId ? Number(form.turmaId) : undefined };
      if (editId) {
        response = await fetch(getApiUrl(`/api/escola-lideres/alunos/${editId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(getApiUrl('/api/escola-lideres/alunos'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(payload)
        });
      }
      const result = await response.json();
      if (response.ok) {
        setSucesso(true);
        setForm({ nome: '', email: '', telefone: '', turmaId: '' });
        setEditId(null);
        fetchAlunos();
      } else {
        setErro(result.error || 'Erro ao salvar aluno.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (aluno: Aluno) => {
    setForm({
      nome: aluno.nome,
      email: aluno.email || '',
      telefone: aluno.telefone || '',
      turmaId: aluno.turmaId ? String(aluno.turmaId) : ''
    });
    setEditId(aluno.id);
    setSucesso(false);
    setErro('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este aluno?')) return;
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
      const response = await fetch(getApiUrl(`/api/escola-lideres/alunos/${id}`), {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      if (response.ok) {
        fetchAlunos();
      } else {
        setErro('Erro ao excluir aluno.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="aluno-cadastro-container">
      <h2>Cadastrar Aluno</h2>
      <form onSubmit={handleSubmit} className="aluno-cadastro-form" autoComplete="off">
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
            placeholder="Nome do aluno"
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
            placeholder="E-mail do aluno (opcional)"
          />
        </div>
        <div className="form-group">
          <label htmlFor="turmaId">Turma *</label>
          <select
            id="turmaId"
            name="turmaId"
            value={form.turmaId}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="">Selecione a turma</option>
            {turmas.map(t => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
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
            placeholder="Telefone do aluno (opcional)"
          />
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Aluno cadastrado com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-aluno">
          {loading ? 'Salvando...' : (editId ? 'Salvar Edição' : 'Cadastrar')}
        </button>
        {editId && (
          <button type="button" className="btn-cancelar-edicao" onClick={() => { setEditId(null); setForm({ nome: '', email: '', telefone: '', turmaId: '' }); setErro(''); setSucesso(false); }} disabled={loading}>
            Cancelar Edição
          </button>
        )}
      </form>
      <hr />
      <h3>Alunos Cadastrados</h3>
      {loading ? (
        <div className="loading">Carregando alunos...</div>
      ) : (
        <table className="alunos-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Telefone</th>
              <th>Turma</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunos.length === 0 ? (
              <tr><td colSpan={5}>Nenhum aluno cadastrado.</td></tr>
            ) : (
              alunos.map(a => (
                <tr key={a.id}>
                  <td>{a.nome}</td>
                  <td>{a.email}</td>
                  <td>{a.telefone}</td>
                  <td>{a.turma?.nome || '-'}</td>
                  <td>
                    <button className="btn-acao-editar" onClick={() => handleEdit(a)} disabled={loading}>Editar</button>
                    <button className="btn-acao-excluir" onClick={() => handleDelete(a.id)} disabled={loading}>Excluir</button>
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
