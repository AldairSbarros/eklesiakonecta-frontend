import React, { useEffect, useState, useCallback } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/LivesCadastro.scss';

interface Live {
  id?: number;
  churchId: number;
  titulo: string;
  descricao: string;
  url: string;
  agendadaEm: string;
}

export default function LivesCadastro() {
  const [lives, setLives] = useState<Live[]>([]);
  const [form, setForm] = useState<Live>({
    churchId: 0,
    titulo: '',
    descricao: '',
    url: '',
    agendadaEm: ''
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
  const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
  const churchId = igrejaData ? JSON.parse(igrejaData).id : null;

  const fetchLives = useCallback(async () => {
    setErro('');
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/lives/${churchId}`), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) setLives(Array.isArray(data) ? data : []);
      else setErro(data.error || 'Erro ao buscar lives.');
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }, [schema, churchId]);

  useEffect(() => { fetchLives(); }, [fetchLives]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const url = editId
        ? getApiUrl(`/api/lives/${editId}`)
        : getApiUrl('/api/lives');
      const method = editId ? 'PUT' : 'POST';
      const body = { ...form, churchId };
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'schema': schema
        },
        body: JSON.stringify(body)
      });
      const data = await response.json();
      if (response.ok) {
        fetchLives();
        setForm({ churchId: 0, titulo: '', descricao: '', url: '', agendadaEm: '' });
        setEditId(null);
      } else setErro(data.error || 'Erro ao salvar live.');
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (live: Live) => {
    setForm({ ...live });
    setEditId(live.id || null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirma remover esta live?')) return;
    setErro('');
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/lives/${id}`), {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) fetchLives();
      else setErro(data.error || 'Erro ao remover live.');
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Notificação simples (browser)
  const handleNotify = (live: Live) => {
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(`Live agendada: ${live.titulo}`, {
        body: `Clique para assistir: ${live.url}`,
        icon: '/favicon.png'
      });
    } else if (window.Notification && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(`Live agendada: ${live.titulo}`, {
            body: `Clique para assistir: ${live.url}`,
            icon: '/favicon.png'
          });
        }
      });
    }
  };

  // Detectar YouTube/Facebook
  const getLiveType = (url: string) => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('facebook.com')) return 'Facebook';
    return 'Outro';
  };

  return (
    <div className="lives-cadastro-container">
      <h2>Transmissões ao Vivo</h2>
      <form onSubmit={handleSubmit} className="lives-form">
        <input name="titulo" value={form.titulo} onChange={handleChange} placeholder="Título" required />
        <textarea name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição" required />
        <input name="url" value={form.url} onChange={handleChange} placeholder="URL da Live (YouTube/Facebook)" required />
        <input name="agendadaEm" type="datetime-local" value={form.agendadaEm} onChange={handleChange} required />
        <button type="submit" disabled={loading}>{editId ? 'Atualizar' : 'Cadastrar'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ churchId: 0, titulo: '', descricao: '', url: '', agendadaEm: '' }); }}>Cancelar</button>}
      </form>
      {erro && <div className="erro-message">{erro}</div>}
      <table className="lives-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Descrição</th>
            <th>Plataforma</th>
            <th>URL</th>
            <th>Agendada Em</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {lives.map(live => (
            <tr key={live.id}>
              <td>{live.id}</td>
              <td>{live.titulo}</td>
              <td>{live.descricao}</td>
              <td>{getLiveType(live.url)}</td>
              <td><a href={live.url} target="_blank" rel="noopener noreferrer">Assistir</a></td>
              <td>{new Date(live.agendadaEm).toLocaleString()}</td>
              <td>
                <button onClick={() => handleEdit(live)}>Editar</button>
                <button onClick={() => handleDelete(live.id!)}>Remover</button>
                <button onClick={() => handleNotify(live)}>Notificar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
