import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as pastoresApi from '../backend/services/pastores.service';
import type { Pastor as PastorModel } from '../backend/services/pastores.service';

const PastorCadastro: React.FC = () => {
  const [pastores, setPastores] = useState<PastorModel[]>([]);
  const [form, setForm] = useState<Partial<PastorModel>>({ nome: '', email: '', telefone: '' });
  const [editId, setEditId] = useState<number | null>(null);

  // Listar pastores
  const fetchPastores = async () => {
    try {
  const data = await pastoresApi.list();
  setPastores(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao listar pastores';
      toast.error(msg);
    }
  };

  useEffect(() => { fetchPastores(); }, []);

  // Criar ou atualizar pastor
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await pastoresApi.update(editId, form);
        toast.success('Pastor atualizado!');
      } else {
        await pastoresApi.create(form);
        toast.success('Pastor cadastrado!');
      }
      setForm({ nome: '', email: '', telefone: '' });
      setEditId(null);
      fetchPastores();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao salvar';
      toast.error(msg);
    }
  };

  // Editar pastor
  const handleEdit = (pastor: PastorModel) => {
    setForm({ nome: pastor.nome || '', email: pastor.email || '', telefone: pastor.telefone || '' });
    setEditId(pastor.id || null);
  };

  // Remover pastor
  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirma remover?')) return;
    try {
      await pastoresApi.remove(id);
      toast.success('Removido com sucesso!');
      fetchPastores();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro ao remover';
      toast.error(msg);
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
          value={form.nome || ''}
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
          required
        />
        <input
          type="email"
          placeholder="E-mail"
          value={form.email || ''}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          required
        />
        <input
          type="text"
          placeholder="Telefone"
          value={form.telefone || ''}
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
