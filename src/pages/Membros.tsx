
import React, { useState } from "react";
import MemberCadastro from "../components/MemberCadastro";
import MemberList from "../components/MemberList";
import MemberDetalhe from "../components/MemberDetalhe";
import MemberLocalizacao from "../components/MemberLocalizacao";
import "../styles/MemberCadastro.scss";

// Tipo do membro, pode ser expandido conforme backend
interface Celula {
  id: number;
  nome: string;
  localizacao?: string;
  membros?: { id: number; nome: string }[];
  congregacao?: { id: number; nome: string };
  lider?: { id: number; nome: string };
}
interface Member {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  celula?: Celula;
  // ...outros campos
}

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
              <p><strong>Localização:</strong> {selected.celula?.localizacao ?? "Não informada"}</p>
              <p><strong>Congregação:</strong> {selected.celula?.congregacao?.nome ?? "Não informada"}</p>
              <p><strong>Líder:</strong> {selected.celula?.lider?.nome ?? "Não informado"}</p>
              <h4>Membros da Célula</h4>
              {selected.celula?.membros?.length ? (
                <ul>
                  {selected.celula.membros.map(m => (
                    <li key={m.id}>{m.nome}</li>
                  ))}
                </ul>
              ) : <p>Nenhum membro listado.</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
