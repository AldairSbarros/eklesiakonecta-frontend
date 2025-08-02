import { useEffect, useState } from "react";
import { API_URL } from '../config/api';

interface Venda {
  id: number;
  churchId?: number;
  valor?: number;
  data?: string;
  Church?: { nome: string };
  upgradeDe?: { id: number };
  upgrades?: number[];
  faturas?: Fatura[];
}

interface Fatura {
  id: number;
  valor: number;
  data: string;
  status: string;
  observacao?: string;
}

function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Venda | null>(null);
  const [form, setForm] = useState<Partial<Venda>>({});
  const [faturaModal, setFaturaModal] = useState<{ vendaId: number, faturas: Fatura[] } | null>(null);
  const [novaFatura, setNovaFatura] = useState<Partial<Fatura>>({});
  const [faturaLoading, setFaturaLoading] = useState(false);
  const schema = localStorage.getItem("schema") || "";

  const fetchVendas = () => {
    setLoading(true);
    setErro("");
    fetch(`${API_URL}/api/vendas`, { headers: { schema } })
      .then(res => res.json())
      .then(data => setVendas(data))
      .catch(() => setErro("Erro ao buscar vendas."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVendas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schema]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErro("");
    const method = editando ? "PUT" : "POST";
    const url = editando ? `${API_URL}/api/vendas/${editando.id}` : `${API_URL}/api/vendas`;
    fetch(url, {
      method,
      headers: { "Content-Type": "application/json", schema },
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(() => {
        setModalOpen(false);
        setEditando(null);
        setForm({});
        fetchVendas();
      })
      .catch(() => setErro("Erro ao salvar venda."))
      .finally(() => setLoading(false));
  };

  const handleDelete = (id: number) => {
    if (!window.confirm("Confirma remover esta venda?")) return;
    setLoading(true);
    fetch(`${API_URL}/api/vendas/${id}`, {
      method: "DELETE",
      headers: { schema }
    })
      .then(() => fetchVendas())
      .catch(() => setErro("Erro ao remover venda."))
      .finally(() => setLoading(false));
  };

  return (
    <div className="vendas-page">
      <h2>Gestão de Vendas</h2>
      <button onClick={() => { setModalOpen(true); setEditando(null); setForm({}); }} style={{marginBottom:16}}>Nova Venda</button>
      {loading && <p>Carregando...</p>}
      {erro && <p style={{color:'red'}}>{erro}</p>}
      <table className="vendas-table" style={{width:'100%',marginBottom:24}}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Igreja</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Upgrade De</th>
            <th>Upgrades</th>
            <th>Faturas</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {vendas.map(v => (
            <tr key={v.id}>
              <td>{v.id}</td>
              <td>{v.Church?.nome ?? '-'}</td>
              <td>{v.valor ? `R$${v.valor.toLocaleString('pt-br',{minimumFractionDigits:2})}` : '-'}</td>
              <td>{v.data ?? '-'}</td>
              <td>{v.upgradeDe?.id ?? '-'}</td>
              <td>{v.upgrades?.length ?? 0}</td>
              <td>
                <button onClick={() => setFaturaModal({ vendaId: v.id, faturas: v.faturas ?? [] })} style={{marginRight:8}}>Ver Faturas ({v.faturas?.length ?? 0})</button>
              </td>
              <td>
                <button onClick={() => { setEditando(v); setForm(v); setModalOpen(true); }}>Editar</button>
                <button onClick={() => handleDelete(v.id)} style={{marginLeft:8}}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Modal de cadastro/edição */}
      {modalOpen && (
        <div className="modal-venda" style={{background:'#fff',padding:24,borderRadius:8,boxShadow:'0 2px 8px #0002',maxWidth:400,margin:'0 auto'}}>
          <h3>{editando ? 'Editar' : 'Nova'} Venda</h3>
          <form onSubmit={handleSubmit}>
            <input placeholder="ID Igreja" type="number" value={form.churchId ?? ''} onChange={e => setForm(f => ({...f, churchId: Number(e.target.value)}))} required style={{marginBottom:8}} />
            <input placeholder="Valor" type="number" value={form.valor ?? ''} onChange={e => setForm(f => ({...f, valor: Number(e.target.value)}))} required style={{marginBottom:8}} />
            <input placeholder="Data" type="date" value={form.data ?? ''} onChange={e => setForm(f => ({...f, data: e.target.value}))} style={{marginBottom:8}} />
            <input placeholder="ID Upgrade De" type="number" value={form.upgradeDe?.id ?? ''} onChange={e => setForm(f => ({...f, upgradeDe: { id: Number(e.target.value) }}))} style={{marginBottom:8}} />
            <div style={{display:'flex',gap:8}}>
              <button type="submit" disabled={loading}>{editando ? 'Salvar' : 'Cadastrar'}</button>
              <button type="button" onClick={() => { setModalOpen(false); setEditando(null); setForm({}); }}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
      {/* Modal de faturas */}
      {faturaModal && (
        <div className="modal-fatura" style={{background:'#fff',padding:24,borderRadius:8,boxShadow:'0 2px 8px #0002',maxWidth:500,margin:'0 auto',position:'fixed',top:40,left:0,right:0,zIndex:100}}>
          <h3>Faturas da Venda #{faturaModal.vendaId}</h3>
          <table style={{width:'100%',marginBottom:16}}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Valor</th>
                <th>Data</th>
                <th>Status</th>
                <th>Obs.</th>
              </tr>
            </thead>
            <tbody>
              {faturaModal.faturas.map(f => (
                <tr key={f.id}>
                  <td>{f.id}</td>
                  <td>{`R$${f.valor.toLocaleString('pt-br',{minimumFractionDigits:2})}`}</td>
                  <td>{f.data}</td>
                  <td>{f.status}</td>
                  <td>{f.observacao ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h4>Nova Fatura</h4>
          <form onSubmit={async e => {
            e.preventDefault();
            setFaturaLoading(true);
            await fetch(`${API_URL}/api/vendas/${faturaModal.vendaId}/faturas`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', schema },
              body: JSON.stringify(novaFatura)
            });
            setNovaFatura({});
            setFaturaLoading(false);
            fetchVendas();
            setFaturaModal(null);
          }}>
            <input placeholder="Valor" type="number" value={novaFatura.valor ?? ''} onChange={e => setNovaFatura(f => ({...f, valor: Number(e.target.value)}))} required style={{marginBottom:8}} />
            <input placeholder="Data" type="date" value={novaFatura.data ?? ''} onChange={e => setNovaFatura(f => ({...f, data: e.target.value}))} required style={{marginBottom:8}} />
            <input placeholder="Status" value={novaFatura.status ?? ''} onChange={e => setNovaFatura(f => ({...f, status: e.target.value}))} required style={{marginBottom:8}} />
            <input placeholder="Observação" value={novaFatura.observacao ?? ''} onChange={e => setNovaFatura(f => ({...f, observacao: e.target.value}))} style={{marginBottom:8}} />
            <div style={{display:'flex',gap:8}}>
              <button type="submit" disabled={faturaLoading}>Cadastrar Fatura</button>
              <button type="button" onClick={() => setFaturaModal(null)}>Fechar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default VendasPage;
