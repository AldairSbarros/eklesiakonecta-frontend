import React, { useState } from 'react';
import { FaCalendarPlus, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import '../styles/EncontroCadastro.scss';

interface EncontroInput {
  titulo: string;
  data: string;
  local: string;
  descricao?: string;
}

export default function EncontroCadastro({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState<EncontroInput>({ titulo: '', data: '', local: '', descricao: '' });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setLoading(true);
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) {
      setErro('Schema da igreja não encontrado. Faça login novamente.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(getApiUrl('/api/encontros'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'schema': schema
        },
        body: JSON.stringify(form)
      });
      const result = await response.json();
      if (response.ok) {
        setSucesso(true);
        setForm({ titulo: '', data: '', local: '', descricao: '' });
        if (onSuccess) onSuccess();
      } else {
        setErro(result.error || 'Erro ao cadastrar encontro.');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="encontro-cadastro-container">
      <h2>Cadastrar Encontro</h2>
      <form onSubmit={handleSubmit} className="encontro-cadastro-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="titulo">Título *</label>
          <input
            type="text"
            id="titulo"
            name="titulo"
            value={form.titulo}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Título do encontro"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="data">Data *</label>
            <input
              type="date"
              id="data"
              name="data"
              value={form.data}
              onChange={handleInputChange}
              required
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="local">Local *</label>
            <input
              type="text"
              id="local"
              name="local"
              value={form.local}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="Local do encontro"
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <textarea
            id="descricao"
            name="descricao"
            value={form.descricao}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="Descrição do encontro (opcional)"
            rows={3}
          />
        </div>
        {erro && <div className="erro-message"><FaInfoCircle style={{marginRight: 4}}/>{erro}</div>}
        {sucesso && <div className="sucesso-message"><FaCheckCircle style={{marginRight: 4}}/>Encontro cadastrado com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-encontro">
          {loading ? 'Salvando...' : <><FaCalendarPlus style={{marginRight: 6}}/>Cadastrar</>}
        </button>
      </form>
    </div>
  );
}
