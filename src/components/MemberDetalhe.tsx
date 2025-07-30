import React from "react";

interface Member {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  congregacaoId?: number;
  latitude?: number;
  longitude?: number;
}

interface Props {
  member: Member;
  onClose?: () => void;
}

export default function MemberDetalhe({ member, onClose }: Props) {
  return (
    <div className="member-detalhe">
      <h2>Detalhes do Membro</h2>
      <p><strong>Nome:</strong> {member.nome}</p>
      <p><strong>E-mail:</strong> {member.email}</p>
      <p><strong>Telefone:</strong> {member.telefone}</p>
      {member.latitude && member.longitude && (
        <p><strong>Localização:</strong> {member.latitude}, {member.longitude}</p>
      )}
      <div className="detalhe-actions">
        {onClose && <button onClick={onClose} className="btn-close">Fechar</button>}
      </div>
    </div>
  );
}
