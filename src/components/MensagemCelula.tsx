import { useEffect, useState } from "react";
import { getApiUrl } from "../config/api";
import { FaFilePdf, FaPlus, FaTrash, FaEdit, FaSearch, FaWhatsapp } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../styles/MensagemCelula.scss";

interface Mensagem {
  id: number;
  titulo: string;
  conteudo: string;
  data: string;
}

interface MensagemPDF {
  nome: string;
  caminho: string;
  data: string;
  titulo?: string;
}

const MensagemCelula: React.FC = () => {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [pdfs, setPdfs] = useState<MensagemPDF[]>([]);
  const [busca, setBusca] = useState("");
  const [form, setForm] = useState<{ id?: number; titulo: string; conteudo: string }>({ titulo: "", conteudo: "" });
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = JSON.parse(localStorage.getItem("eklesiakonecta_igreja") || "{}").schema || "";

  useEffect(() => {
    listarMensagens();
    listarPDFs();
  }, []);

  const listarMensagens = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/mensagem-celula"), {
        headers: { "schema": schema },
      });
      if (!res.ok) throw new Error("Erro ao buscar mensagens");
      const data = await res.json();
      setMensagens(data);
    } catch {
      setMensagens([]);
      toast.error("Erro ao buscar mensagens.");
    } finally {
      setLoading(false);
    }
  };

  const listarPDFs = async () => {
    try {
      const res = await fetch(getApiUrl("/api/mensagem-celula/pdfs"), {
        headers: { "schema": schema },
      });
      if (!res.ok) throw new Error("Erro ao buscar PDFs");
      const data = await res.json();
      setPdfs(data);
    } catch {
      setPdfs([]);
      toast.error("Erro ao buscar PDFs.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const url = editando ? `/api/mensagem-celula/${form.id}` : "/api/mensagem-celula";
      const method = editando ? "PUT" : "POST";
      const res = await fetch(getApiUrl(url), {
        method,
        headers: { "Content-Type": "application/json", "schema": schema },
        body: JSON.stringify({ titulo: form.titulo, conteudo: form.conteudo }),
      });
      if (res.ok) {
        listarMensagens();
        setForm({ titulo: "", conteudo: "" });
        setEditando(false);
        toast.success(editando ? "Mensagem editada com sucesso!" : "Mensagem cadastrada!");
      } else {
        toast.error("Erro ao salvar mensagem.");
      }
    } catch {
      toast.error("Erro ao salvar mensagem.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (msg: Mensagem) => {
    setForm({ id: msg.id, titulo: msg.titulo, conteudo: msg.conteudo });
    setEditando(true);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirma remover mensagem?")) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl(`/api/mensagem-celula/${id}`), {
        method: "DELETE",
        headers: { "schema": schema },
      });
      if (res.ok) {
        listarMensagens();
        toast.success("Mensagem removida!");
      } else {
        toast.error("Erro ao remover mensagem.");
      }
    } catch {
      toast.error("Erro ao remover mensagem.");
    } finally {
      setLoading(false);
    }
  };

  const mensagensFiltradas = mensagens.filter(m => m.titulo.toLowerCase().includes(busca.toLowerCase()));

  // Envio via WhatsApp (Twilio)
  const handleEnviarWhatsApp = async (msg: Mensagem) => {
    const numero = prompt("Informe o número do WhatsApp (com DDD e país, ex: +5511999999999):");
    if (!numero) return;
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/mensagem-celula/enviar-whatsapp"), {
        method: "POST",
        headers: { "Content-Type": "application/json", "schema": schema },
        body: JSON.stringify({ numero, titulo: msg.titulo, conteudo: msg.conteudo }),
      });
      if (res.ok) {
        toast.success("Mensagem enviada pelo WhatsApp!");
      } else {
        toast.error("Erro ao enviar pelo WhatsApp.");
      }
    } catch {
      toast.error("Erro ao enviar pelo WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mensagem-celula-container">
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar theme="colored" />
      <h2 className="titulo-animado">Mensagens da Célula</h2>
      <form onSubmit={handleSubmit} className="mensagem-form">
        <input
          type="text"
          placeholder="Título da mensagem"
          value={form.titulo}
          onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
          required
          className="input-animado"
        />
        <textarea
          placeholder="Conteúdo da mensagem"
          value={form.conteudo}
          onChange={e => setForm(f => ({ ...f, conteudo: e.target.value }))}
          required
          className="input-animado"
        />
        <button type="submit" disabled={loading} className="btn-salvar btn-animado">
          {editando ? <FaEdit /> : <FaPlus />} {editando ? "Salvar edição" : "Cadastrar"}
        </button>
        {editando && (
          <button type="button" className="btn-cancelar btn-animado" onClick={() => { setEditando(false); setForm({ titulo: "", conteudo: "" }); }}>
            Cancelar
          </button>
        )}
      </form>
      <div className="mensagem-busca">
        <FaSearch />
        <input
          type="text"
          placeholder="Buscar por título..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="input-animado"
        />
      </div>
      <div className="mensagem-lista">
        {loading ? <div className="loading-msg">Carregando...</div> : mensagensFiltradas.length === 0 ? <div className="nenhuma-msg">Nenhuma mensagem encontrada.</div> : (
          mensagensFiltradas.map(msg => (
            <div key={msg.id} className="mensagem-card card-animado">
              <h4>{msg.titulo}</h4>
              <p>{msg.conteudo}</p>
              <span className="mensagem-data">{new Date(msg.data).toLocaleString()}</span>
              <div className="mensagem-actions">
                <button onClick={() => handleEdit(msg)} title="Editar" className="btn-animado"><FaEdit /></button>
                <button onClick={() => handleDelete(msg.id)} title="Remover" className="btn-animado"><FaTrash /></button>
                <button onClick={() => handleEnviarWhatsApp(msg)} title="Enviar pelo WhatsApp" className="btn-animado whatsapp-btn">
                  <FaWhatsapp />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <h3 className="pdf-titulo">Mensagens em PDF</h3>
      <div className="pdf-lista">
        {pdfs.length === 0 ? <div className="nenhum-pdf">Nenhum PDF encontrado.</div> : (
          pdfs.map(pdf => (
            <a key={pdf.nome} href={pdf.caminho} target="_blank" rel="noopener noreferrer" className="pdf-card card-animado">
              <FaFilePdf className="pdf-icon" />
              <span className="pdf-nome">{pdf.titulo || pdf.nome}</span>
              <span className="pdf-data">{new Date(pdf.data).toLocaleDateString()}</span>
            </a>
          ))
        )}
      </div>
    </div>
  );
};

export default MensagemCelula;
