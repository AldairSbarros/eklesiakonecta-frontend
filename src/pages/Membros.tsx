
import { useState } from "react";
import type { Member } from "../types/Member";
import MemberCadastro from "../components/MemberCadastro";
import MemberList from "../components/MemberList";
import MemberDetalhe from "../components/MemberDetalhe";
import MemberLocalizacao from "../components/MemberLocalizacao";
import "../styles/MemberCadastro.scss";

// Tipos centralizados em ../types/Member

export default function Membros() {
  const [selected, setSelected] = useState<Member | undefined>(undefined);
  const [editando, setEditando] = useState(false);
  const [showDetalhe, setShowDetalhe] = useState(false);

  return (
    <div className="membros-page">
      <h1>Membros</h1>
      <div className="membros-content">
        <MemberList
          onEdit={member => { setSelected(member); setEditando(true); }}
          onView={member => { setSelected(member); setShowDetalhe(true); }}
        />
        {editando && (
          <MemberCadastro
            member={selected ? { ...selected, email: selected.email ?? "", telefone: selected.telefone ?? "" } : undefined}
            onSave={() => { setEditando(false); setSelected(undefined); }}
            onCancel={() => { setEditando(false); setSelected(undefined); }}
          />
        )}
        {showDetalhe && selected && (
          <MemberDetalhe member={{ ...selected, email: selected.email ?? "", telefone: selected.telefone ?? "" }} onClose={() => setShowDetalhe(false)} />
        )}
        {selected && (
          <>
            <MemberLocalizacao member={selected} />
            <div className="celula-info" style={{marginTop:16, background:'#f7f7f7', padding:12, borderRadius:8}}>
              <h3>Informações da Célula</h3>
              <p><strong>Nome:</strong> {selected.celula?.nome ?? "Não informado"}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
