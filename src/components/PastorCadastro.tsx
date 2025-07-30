import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Pastor {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
}

const PastorCadastro: React.FC = () => {
  const [pastores, setPastores] = useState<Pastor[]>([]);
  const [form, setForm] = useState<Pastor>({ nome: '', email: '', telefone: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const schema = localStorage.getItem('eklesiakonecta_schema') || '';

  // Listar pastores
  const fetchPastores = async () => {
    try {
      const res = await fetch('/api/pastores', {
        headers: { schema }
      });
      const data = await res.json();
      if (res.ok) setPastores(data);
      else toast.error(data.error || 'Erro ao listar pastores');
    } catch {
      toast.error('Erro de conexão');
    }
  };

  useEffect(() => { fetchPastores(); }, []);

  // Criar ou atualizar pastor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/pastores/${editId}` : '/api/pastores';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', schema },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editId ? 'Pastor atualizado!' : 'Pastor cadastrado!');
        setForm({ nome: '', email: '', telefone: '' });
        setEditId(null);
        fetchPastores();
      } else toast.error(data.error || 'Erro ao salvar');
    } catch {
      toast.error('Erro de conexão');
    }
  };

  // Editar pastor
  const handleEdit = (pastor: Pastor) => {
    setForm(pastor);
    setEditId(pastor.id || null);
  };

  // Remover pastor
  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirma remover?')) return;
    try {
      const res = await fetch(`/api/pastores/${id}`, {
        method: 'DELETE',
        headers: { schema }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Removido com sucesso!');
        fetchPastores();
      } else toast.error(data.error || 'Erro ao remover');
    } catch {
      toast.error('Erro de conexão');
    }
  };

  return (
    <div className="pastor-cadastro-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <form className="pastor-form" onSubmit={handleSubmit}>
        <h2>{editId ? 'Editar Pastor' : 'Cadastrar Pastor'}</h2>
        <input
          type="text"
          placeholder="Nome"
          value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Telefone"
          value={form.telefone}
          onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
        />
        <button type="submit">{editId ? 'Salvar' : 'Cadastrar'}</button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ nome: '', email: '', telefone: '' }); }}>Cancelar</button>
        )}
      </form>
      <div className="pastor-list">
        <h3>Pastores Cadastrados</h3>
        <ul>
          {pastores.map(p => (
            <li key={p.id}>
              <strong>{p.nome}</strong> - {p.email} - {p.telefone}
              <button onClick={() => handleEdit(p)}>Editar</button>
              <button onClick={() => handleDelete(p.id!)}>Remover</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PastorCadastro;
