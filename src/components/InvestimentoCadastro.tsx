import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/InvestimentoCadastro.scss';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
Chart.register(...registerables);

interface Investimento {
  id?: number;
  congregacaoId: number;
  descricao: string;
  valor: number;
  data: string;
  categoria: string;
  codigoManual: string;
}

export default function InvestimentoCadastro() {
  const [investimentos, setInvestimentos] = useState<Investimento[]>([]);
  const [form, setForm] = useState<Investimento>({
    congregacaoId: 0,
    descricao: '',
    valor: 0,
    data: '',
    categoria: '',
    codigoManual: ''
  });
  const [editId, setEditId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const categoriaChartRef = useRef<HTMLCanvasElement>(null);

  const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
  const schema = igrejaData ? JSON.parse(igrejaData).schema : null;

  const fetchInvestimentos = useCallback(async () => {
    setErro('');
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/investimentos'), {
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) setInvestimentos(Array.isArray(data) ? data : []);
      else setErro(data.error || 'Erro ao buscar investimentos.');
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }, [schema]);

  useEffect(() => { fetchInvestimentos(); }, [fetchInvestimentos]);

  useEffect(() => {
    if (!investimentos.length) return;
    // Agrupar por categoria
    const categorias: Record<string, number> = {};
    investimentos.forEach(inv => {
      categorias[inv.categoria] = (categorias[inv.categoria] || 0) + inv.valor;
    });
    if (categoriaChartRef.current) {
      new Chart(categoriaChartRef.current, {
        type: 'pie',
        data: {
          labels: Object.keys(categorias),
          datasets: [{
            label: 'Investimentos por Categoria',
            data: Object.values(categorias),
            backgroundColor: [
              '#27ae60', '#2d8cff', '#c0392b', '#f7971e', '#a18cd1', '#43e97b', '#ff9a9e', '#fdcbf1'
            ]
          }]
        },
        options: { plugins: { legend: { display: true } } }
      });
    }
  }, [investimentos]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const url = editId
        ? getApiUrl(`/api/investimentos/${editId}`)
        : getApiUrl('/api/investimentos');
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'schema': schema
        },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        fetchInvestimentos();
        setForm({ congregacaoId: 0, descricao: '', valor: 0, data: '', categoria: '', codigoManual: '' });
        setEditId(null);
      } else setErro(data.error || 'Erro ao salvar investimento.');
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (inv: Investimento) => {
    setForm({ ...inv });
    setEditId(inv.id || null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirma remover este investimento?')) return;
    setErro('');
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/investimentos/${id}`), {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) fetchInvestimentos();
      else setErro(data.error || 'Erro ao remover investimento.');
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Exportação PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Investimentos', 15, 15);
    let y = 30;
    investimentos.forEach(inv => {
      doc.text(`ID: ${inv.id} | Congregação: ${inv.congregacaoId} | Descrição: ${inv.descricao} | Valor: R$ ${inv.valor.toFixed(2)} | Data: ${new Date(inv.data).toLocaleDateString()} | Categoria: ${inv.categoria} | Código: ${inv.codigoManual}`, 10, y);
      y += 8;
    });
    doc.save('investimentos.pdf');
  };

  // Compartilhar via WhatsApp Web (mensagem customizada)
  const handleShareWhatsApp = () => {
    const msg = encodeURIComponent('Relatório de Investimentos:\n' + investimentos.map(inv => `ID: ${inv.id} | Congregação: ${inv.congregacaoId} | Descrição: ${inv.descricao} | Valor: R$ ${inv.valor.toFixed(2)} | Data: ${new Date(inv.data).toLocaleDateString()} | Categoria: ${inv.categoria} | Código: ${inv.codigoManual}`).join('\n'));
    window.open(`https://web.whatsapp.com/send?text=${msg}`, '_blank');
  };

  // Notificação por e-mail (simples via mailto)
  const handleSendEmail = () => {
    const subject = encodeURIComponent('Relatório de Investimentos');
    const body = encodeURIComponent(investimentos.map(inv => `ID: ${inv.id} | Congregação: ${inv.congregacaoId} | Descrição: ${inv.descricao} | Valor: R$ ${inv.valor.toFixed(2)} | Data: ${new Date(inv.data).toLocaleDateString()} | Categoria: ${inv.categoria} | Código: ${inv.codigoManual}`).join('\n'));
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  // Integração externa (exemplo: webhook)
  const handleSendWebhook = async () => {
    try {
      await fetch('https://webhook.site/your-custom-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ investimentos })
      });
      alert('Dados enviados para API externa!');
    } catch {
      alert('Falha ao enviar para API externa.');
    }
  };

  return (
    <div className="investimento-cadastro-container">
      <h2>Investimentos</h2>
      <form onSubmit={handleSubmit} className="investimento-form">
        <input name="congregacaoId" type="number" value={form.congregacaoId} onChange={handleChange} placeholder="Congregação ID" required />
        <input name="descricao" value={form.descricao} onChange={handleChange} placeholder="Descrição" required />
        <input name="valor" type="number" value={form.valor} onChange={handleChange} placeholder="Valor" required />
        <input name="data" type="date" value={form.data} onChange={handleChange} required />
        <input name="categoria" value={form.categoria} onChange={handleChange} placeholder="Categoria" required />
        <input name="codigoManual" value={form.codigoManual} onChange={handleChange} placeholder="Código Manual" required />
        <button type="submit" disabled={loading}>{editId ? 'Atualizar' : 'Cadastrar'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ congregacaoId: 0, descricao: '', valor: 0, data: '', categoria: '', codigoManual: '' }); }}>Cancelar</button>}
      </form>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={handleExportPDF} className="btn-export-pdf">Exportar PDF</button>
        <button onClick={handleShareWhatsApp} className="btn-whatsapp">Notificar WhatsApp</button>
        <button onClick={handleSendEmail} className="btn-email">Notificar E-mail</button>
        <button onClick={handleSendWebhook} className="btn-webhook">API Externa</button>
      </div>
      <div className="grafico-investimento">
        <h4>Investimentos por Categoria</h4>
        <canvas ref={categoriaChartRef} width={320} height={180}></canvas>
      </div>
      {erro && <div className="erro-message">{erro}</div>}
      <table className="investimento-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Congregação</th>
            <th>Descrição</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Categoria</th>
            <th>Código Manual</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {investimentos.map(inv => (
            <tr key={inv.id}>
              <td>{inv.id}</td>
              <td>{inv.congregacaoId}</td>
              <td>{inv.descricao}</td>
              <td>R$ {inv.valor.toFixed(2)}</td>
              <td>{new Date(inv.data).toLocaleDateString()}</td>
              <td>{inv.categoria}</td>
              <td>{inv.codigoManual}</td>
              <td>
                <button onClick={() => handleEdit(inv)}>Editar</button>
                <button onClick={() => handleDelete(inv.id!)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
