import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import '../styles/RecuperarSenha.scss';

const RecuperarSenha: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Chamada à API
      const res = await fetch('/api/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        toast.success(data.message || 'E-mail de recuperação enviado!');
      } else {
        toast.error(data.error || 'Erro ao enviar e-mail.');
      }
    } catch {
      toast.error('Erro de conexão.');
    }
    setLoading(false);
  };

  return (
    <div className="recuperar-senha-page">
      <ToastContainer position="top-right" autoClose={3000} />
      <form className="recuperar-form" onSubmit={handleSubmit}>
        <h2><FaEnvelope /> Recuperar Senha</h2>
        {!success ? (
          <>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            <button type="submit" disabled={loading || !email} style={{ transition: 'background 0.2s' }}>
              <FaPaperPlane /> {loading ? 'Enviando...' : 'Enviar link de recuperação'}
            </button>
            <a href="/login" style={{ color: '#ff4b6e', textDecoration: 'underline', marginTop: 12, fontWeight: 500, textAlign: 'center' }}>Voltar ao login</a>
          </>
        ) : (
          <div className="success-message" style={{ textAlign: 'center', color: '#ff4b6e', fontWeight: 600, fontSize: '1.1rem', marginTop: 24 }}>
            Link de recuperação enviado!<br />
            Verifique seu e-mail e siga as instruções.<br />
            <a href="/login" style={{ color: '#ff4b6e', textDecoration: 'underline', marginTop: 18, display: 'inline-block', fontWeight: 500 }}>Voltar ao login</a>
          </div>
        )}
      </form>
    </div>
  );
};

export default RecuperarSenha;
