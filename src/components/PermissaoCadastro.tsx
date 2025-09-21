import { useState, useEffect, useCallback } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { http } from '../config/http';

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
  // Listar permissões
  const fetchPermissoes = useCallback(async () => {
    try {
      const data = await http('/api/permissoes');
      setPermissoes(Array.isArray(data) ? data as Permissao[] : []);
    } catch {
      toast.error('Erro ao listar permissões');
    }
  }, []);

  useEffect(() => { fetchPermissoes(); }, [fetchPermissoes]);

  // Criar ou atualizar permissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editId ? `/api/permissoes/${editId}` : '/api/permissoes';
      const method = editId ? 'PUT' : 'POST';
      await http(url, { method, body: JSON.stringify(form) });
      {
        toast.success(editId ? 'Permissão atualizada!' : 'Permissão cadastrada!');
        setForm({ nome: '', descricao: '' });
        setEditId(null);
        fetchPermissoes();
      }
    } catch {
      toast.error('Erro ao salvar permissão');
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
      await http(`/api/permissoes/${id}`, { method: 'DELETE' });
        toast.success('Removido com sucesso!');
        fetchPermissoes();
    } catch {
      toast.error('Erro ao remover permissão');
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
