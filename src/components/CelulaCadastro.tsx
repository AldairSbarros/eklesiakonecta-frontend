import { useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/CelulaCadastro.scss';

interface CelulaCadastroProps {
  onSuccess?: () => void;
}

export default function CelulaCadastro({ onSuccess }: CelulaCadastroProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

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
      const response = await fetch(getApiUrl('/api/celulas'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'schema': schema
        },
        body: JSON.stringify({ nome, descricao })
      });
      const result = await response.json();
      if (response.ok) {
        setSucesso(true);
        setNome('');
        setDescricao('');
        if (onSuccess) onSuccess();
      } else {
        setErro(result.error || 'Erro ao cadastrar célula.');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="celula-cadastro-container">
      <h2>Cadastrar Nova Célula</h2>
      <form onSubmit={handleSubmit} className="celula-cadastro-form">
        <div className="form-group">
          <label htmlFor="nome">Nome da Célula *</label>
          <input
            type="text"
            id="nome"
            value={nome}
            onChange={e => setNome(e.target.value)}
            required
            disabled={loading}
            placeholder="Ex: Célula Jovens Norte"
          />
        </div>
        <div className="form-group">
          <label htmlFor="descricao">Descrição</label>
          <input
            type="text"
            id="descricao"
            value={descricao}
            onChange={e => setDescricao(e.target.value)}
            disabled={loading}
            placeholder="Breve descrição da célula"
          />
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Célula cadastrada com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-celula">
          {loading ? 'Cadastrando...' : 'Cadastrar Célula'}
        </button>
      </form>
    </div>
  );
}
