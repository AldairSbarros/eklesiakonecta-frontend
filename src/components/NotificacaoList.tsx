import React, { useEffect, useState } from "react";
import { getApiUrl } from "../config/api";
import { toast } from "react-toastify";

interface Notificacao {
  id: number;
  titulo: string;
  mensagem: string;
  lida: boolean;
  data: string;
}

const NotificacaoList: React.FC = () => {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);
  const schema = JSON.parse(localStorage.getItem("eklesiakonecta_igreja") || "{}").schema || "";

  useEffect(() => {
    buscarNotificacoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buscarNotificacoes = async () => {
    setLoading(true);
    try {
      const res = await fetch(getApiUrl("/api/notificacoes"), { headers: { schema } });
      const data = await res.json();
      if (res.ok) {
        setNotificacoes(data);
      } else {
        toast.error("Erro ao buscar notificações.");
      }
    } catch {
      toast.error("Erro ao buscar notificações.");
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLida = async (id: number) => {
    try {
      const res = await fetch(getApiUrl(`/api/notificacoes/${id}`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", schema },
        body: JSON.stringify({ lida: true })
      });
      if (res.ok) {
        toast.success("Notificação marcada como lida!");
        buscarNotificacoes();
      } else {
        toast.error("Erro ao marcar como lida.");
      }
    } catch {
      toast.error("Erro ao marcar como lida.");
    }
  };

  const removerNotificacao = async (id: number) => {
    try {
      const res = await fetch(getApiUrl(`/api/notificacoes/${id}`), {
        method: "DELETE",
        headers: { schema }
      });
      if (res.ok) {
        toast.success("Notificação removida!");
        setNotificacoes(notificacoes.filter(n => n.id !== id));
      } else {
        toast.error("Erro ao remover notificação.");
      }
    } catch {
      toast.error("Erro ao remover notificação.");
    }
  };

  return (
    <div className="notificacao-list">
      <h2>Notificações</h2>
      {loading && <div>Carregando...</div>}
      <ul>
        {notificacoes.map(n => (
          <li key={n.id} className={n.lida ? "notificacao lida" : "notificacao"}>
            <div>
              <strong>{n.titulo}</strong>
              <p>{n.mensagem}</p>
              <span>{new Date(n.data).toLocaleString()}</span>
            </div>
            <div className="notificacao-actions">
              {!n.lida && (
                <button onClick={() => marcarComoLida(n.id)} className="btn-lida">Marcar como lida</button>
              )}
              <button onClick={() => removerNotificacao(n.id)} className="btn-remover">Remover</button>
            </div>
          </li>
        ))}
      </ul>
      {notificacoes.length === 0 && !loading && <div>Nenhuma notificação encontrada.</div>}
    </div>
  );
};

export default NotificacaoList;
