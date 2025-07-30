import React, { useState } from 'react';
import './SuperModal.scss';
import { getApiUrl } from '../config/api';

interface SuperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (token: string) => void;
}

export default function SuperModal({ isOpen, onClose, onLoginSuccess }: SuperModalProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    try {
      // Login DevUser no backend configurado
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'schema': 'devuser',
          'Schema': 'devuser',
          'x-church-schema': 'devuser',
          'X-Church-Schema': 'devuser'
        },
        body: JSON.stringify({ email, senha })
      });
      const result = await response.json();
      if (response.ok && result.token) {
        onLoginSuccess(result.token);
        onClose();
      } else {
        setErro(result.error || 'Login inválido');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="supermodal-overlay">
      <div className="supermodal">
        <button className="supermodal-close" onClick={onClose}>&times;</button>
        <h2>Login DevUser</h2>
        <form onSubmit={handleSubmit} className="supermodal-form">
          <input
            type="email"
            placeholder="E-mail do DevUser"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            disabled={loading}
          />
          {erro && <div className="supermodal-error">{erro}</div>}
          <button type="submit" className="supermodal-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="supermodal-footer">
          <span>DevUser EklesiaKonecta</span>
        </div>
      </div>
    </div>
  );
}
