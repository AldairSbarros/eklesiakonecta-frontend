import React, { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Reuniao {
  id: number;
  data: string;
  tema: string;
  celulaId: number;
  observacoes?: string;
}

function ReuniaoCelula() {
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Reuniao | null>(null);
  const [form, setForm] = useState<Partial<Reuniao>>({});
  const schema = localStorage.getItem("schema") || "";

  const fetchReunioes = () => {
    setLoading(true);
    setErro("");
    fetch(`${API_URL}/reunioes`, { headers: { schema } })
      .then(res => res.json())
      .then(data => setReunioes(data))
      .catch(() => setErro("Erro ao buscar reuniões."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReunioes();
  }, [schema]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const method = editando ? "PUT" : "POST";
    const url = editando ? `${API_URL}/reunioes/${editando.id}` : `${API_URL}/reunioes`;
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
        fetchReunioes();
      })
      .catch(() => setErro("Erro ao salvar reunião."))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Confirma remover esta reunião?")) return;
    setLoading(true);
    fetch(`${API_URL}/reunioes/${id}`, {
      method: "DELETE",
      headers: { schema }
    })
      .then(() => fetchReunioes())
      .catch(() => setErro("Erro ao remover reunião."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="reuniao-celula">
      <h2>Reuniões de Célula</h2>
      <button onClick={() => { setModalOpen(true); setEditando(null); setForm({}); }} style={{marginBottom:16}}>Nova Reunião</button>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      <table className="reuniao-table" style={{width:'100%',marginBottom:24}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Data</th>
            <th>Tema</th>
            <th>Célula</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {reunioes.map(r => (
            <tr key={r.id}>
              <td>{r.id}</td>
              <td>{r.data}</td>
              <td>{r.tema}</td>
              <td>{r.celulaId}</td>
              <td>
                <button onClick={() => { setEditando(r); setForm(r); setModalOpen(true); }}>Editar</button>
                <button onClick={() => handleDelete(r.id)} style={{marginLeft:8}}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal de cadastro/edição */}
      {modalOpen && (
        <div className="modal-reuniao" style={{background:'#fff',padding:24,borderRadius:8,boxShadow:'0 2px 8px #0002',maxWidth:400,margin:'0 auto'}}>
          <h3>{editando ? 'Editar' : 'Nova'} Reunião</h3>
          <form onSubmit={handleSubmit}>
            <input type="date" value={form.data ?? ''} onChange={e => setForm(f => ({...f, data: e.target.value}))} required style={{marginBottom:8}} />
            <input placeholder="Tema" value={form.tema ?? ''} onChange={e => setForm(f => ({...f, tema: e.target.value}))} required style={{marginBottom:8}} />
            <input placeholder="ID da Célula" type="number" value={form.celulaId ?? ''} onChange={e => setForm(f => ({...f, celulaId: Number(e.target.value)}))} required style={{marginBottom:8}} />
            <textarea placeholder="Observações" value={form.observacoes ?? ''} onChange={e => setForm(f => ({...f, observacoes: e.target.value}))} style={{marginBottom:8}} />
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

export default ReuniaoCelula;
