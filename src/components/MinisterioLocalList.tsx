import React, { useEffect, useState } from "react";
import { getApiUrl } from "../config/api";
import { FaEdit, FaTrash, FaSearch, FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";
import MinisterioLocalCadastro from "./MinisterioLocalCadastro";

const MinisterioLocalList: React.FC = () => {
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
      const res = await fetch(getApiUrl("/api/ministerios-locais"), {
        headers: { "schema": schema },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMinisterios(data);
    } catch {
      setMinisterios([]);
      toast.error("Erro ao buscar ministérios locais.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirma remover ministério local?")) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/ministerios-locais/${id}`), {
        method: "DELETE",
        headers: { "schema": schema },
      });
      if (res.ok) {
        toast.success("Ministério local removido!");
        listar();
      } else {
        toast.error("Erro ao remover ministério local.");
      }
    } catch {
      toast.error("Erro ao remover ministério local.");
    } finally {
      setLoading(false);
    }
  };

  const ministeriosFiltrados = ministerios.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="ministerio-list-container">
      <h2>Ministérios Locais</h2>
      <button className="btn-salvar" onClick={() => { setShowForm(true); setEditando(null); }}>Novo Ministério Local</button>
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
        <MinisterioLocalCadastro onSave={() => { setShowForm(false); listar(); }} ministerio={editando} />
      )}
      <div className="ministerio-lista">
        {loading ? <div>Carregando...</div> : ministeriosFiltrados.length === 0 ? <div>Nenhum ministério local encontrado.</div> : (
          ministeriosFiltrados.map(m => (
            <div key={m.id} className="ministerio-card">
              <h4>{m.nome}</h4>
              <p>{m.descricao}</p>
              <div className="ministerio-detalhes">
                <span><FaUsers /> Membros: {m.membros?.length || 0}</span>
                <span>Líder: {m.lider?.nome || "-"}</span>
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

export default MinisterioLocalList;
