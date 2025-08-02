import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaSpinner, FaCheck, FaChurch } from 'react-icons/fa';
import { API_URL } from '../config/api';
import '../styles/CadastroInicial.scss';
import Header from '../components/Header';
import EklesiaLogo from '../assets/EklesiaKonecta.png';

interface DadosCadastro {
  nomeIgreja: string;
  nomePastor: string;
  emailPastor: string;
  senhaPastor: string;
}

interface CadastroInicialProps {
  onSuccess?: () => void;
}

export default function CadastroInicial({ onSuccess }: CadastroInicialProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [instalando, setInstalando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState('');

  const [dados, setDados] = useState<DadosCadastro>({
    nomeIgreja: '',
    nomePastor: '',
    emailPastor: '',
    senhaPastor: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDados(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validarFormulario = (): boolean => {
    if (!dados.nomeIgreja.trim()) {
      setErro('Nome da igreja é obrigatório');
      return false;
    }
    if (!dados.nomePastor.trim()) {
      setErro('Nome do pastor é obrigatório');
      return false;
    }
    if (!dados.emailPastor.trim()) {
      setErro('E-mail do pastor é obrigatório');
      return false;
    }
    if (!dados.emailPastor.includes('@')) {
      setErro('E-mail inválido');
      return false;
    }
    if (dados.senhaPastor.length < 6) {
      setErro('Senha deve ter no mínimo 6 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setErro('');
    setInstalando(true);

    const tempoMinimo = 3000; // 3 segundos
    const inicio = Date.now();

    try {
      const response = await fetch(`${API_URL}/api/cadastro-inicial`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...dados,
          perfilUsuario: 'ADMIN'
        })
      });

      const result = await response.json();

      const tempoRestante = tempoMinimo - (Date.now() - inicio);
      if (tempoRestante > 0) {
        await new Promise(resolve => setTimeout(resolve, tempoRestante));
      }

      if (response.ok) {
        setSucesso(true);

        // Garante que o schema retornado do backend seja salvo corretamente
        const schema = result.igreja?.schema;
        if (!schema) {
          setErro('Erro ao cadastrar: schema não retornado pelo backend.');
          setLoading(false);
          setInstalando(false);
          return;
        }
        const igrejaData = {
          nomeIgreja: result.igreja?.nome || dados.nomeIgreja,
          nomePastor: dados.nomePastor,
          emailPastor: dados.emailPastor,
          schema,
          sistemaConfigurado: true
        };
        localStorage.setItem('eklesiakonecta_igreja', JSON.stringify(igrejaData));
        if (onSuccess) {
          onSuccess();
        }

        setTimeout(() => {
          navigate('/login', {
            state: {
              message: 'Igreja cadastrada com sucesso! Faça seu login para acessar o sistema.',
              email: dados.emailPastor,
              schema: igrejaData.schema,
              isNewRegistration: true
            }
          });
        }, 2000);
      } else {
        setInstalando(false);
        setErro(result.error || 'Erro ao cadastrar igreja');
      }
    } catch {
      setInstalando(false);
      setErro('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Tela de instalação/aguardando backend
  if (instalando && !sucesso) {
    return (
      <div className="cadastro-instalando">
        <div className="instalando-content">
          <div className="instalando-logo">
            <img src={EklesiaLogo} alt="EklesiaKonecta" className="logo-instalando" />
            <h3>EklesiaKonecta</h3>
          </div>
          <div className="instalando-icon-container">
            <FaSpinner className="instalando-spinner spinning" />
          </div>
          <h1>Instalando sistema...</h1>
          <p>Estamos preparando o ambiente da sua igreja.<br />Isso pode levar alguns segundos.</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  // Tela de sucesso
  if (sucesso) {
    return (
      <div className="cadastro-sucesso">
        <div className="sucesso-content">
          <div className="sucesso-logo">
            <img src={EklesiaLogo} alt="EklesiaKonecta" className="logo-sucesso" />
            <h3>EklesiaKonecta</h3>
          </div>
          <div className="sucesso-icon-container">
            <FaCheck className="sucesso-icon" />
          </div>
          <h1>Cadastro Inicial Realizado com Sucesso!</h1>
          <p>Sua igreja foi cadastrada no sistema.</p>
          <p>Agora você pode fazer login para acessar o sistema.</p>
          <p>Redirecionando para a tela de login...</p>
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-inicial">
      <div className="cadastro-container">
        <Header 
          variant="form" 
          title="Cadastro Inicial" 
          subtitle="Configure sua igreja no Eklesia Konecta" 
        />

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="cadastro-form">
          <div className="form-section">
            <h2>
              <FaChurch className="section-icon" />
              Dados da Igreja
            </h2>

            <div className="form-group">
              <label htmlFor="nomeIgreja">
                <FaChurch className="field-icon" />
                Nome da Igreja *
              </label>
              <input
                type="text"
                id="nomeIgreja"
                name="nomeIgreja"
                value={dados.nomeIgreja}
                onChange={handleInputChange}
                placeholder="Ex: Igreja Batista Central"
                required
                disabled={loading || instalando}
              />
            </div>
          </div>

          <div className="form-section">
            <h2>
              <FaUser className="section-icon" />
              Dados do Pastor Responsável
            </h2>

            <div className="form-group">
              <label htmlFor="nomePastor">
                <FaUser className="field-icon" />
                Nome Completo *
              </label>
              <input
                type="text"
                id="nomePastor"
                name="nomePastor"
                value={dados.nomePastor}
                onChange={handleInputChange}
                placeholder="Nome completo do pastor"
                required
                disabled={loading || instalando}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="emailPastor">
                  <FaEnvelope className="field-icon" />
                  E-mail para Login *
                </label>
                <input
                  type="email"
                  id="emailPastor"
                  name="emailPastor"
                  value={dados.emailPastor}
                  onChange={handleInputChange}
                  placeholder="pastor@igreja.com"
                  required
                  disabled={loading || instalando}
                />
              </div>

              <div className="form-group">
                <label htmlFor="senhaPastor">
                  <FaLock className="field-icon" />
                  Senha *
                </label>
                <input
                  type="password"
                  id="senhaPastor"
                  name="senhaPastor"
                  value={dados.senhaPastor}
                  onChange={handleInputChange}
                  placeholder="Mínimo 6 caracteres"
                  minLength={6}
                  required
                  disabled={loading || instalando}
                />
              </div>
            </div>
          </div>

          {/* Mensagem de erro */}
          {erro && (
            <div className="erro-message">
              <strong>Erro:</strong> {erro}
            </div>
          )}

          {/* Botão de submit */}
          <button
            type="submit"
            disabled={loading || instalando}
            className="btn-cadastrar"
          >
            {loading ? (
              <>
                <FaSpinner className="spinning" />
                Cadastrando Igreja...
              </>
            ) : (
              <>
                <FaChurch />
                Cadastrar Minha Igreja
              </>
            )}
          </button>

          {/* Link para voltar */}
          <div className="form-footer">
            <button
              type="button"
              className="btn-voltar"
              onClick={() => navigate('/')}
              disabled={loading || instalando}
            >
              ← Voltar para página inicial
            </button>
            
            <button
              type="button"
              className="btn-login"
              onClick={() => navigate('/login')}
              disabled={loading || instalando}
            >
              Já tenho conta →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}