import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/FaturaCadastro.scss';

interface Fatura {
  id: number;
  descricao: string;
  valor: number;
  vencimento: string;
  status: string;
}

const statusOptions = [
  'PENDENTE',
  'PAGA',
  'ATRASADA',
  'CANCELADA'
];

export default function FaturaCadastro() {
  const [faturas, setFaturas] = useState<Fatura[]>([]);
  const [form, setForm] = useState({ descricao: '', valor: '', vencimento: '', status: 'PENDENTE' });
  const [editId, setEditId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');

  const fetchFaturas = async () => {
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
      const response = await fetch(getApiUrl('/api/faturas'), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) {
        setFaturas(Array.isArray(data) ? data : []);
      } else {
        setErro(data.error || 'Erro ao buscar faturas.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaturas();
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
      if (editId) {
        response = await fetch(getApiUrl(`/api/faturas/${editId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'schema': schema
          },
          body: JSON.stringify(form)
        });
      } else {
        response = await fetch(getApiUrl('/api/faturas'), {
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
        setForm({ descricao: '', valor: '', vencimento: '', status: 'PENDENTE' });
        setEditId(null);
        fetchFaturas();
      } else {
        setErro(result.error || 'Erro ao salvar fatura.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (fatura: Fatura) => {
    setForm({
      descricao: fatura.descricao,
      valor: String(fatura.valor),
      vencimento: fatura.vencimento,
      status: fatura.status
    });
    setEditId(fatura.id);
    setSucesso(false);
    setErro('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir esta fatura?')) return;
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
      const response = await fetch(getApiUrl(`/api/faturas/${id}`), {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      if (response.ok) {
        fetchFaturas();
      } else {
        setErro('Erro ao excluir fatura.');
      }
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Filtro e ordenação
  const faturasFiltradas = faturas
    .filter(f => filtroStatus === 'TODOS' || f.status === filtroStatus)
    .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime());

  // Totalizadores
  const totalPorStatus = statusOptions.reduce((acc, status) => {
    acc[status] = faturas.filter(f => f.status === status).reduce((sum, f) => sum + Number(f.valor), 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="fatura-cadastro-container">
      <h2>Cadastrar Fatura</h2>
      <form onSubmit={handleSubmit} className="fatura-cadastro-form" autoComplete="off">
        {/* ...form fields... */}
        <div className="form-group">
          <label htmlFor="descricao">Descrição *</label>
          <input
            type="text"
            id="descricao"
            name="descricao"
            value={form.descricao}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Descrição da fatura"
          />
        </div>
        <div className="form-group">
          <label htmlFor="valor">Valor *</label>
          <input
            type="number"
            id="valor"
            name="valor"
            value={form.valor}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Valor da fatura"
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label htmlFor="vencimento">Vencimento *</label>
          <input
            type="date"
            id="vencimento"
            name="vencimento"
            value={form.vencimento}
            onChange={handleInputChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="status">Status *</label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleInputChange}
            required
            disabled={loading}
          >
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Fatura cadastrada/atualizada com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-fatura">
          {loading ? 'Salvando...' : (editId ? 'Salvar Edição' : 'Cadastrar')}
        </button>
        {editId && (
          <button type="button" className="btn-cancelar-edicao" onClick={() => { setEditId(null); setForm({ descricao: '', valor: '', vencimento: '', status: 'PENDENTE' }); setErro(''); setSucesso(false); }} disabled={loading}>
            Cancelar Edição
          </button>
        )}
      </form>
      <hr />
      <div className="fatura-filtros-totais">
        <div className="filtros-status">
          <label>Filtrar por status:</label>
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} disabled={loading}>
            <option value="TODOS">Todos</option>
            {statusOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="totais-status">
          {statusOptions.map(opt => (
            <span key={opt} className={`total-status total-${opt.toLowerCase()}`}>
              {opt}: R$ {totalPorStatus[opt]?.toFixed(2) || '0.00'}
            </span>
          ))}
        </div>
      </div>
      <h3>Faturas Cadastradas</h3>
      {loading ? (
        <div className="loading">Carregando faturas...</div>
      ) : (
        <table className="faturas-table">
          <thead>
            <tr>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {faturasFiltradas.length === 0 ? (
              <tr><td colSpan={5}>Nenhuma fatura cadastrada.</td></tr>
            ) : (
              faturasFiltradas.map(f => {
                const venc = new Date(f.vencimento);
                const hoje = new Date();
                const atrasada = f.status === 'PENDENTE' && venc < hoje;
                return (
                  <tr key={f.id} className={atrasada ? 'fatura-atrasada' : ''}>
                    <td>{f.descricao}</td>
                    <td>R$ {Number(f.valor).toFixed(2)}</td>
                    <td>{f.vencimento}</td>
                    <td>{f.status}</td>
                    <td>
                      <button className="btn-acao-editar" onClick={() => handleEdit(f)} disabled={loading}>Editar</button>
                      <button className="btn-acao-excluir" onClick={() => handleDelete(f.id)} disabled={loading}>Excluir</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
