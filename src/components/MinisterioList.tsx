import { useEffect, useState } from "react";
// import { getApiUrl } from "../config/api";
import { FaEdit, FaTrash, FaSearch, FaUsers } from "react-icons/fa";
import { toast } from "react-toastify";
import MinisterioCadastro from "./MinisterioCadastro";
import * as ministeriosService from "../backend/services/missoes.service";

type MinisterioListItem = {
  id: number | string;
  nome: string;
  descricao?: string;
  membros?: Array<unknown>;
  Congregacao?: { nome?: string };
  Lider?: { nome?: string };
};

type Member = { id: number | string; nome: string };
type MinisterioForEdit = {
  id?: number | string;
  nome?: string;
  descricao?: string;
  congregacaoId?: number | string;
  liderId?: number | string;
  membros?: Member[];
  members?: Member[];
};

const MinisterioList: React.FC = () => {
  const [ministerios, setMinisterios] = useState<MinisterioListItem[]>([]);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<MinisterioForEdit | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  // schema é aplicado automaticamente pelo http wrapper do serviço

  useEffect(() => {
    listar();
  }, []);

  const listar = async () => {
    setLoading(true);
    try {
  const data = await ministeriosService.list();
      setMinisterios(data);
    } catch {
      setMinisterios([]);
  toast.error("Erro ao buscar missões.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
  if (!window.confirm("Confirma remover missão?")) return;
    setLoading(true);
    try {
  await ministeriosService.remove(id);
  toast.success("Missão removida!");
      listar();
    } catch {
  toast.error("Erro ao remover missão.");
    } finally {
      setLoading(false);
    }
  };

  const ministeriosFiltrados = ministerios.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
  <div className="ministerio-list-container">
  <h2>Missões</h2>
  <button className="btn-salvar" onClick={() => { setShowForm(true); setEditando(null); }}>Nova Missão</button>
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
        <MinisterioCadastro onSave={() => { setShowForm(false); listar(); }} ministerio={editando || undefined} />
      )}
      <div className="ministerio-lista">
        {loading ? <div>Carregando...</div> : ministeriosFiltrados.length === 0 ? <div>Nenhuma missão encontrada.</div> : (
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
                <button onClick={() => { 
                  const toEdit: MinisterioForEdit = {
                    id: m.id,
                    nome: m.nome,
                    descricao: m.descricao,
                    // campos opcionais para manter compatibilidade com o form
                    membros: Array.isArray(m.membros) ? (m.membros as Member[]) : [],
                  };
                  setEditando(toEdit); setShowForm(true); 
                }} title="Editar"><FaEdit /></button>
                <button onClick={() => handleDelete(Number(m.id))} title="Remover"><FaTrash /></button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MinisterioList;
