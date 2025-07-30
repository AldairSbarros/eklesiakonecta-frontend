import React, { useState } from "react";
import { getApiUrl } from "../config/api";

interface Member {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  congregacaoId?: number;
  latitude?: number;
  longitude?: number;
}

interface Props {
  member?: Member;
  onSave?: (member: Member) => void;
  onCancel?: () => void;
}

export default function MemberCadastro({ member, onSave, onCancel }: Props) {
  const [dados, setDados] = useState<Member>(member || {
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
      const igrejaData = localStorage.getItem("eklesiakonecta_igreja");
      const schema = igrejaData ? JSON.parse(igrejaData).schema : "";
      const url = member?.id
        ? getApiUrl(`/api/members/${member.id}`)
        : getApiUrl("/api/members");
      const method = member?.id ? "PUT" : "POST";
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "schema": schema,
        },
        body: JSON.stringify(dados),
      });
      const result = await response.json();
      if (response.ok) {
        onSave && onSave(result);
      } else {
        setErro(result.error || "Erro ao salvar membro");
      }
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
