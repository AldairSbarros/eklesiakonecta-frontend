import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/LicaoCadastro.scss';

interface Licao {
  id: number;
  nome: string;
  descricao?: string;
  moduloId?: number;
  modulo?: { id: number; nome: string };
}

interface Modulo {
  id: number;
  nome: string;
}

const LicaoCadastro: React.FC = () => {
  const [licoes, setLicoes] = useState<Licao[]>([]);
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [form, setForm] = useState({ nome: '', descricao: '', moduloId: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  // Buscar módulos para o select
  const fetchModulos = async () => {
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) return;
    try {
      const response = await fetch(getApiUrl('/api/escola-lideres/modulos'), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) setModulos(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erro ao buscar módulos:', error);
    }
  };

  const fetchLicoes = async () => {
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
      const response = await fetch(getApiUrl('/api/escola-lideres/licoes'), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) {
        setLicoes(Array.isArray(data) ? data : []);
      } else {
        setErro(data.error || 'Erro ao buscar lições.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLicoes();
    fetchModulos();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      const payload = { ...form, moduloId: form.moduloId ? Number(form.moduloId) : undefined };
      if (editId) {
        response = await fetch(getApiUrl(`/api/escola-lideres/licoes/${editId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(payload)
        });
      } else {
        response = await fetch(getApiUrl('/api/escola-lideres/licoes'), {
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
        setForm({ nome: '', descricao: '', moduloId: '' });
        setEditId(null);
        fetchLicoes();
      } else {
        setErro(result.error || 'Erro ao salvar lição.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (licao: Licao) => {
    setForm({
      nome: licao.nome,
      descricao: licao.descricao || '',
      moduloId: licao.moduloId ? String(licao.moduloId) : ''
    });
    setEditId(licao.id);
    setSucesso(false);
    setErro('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta lição?')) return;
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
      const response = await fetch(getApiUrl(`/api/escola-lideres/licoes/${id}`), {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      if (response.ok) {
        fetchLicoes();
      } else {
        setErro('Erro ao excluir lição.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="licao-cadastro-container">
      <h2>Cadastrar Lição</h2>
      <form onSubmit={handleSubmit} className="licao-cadastro-form" autoComplete="off">
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
            placeholder="Nome da lição"
          />
        </div>
        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={form.descricao}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="Descrição da lição (opcional)"
            rows={2}
          />
        </div>
        <div className="form-group">
          <label htmlFor="moduloId">Módulo *</label>
          <select
            id="moduloId"
            name="moduloId"
            value={form.moduloId}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            <option value="">Selecione o módulo</option>
            {modulos.map(m => (
              <option key={m.id} value={m.id}>{m.nome}</option>
            ))}
          </select>
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Lição cadastrada com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-licao">
          {loading ? 'Salvando...' : (editId ? 'Salvar Edição' : 'Cadastrar')}
        </button>
        {editId && (
          <button type="button" className="btn-cancelar-edicao" onClick={() => { setEditId(null); setForm({ nome: '', descricao: '', moduloId: '' }); setErro(''); setSucesso(false); }} disabled={loading}>
            Cancelar Edição
          </button>
        )}
      </form>
      <hr />
      <h3>Lições Cadastradas</h3>
      {loading ? (
        <div className="loading">Carregando lições...</div>
      ) : (
        <table className="licoes-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Módulo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {licoes.length === 0 ? (
              <tr><td colSpan={4}>Nenhuma lição cadastrada.</td></tr>
            ) : (
              licoes.map(l => (
                <tr key={l.id}>
                  <td>{l.nome}</td>
                  <td>{l.descricao}</td>
                  <td>{l.modulo?.nome || '-'}</td>
                  <td>
                    <button className="btn-acao-editar" onClick={() => handleEdit(l)} disabled={loading}>Editar</button>
                    <button className="btn-acao-excluir" onClick={() => handleDelete(l.id)} disabled={loading}>Excluir</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default LicaoCadastro;
