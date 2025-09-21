import { useEffect, useState, useRef } from 'react';
import { http, httpDownload } from '../config/http';
import { EXPORTS } from '../config/exports';
import '../styles/DashboardFinanceiro.scss';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface Transacao {
  descricao?: string;
  categoria?: string;
  valor: number;
}

interface ResumoFinanceiro {
  totalOfferings: number;
  totalReceitas: number;
  totalDespesas: number;
  totalInvestimentos: number;
  totalEntradas: number;
  totalSaidas: number;
  receitasPorCategoria: Record<string, number>;
  despesasPorCategoria: Record<string, number>;
  saldo: number;
  receitas?: Transacao[];
  despesas?: Transacao[];
  investimentos?: Transacao[];
  saldoPorMes?: { mes: string, saldo: number }[];
}

interface Congregacao {
  id: number;
  nome: string;
}

export default function DashboardFinanceiro() {
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);
  const [congregacaoId, setCongregacaoId] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [resumo, setResumo] = useState<ResumoFinanceiro | null>(null);
  const receitasChartRef = useRef<HTMLCanvasElement>(null);
  const despesasChartRef = useRef<HTMLCanvasElement>(null);
  const saldoChartRef = useRef<HTMLCanvasElement>(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCongregacoes = async () => {
      setErro('');
      const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
      const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
      if (!schema) return;
      try {
  const data = await http('/api/congregacoes', { schema }) as Congregacao[];
  setCongregacoes(Array.isArray(data) ? data : []);
      } catch {
        // erro silencioso, pode logar se necessário
      }
    };
    fetchCongregacoes();
  }, []);

  useEffect(() => {
    if (!resumo) return;
    // Gráfico de receitas por categoria
    if (receitasChartRef.current) {
      new Chart(receitasChartRef.current, {
        type: 'bar',
        data: {
          labels: Object.keys(resumo.receitasPorCategoria),
          datasets: [{
            label: 'Receitas',
            data: Object.values(resumo.receitasPorCategoria),
            backgroundColor: '#27ae60',
          }]
        },
        options: { plugins: { legend: { display: false } } }
      });
    }
    // Gráfico de despesas por categoria
    if (despesasChartRef.current) {
      new Chart(despesasChartRef.current, {
        type: 'bar',
        data: {
          labels: Object.keys(resumo.despesasPorCategoria),
          datasets: [{
            label: 'Despesas',
            data: Object.values(resumo.despesasPorCategoria),
            backgroundColor: '#c0392b',
          }]
        },
        options: { plugins: { legend: { display: false } } }
      });
    }
    // Gráfico de evolução do saldo
    if (saldoChartRef.current && resumo.saldoPorMes) {
      new Chart(saldoChartRef.current, {
        type: 'line',
        data: {
          labels: resumo.saldoPorMes.map(s => s.mes),
          datasets: [{
            label: 'Saldo',
            data: resumo.saldoPorMes.map(s => s.saldo),
            borderColor: '#2d8cff',
            fill: false,
          }]
        },
        options: { plugins: { legend: { display: true } } }
      });
    }
  }, [resumo]);

  const handleBuscarResumo = async () => {
    setErro('');
    setResumo(null);
    setLoading(true);
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema || !congregacaoId) {
      setErro('Selecione a congregação.');
      setLoading(false);
      return;
    }
    try {
      const path = `/api/financeiro/resumo?congregacaoId=${congregacaoId}${mes ? `&mes=${mes}` : ''}${ano ? `&ano=${ano}` : ''}`;
      const data = await http(path, { schema });
      setResumo(data as ResumoFinanceiro);
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!congregacaoId) return setErro('Selecione a congregação.');
    const params = new URLSearchParams({ congregacaoId });
    if (mes) params.set('mes', mes);
    if (ano) params.set('ano', ano);
    await httpDownload(`${EXPORTS.resumo.excel}?${params.toString()}`, `ResumoFinanceiro_${congregacaoId}_${mes || 'all'}_${ano || 'all'}.xlsx`);
  };

  const handleExportPDF = async () => {
    if (!congregacaoId) return setErro('Selecione a congregação.');
    const params = new URLSearchParams({ congregacaoId });
    if (mes) params.set('mes', mes);
    if (ano) params.set('ano', ano);
    await httpDownload(`${EXPORTS.resumo.pdf}?${params.toString()}`, `ResumoFinanceiro_${congregacaoId}_${mes || 'all'}_${ano || 'all'}.pdf`);
  };

  return (
    <div className="dashboard-financeiro-container">
      <h2>Resumo Financeiro</h2>
      <div className="dashboard-filtros">
        <div className="form-group">
          <label>Congregação *</label>
          <select value={congregacaoId} onChange={e => setCongregacaoId(e.target.value)} disabled={loading}>
            <option value="">Selecione</option>
            {congregacoes.map(c => (
              <option key={c.id} value={c.id}>{c.nome}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Mês</label>
          <input type="number" value={mes} onChange={e => setMes(e.target.value)} disabled={loading} min="1" max="12" placeholder="Ex: 7" />
        </div>
        <div className="form-group">
          <label>Ano</label>
          <input type="number" value={ano} onChange={e => setAno(e.target.value)} disabled={loading} min="2000" max="2100" placeholder="Ex: 2025" />
        </div>
        <button onClick={handleBuscarResumo} disabled={loading || !congregacaoId} className="btn-buscar-resumo">
          {loading ? 'Buscando...' : 'Buscar Resumo'}
        </button>
        <button onClick={handleExportExcel} disabled={!congregacaoId} className="btn-export-excel">Exportar Excel</button>
        <button onClick={handleExportPDF} disabled={!congregacaoId} className="btn-export-pdf">Exportar PDF</button>
      </div>
      {erro && <div className="erro-message">{erro}</div>}
      {resumo && (
        <>
        <div className="dashboard-cards">
          <div className="card card-entradas">
            <h3>Total Entradas</h3>
            <span>R$ {resumo.totalEntradas.toFixed(2)}</span>
          </div>
          <div className="card card-saidas">
            <h3>Total Saídas</h3>
            <span>R$ {resumo.totalSaidas.toFixed(2)}</span>
          </div>
          <div className="card card-saldo">
            <h3>Saldo</h3>
            <span>R$ {resumo.saldo.toFixed(2)}</span>
          </div>
          <div className="card card-ofertas">
            <h3>Ofertas</h3>
            <span>R$ {resumo.totalOfferings.toFixed(2)}</span>
          </div>
          <div className="card card-receitas">
            <h3>Receitas</h3>
            <span>R$ {resumo.totalReceitas.toFixed(2)}</span>
          </div>
          <div className="card card-despesas">
            <h3>Despesas</h3>
            <span>R$ {resumo.totalDespesas.toFixed(2)}</span>
          </div>
          <div className="card card-investimentos">
            <h3>Investimentos</h3>
            <span>R$ {resumo.totalInvestimentos.toFixed(2)}</span>
          </div>
        </div>
        <div className="dashboard-graficos">
          <div className="grafico-box">
            <h4>Receitas por Categoria</h4>
            <canvas ref={receitasChartRef} width={320} height={180}></canvas>
          </div>
          <div className="grafico-box">
            <h4>Despesas por Categoria</h4>
            <canvas ref={despesasChartRef} width={320} height={180}></canvas>
          </div>
          {resumo.saldoPorMes && (
            <div className="grafico-box">
              <h4>Evolução do Saldo</h4>
              <canvas ref={saldoChartRef} width={320} height={180}></canvas>
            </div>
          )}
        </div>
        <div className="dashboard-detalhamento">
          <h4>Detalhamento Mensal</h4>
          <div className="detalhe-list">
            <h5>Receitas</h5>
            <ul>
              {resumo.receitas?.map((r, i) => (
                <li key={i}>{r.descricao || r.categoria}: R$ {r.valor.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div className="detalhe-list">
            <h5>Despesas</h5>
            <ul>
              {resumo.despesas?.map((d, i) => (
                <li key={i}>{d.descricao || d.categoria}: R$ {d.valor.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div className="detalhe-list">
            <h5>Investimentos</h5>
            <ul>
              {resumo.investimentos?.map((inv, i) => (
                <li key={i}>{inv.descricao || inv.categoria}: R$ {inv.valor.toFixed(2)}</li>
              ))}
            </ul>
          </div>
        </div>
        <button className="btn-export-pdf" onClick={() => window.print()} style={{marginTop: '2rem'}}>Exportar Resumo em PDF</button>
        </>
      )}
      {resumo && (
        <div className="dashboard-categorias">
          <div className="categoria-list">
            <h4>Receitas por Categoria</h4>
            <ul>
              {Object.entries(resumo.receitasPorCategoria).map(([cat, val]) => (
                <li key={cat}>{cat}: R$ {val.toFixed(2)}</li>
              ))}
            </ul>
          </div>
          <div className="categoria-list">
            <h4>Despesas por Categoria</h4>
            <ul>
              {Object.entries(resumo.despesasPorCategoria).map(([cat, val]) => (
                <li key={cat}>{cat}: R$ {val.toFixed(2)}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
