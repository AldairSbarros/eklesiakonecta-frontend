import { useEffect, useState, useCallback } from "react";
import { http } from '../config/http';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
  congregacaoId?: number;
  ativo?: boolean;
}

function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);
  const [form, setForm] = useState<Partial<Usuario & { senha?: string; token?: string }>>({});
  const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
  const schema = (() => { try { return (igrejaData && JSON.parse(igrejaData).schema) || localStorage.getItem('church_schema') || ""; } catch { return localStorage.getItem('church_schema') || ""; } })();

  const fetchUsuarios = useCallback(() => {
    setLoading(true);
    setErro("");
    http('/api/usuarios', { schema })
      .then(data => setUsuarios(Array.isArray(data) ? data as Usuario[] : []))
      .catch(() => setErro("Erro ao buscar usuários."))
      .finally(() => setLoading(false));
  }, [schema]);

  useEffect(() => { fetchUsuarios(); }, [fetchUsuarios]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const method = editando ? 'PUT' : 'POST';
    const url = editando ? `/api/usuarios/${editando.id}` : `/api/usuarios`;
    http(url, { method, schema, body: JSON.stringify(form) })
      .then(() => {
        setModalOpen(false);
        setEditando(null);
        setForm({});
        fetchUsuarios();
      })
      .catch(() => setErro("Erro ao salvar usuário."))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Confirma remover este usuário?")) return;
    setLoading(true);
    http(`/api/usuarios/${id}`, { method: 'DELETE', schema })
      .then(() => fetchUsuarios())
      .catch(() => setErro("Erro ao remover usuário."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="usuarios-page">
      <h2>Gestão de Usuários</h2>
      <button onClick={() => { setModalOpen(true); setEditando(null); setForm({}); }} style={{marginBottom:16}}>Novo Usuário</button>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      <table className="usuarios-table" style={{width:'100%',marginBottom:24}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Email</th>
            <th>Perfil</th>
            <th>Congregação</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map(u => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>{u.nome}</td>
              <td>{u.email}</td>
              <td>{u.perfil}</td>
              <td>{u.congregacaoId ?? '-'}</td>
              <td>{u.ativo ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => { setEditando(u); setForm(u); setModalOpen(true); }}>Editar</button>
                <button onClick={() => handleDelete(u.id)} style={{marginLeft:8}}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal de cadastro/edição */}
      {modalOpen && (
        <div className="modal-usuario" style={{background:'#fff',padding:24,borderRadius:8,boxShadow:'0 2px 8px #0002',maxWidth:400,margin:'0 auto'}}>
          <h3>{editando ? 'Editar' : 'Novo'} Usuário</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="Nome" value={form.nome ?? ''} onChange={e => setForm(f => ({...f, nome: e.target.value}))} required style={{marginBottom:8}} />
            <input placeholder="Email" type="email" value={form.email ?? ''} onChange={e => setForm(f => ({...f, email: e.target.value}))} required style={{marginBottom:8}} />
            {!editando && <input placeholder="Senha" type="password" value={form.senha ?? ''} onChange={e => setForm(f => ({...f, senha: e.target.value}))} required style={{marginBottom:8}} />}
            <input placeholder="Perfil" value={form.perfil ?? ''} onChange={e => setForm(f => ({...f, perfil: e.target.value}))} required style={{marginBottom:8}} />
            <input placeholder="ID da Congregação" type="number" value={form.congregacaoId ?? ''} onChange={e => setForm(f => ({...f, congregacaoId: Number(e.target.value)}))} style={{marginBottom:8}} />
            <input placeholder="Token de autorização" value={form.token ?? ''} onChange={e => setForm(f => ({...f, token: e.target.value}))} style={{marginBottom:8}} />
            <div style={{display:'flex',gap:8}}>
              <button type="submit" disabled={loading}>{editando ? 'Salvar' : 'Cadastrar'}</button>
              <button type="button" onClick={() => { setModalOpen(false); setEditando(null); setForm({}); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default UsuariosPage;
