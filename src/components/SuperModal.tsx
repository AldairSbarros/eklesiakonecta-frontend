import { useState, useEffect } from 'react';
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
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('online'); // Iniciando como online para evitar verificação problemática

  // Simplificando a verificação de API que pode estar causando problemas de CORS
  useEffect(() => {
    if (isOpen) {
      // Não vamos mais verificar o status da API automaticamente
      // pois isso pode estar causando problemas de CORS desnecessários
      setApiStatus('online');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    
    try {
      // Endpoint para LOGIN (autenticação)
      const loginUrl = getApiUrl('/api/auth/login');
      console.log('Tentando login via:', loginUrl);
      
      // Login DevUser no backend configurado
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'schema': 'devuser',
          'Schema': 'devuser',
          'x-church-schema': 'devuser',
          'X-Church-Schema': 'devuser'
        },
        body: JSON.stringify({ email, senha }),
      });
      
      const result = await response.json();
      if (response.ok && result.token) {
        onLoginSuccess(result.token);
        onClose();
      } else {
        setErro(result.error || 'Login inválido');
      }
    } catch (error) {
      console.error('Erro no login:', error);
      setErro('Erro de conexão. Verifique se o proxy do Vite está configurado corretamente.');
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
        
        {apiStatus === 'offline' && (
          <div className="supermodal-api-status offline">
            Servidor não disponível.
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="supermodal-form">
          <input
            type="email"
            placeholder="E-mail do DevUser"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
            disabled={loading}
            autoComplete="email"
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
          {erro && <div className="supermodal-error">{erro}</div>}
          <button type="submit" className="supermodal-btn" disabled={loading || apiStatus === 'offline'}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <div className="supermodal-footer">
          <span>DevUser EklesiaKonecta</span>
          <div className="supermodal-info">
            <small>Dica: Se estiver tendo problemas com CORS, verifique se a API está acessível e configurada corretamente.</small>
          </div>
        </div>
      </div>
    </div>
  );
}
