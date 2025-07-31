import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./PresencaCelulaCadastro.scss";

interface Member {
  id: number;
  nome: string;
}
interface Discipulando {
  id: number;
  nome: string;
}
interface Presenca {
  id: number;
  data: string;
  membros: Member[];
  discipulandos: Discipulando[];
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function PresencaCelulaCadastro() {
  const [presencas, setPresencas] = useState<Presenca[]>([]);
  const [membros, setMembros] = useState<Member[]>([]);
  const [discipulandos, setDiscipulandos] = useState<Discipulando[]>([]);
  const [selectedMembros, setSelectedMembros] = useState<number[]>([]);
  const [selectedDiscipulandos, setSelectedDiscipulandos] = useState<number[]>([]);
  const [data, setData] = useState("");
  const [loading, setLoading] = useState(false);
  const schema = localStorage.getItem("schema") || "";

  useEffect(() => {
    fetchPresencas();
    fetchMembros();
    fetchDiscipulandos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPresencas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/presencaCelula`, { headers: { schema } });
      setPresencas(res.data);
    } catch {
      toast.error("Erro ao buscar presenças");
    }
    setLoading(false);
  };

  const fetchMembros = async () => {
    try {
      const res = await axios.get(`${API_URL}/member`, { headers: { schema } });
      setMembros(res.data);
    } catch {
      toast.error("Erro ao buscar membros");
    }
  };

  const fetchDiscipulandos = async () => {
    try {
      const res = await axios.get(`${API_URL}/discipulando`, { headers: { schema } });
      setDiscipulandos(res.data);
    } catch {
      toast.error("Erro ao buscar discipulandos/visitantes");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return toast.error("Informe a data da célula");
    if (selectedMembros.length === 0 && selectedDiscipulandos.length === 0)
      return toast.error("Selecione pelo menos um presente");
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/presencaCelula`,
        {
          data,
          membros: selectedMembros,
          discipulandos: selectedDiscipulandos,
        },
        { headers: { schema } }
      );
      toast.success("Presença registrada!");
      setData("");
      setSelectedMembros([]);
      setSelectedDiscipulandos([]);
      fetchPresencas();
    } catch {
      toast.error("Erro ao registrar presença");
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Remover presença?")) return;
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/presencaCelula/${id}`, { headers: { schema } });
      toast.success("Presença removida");
      fetchPresencas();
    } catch {
      toast.error("Erro ao remover presença");
    }
    setLoading(false);
  };

  return (
    <div className="presenca-celula-cadastro">
      <h2>Cadastro de Presença na Célula</h2>
      <form onSubmit={handleSubmit} className="presenca-form">
        <label>Data:</label>
        <input type="date" value={data} onChange={e => setData(e.target.value)} required />
        <label>Membros Presentes:</label>
        <select multiple value={selectedMembros.map(String)} onChange={e => setSelectedMembros(Array.from(e.target.selectedOptions, opt => Number(opt.value)))}>
          {membros.map(m => (
            <option key={m.id} value={m.id}>{m.nome}</option>
          ))}
        </select>
        <label>Discipulandos/Visitantes Presentes:</label>
        <select multiple value={selectedDiscipulandos.map(String)} onChange={e => setSelectedDiscipulandos(Array.from(e.target.selectedOptions, opt => Number(opt.value)))}>
          {discipulandos.map(d => (
            <option key={d.id} value={d.id}>{d.nome}</option>
          ))}
        </select>
        <button type="submit" disabled={loading}>{loading ? "Salvando..." : "Registrar Presença"}</button>
      </form>
      <h3>Presenças Registradas</h3>
      <div className="presenca-list">
        {presencas.map(p => (
          <div key={p.id} className="presenca-item">
            <span><b>Data:</b> {p.data}</span>
            <span><b>Membros:</b> {p.membros.map(m => m.nome).join(", ")}</span>
            <span><b>Discipulandos/Visitantes:</b> {p.discipulandos.map(d => d.nome).join(", ")}</span>
            <button onClick={() => handleDelete(p.id)} disabled={loading}>Remover</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PresencaCelulaCadastro;
