import React, { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface UsuarioPermissao {
  id: number;
  usuarioId: number;
  permissao: string;
  ativo?: boolean;
}

function PermissoesPage() {
  const [permissoes, setPermissoes] = useState<UsuarioPermissao[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<UsuarioPermissao | null>(null);
  const [form, setForm] = useState<Partial<UsuarioPermissao>>({});
  const schema = localStorage.getItem("schema") || "";

  const fetchPermissoes = () => {
    setLoading(true);
    setErro("");
    fetch(`${API_URL}/usuario-permissao`, { headers: { schema } })
      .then(res => res.json())
      .then(data => setPermissoes(data))
      .catch(() => setErro("Erro ao buscar permissões."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPermissoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const method = editando ? "PUT" : "POST";
    const url = editando ? `${API_URL}/usuario-permissao/${editando.id}` : `${API_URL}/usuario-permissao`;
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json", schema },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        setModalOpen(false);
        setEditando(null);
        setForm({});
        fetchPermissoes();
      })
      .catch(() => setErro("Erro ao salvar permissão."))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Confirma remover esta permissão?")) return;
    setLoading(true);
    fetch(`${API_URL}/usuario-permissao/${id}`, {
      method: "DELETE",
      headers: { schema }
    })
      .then(() => fetchPermissoes())
      .catch(() => setErro("Erro ao remover permissão."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="permissoes-page">
      <h2>Permissões de Usuários</h2>
      <button onClick={() => { setModalOpen(true); setEditando(null); setForm({}); }} style={{marginBottom:16}}>Nova Permissão</button>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      <table className="permissoes-table" style={{width:'100%',marginBottom:24}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>ID Usuário</th>
            <th>Permissão</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {permissoes.map(p => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.usuarioId}</td>
              <td>{p.permissao}</td>
              <td>{p.ativo ? 'Sim' : 'Não'}</td>
              <td>
                <button onClick={() => { setEditando(p); setForm(p); setModalOpen(true); }}>Editar</button>
                <button onClick={() => handleDelete(p.id)} style={{marginLeft:8}}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal de cadastro/edição */}
      {modalOpen && (
        <div className="modal-permissao" style={{background:'#fff',padding:24,borderRadius:8,boxShadow:'0 2px 8px #0002',maxWidth:400,margin:'0 auto'}}>
          <h3>{editando ? 'Editar' : 'Nova'} Permissão</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="ID Usuário" type="number" value={form.usuarioId ?? ''} onChange={e => setForm(f => ({...f, usuarioId: Number(e.target.value)}))} required style={{marginBottom:8}} />
            <input placeholder="Permissão" value={form.permissao ?? ''} onChange={e => setForm(f => ({...f, permissao: e.target.value}))} required style={{marginBottom:8}} />
            <label style={{marginBottom:8,display:'block'}}>
              <input type="checkbox" checked={form.ativo ?? false} onChange={e => setForm(f => ({...f, ativo: e.target.checked}))} /> Ativo
            </label>
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

export default PermissoesPage;
