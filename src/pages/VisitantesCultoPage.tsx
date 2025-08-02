import { useEffect, useState } from "react";
import { API_URL } from '../config/api';

interface Visitante {
  id: number;
  nome: string;
  telefone?: string;
  cultoId?: number;
  Culto?: { id: number; data: string; tema?: string };
}

function VisitantesCultoPage() {
  const [visitantes, setVisitantes] = useState<Visitante[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Visitante | null>(null);
  const [form, setForm] = useState<Partial<Visitante>>({});
  const schema = localStorage.getItem("schema") || "";

  const fetchVisitantes = () => {
    setLoading(true);
    setErro("");
    fetch(`${API_URL}/api/visitantes-culto`, { headers: { schema } })
      .then(res => res.json())
      .then(data => setVisitantes(data))
      .catch(() => setErro("Erro ao buscar visitantes."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisitantes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const method = editando ? "PUT" : "POST";
    const url = editando ? `${API_URL}/api/visitantes-culto/${editando.id}` : `${API_URL}/api/visitantes-culto`;
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
        fetchVisitantes();
      })
      .catch(() => setErro("Erro ao salvar visitante."))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Confirma remover este visitante?")) return;
    setLoading(true);
    fetch(`${API_URL}/api/visitantes-culto/${id}`, {
      method: "DELETE",
      headers: { schema }
    })
      .then(() => fetchVisitantes())
      .catch(() => setErro("Erro ao remover visitante."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="visitantes-culto-page">
      <h2>Visitantes por Culto</h2>
      <button onClick={() => { setModalOpen(true); setEditando(null); setForm({}); }} style={{marginBottom:16}}>Novo Visitante</button>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      <table className="visitantes-table" style={{width:'100%',marginBottom:24}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Culto</th>
            <th>Data</th>
            <th>Tema</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {visitantes.map(v => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.nome}</td>
              <td>{v.telefone ?? '-'}</td>
              <td>{v.Culto?.id ?? '-'}</td>
              <td>{v.Culto?.data ?? '-'}</td>
              <td>{v.Culto?.tema ?? '-'}</td>
              <td>
                <button onClick={() => { setEditando(v); setForm(v); setModalOpen(true); }}>Editar</button>
                <button onClick={() => handleDelete(v.id)} style={{marginLeft:8}}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal de cadastro/edição */}
      {modalOpen && (
        <div className="modal-visitante" style={{background:'#fff',padding:24,borderRadius:8,boxShadow:'0 2px 8px #0002',maxWidth:400,margin:'0 auto'}}>
          <h3>{editando ? 'Editar' : 'Novo'} Visitante</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="Nome" value={form.nome ?? ''} onChange={e => setForm(f => ({...f, nome: e.target.value}))} required style={{marginBottom:8}} />
            <input placeholder="Telefone" value={form.telefone ?? ''} onChange={e => setForm(f => ({...f, telefone: e.target.value}))} style={{marginBottom:8}} />
            <input placeholder="ID Culto" type="number" value={form.cultoId ?? ''} onChange={e => setForm(f => ({...f, cultoId: Number(e.target.value)}))} style={{marginBottom:8}} />
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

export default VisitantesCultoPage;
