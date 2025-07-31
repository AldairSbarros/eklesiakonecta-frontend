import { useState, useEffect } from "react";
import { getApiUrl } from "../config/api";
import { toast } from "react-toastify";

interface Ministerio {
  id?: string | number;
  nome?: string;
  descricao?: string;
  liderId?: string | number;
  membros?: Member[];
  members?: Member[];
}

interface Props {
  onSave: () => void;
  ministerio?: Ministerio;
}

interface Member {
  id: string | number;
  nome: string;
}

const MinisterioLocalCadastro: React.FC<Props> = ({ onSave, ministerio }) => {
  const [form, setForm] = useState({
    nome: ministerio?.nome || "",
    descricao: ministerio?.descricao || "",
    liderId: ministerio?.liderId || "",
    membrosIds: Array.isArray(ministerio?.membros) ? ministerio.membros.map((m: Member) => m.id) : [],
    memberIds: Array.isArray(ministerio?.members) ? ministerio.members.map((m: Member) => m.id) : [],
  });
  const [loading, setLoading] = useState(false);
  const [lideres, setLideres] = useState<Member[]>([]);
  const [membros, setMembros] = useState<Member[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const schema = JSON.parse(localStorage.getItem("eklesiakonecta_igreja") || "{}" ).schema || "";

  useEffect(() => {
    buscarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscarDados = async () => {
    try {
      const [ldRes, mbRes, memRes] = await Promise.all([
        fetch(getApiUrl("/api/membros?tipo=lider"), { headers: { schema } }),
        fetch(getApiUrl("/api/membros"), { headers: { schema } }),
        fetch(getApiUrl("/api/members"), { headers: { schema } })
      ]);
      setLideres(await ldRes.json());
      setMembros(await mbRes.json());
      setMembers(await memRes.json());
    } catch {
      toast.error("Erro ao buscar dados de membros e líderes.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = ministerio ? `/api/ministerios-locais/${ministerio.id}` : "/api/ministerios-locais";
      const method = ministerio ? "PUT" : "POST";
      const res = await fetch(getApiUrl(url), {
        method,
        headers: { "Content-Type": "application/json", "schema": schema },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(ministerio ? "Ministério local atualizado!" : "Ministério local cadastrado!");
        onSave();
      } else {
        toast.error("Erro ao salvar ministério local.");
      }
    } catch {
      toast.error("Erro ao salvar ministério local.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ministerio-form card-animado">
      <input
        type="text"
        placeholder="Nome do ministério local"
        value={form.nome}
        onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
        required
        className="input-animado"
      />
      <textarea
        placeholder="Descrição"
        value={form.descricao}
        onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
        required
        className="input-animado"
      />
      <select
        value={form.liderId}
        onChange={e => setForm(f => ({ ...f, liderId: e.target.value }))}
        required
        className="input-animado"
      >
        <option value="">Selecione o líder</option>
        {lideres.map(ld => (
          <option key={ld.id} value={ld.id}>{ld.nome}</option>
        ))}
      </select>
      <label>Membros do ministério local:</label>
      <select
        multiple
        value={form.membrosIds.map(String)}
        onChange={e => {
          const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
          setForm(f => ({ ...f, membrosIds: options }));
        }}
        className="input-animado"
        style={{ minHeight: 80 }}
      >
        {membros.map(mb => (
          <option key={mb.id} value={mb.id}>{mb.nome}</option>
        ))}
      </select>
      <label>Membros (tabela member):</label>
      <select
        multiple
        value={form.memberIds.map(String)}
        onChange={e => {
          const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
          setForm(f => ({ ...f, memberIds: options }));
        }}
        className="input-animado"
        style={{ minHeight: 80 }}
      >
        {members.map(mb => (
          <option key={mb.id} value={mb.id}>{mb.nome}</option>
        ))}
      </select>
      <button type="submit" disabled={loading} className="btn-salvar btn-animado">
        {ministerio ? "Salvar edição" : "Cadastrar"}
      </button>
    </form>
  );
};

export default MinisterioLocalCadastro;
