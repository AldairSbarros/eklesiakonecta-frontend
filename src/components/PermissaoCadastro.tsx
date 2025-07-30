import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Usuario {
  id: number;
  nome: string;
  email: string;
}

interface Permissao {
  id?: number;
  nome: string;
  descricao: string;
  usuarios?: Usuario[];
}

const PermissaoCadastro: React.FC = () => {
  const [permissoes, setPermissoes] = useState<Permissao[]>([]);
  const [form, setForm] = useState<Permissao>({ nome: '', descricao: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const schema = localStorage.getItem('eklesiakonecta_schema') || '';

  // Listar permissões
  const fetchPermissoes = async () => {
    try {
      const res = await fetch('/api/permissoes', {
        headers: { schema }
      });
      const data = await res.json();
      if (res.ok) setPermissoes(data);
      else toast.error(data.error || 'Erro ao listar permissões');
    } catch {
      toast.error('Erro de conexão');
    }
  };

  useEffect(() => { fetchPermissoes(); }, []);

  // Criar ou atualizar permissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/permissoes/${editId}` : '/api/permissoes';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', schema },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(editId ? 'Permissão atualizada!' : 'Permissão cadastrada!');
        setForm({ nome: '', descricao: '' });
        setEditId(null);
        fetchPermissoes();
      } else toast.error(data.error || 'Erro ao salvar');
    } catch {
      toast.error('Erro de conexão');
    }
  };

  // Editar permissão
  const handleEdit = (permissao: Permissao) => {
    setForm(permissao);
    setEditId(permissao.id || null);
  };

  // Remover permissão
  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirma remover?')) return;
    try {
      const res = await fetch(`/api/permissoes/${id}`, {
        method: 'DELETE',
        headers: { schema }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Removido com sucesso!');
        fetchPermissoes();
      } else toast.error(data.error || 'Erro ao remover');
    } catch {
      toast.error('Erro de conexão');
    }
  };

  return (
    <div className="permissao-cadastro-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <form className="permissao-form" onSubmit={handleSubmit}>
        <h2>{editId ? 'Editar Permissão' : 'Cadastrar Permissão'}</h2>
        <input
          type="text"
          placeholder="Nome da permissão"
          value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Descrição"
          value={form.descricao}
          onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
        />
        <button type="submit">{editId ? 'Salvar' : 'Cadastrar'}</button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ nome: '', descricao: '' }); }}>Cancelar</button>
        )}
      </form>
      <div className="permissao-list">
        <h3>Permissões Cadastradas</h3>
        <ul>
          {permissoes.map(p => (
            <li key={p.id}>
              <strong>{p.nome}</strong> - {p.descricao}
              {p.usuarios && p.usuarios.length > 0 && (
                <span style={{ marginLeft: 12, color: '#666', fontSize: '0.95rem' }}>
                  Usuários: {p.usuarios.map(u => u.nome).join(', ')}
                </span>
              )}
              <button onClick={() => handleEdit(p)}>Editar</button>
              <button onClick={() => handleDelete(p.id!)}>Remover</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PermissaoCadastro;
