// LandingPage.tsx
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LandingPage.scss';
import EklesiaLogo from '../assets/EklesiaKonecta.png';
import Header from '../components/Header';

import { useState } from 'react';
import SuperModal from '../components/SuperModal';

export default function LandingPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleDevUserLogin = (token: string) => {
    localStorage.setItem('eklesiakonecta_devuser_token', token);
    setModalOpen(false);
    navigate('/cadastro-inicial');
  };

  return (
    <div className="landing">
      <Header variant="landing" />
      <main>
        <button
          className="btn-cadastro"
          onClick={() => setModalOpen(true)}
        >
          Quero cadastrar minha igreja
        </button>
        <Link to="/login" className="btn-login">
          Já tenho conta
        </Link>
      </main>
      <footer className="landing-footer">
        <div className="footer-content">
          <img src={EklesiaLogo} alt="EklesiaKonecta" className="footer-logo" />
          <span className="footer-text">EklesiaKonecta</span>
        </div>
        <p className="footer-copyright">
          © 2025 EklesiaKonecta. Todos os direitos reservados.
        </p>
      </footer>
      <SuperModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onLoginSuccess={handleDevUserLogin}
      />
    </div>
  );
}