import React, { useState, useEffect } from 'react';

import type { OfertaDizimo } from '../types/OfertaDizimo';
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
  const totalOfertas = React.useMemo(() => registros.filter(r => r.tipo === 'oferta').reduce((acc, r) => acc + r.valor, 0), [registros]);
  const totalDizimos = React.useMemo(() => registros.filter(r => r.tipo === 'dizimo').reduce((acc, r) => acc + r.valor, 0), [registros]);
  const totalGeral = totalOfertas + totalDizimos;
  const pieData = React.useMemo(() => [
    { name: 'Ofertas', value: totalOfertas },
    { name: 'Dízimos', value: totalDizimos }
  ], [totalOfertas, totalDizimos]);
  const COLORS = ['#ff9a9e', '#ff4b6e'];

  useEffect(() => {
    // Simulação de fetch
    setTimeout(() => {
      setRegistros([
        {
          id: '1',
          tipo: 'dizimo',
          valor: 120,
          data: '2025-07-10',
          membro: 'João Silva',
          congregacao: 'Central',
          observacao: 'Dízimo mensal',
          comprovante: 'comprovante1.jpg'
        },
        {
          id: '2',
          tipo: 'oferta',
          valor: 50,
          data: '2025-07-15',
          membro: 'Maria Souza',
          congregacao: 'Sul',
          observacao: 'Oferta especial',
          comprovante: 'comprovante2.jpg'
        }
      ]);
    }, 600);
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

  const handleFormSubmit = (novoRegistro: OfertaDizimo) => {
    // Simulação de POST/PUT
    setTimeout(() => {
      if (editData) {
        setRegistros(registros.map(r => r.id === novoRegistro.id ? novoRegistro : r));
        toast.success('Registro atualizado com sucesso!');
      } else {
        setRegistros([...registros, novoRegistro]);
        toast.success('Oferta/Dízimo cadastrado com sucesso!');
      }
      setShowForm(false);
      setEditData(null);
    }, 500);
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
                {pieData.map((entry, index) => (
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
            <OfertaDizimoCard key={registro.id} registro={registro} onEdit={() => handleEdit(registro)} />
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
