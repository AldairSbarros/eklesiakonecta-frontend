// cSpell:disable
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';
import './App.scss';

// Ajuste os imports conforme o nome exato dos arquivos e o tipo de exportação (default ou nomeado)
import LandingPage from './pages/LandingPages';
import CadastroInicial from './pages/CadastroInicial';
import Login from './pages/Login';
import PainelControle from './pages/PainelControle';
// import PresencasCelula from './pages/PresencasCelula';
// import Receitas from './pages/Receitas';
// import RelatorioCelulas from './pages/RelatorioCelulas';
// import RelatorioFinanceiro from './pages/RelatorioFinanceiro';
// import RelatorioDiscipulado from './pages/RelatorioDiscipulado';
// import CelulasPage from './pages/Celulas'; // Verifique se o arquivo é Celulas.tsx
// import ChurchesPage from './pages/Churches';
// import CongregacoesPage from './pages/Congregacoes';
// import ConfigEmailPage from './pages/ConfigEmail';
// import RelatorioExportacao from './components/RelatorioExportacao';
// import FaturaCadastro from './components/FaturaCadastro';
// import DashboardFinanceiro from './components/DashboardFinanceiro';
// import InvestimentoCadastro from './components/InvestimentoCadastro';
// import Encontros from './pages/Encontros';
// import LivesCadastro from './components/LivesCadastro';
// import LogsCadastro from './components/LogsCadastro';
// import EscolaDeLideres from './pages/EscolaDeLideres';
// import DiscipuladoPage from './pages/Discipulado';
// import Membros from './pages/Membros';
// import DespesasPage from './pages/Despesas';
// import MemberLoginPage from './pages/MemberLogin';

// Novos módulos
// import VendasPage from './pages/VendasPage';
// import PermissoesPage from './pages/PermissoesPage';
// import UsuariosPage from './pages/UsuariosPage';
// import VisitantesCelulaPage from './pages/VisitantesCelulaPage';
// import VisitantesCultoPage from './pages/VisitantesCultoPage';
// import LancamentoSemanalPage from './pages/LancamentoSemanalPage';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

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
          <Route path="/" element={<LandingPage />} />
          <Route path="/cadastro-inicial" element={<CadastroInicial />} />
          <Route path="/login" element={<Login />} />
          {/* <Route path="/login-membro" element={<MemberLoginPage />} /> */}
          <Route path="/painel-controle" element={<PainelControle />} />
          {/* <Route path="/presencasCelula" element={<PresencasCelula />} /> */}
          {/* <Route path="/receitas" element={<Receitas />} /> */}
          {/* <Route path="/relatorio-celulas" element={<RelatorioCelulas />} /> */}
          {/* <Route path="/relatorio-financeiro" element={<RelatorioFinanceiro />} /> */}
          {/* <Route path="/relatorio-discipulado" element={<RelatorioDiscipulado />} /> */}
          {/* <Route path="/celulas" element={<CelulasPage />} /> */}
          {/* <Route path="/churches" element={<ChurchesPage />} /> */}
          {/* <Route path="/congregacoes" element={<CongregacoesPage />} /> */}
          {/* <Route path="/config-email" element={<ConfigEmailPage />} /> */}
          {/* <Route path="/relatorio-exportacao" element={<RelatorioExportacao />} /> */}
          {/* <Route path="/faturas" element={<FaturaCadastro />} /> */}
          {/* <Route path="/dashboard-financeiro" element={<DashboardFinanceiro />} /> */}
          {/* <Route path="/investimentos" element={<InvestimentoCadastro />} /> */}
          {/* <Route path="/encontros" element={<Encontros />} /> */}
          {/* <Route path="/lives" element={<LivesCadastro />} /> */}
          {/* <Route path="/logs" element={<LogsCadastro />} /> */}
          {/* <Route path="/escola-lideres" element={<EscolaDeLideres />} /> */}
          {/* <Route path="/discipulado" element={<DiscipuladoPage />} /> */}
          {/* <Route path="/membros" element={<Membros />} /> */}
          {/* <Route path="/despesas" element={<DespesasPage />} /> */}

          {/* Novos módulos */}
          {/* <Route path="/vendas" element={<VendasPage />} /> */}
          {/* <Route path="/permissoes" element={<PermissoesPage />} /> */}
          {/* <Route path="/usuarios" element={<UsuariosPage />} /> */}
          {/* <Route path="/visitantescelulapage" element={<VisitantesCelulaPage />} /> */}
          {/* <Route path="/visitantescultopage" element={<VisitantesCultoPage />} /> */}
          {/* <Route path="/lancamentosemanalpage" element={<LancamentoSemanalPage />} /> */}

          {/* Rota coringa */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App