import React, { useEffect, useState } from "react";
import { getApiUrl } from "../config/api";
import { FaEdit, FaTrash, FaSearch, FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";
import MinisterioCadastro from "./MinisterioCadastro";

const MinisterioList: React.FC = () => {
  const [ministerios, setMinisterios] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const schema = JSON.parse(localStorage.getItem("eklesiakonecta_igreja") || "{}").schema || "";

  useEffect(() => {
    listar();
  }, []);

  const listar = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/ministerios"), {
        headers: { "schema": schema },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMinisterios(data);
    } catch {
      setMinisterios([]);
      toast.error("Erro ao buscar ministérios.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirma remover ministério?")) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/ministerios/${id}`), {
        method: "DELETE",
        headers: { "schema": schema },
      });
      if (res.ok) {
        toast.success("Ministério removido!");
        listar();
      } else {
        toast.error("Erro ao remover ministério.");
      }
    } catch {
      toast.error("Erro ao remover ministério.");
    } finally {
      setLoading(false);
    }
  };

  const ministeriosFiltrados = ministerios.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="ministerio-list-container">
      <h2>Ministérios</h2>
      <button className="btn-salvar" onClick={() => { setShowForm(true); setEditando(null); }}>Novo Ministério</button>
      <div className="ministerio-busca">
        <FaSearch />
        <input
          type="text"
          placeholder="Buscar por nome..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>
      {showForm && (
        <MinisterioCadastro onSave={() => { setShowForm(false); listar(); }} ministerio={editando} />
      )}
      <div className="ministerio-lista">
        {loading ? <div>Carregando...</div> : ministeriosFiltrados.length === 0 ? <div>Nenhum ministério encontrado.</div> : (
          ministeriosFiltrados.map(m => (
            <div key={m.id} className="ministerio-card">
              <h4>{m.nome}</h4>
              <p>{m.descricao}</p>
              <div className="ministerio-detalhes">
                <span><FaUsers /> Membros: {m.membros?.length || 0}</span>
                <span>Congregação: {m.Congregacao?.nome || "-"}</span>
                <span>Líder: {m.Lider?.nome || "-"}</span>
              </div>
              <div className="ministerio-actions">
                <button onClick={() => { setEditando(m); setShowForm(true); }} title="Editar"><FaEdit /></button>
                <button onClick={() => handleDelete(m.id)} title="Remover"><FaTrash /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MinisterioList;
