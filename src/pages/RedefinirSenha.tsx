import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaLock, FaCheck } from 'react-icons/fa';
import '../styles/RedefinirSenha.scss';

const RedefinirSenha: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/redefinir-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Senha redefinida com sucesso!');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        toast.error(data.error || 'Erro ao redefinir senha.');
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    }
    setLoading(false);
  };

  return (
    <div className="redefinir-senha-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <form className="redefinir-form" onSubmit={handleSubmit}>
        <h2><FaLock /> Redefinir Senha</h2>
        <input
          type="password"
          placeholder="Nova senha"
          value={novaSenha}
          onChange={e => setNovaSenha(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          <FaCheck /> {loading ? 'Redefinindo...' : 'Redefinir Senha'}
        </button>
      </form>
    </div>
  );
};

export default RedefinirSenha;
