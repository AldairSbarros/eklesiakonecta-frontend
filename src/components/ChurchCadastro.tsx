import { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import '../styles/ChurchCadastro.scss';

interface Church {
  id?: number;
  nome: string;
  email: string;
  telefone?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  latitude?: number;
  longitude?: number;
}

interface ChurchCadastroProps {
  onSuccess?: () => void;
}

export default function ChurchCadastro({ onSuccess }: ChurchCadastroProps) {
  const [church, setChurch] = useState<Church>({
    nome: '',
    email: '',
    telefone: '',
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
    setChurch(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    setLoading(true);
    try {
      const response = await fetch(getApiUrl('/api/churches'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(church)
      });
      const result = await response.json();
      if (response.ok) {
        setSucesso(true);
        setChurch({ nome: '', email: '', telefone: '', endereco: '', cidade: '', estado: '', latitude: undefined, longitude: undefined });
        if (onSuccess) onSuccess();
      } else {
        setErro(result.error || 'Erro ao cadastrar igreja.');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="church-cadastro-container">
      <h2>Cadastrar Nova Igreja</h2>
      <form onSubmit={handleSubmit} className="church-cadastro-form">
        <div className="form-group">
          <label htmlFor="nome">Nome da Igreja *</label>
          <input
            type="text"
            id="nome"
            name="nome"
            value={church.nome}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="Ex: Igreja Batista Central"
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">E-mail *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={church.email}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="contato@igreja.com"
          />
        </div>
        <div className="form-group">
          <label htmlFor="telefone">Telefone</label>
          <input
            type="text"
            id="telefone"
            name="telefone"
            value={church.telefone}
            onChange={handleInputChange}
            disabled={loading}
            placeholder="(99) 99999-9999"
          />
        </div>
        <div className="form-group">
          <label htmlFor="endereco">Endereço</label>
          <input
            type="text"
            id="endereco"
            name="endereco"
            value={church.endereco}
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
              value={church.cidade}
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
              value={church.estado}
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
              value={church.latitude ?? ''}
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
              value={church.longitude ?? ''}
              onChange={handleInputChange}
              disabled={loading}
              placeholder="Longitude"
              step="any"
            />
          </div>
        </div>
        {erro && <div className="erro-message">{erro}</div>}
        {sucesso && <div className="sucesso-message">Igreja cadastrada com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-church">
          {loading ? 'Cadastrando...' : 'Cadastrar Igreja'}
        </button>
      </form>
    </div>
  );
}
