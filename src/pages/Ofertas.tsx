import { useState, useEffect, useMemo } from 'react';

import type { OfertaDizimo } from '../types/OfertaDizimo';
import { mapApiToUi } from '../types/OfertaDizimo';
import * as offeringApi from '../backend/services/offering.service';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSearch, FaFilter, FaPlus, FaChartPie, FaMoneyBillWave, FaHeart } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import '../styles/Ofertas.scss';
import OfertaDizimoCard from '../components/OfertaDizimoCard';
import OfertaDizimoForm from '../components/OfertaDizimoForm';

const Ofertas: React.FC = () => {

  const [registros, setRegistros] = useState<OfertaDizimo[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'oferta' | 'dizimo'>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editData, setEditData] = useState<OfertaDizimo | null>(null);
  // Estatísticas
  const totalOfertas = useMemo(() => registros.filter(r => r.tipo === 'oferta').reduce((acc, r) => acc + r.valor, 0), [registros]);
  const totalDizimos = useMemo(() => registros.filter(r => r.tipo === 'dizimo').reduce((acc, r) => acc + r.valor, 0), [registros]);
  const totalGeral = totalOfertas + totalDizimos;
  const pieData = useMemo(() => [
    { name: 'Ofertas', value: totalOfertas },
    { name: 'Dízimos', value: totalDizimos }
  ], [totalOfertas, totalDizimos]);
  const COLORS = ['#ff9a9e', '#ff4b6e'];

  useEffect(() => {
    const carregar = async () => {
      try {
        const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
        const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
        if (!schema) return; // sem schema, não chama API
        // Opcionalmente filtrar por congregacao salva
        const congregacaoIdStr = localStorage.getItem('eklesiakonecta_congregacaoId');
        const congregacaoId = congregacaoIdStr ? Number(congregacaoIdStr) : undefined;
        const apiItems = await offeringApi.list({ congregacaoId });
        setRegistros(apiItems.map(mapApiToUi));
      } catch {
        // manter silencioso ou exibir toast
      }
    };
    carregar();
  }, []);

  const handleNovoRegistro = () => {
    setEditData(null);
    setShowForm(true);
  };

  const handleEdit = (registro: OfertaDizimo) => {
    setEditData(registro);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditData(null);
  };

  const normalizeTipo = (t: string | undefined): 'oferta' | 'dizimo' => {
    return t === 'dizimo' ? 'dizimo' : 'oferta';
  };

  const handleFormSubmit = async (novoRegistro: OfertaDizimo) => {
    try {
      const congregacaoIdLocal = Number(localStorage.getItem('eklesiakonecta_congregacaoId') || 0) || undefined;
      const memberId = novoRegistro.memberId;
      const congregacaoId = novoRegistro.congregacaoId || congregacaoIdLocal;
      if (!memberId || !congregacaoId) {
        toast.error('Informe o membro (ID) e a congregação (ID) para salvar.');
        return;
      }
      if (editData && typeof editData.id === 'number') {
        const updated = await offeringApi.update(editData.id, {
          type: normalizeTipo(novoRegistro.tipo as string),
          valor: novoRegistro.valor, // controller aceita camelcase valor
          data: novoRegistro.data,
          memberId,
          congregacaoId,
          numeroRecibo: novoRegistro.numeroRecibo,
          service: novoRegistro.service || undefined,
          receiptPhoto: novoRegistro.comprovante,
        });
        if (novoRegistro.comprovanteFile) {
          try {
            await offeringApi.uploadReceipt(updated.id, novoRegistro.comprovanteFile);
            // pegar estado atualizado do backend (inclui receiptPhoto e includes)
            const fresh = await offeringApi.get(updated.id);
            setRegistros(registros.map(r => r.id === editData.id ? mapApiToUi(fresh) : r));
          } catch {
            setRegistros(registros.map(r => r.id === editData.id ? mapApiToUi(updated) : r));
          }
        } else {
          setRegistros(registros.map(r => r.id === editData.id ? mapApiToUi(updated) : r));
        }
        toast.success('Registro atualizado com sucesso!');
      } else {
        const created = await offeringApi.create({
          valor: novoRegistro.valor,
          data: novoRegistro.data,
          memberId,
          congregacaoId,
          type: normalizeTipo(novoRegistro.tipo as string),
          numeroRecibo: novoRegistro.numeroRecibo,
          service: novoRegistro.service || undefined,
          receiptPhoto: novoRegistro.comprovante,
        });
        if (novoRegistro.comprovanteFile) {
          try {
            await offeringApi.uploadReceipt(created.id, novoRegistro.comprovanteFile);
            const fresh = await offeringApi.get(created.id);
            setRegistros([...registros, mapApiToUi(fresh)]);
          } catch {
            setRegistros([...registros, mapApiToUi(created)]);
          }
        } else {
          setRegistros([...registros, mapApiToUi(created)]);
        }
        toast.success('Oferta/Dízimo cadastrado com sucesso!');
      }
      setShowForm(false);
      setEditData(null);
    } catch {
      toast.error('Falha ao salvar oferta/dízimo');
    }
  };

  const registrosFiltrados = registros.filter((r: OfertaDizimo) => {
    const matchTipo = filtroTipo === 'todos' || r.tipo === filtroTipo;
    const matchSearch = r.membro?.toLowerCase().includes(searchTerm.toLowerCase()) || r.congregacao?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTipo && matchSearch;
  });

  return (
    <div className="ofertas-page">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      <header className="ofertas-header">
        <h2><FaMoneyBillWave /> Ofertas & Dízimos</h2>
        <button className="btn-novo" onClick={handleNovoRegistro}><FaPlus /> Nova Oferta/Dízimo</button>
      </header>
      {/* Estatísticas Visuais */}
      <section className="ofertas-stats" style={{ display: 'flex', gap: '2rem', justifyContent: 'center', alignItems: 'center', margin: '2rem 0' }}>
        <div className="stat-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #ff9a9e22', padding: '1.2rem 2rem', minWidth: 180, textAlign: 'center', animation: 'fadeIn 0.7s' }}>
          <span style={{ color: '#ff4b6e', fontWeight: 700, fontSize: '1.2rem' }}>Total Geral</span>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ff9a9e', margin: '0.5rem 0' }}>R$ {totalGeral.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #ff9a9e22', padding: '1.2rem 2rem', minWidth: 180, textAlign: 'center', animation: 'fadeIn 0.9s' }}>
          <span style={{ color: '#ff4b6e', fontWeight: 700 }}>Ofertas</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ff9a9e' }}>R$ {totalOfertas.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="stat-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #ff9a9e22', padding: '1.2rem 2rem', minWidth: 180, textAlign: 'center', animation: 'fadeIn 1.1s' }}>
          <span style={{ color: '#ff4b6e', fontWeight: 700 }}>Dízimos</span>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ff4b6e' }}>R$ {totalDizimos.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="pie-chart-card" style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px #ff9a9e22', padding: '1.2rem', minWidth: 220, textAlign: 'center', animation: 'fadeIn 1.3s' }}>
          <span style={{ color: '#ff4b6e', fontWeight: 700 }}>Distribuição</span>
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={80}
                fill="#ff9a9e"
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : 0}%`}
              >
                {pieData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>
      <section className="ofertas-filtros">
        <button className={filtroTipo === 'todos' ? 'ativo' : ''} onClick={() => setFiltroTipo('todos')}><FaFilter /> Todos</button>
        <button className={filtroTipo === 'oferta' ? 'ativo' : ''} onClick={() => setFiltroTipo('oferta')}><FaHeart /> Ofertas</button>
        <button className={filtroTipo === 'dizimo' ? 'ativo' : ''} onClick={() => setFiltroTipo('dizimo')}><FaMoneyBillWave /> Dízimos</button>
        <input type="text" placeholder="Buscar por membro ou congregação..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </section>
      <section className="ofertas-cards">
        {registrosFiltrados.length === 0 ? (
          <div className="no-results">
            <FaSearch size={48} />
            <p>Nenhum registro encontrado.</p>
          </div>
        ) : (
          registrosFiltrados.map((registro: OfertaDizimo) => (
            <OfertaDizimoCard
              key={registro.id}
              registro={registro}
              onEdit={() => handleEdit(registro)}
              onDownloadReceipt={async (id) => {
                try { await offeringApi.downloadReceipt(id); } catch { toast.error('Falha ao baixar comprovante'); }
              }}
              onDeleteReceipt={async (id) => {
                try {
                  await offeringApi.deleteReceipt(id);
                  setRegistros(prev => prev.map(r => r.id === id ? { ...r, comprovante: undefined } : r));
                  toast.success('Comprovante excluído');
                } catch { toast.error('Falha ao excluir comprovante'); }
              }}
            />
          ))
        )}
      </section>
      {showForm && (
        <OfertaDizimoForm
          editData={editData ?? undefined}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      )}
      <footer className="ofertas-footer">
        <div className="stats">
          <FaChartPie /> Estatísticas e gráficos em tempo real
        </div>
      </footer>
    </div>
  );
};

export default Ofertas;
