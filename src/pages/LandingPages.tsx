// LandingPage.tsx
import { Link, useNavigate } from 'react-router-dom';
import '../styles/LandingPage.scss';
import EklesiaLogo from '../assets/EklesiaKonecta.png';

export default function LandingPage() {
  const navigate = useNavigate();
  return (
    <div className="landing-page-apresentacao">
      <header className="lp-header">
        <img src={EklesiaLogo} alt="EklesiaKonecta" className="lp-logo" />
        <h1>Eklesia Konecta</h1>
        <h2>Transforme a gestão da sua igreja com tecnologia, segurança e praticidade.</h2>
      </header>
      <main className="lp-main">
        <section className="lp-beneficios">
          <h3>Por que escolher o Eklesia Konecta?</h3>
          <ul>
            <li><strong>Gestão completa</strong> de igrejas, congregações e células.</li>
            <li><strong>Controle financeiro</strong> integrado: ofertas, dízimos, despesas e receitas.</li>
            <li><strong>Relatórios inteligentes</strong> para tomada de decisão rápida e segura.</li>
            <li><strong>Segurança de dados</strong> e privacidade para sua comunidade.</li>
            <li><strong>Interface intuitiva</strong> e responsiva, acessível de qualquer dispositivo.</li>
            <li><strong>Suporte dedicado</strong> para líderes e administradores.</li>
          </ul>
        </section>
        <section className="lp-recursos">
          <h3>Recursos que fazem a diferença</h3>
          <div className="lp-features-grid">
            <div className="lp-feature">
              <span role="img" aria-label="Gestão">📊</span>
              <p>Dashboard de gestão</p>
            </div>
            <div className="lp-feature">
              <span role="img" aria-label="Financeiro">💰</span>
              <p>Financeiro integrado</p>
            </div>
            <div className="lp-feature">
              <span role="img" aria-label="Relatórios">📑</span>
              <p>Relatórios automáticos</p>
            </div>
            <div className="lp-feature">
              <span role="img" aria-label="Segurança">🔒</span>
              <p>Segurança avançada</p>
            </div>
            <div className="lp-feature">
              <span role="img" aria-label="Suporte">🤝</span>
              <p>Suporte dedicado</p>
            </div>
            <div className="lp-feature">
              <span role="img" aria-label="Mobile">📱</span>
              <p>100% responsivo</p>
            </div>
          </div>
        </section>
        <section className="lp-cta">
          <h3>Pronto para revolucionar a gestão da sua igreja?</h3>
          <button className="lp-btn-cadastro" onClick={() => navigate('/cadastro-inicial')}>
            Quero cadastrar minha igreja
          </button>
          <Link to="/login" className="lp-btn-login">
            Já tenho conta
          </Link>
        </section>
        <section className="lp-depoimento">
          <blockquote>
            "O Eklesia Konecta trouxe organização, transparência e agilidade para nossa igreja. Recomendo para todos os líderes!"
          </blockquote>
          <cite>— Pastor João, Igreja Batista Central</cite>
        </section>
      </main>
      <footer className="lp-footer">
        <span>© 2025 Eklesia Konecta. Todos os direitos reservados.</span>
      </footer>
    </div>
  );
}