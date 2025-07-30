import React, { useEffect, useState } from "react";
import { FaBirthdayCake, FaEnvelope, FaWhatsapp } from "react-icons/fa";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

interface Aniversariante {
  id: number;
  nome: string;
  dataNascimento: string;
  email?: string;
  telefone?: string;
}


// Versículos de bênção (pode ser integrado ao BibleReader futuramente)
const versiculosBencao = [
  'Que o Senhor te abençoe e te guarde; que o Senhor faça resplandecer o seu rosto sobre ti e te conceda graça. (Números 6:24-25)',
  'O Senhor é o meu pastor; nada me faltará. (Salmos 23:1)',
  'O Senhor te dará sempre a sua paz. (2 Tessalonicenses 3:16)',
  'Bem-aventurado aquele que teme ao Senhor. (Salmos 128:1)',
  'O Senhor te fortalecerá e te ajudará. (Isaías 41:10)'
];

function getVersiculoAleatorio() {
  return versiculosBencao[Math.floor(Math.random() * versiculosBencao.length)];
}

function montarMensagem(aniversariantes: Aniversariante[], pastor: string, dirigente: string) {
  const lista = aniversariantes.map(a => `- ${a.nome} (${a.dataNascimento})${a.email ? ' | ' + a.email : ''}${a.telefone ? ' | ' + a.telefone : ''}`).join('\n');
  const versiculo = getVersiculoAleatorio();
  return `Olá, querido(a) irmão(ã)!\n\nHoje celebramos o dom da sua vida. Que Deus continue te abençoando e guiando seus passos.\n\nAniversariantes do dia:\n${lista}\n\nVerso especial para você:\n${versiculo}\n\nReceba o carinho do Pastor da Área (${pastor}) e do Dirigente (${dirigente}). Conte sempre conosco!\n\nCom amor,\nPr. ${pastor} e ${dirigente}`;
}

function AniversariantesDoDia() {
  const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const schema = localStorage.getItem("schema") || "";
  // Simulação: nomes do pastor e dirigente (pode vir do backend/localStorage)
  const pastor = localStorage.getItem('nomePastor') || 'Seu Pastor';
  const dirigente = localStorage.getItem('nomeDirigente') || 'Seu Dirigente';

  useEffect(() => {
    setLoading(true);
    setErro("");
    fetch(`${API_URL}/aniversariantes-dia`, { headers: { schema } })
      .then(res => res.json())
      .then(data => setAniversariantes(data))
      .catch(() => setErro("Erro ao buscar aniversariantes do dia."))
      .finally(() => setLoading(false));
  }, [schema]);

  const enviarAlerta = async (tipo: "email" | "whatsapp") => {
    setEnviando(true);
    try {
      const mensagem = montarMensagem(aniversariantes, pastor, dirigente);
      await fetch(`${API_URL}/alerta-aniversariantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", schema },
        body: JSON.stringify({ tipo, mensagem }),
      });
      alert(`Alerta enviado por ${tipo === "email" ? "e-mail" : "WhatsApp"}!`);
    } catch {
      alert("Erro ao enviar alerta.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="card-aniversariantes" style={{background:'#fff',borderRadius:12,padding:24,boxShadow:'0 2px 8px #0002',maxWidth:400}}>
      <h2 style={{display:'flex',alignItems:'center',gap:8}}><FaBirthdayCake color="#f39c12" /> Aniversariantes do Dia</h2>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      {!loading && aniversariantes.length === 0 && <p>Nenhum aniversariante hoje.</p>}
      {!loading && aniversariantes.length > 0 && (
        <ul style={{margin:'16px 0'}}>
          {aniversariantes.map(a => (
            <li key={a.id} style={{marginBottom:8}}>
              <strong>{a.nome}</strong> <span style={{color:'#888'}}>({a.dataNascimento})</span>
              {a.email && <span style={{marginLeft:8}}><FaEnvelope size={14} /> {a.email}</span>}
              {a.telefone && <span style={{marginLeft:8}}><FaWhatsapp size={14} /> {a.telefone}</span>}
            </li>
          ))}
        </ul>
      )}
      <div style={{display:'flex',gap:12,marginTop:16}}>
        <button onClick={() => enviarAlerta("email")} disabled={enviando || aniversariantes.length === 0} style={{background:'#2980b9',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer'}}>
          <FaEnvelope style={{marginRight:6}} /> Enviar por E-mail
        </button>
        <button onClick={() => enviarAlerta("whatsapp")} disabled={enviando || aniversariantes.length === 0} style={{background:'#25d366',color:'#fff',border:'none',borderRadius:6,padding:'8px 16px',cursor:'pointer'}}>
          <FaWhatsapp style={{marginRight:6}} /> WhatsApp
        </button>
      </div>
      {/* Exemplo da mensagem gerada */}
      {!loading && aniversariantes.length > 0 && (
        <div style={{marginTop:24,background:'#f9f9f9',padding:12,borderRadius:8}}>
          <strong>Mensagem enviada:</strong>
          <pre style={{fontSize:13,whiteSpace:'pre-wrap'}}>{montarMensagem(aniversariantes, pastor, dirigente)}</pre>
        </div>
      )}
    </div>
  );
}

export default AniversariantesDoDia;
