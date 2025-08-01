import { useState, useEffect } from "react";
import { getApiUrl } from "../config/api";
import { toast } from "react-toastify";


interface Member {
  id: string | number;
  nome: string;
}

interface Ministerio {
  id?: string | number;
  nome?: string;
  descricao?: string;
  congregacaoId?: string | number;
  liderId?: string | number;
  membros?: Member[];
  members?: Member[];
}

interface Props {
  onSave: () => void;
  ministerio?: Ministerio;
}

const MinisterioCadastro: React.FC<Props> = ({ onSave, ministerio }) => {
  const [form, setForm] = useState({
    nome: ministerio?.nome || "",
    descricao: ministerio?.descricao || "",
    congregacaoId: ministerio?.congregacaoId || "",
    liderId: ministerio?.liderId || "",
    membrosIds: Array.isArray(ministerio?.membros) ? ministerio.membros.map((m: Member) => m.id) : [],
    memberIds: Array.isArray(ministerio?.members) ? ministerio.members.map((m: Member) => m.id) : [],
  });
  const [loading, setLoading] = useState(false);
  const [congregacoes, setCongregacoes] = useState<{ id: string | number; nome: string }[]>([]);
  const [lideres, setLideres] = useState<Member[]>([]);
  const [membros, setMembros] = useState<Member[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [buscaMembro, setBuscaMembro] = useState("");
  const [buscaMember, setBuscaMember] = useState("");
  const schema = JSON.parse(localStorage.getItem("eklesiakonecta_igreja") || "{}" ).schema || "";

  useEffect(() => {
    buscarDados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscarDados = async () => {
    try {
      const [cgRes, ldRes, mbRes, memRes] = await Promise.all([
        fetch(getApiUrl("/api/congregacoes"), { headers: { schema } }),
        fetch(getApiUrl("/api/membros?tipo=lider"), { headers: { schema } }),
        fetch(getApiUrl("/api/membros"), { headers: { schema } }),
        fetch(getApiUrl("/api/members"), { headers: { schema } })
      ]);
      setCongregacoes(await cgRes.json());
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
      const url = ministerio ? `/api/ministerios/${ministerio.id}` : "/api/ministerios";
      const method = ministerio ? "PUT" : "POST";
      const res = await fetch(getApiUrl(url), {
        method,
        headers: { "Content-Type": "application/json", "schema": schema },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success(ministerio ? "Ministério atualizado!" : "Ministério cadastrado!");
        onSave();
      } else {
        toast.error("Erro ao salvar ministério.");
      }
    } catch {
      toast.error("Erro ao salvar ministério.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="ministerio-form card-animado">
      <input
        type="text"
        placeholder="Nome do ministério"
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
        value={form.congregacaoId}
        onChange={e => setForm(f => ({ ...f, congregacaoId: e.target.value }))}
        required
        className="input-animado"
      >
        <option value="">Selecione a congregação</option>
        {congregacoes.map(cg => (
          <option key={cg.id} value={cg.id}>{cg.nome}</option>
        ))}
      </select>
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
      <label>Membros do ministério:</label>
      <input
        type="text"
        placeholder="Buscar membro..."
        className="input-animado"
        value={buscaMembro}
        onChange={e => setBuscaMembro(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div className="membros-select-list">
        {membros.filter(mb => mb.nome.toLowerCase().includes(buscaMembro.toLowerCase())).map(mb => (
          <div
            key={mb.id}
            className={form.membrosIds.includes(mb.id) ? "membro-item selecionado" : "membro-item"}
            onClick={() => {
              setForm(f => {
                const ids = f.membrosIds.includes(mb.id)
                  ? f.membrosIds.filter(id => id !== mb.id)
                  : [...f.membrosIds, mb.id];
                return { ...f, membrosIds: ids };
              });
            }}
          >
            <span>{mb.nome}</span>
            {form.membrosIds.includes(mb.id) && <span className="check">✔</span>}
          </div>
        ))}
      </div>
      <label>Membros (tabela member):</label>
      <input
        type="text"
        placeholder="Buscar membro (member)..."
        className="input-animado"
        value={buscaMember}
        onChange={e => setBuscaMember(e.target.value)}
        style={{ marginBottom: 8 }}
      />
      <div className="membros-select-list">
        {members.filter(mb => mb.nome.toLowerCase().includes(buscaMember.toLowerCase())).map(mb => (
          <div
            key={mb.id}
            className={form.memberIds.includes(mb.id) ? "membro-item selecionado" : "membro-item"}
            onClick={() => {
              setForm(f => {
                const ids = f.memberIds.includes(mb.id)
                  ? f.memberIds.filter(id => id !== mb.id)
                  : [...f.memberIds, mb.id];
                return { ...f, memberIds: ids };
              });
            }}
          >
            <span>{mb.nome}</span>
            {form.memberIds.includes(mb.id) && <span className="check">✔</span>}
          </div>
        ))}
      </div>
      <button type="submit" disabled={loading} className="btn-salvar btn-animado">
        {ministerio ? "Salvar edição" : "Cadastrar"}
      </button>
    </form>
  );
};

export default MinisterioCadastro;
