import { useEffect, useState } from 'react';
import { FaFileExcel, FaFilePdf, FaCheckCircle, FaSpinner, FaWhatsapp, FaPaperPlane } from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import '../styles/RelatorioExportacao.scss';

interface Congregacao {
  id: number;
  nome: string;
}

const meses = [
  { value: '1', label: 'Janeiro' },
  { value: '2', label: 'Fevereiro' },
  { value: '3', label: 'Março' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Maio' },
  { value: '6', label: 'Junho' },
  { value: '7', label: 'Julho' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Setembro' },
  { value: '10', label: 'Outubro' },
  { value: '11', label: 'Novembro' },
  { value: '12', label: 'Dezembro' },
];

export default function RelatorioExportacao() {
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);
  const [congregacaoId, setCongregacaoId] = useState('');
  const [mes, setMes] = useState('');
  const [ano, setAno] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [whatsUrl, setWhatsUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [numeroWhats, setNumeroWhats] = useState('');
  const [enviandoTwilio, setEnviandoTwilio] = useState(false);
  const [twilioMsg, setTwilioMsg] = useState('');
  // Envio via Twilio (backend)
  const handleEnviarTwilio = async () => {
    setErro('');
    setTwilioMsg('');
    if (!congregacaoId || !mes || !ano || !numeroWhats) {
      setErro('Preencha todos os campos e o número do WhatsApp.');
      return;
    }
    setEnviandoTwilio(true);
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) {
      setErro('Schema da igreja não encontrado. Faça login novamente.');
      setEnviandoTwilio(false);
      return;
    }
    try {
      // Gera o relatório PDF (blob)
      const url = getApiUrl(`/api/relatorio/exportar/pdf?congregacaoId=${congregacaoId}&mes=${mes}&ano=${ano}`);
      const response = await fetch(url, { headers: { 'schema': schema } });
      if (!response.ok) {
        const data = await response.json();
        setErro(data.error || 'Erro ao exportar relatório.');
        setEnviandoTwilio(false);
        return;
      }
      const blob = await response.blob();
      // Envia para backend (endpoint precisa aceitar multipart/form-data)
      const formData = new FormData();
      formData.append('file', blob, 'relatorio.pdf');
      formData.append('numero', numeroWhats);
      const sendResp = await fetch(getApiUrl('/api/relatorio/enviar-whatsapp'), {
        method: 'POST',
        body: formData,
        headers: { 'schema': schema }
      });
      const sendData = await sendResp.json();
      if (sendResp.ok) {
        setTwilioMsg('Relatório enviado via WhatsApp com sucesso!');
      } else {
        setErro(sendData.error || 'Erro ao enviar via WhatsApp.');
      }
    } catch {
      setErro('Erro de conexão ao enviar via WhatsApp.');
    } finally {
      setEnviandoTwilio(false);
    }
  };

  useEffect(() => {
    const fetchCongregacoes = async () => {
      setErro('');
      const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
      const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
      if (!schema) {
        setErro('Schema da igreja não encontrado. Faça login novamente.');
        return;
      }
      try {
        const response = await fetch(getApiUrl('/api/congregacoes'), {
          headers: { 'schema': schema }
        });
        const data = await response.json();
        if (response.ok) {
          setCongregacoes(Array.isArray(data) ? data : []);
        } else {
          setErro(data.error || 'Erro ao buscar congregações.');
        }
      } catch {
        setErro('Erro de conexão.');
      }
    };
    fetchCongregacoes();
  }, []);

  const handleExport = async (tipo: 'excel' | 'pdf', enviarWhats = false) => {
    setErro('');
    setSucesso(false);
    if (!congregacaoId || !mes || !ano) {
      setErro('Selecione todos os campos.');
      return;
    }
    setLoading(true);
    setWhatsUrl(null);
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) {
      setErro('Schema da igreja não encontrado. Faça login novamente.');
      setLoading(false);
      return;
    }
    try {
      const url = getApiUrl(`/api/relatorio/exportar/${tipo}?congregacaoId=${congregacaoId}&mes=${mes}&ano=${ano}`);
      const response = await fetch(url, {
        headers: { 'schema': schema }
      });
      if (!response.ok) {
        const data = await response.json();
        setErro(data.error || 'Erro ao exportar relatório.');
        setLoading(false);
        return;
      }
      const blob = await response.blob();
      const fileName = tipo === 'excel' ? 'relatorio.xlsx' : 'relatorio.pdf';
      if (enviarWhats) {
        setUploading(true);
        try {
          const formData = new FormData();
          formData.append('file', blob, fileName);
          const uploadResp = await fetch('https://file.io/?expires=1d', {
            method: 'POST',
            body: formData
          });
          const uploadData = await uploadResp.json();
          if (uploadData.success && uploadData.link) {
            const msg = encodeURIComponent(`Segue o relatório mensal da congregação. Baixe aqui: ${uploadData.link}`);
            setWhatsUrl(`https://wa.me/?text=${msg}`);
          } else {
            setErro('Falha ao gerar link para WhatsApp.');
          }
        } catch {
          setErro('Erro ao enviar para o file.io');
        } finally {
          setUploading(false);
          setLoading(false);
        }
        return;
      }
      // Download normal
      const urlBlob = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(urlBlob);
      setSucesso(true);
      setTimeout(() => setSucesso(false), 3000);
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relatorio-exportacao-container">
      <h2>Exportar Relatório Mensal de Dizimistas</h2>
      <div className="relatorio-form">
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
          <label>Mês *</label>
          <select value={mes} onChange={e => setMes(e.target.value)} disabled={loading}>
            <option value="">Selecione</option>
            {meses.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Ano *</label>
          <input type="number" value={ano} onChange={e => setAno(e.target.value)} disabled={loading} placeholder="Ex: 2025" min="2000" max="2100" />
        </div>
        <div className="form-group">
          <label>Número WhatsApp (com DDI, ex: 5511999999999) *</label>
          <input type="tel" value={numeroWhats} onChange={e => setNumeroWhats(e.target.value)} disabled={enviandoTwilio || loading} placeholder="Ex: 5511999999999" />
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && (
          <div className="sucesso-message">
            <FaCheckCircle style={{ color: '#27ae60', marginRight: 6 }} />
            Relatório exportado com sucesso!
          </div>
        )}
        <div className="botoes-exportacao">
          <button onClick={() => handleExport('excel')} disabled={loading || uploading || enviandoTwilio} className="btn-export-excel">
            {loading ? <FaSpinner className="spin" /> : <FaFileExcel style={{ marginRight: 6 }} />} Exportar Excel
          </button>
          <button onClick={() => handleExport('pdf')} disabled={loading || uploading || enviandoTwilio} className="btn-export-pdf">
            {loading ? <FaSpinner className="spin" /> : <FaFilePdf style={{ marginRight: 6 }} />} Exportar PDF
          </button>
          <button onClick={() => handleExport('pdf', true)} disabled={loading || uploading || enviandoTwilio} className="btn-export-whatsapp">
            {uploading ? <FaSpinner className="spin" /> : <FaWhatsapp style={{ marginRight: 6 }} />} Enviar PDF pelo WhatsApp (link)
          </button>
          <button onClick={handleEnviarTwilio} disabled={loading || uploading || enviandoTwilio || !numeroWhats} className="btn-export-twilio">
            {enviandoTwilio ? <FaSpinner className="spin" /> : <FaPaperPlane style={{ marginRight: 6 }} />} Enviar PDF via WhatsApp (Twilio)
          </button>
        {twilioMsg && (
          <div className="sucesso-message">
            <FaCheckCircle style={{ color: '#27ae60', marginRight: 6 }} />
            {twilioMsg}
          </div>
        )}
        </div>
        {whatsUrl && (
          <div className="whatsapp-link-msg">
            <a href={whatsUrl} target="_blank" rel="noopener noreferrer" className="whatsapp-link-btn">
              <FaWhatsapp style={{ marginRight: 6 }} /> Abrir WhatsApp para envio
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
