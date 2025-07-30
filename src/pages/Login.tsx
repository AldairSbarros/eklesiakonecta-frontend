import React, { useState, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { CSSTransition } from "react-transition-group";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GenericModal from "../components/GenericModal";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaSpinner,
  FaChurch,
  FaCheckCircle,
  FaExclamationTriangle,
  FaGoogle,
  FaFacebook,
} from "react-icons/fa";
import { getApiUrl } from "../config/api";
import "../styles/Login.scss";
import Header from "../components/Header";

interface LoginData {
  email: string;
  senha: string;
}

interface LocationState {
  message?: string;
  email?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState & { schema?: string; isNewRegistration?: boolean };

  // Se vier schema pelo state (após cadastro), salva no localStorage
  useEffect(() => {
    if (state?.schema) {
      const igrejaData = localStorage.getItem("eklesiakonecta_igreja");
      const obj = igrejaData ? JSON.parse(igrejaData) : {};
      obj.schema = state.schema;
      localStorage.setItem("eklesiakonecta_igreja", JSON.stringify(obj));
    }
  }, [state?.schema]);

  const [dados, setDados] = useState<LoginData>({
    email: state?.email || "",
    senha: "",
  });

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarMe, setLembrarMe] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  // ...sem autenticação 2FA...

  // Detecta token de login social no retorno do OAuth
  useEffect(() => {
    const igrejaData = localStorage.getItem("eklesiakonecta_igreja");
    if (igrejaData) {
      try {
        const dadosIgreja = JSON.parse(igrejaData);
        setDados((prev) => ({
          ...prev,
          email: dadosIgreja.emailPastor || prev.email,
        }));
      } catch (error) {
        console.error("Erro ao carregar dados da igreja:", error);
      }
    }
    testarBackend();

    // Verifica se veio token do OAuth
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      localStorage.setItem("eklesiakonecta_token", token);
      // Opcional: buscar dados do usuário via backend
      navigate("/painel-controle");
    }
  }, []);

  const testarBackend = async () => {
    try {
      await fetch(getApiUrl("/test"), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      console.error("Erro ao testar backend:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDados((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const validarFormulario = (): boolean => {
    if (!dados.email.trim()) {
      setErro("E-mail é obrigatório");
      return false;
    }
    if (!dados.email.includes("@")) {
      setErro("E-mail inválido");
      return false;
    }
    if (!dados.senha.trim()) {
      setErro("Senha é obrigatória");
      return false;
    }
    if (dados.senha.length < 6) {
      setErro("Senha deve ter pelo menos 6 caracteres");
      return false;
    }
    return true;
  };

  // Função para buscar o schema pelo email no backend
  const buscarSchemaPorEmail = async (
    email: string
  ): Promise<string | null> => {
    try {
      const response = await fetch(getApiUrl("/api/auth/schema"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        const result = await response.json();
        return result.schema || null;
      }
      return null;
    } catch {
      return null;
    }
  };

  // Login principal
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validarFormulario()) return;

    setLoading(true);
    setErro("");

    try {
      let schema = "";
      const igrejaData = localStorage.getItem("eklesiakonecta_igreja");
      if (igrejaData) {
        const dadosIgreja = JSON.parse(igrejaData);
        schema = dadosIgreja.schema || "";
      }
      if (!schema) {
        const schemaResult = await buscarSchemaPorEmail(dados.email);
        schema = schemaResult ?? "";
        if (!schema) {
          setErro("Não foi possível localizar o schema da igreja. Verifique o email ou cadastre sua igreja.");
          toast.error("Não foi possível localizar o schema da igreja.");
          setLoading(false);
          return;
        }
      }
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "X-Church-Schema": schema,
        "schema": schema,
      };
      const response = await fetch(getApiUrl("/api/auth/login"), {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          email: dados.email,
          senha: dados.senha,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        const userData = {
          ...result.user,
          token: result.token,
          schema: result.user.schema || schema,
          isLoggedIn: true,
          perfilUsuario: result.user.perfil,
        };
        const igrejaDataAtualizada = {
          nomeIgreja: result.user.igreja || userData.igreja,
          nomePastor: userData.nome,
          emailPastor: userData.email,
          schema: userData.schema,
          token: result.token,
          perfilUsuario: result.user.perfil,
          isLoggedIn: true,
          sistemaConfigurado: true,
        };
        localStorage.setItem("eklesiakonecta_igreja", JSON.stringify(igrejaDataAtualizada));
        localStorage.setItem("eklesiakonecta_token", result.token);
        if (lembrarMe) {
          localStorage.setItem("eklesiakonecta_lembrar", "true");
        }
        setShowSuccess(true);
        toast.success(`Bem-vindo, ${result.user.nome}!`);
        setTimeout(() => {
          navigate("/painel-controle", {
            state: {
              message: `Bem-vindo, ${result.user.nome}! Perfil: ${result.user.perfil}`,
              igreja: result.user.igreja || userData.igreja,
              perfil: result.user.perfil,
            },
          });
        }, 1200);
      } else {
        setErro(result.error || "Credenciais inválidas");
        toast.error(result.error || "Credenciais inválidas");
      }
    } catch {
      setErro("Erro de conexão. Verifique sua internet e tente novamente.");
      toast.error("Erro de conexão. Verifique sua internet e tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getIgrejaInfo = () => {
    const igrejaData = localStorage.getItem("eklesiakonecta_igreja");
    if (igrejaData) {
      try {
        return JSON.parse(igrejaData);
      } catch {
        return null;
      }
    }
    return null;
  };

  const igrejaInfo = getIgrejaInfo();

  // Configuração do Google Maps
  const defaultPosition = { lat: -14.235004, lng: -51.92528 }; // Brasil
  const igrejaPosition = igrejaInfo && igrejaInfo.latitude && igrejaInfo.longitude
    ? { lat: igrejaInfo.latitude, lng: igrejaInfo.longitude }
    : defaultPosition;

  // Carregar Google Maps API
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "SUA_GOOGLE_MAPS_API_KEY_AQUI" // Troque pela sua chave
  });

  // Recuperação de senha
  const handleForgotPassword = async () => {
    setForgotLoading(true);
    setForgotMessage("");
    try {
      const response = await fetch(getApiUrl("/api/auth/forgot-password"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      if (response.ok) {
        setForgotMessage("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      } else {
        const result = await response.json();
        setForgotMessage(result.error || "Erro ao enviar e-mail. Tente novamente.");
      }
    } catch {
      setForgotMessage("Erro de conexão. Tente novamente.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-bg-gradient">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar theme="colored" />
      <div className="login-container">
        <Header
          variant="form"
          title="Bem-vindo de volta!"
          subtitle="Faça login para acessar o sistema"
        />
        {igrejaInfo && (
          <CSSTransition in={!!igrejaInfo} timeout={400} classNames="fade" appear>
            <div className="church-info">
              <FaChurch className="church-icon" />
              <div className="church-details">
                <h3>{igrejaInfo.nomeIgreja}</h3>
                <p>Sistema configurado e pronto!</p>
              </div>
            </div>
          </CSSTransition>
        )}
        {/* Google Maps - localização da igreja */}
        {isLoaded && (
          <div className="church-map-container">
            <GoogleMap
              mapContainerStyle={{ width: "100%", height: "250px", borderRadius: 12, margin: "16px 0" }}
              center={igrejaPosition}
              zoom={igrejaPosition === defaultPosition ? 4 : 15}
            >
              <Marker position={igrejaPosition} />
            </GoogleMap>
          </div>
        )}
        {state?.message && (
          <CSSTransition in={!!state?.message} timeout={400} classNames="fade" appear>
            <div className="success-message">
              <FaCheckCircle className="success-icon" />
              <span>{state.message}</span>
            </div>
          </CSSTransition>
        )}
        <div className="login-card">
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">
                <FaEnvelope className="field-icon" /> E-mail
              </label>
              <div className="input-wrapper">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={dados.email}
                  onChange={handleInputChange}
                  placeholder="seu@email.com"
                  required
                  disabled={loading}
                  autoComplete="email"
                  className="animated-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="senha">
                <FaLock className="field-icon" /> Senha
              </label>
              <div className="input-wrapper password-wrapper">
                <input
                  type={mostrarSenha ? "text" : "password"}
                  id="senha"
                  name="senha"
                  value={dados.senha}
                  onChange={handleInputChange}
                  placeholder="Sua senha"
                  required
                  disabled={loading}
                  autoComplete="current-password"
                  className="animated-input"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  disabled={loading}
                  title={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={lembrarMe}
                  onChange={(e) => setLembrarMe(e.target.checked)}
                  disabled={loading}
                />
                <span className="checkmark"></span>
                Lembrar-me
              </label>
              <a href="/recuperar-senha" className="forgot-password" style={{ color: '#ff4b6e', textDecoration: 'underline', fontWeight: 500 }}>
                Esqueci minha senha
              </a>
            </div>
            {erro && (
              <CSSTransition in={!!erro} timeout={400} classNames="fade" appear>
                <div className="error-message">
                  <FaExclamationTriangle className="error-icon" />
                  <span>{erro}</span>
                </div>
              </CSSTransition>
            )}
            <button type="submit" disabled={loading} className="login-button">
              {loading ? (
                <span className="loader-center">
                  <FaSpinner className="spinning" /> Entrando...
                </span>
              ) : (
                <>
                  <FaChurch /> Entrar no Sistema
                </>
              )}
            </button>
          </form>
          <div className="social-login">
            <button
              type="button"
              className="social-btn google"
              onClick={() => window.location.href = getApiUrl("/api/auth/google")}
              disabled={loading}
              title="Entrar com Google"
            >
              <FaGoogle /> Entrar com Google
            </button>
            <button
              type="button"
              className="social-btn facebook"
              onClick={() => window.location.href = getApiUrl("/api/auth/facebook")}
              disabled={loading}
              title="Entrar com Facebook"
            >
              <FaFacebook /> Entrar com Facebook
            </button>
          </div>
          <div className="card-footer">
            <p>
              Não tem uma conta?
              <button
                type="button"
                className="register-link"
                onClick={() => navigate("/cadastro")}
                disabled={loading}
              >
                Cadastre sua igreja
              </button>
            </p>
            <p>
              Problemas para acessar?
              <button type="button" className="support-link">
                Entre em contato
              </button>
            </p>
          </div>
          <CSSTransition in={showSuccess} timeout={600} classNames="fade" unmountOnExit>
            <div className="login-success-animation">
              <FaCheckCircle className="success-check" />
              <span>Login realizado com sucesso!</span>
            </div>
          </CSSTransition>
        </div>
        {showForgotModal && (
          <GenericModal isOpen={showForgotModal} onClose={() => setShowForgotModal(false)}>
            <div className="forgot-modal-content">
              <FaEnvelope className="forgot-icon" />
              <h2>Recuperação de Senha</h2>
              <p>Informe seu e-mail cadastrado para receber o link de redefinição.</p>
              <input
                type="email"
                value={forgotEmail}
                onChange={e => setForgotEmail(e.target.value)}
                placeholder="seu@email.com"
                disabled={forgotLoading}
                style={{ width: "100%", marginBottom: 12 }}
                className="animated-input"
              />
              <button
                onClick={handleForgotPassword}
                disabled={forgotLoading || !forgotEmail.includes("@")}
                style={{ width: "100%" }}
              >
                {forgotLoading ? <FaSpinner className="spinning" /> : "Enviar link de recuperação"}
              </button>
              {forgotMessage && <div className="forgot-message">{forgotMessage}</div>}
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setShowForgotModal(false)}
                style={{ marginTop: 10 }}
              >
                Fechar
              </button>
            </div>
          </GenericModal>
        )}
      </div>
    </div>
);
}