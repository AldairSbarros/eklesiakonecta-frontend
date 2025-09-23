import React, { useState } from "react";
import { http } from "../config/http";
import type { Member, MemberCreateInput, MemberUpdateInput } from "../types/Member";

interface Props {
  member?: Member;
  onSave?: (member: Member) => void;
  onCancel?: () => void;
}

export default function MemberCadastro({ member, onSave, onCancel }: Props) {
  const [dados, setDados] = useState<MemberCreateInput | MemberUpdateInput>(member || {
    nome: "",
    email: "",
    telefone: "",
    congregacaoId: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDados((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    try {
    const path = member?.id ? `/api/membros/${member.id}` : '/api/membros';
    const method = member?.id ? 'PUT' : 'POST';
    const result = await http(path, { method, body: JSON.stringify(dados) });
    if (onSave) onSave(result as Member);
    } catch {
      setErro("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="member-cadastro-form" onSubmit={handleSubmit}>
      <h2>{member ? "Editar Membro" : "Novo Membro"}</h2>
      <input
        name="nome"
        value={dados.nome}
        onChange={handleChange}
        placeholder="Nome"
        required
      />
      <input
        name="email"
        value={dados.email}
        onChange={handleChange}
        placeholder="E-mail"
        type="email"
        required
      />
      <input
        name="telefone"
        value={dados.telefone}
        onChange={handleChange}
        placeholder="Telefone"
        required
      />
      {/* Filtro de congregação pode ser um select dinâmico */}
      {erro && <div className="error-message">{erro}</div>}
      <div className="form-actions">
        <button type="submit" disabled={loading} className="btn-save">
          {loading ? "Salvando..." : "Salvar"}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-cancel">Cancelar</button>
        )}
      </div>
    </form>
  );
}
