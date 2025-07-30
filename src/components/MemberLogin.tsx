import { useState } from 'react';
import { FaUser, FaLock, FaEye, FaEyeSlash, FaSignInAlt, FaInfoCircle } from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import '../styles/MemberLogin.scss';

interface Membro {
  id: number;
  nome: string;
  email: string;
  // Adicione outros campos relevantes conforme necessário
}

interface MemberLoginProps {
  onSuccess?: (token: string, membro: Membro) => void;
}

export default function MemberLogin({ onSuccess }: MemberLoginProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    const schema = igrejaData ? JSON.parse(igrejaData).schema : null;
    if (!schema) {
      setErro('Schema da igreja não encontrado. Faça login administrativo primeiro.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(getApiUrl('/api/membros/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'schema': schema
        },
        body: JSON.stringify({ email, senha })
      });
      const result = await response.json();
      if (response.ok && result.token) {
        if (onSuccess) onSuccess(result.token, result.membro);
        setErro('');
      } else {
        setErro(result.error || 'E-mail ou senha inválidos.');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-login-container">
      <h2>Login do Membro</h2>
      <form onSubmit={handleSubmit} className="member-login-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="email"><FaUser /> E-mail</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={loading}
            placeholder="Seu e-mail de membro"
          />
        </div>
        <div className="form-group senha-group">
          <label htmlFor="senha"><FaLock /> Senha</label>
          <div className="senha-input-wrapper">
            <input
              type={showPass ? 'text' : 'password'}
              id="senha"
              name="senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
              disabled={loading}
              placeholder="Sua senha"
              autoComplete="current-password"
            />
            <button type="button" className="btn-toggle-pass" onClick={() => setShowPass(v => !v)} tabIndex={-1} aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>
              {showPass ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
        </div>
        {erro && <div className="erro-message"><FaInfoCircle style={{marginRight: 4}}/>{erro}</div>}
        <button type="submit" disabled={loading} className="btn-member-login">
          {loading ? 'Entrando...' : <><FaSignInAlt style={{marginRight: 6}}/>Entrar</>}
        </button>
      </form>
    </div>
  );
}
