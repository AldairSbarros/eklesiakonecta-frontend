// cSpell:disable
import { Link } from 'react-router-dom';
import EklesiaLogo from '../assets/EklesiaKonecta.png';
import './Header.scss';

interface HeaderProps {
  variant?: 'landing' | 'form' | 'panel';
  title?: string;
  subtitle?: string;
  showNavigation?: boolean;
}

export default function Header({ 
  variant = 'form', 
  title, 
  subtitle,
  showNavigation = false 
}: HeaderProps) {
  
  if (variant === 'landing') {
    return (
      <header className="header header-landing">
        <img src={EklesiaLogo} alt="Logo Eklesia Konecta" className="logo-large" />
        <h1>Bem-vindo ao Eklesia Konecta</h1>
        <p>O sistema completo para gestão de igrejas, congregações e células.</p>
      </header>
    );
  }

  if (variant === 'panel') {
    return (
      <header className="header header-panel">
        <div className="panel-nav">
          <Link to="/" className="nav-logo">
            <img src={EklesiaLogo} alt="EklesiaKonecta" className="logo-nav" />
            <span className="nav-title">EklesiaKonecta</span>
          </Link>
          
          {showNavigation && (
            <nav className="nav-menu">
              <Link to="/painel" className="nav-item">Dashboard</Link>
              <Link to="/membros" className="nav-item">Membros</Link>
              <Link to="/financas" className="nav-item">Finanças</Link>
              <Link to="/eventos" className="nav-item">Eventos</Link>
            </nav>
          )}
          
          <div className="nav-actions">
            <button className="btn-logout">Sair</button>
          </div>
        </div>
      </header>
    );
  }

  // Variant 'form' (default)
  return (
    <header className="header header-form">
      <div className="header-logo">
        <img src={EklesiaLogo} alt="EklesiaKonecta" className="logo-form" />
        <div className="logo-text">
          <h2>EklesiaKonecta</h2>
          <span>Sistema de Gestão</span>
        </div>
      </div>
      
      {title && (
        <div className="header-content">
          <h1>{title}</h1>
          {subtitle && <p>{subtitle}</p>}
        </div>
      )}
    </header>
  );
}
