import { useState } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/CongregacaoCadastro.scss';

interface Congregacao {
  id?: number;
  nome: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  latitude?: number;
  longitude?: number;
}

interface CongregacaoCadastroProps {
  onSuccess?: () => void;
}

export default function CongregacaoCadastro({ onSuccess }: CongregacaoCadastroProps) {
  const [congregacao, setCongregacao] = useState<Congregacao>({
    nome: '',
    endereco: '',
    cidade: '',
    estado: '',
    latitude: undefined,
    longitude: undefined
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCongregacao(prev => ({ ...prev, [name]: value }));
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
      const response = await fetch(getApiUrl('/api/congregacoes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'schema': schema
        },
        body: JSON.stringify(congregacao)
      });
      const result = await response.json();
      if (response.ok) {
        setSucesso(true);
        setCongregacao({ nome: '', endereco: '', cidade: '', estado: '', latitude: undefined, longitude: undefined });
        if (onSuccess) onSuccess();
      } else {
        setErro(result.error || 'Erro ao cadastrar congregação.');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="congregacao-cadastro-container">
      <h2>Cadastrar Nova Congregação</h2>
      <form onSubmit={handleSubmit} className="congregacao-cadastro-form">
        <div className="form-group">
          <label htmlFor="nome">Nome da Congregação *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={congregacao.nome}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Ex: Congregação Zona Sul"
          />
        </div>
        <div className="form-group">
          <label htmlFor="endereco">Endereço</label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            value={congregacao.endereco}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="Rua, número, bairro"
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="cidade">Cidade</label>
            <input
              type="text"
              id="cidade"
              name="cidade"
              value={congregacao.cidade}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Cidade"
            />
          </div>
          <div className="form-group">
            <label htmlFor="estado">Estado</label>
            <input
              type="text"
              id="estado"
              name="estado"
              value={congregacao.estado}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="UF"
              maxLength={2}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="latitude">Latitude</label>
            <input
              type="number"
              id="latitude"
              name="latitude"
              value={congregacao.latitude ?? ''}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Latitude"
              step="any"
            />
          </div>
          <div className="form-group">
            <label htmlFor="longitude">Longitude</label>
            <input
              type="number"
              id="longitude"
              name="longitude"
              value={congregacao.longitude ?? ''}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Longitude"
              step="any"
            />
          </div>
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Congregação cadastrada com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-congregacao">
          {loading ? 'Cadastrando...' : 'Cadastrar Congregação'}
        </button>
      </form>
    </div>
  );
}
