import React, { useEffect, useState, useCallback } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/LogsCadastro.scss';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface Log {
  id?: number;
  tipo: string;
  mensagem: string;
  usuario?: string;
  data: string;
}

export default function LogsCadastro() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [form, setForm] = useState<Log>({ tipo: '', mensagem: '', usuario: '', data: '' });
  const [editId, setEditId] = useState<number | null>(null);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
  const schema = igrejaData ? JSON.parse(igrejaData).schema : null;

  const fetchLogs = useCallback(async () => {
    setErro('');
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/logs'), { headers: { 'schema': schema } });
      const data = await response.json();
      if (response.ok) setLogs(Array.isArray(data) ? data : []);
      else setErro(data.error || 'Erro ao buscar logs.');
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  }, [schema]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      const url = editId ? getApiUrl(`/api/logs/${editId}`) : getApiUrl('/api/logs');
      const method = editId ? 'PUT' : 'POST';
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'schema': schema },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (response.ok) {
        fetchLogs();
        setForm({ tipo: '', mensagem: '', usuario: '', data: '' });
        setEditId(null);
      } else setErro(data.error || 'Erro ao salvar log.');
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (log: Log) => {
    setForm({ ...log });
    setEditId(log.id || null);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirma remover este log?')) return;
    setErro('');
    setLoading(true);
    try {
      const response = await fetch(getApiUrl(`/api/logs/${id}`), {
        method: 'DELETE',
        headers: { 'schema': schema }
      });
      const data = await response.json();
      if (response.ok) fetchLogs();
      else setErro(data.error || 'Erro ao remover log.');
    } catch {
      setErro('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  // Exportação PDF
  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Logs do Sistema', 15, 15);
    let y = 30;
    logs.forEach(log => {
      doc.text(`ID: ${log.id} | Tipo: ${log.tipo} | Usuário: ${log.usuario} | Data: ${new Date(log.data).toLocaleString()} | Mensagem: ${log.mensagem}`, 10, y);
      y += 8;
    });
    doc.save('logs.pdf');
  };

  // Exportação Excel
  const handleExportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(logs.map(log => ({
      ID: log.id,
      Tipo: log.tipo,
      Usuário: log.usuario,
      Data: new Date(log.data).toLocaleString(),
      Mensagem: log.mensagem
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Logs');
    XLSX.writeFile(wb, 'logs.xlsx');
  };

  return (
    <div className="logs-cadastro-container">
      <h2>Logs do Sistema</h2>
      <form onSubmit={handleSubmit} className="logs-form">
        <input name="tipo" value={form.tipo} onChange={handleChange} placeholder="Tipo" required />
        <input name="usuario" value={form.usuario} onChange={handleChange} placeholder="Usuário" />
        <input name="data" type="datetime-local" value={form.data} onChange={handleChange} required />
        <textarea name="mensagem" value={form.mensagem} onChange={handleChange} placeholder="Mensagem" required />
        <button type="submit" disabled={loading}>{editId ? 'Atualizar' : 'Cadastrar'}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setForm({ tipo: '', mensagem: '', usuario: '', data: '' }); }}>Cancelar</button>}
      </form>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button onClick={handleExportPDF} className="btn-export-pdf">Exportar PDF</button>
        <button onClick={handleExportExcel} className="btn-export-excel">Exportar Excel</button>
      </div>
      {erro && <div className="erro-message">{erro}</div>}
      <table className="logs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tipo</th>
            <th>Usuário</th>
            <th>Data</th>
            <th>Mensagem</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {logs.map(log => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.tipo}</td>
              <td>{log.usuario}</td>
              <td>{new Date(log.data).toLocaleString()}</td>
              <td>{log.mensagem}</td>
              <td>
                <button onClick={() => handleEdit(log)}>Editar</button>
                <button onClick={() => handleDelete(log.id!)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
