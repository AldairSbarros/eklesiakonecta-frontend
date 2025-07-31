import { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/ModuloCadastro.scss';

interface Modulo {
  id: number;
  nome: string;
  descricao?: string;
}

export default function ModuloCadastro() {
  const [modulos, setModulos] = useState<Modulo[]>([]);
  const [form, setForm] = useState({ nome: '', descricao: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);

  const fetchModulos = async () => {
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
      const response = await fetch(getApiUrl('/api/escola-lideres/modulos'), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) {
        setModulos(Array.isArray(data) ? data : []);
      } else {
        setErro(data.error || 'Erro ao buscar módulos.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModulos();
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
        response = await fetch(getApiUrl(`/api/escola-lideres/modulos/${editId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(form)
        });
      } else {
        response = await fetch(getApiUrl('/api/escola-lideres/modulos'), {
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
        setForm({ nome: '', descricao: '' });
        setEditId(null);
        fetchModulos();
      } else {
        setErro(result.error || 'Erro ao salvar módulo.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (modulo: Modulo) => {
    setForm({ nome: modulo.nome, descricao: modulo.descricao || '' });
    setEditId(modulo.id);
    setSucesso(false);
    setErro('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este módulo?')) return;
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
      const response = await fetch(getApiUrl(`/api/escola-lideres/modulos/${id}`), {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      if (response.ok) {
        fetchModulos();
      } else {
        setErro('Erro ao excluir módulo.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modulo-cadastro-container">
      <h2>Cadastrar Módulo</h2>
      <form onSubmit={handleSubmit} className="modulo-cadastro-form" autoComplete="off">
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
            placeholder="Nome do módulo"
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
            placeholder="Descrição do módulo (opcional)"
            rows={2}
          />
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Módulo cadastrado com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-modulo">
          {loading ? 'Salvando...' : (editId ? 'Salvar Edição' : 'Cadastrar')}
        </button>
        {editId && (
          <button type="button" className="btn-cancelar-edicao" onClick={() => { setEditId(null); setForm({ nome: '', descricao: '' }); setErro(''); setSucesso(false); }} disabled={loading}>
            Cancelar Edição
          </button>
        )}
      </form>
      <hr />
      <h3>Módulos Cadastrados</h3>
      {loading ? (
        <div className="loading">Carregando módulos...</div>
      ) : (
        <table className="modulos-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {modulos.length === 0 ? (
              <tr><td colSpan={3}>Nenhum módulo cadastrado.</td></tr>
            ) : (
              modulos.map(m => (
                <tr key={m.id}>
                  <td>{m.nome}</td>
                  <td>{m.descricao}</td>
                  <td>
                    <button className="btn-acao-editar" onClick={() => handleEdit(m)} disabled={loading}>Editar</button>
                    <button className="btn-acao-excluir" onClick={() => handleDelete(m.id)} disabled={loading}>Excluir</button>
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
