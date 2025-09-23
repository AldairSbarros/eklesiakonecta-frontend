import { useEffect, useState } from "react";
import { http } from "../config/http";
import type { Member } from "../types/Member";

interface Props {
  onEdit?: (member: Member) => void;
  onView?: (member: Member) => void;
}

export default function MemberList({ onEdit, onView }: Props) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    setLoading(true);
    setErro("");
    try {
      const result = await http('/api/membros');
      type Raw = Partial<Member> & { id?: number; nome?: string };
      const list: Raw[] = Array.isArray(result) ? result : [];
      // Garantir shape mínimo para evitar quebras de renderização
      setMembers(list.map((m) => ({
        id: m?.id ?? 0,
        nome: m?.nome ?? '—',
        email: m?.email ?? '',
        telefone: m?.telefone ?? '',
        congregacaoId: m?.congregacaoId,
        latitude: m?.latitude ?? null,
        longitude: m?.longitude ?? null,
      })));
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const filtered = members.filter(m => m.nome.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="member-list">
      <h2>Membros</h2>
      <input
        type="text"
        placeholder="Buscar por nome..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="search-input"
      />
      {loading && <div>Carregando...</div>}
      {erro && <div className="error-message">{erro}</div>}
      <ul>
        {filtered.map(member => (
          <li key={member.id} className="member-item">
            <span>{member.nome}</span>
            <span>{member.email}</span>
            <span>{member.telefone}</span>
            <button onClick={() => onView && onView(member)} className="btn-view">Ver</button>
            <button onClick={() => onEdit && onEdit(member)} className="btn-edit">Editar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
