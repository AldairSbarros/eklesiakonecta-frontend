import EscolaDeLideres from './pages/EscolaDeLideres';
import DiscipuladoPage from './pages/Discipulado';
import Membros from "./pages/Membros";
          {/* ...existing routes... */}
          <Route path="/membros" element={<Membros />} />
          {/* Rota da Escola de Líderes */}
          <Route path="/escola-lideres" element={<EscolaDeLideres />} />
{/* Rota de discipulado */}
<Route path="/discipulado" element={<DiscipuladoPage />} />
import DespesasPage from './pages/Despesas'
          {/* Rota de despesas */}
          <Route path="/despesas" element={<DespesasPage />} />
import MemberLoginPage from './pages/MemberLogin'
          {/* Rota de login do membro */}
          <Route path="/login-membro" element={<MemberLoginPage />} />
import { useState, useEffect } from 'react'
import RelatorioExportacao from './components/RelatorioExportacao';
import FaturaCadastro from './components/FaturaCadastro';
import DashboardFinanceiro from './components/DashboardFinanceiro';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import PresencasCelula from './pages/PresencasCelula';
import Receitas from './pages/Receitas';
import RelatorioCelulas from './pages/RelatorioCelulas';
import RelatorioFinanceiro from './pages/RelatorioFinanceiro';
import RelatorioDiscipulado from './pages/RelatorioDiscipulado';
import CadastroInicial from './pages/CadastroInicial'
import Login from './pages/Login'
import PainelControle from './pages/PainelControle'
import { FaSpinner } from 'react-icons/fa'
import './App.scss'
import LandingPage from './pages/LandingPages'
import CelulasPage from './pages/Celulas'
import ChurchesPage from './pages/Churches'
import CongregacoesPage from './pages/Congregacoes'
import ConfigEmailPage from './pages/ConfigEmail'

import Encontros from './pages/Encontros'
import InvestimentoCadastro from './components/InvestimentoCadastro';
import LivesCadastro from './components/LivesCadastro';
import LogsCadastro from './components/LogsCadastro';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular verificação básica do sistema
    // Sempre permitir acesso ao cadastro e login
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  // Tela de loading enquanto inicializa
  if (loading) {
    return (
      <div className="loading-screen">
        <FaSpinner className="spinning" size={48} />
        <p>Inicializando sistema...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Rota principal agora mostra a landing page */}
          <Route path="/" element={<LandingPage />} />

          {/* Rota de cadastro */}
          <Route path="/cadastro-inicial" element={<CadastroInicial />} />
          
          {/* Rota de login - sempre acessível */}
          <Route path="/login" element={<Login />} />
          
          {/* Rota do painel - sempre acessível (verificação interna) */}
          <Route path="/painel-controle" element={<PainelControle />} />
          {/* Rota de presenças de célula */}
          <Route path="/PresencasCelula" element={<PresencasCelula />} />
          {/* Rota de receitas */}
          <Route path="/Receitas" element={<Receitas />} />
          {/* Relatórios mock */}
          <Route path="/relatorio-celulas" element={<RelatorioCelulas />} />
          <Route path="/relatorio-financeiro" element={<RelatorioFinanceiro />} />
          <Route path="/relatorio-discipulado" element={<RelatorioDiscipulado />} />
          {/* Rota de células */}
          <Route path="/celulas" element={<CelulasPage />} />
          {/* Rota de igrejas */}
          <Route path="/churches" element={<ChurchesPage />} />
          {/* Rota de congregações */}
          <Route path="/congregacoes" element={<CongregacoesPage />} />
          {/* Rota de configuração de e-mail */}
          <Route path="/config-email" element={<ConfigEmailPage />} />
        {/* Rota de exportação de relatórios */}
        <Route path="/relatorio-exportacao" element={<RelatorioExportacao />} />
        {/* Rota de faturas */}
        <Route path="/faturas" element={<FaturaCadastro />} />
        {/* Rota do dashboard financeiro */}
        <Route path="/dashboard-financeiro" element={<DashboardFinanceiro />} />
        <Route path="/investimentos" element={<InvestimentoCadastro />} />
          {/* Rota de faturas */}
          <Route path="/faturas" element={<FaturaCadastro />} />
          {/* Rota de encontros */}
          <Route path="/encontros" element={<Encontros />} />
          {/* Rota de Lives */}
          <Route path="/lives" element={<LivesCadastro />} />
          {/* Rota de Logs */}
          <Route path="/logs" element={<LogsCadastro />} />
          {/* Qualquer outra rota vai para o cadastro inicial */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App