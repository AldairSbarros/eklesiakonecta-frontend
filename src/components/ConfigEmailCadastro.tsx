import { useState } from 'react';
import { FaEye, FaEyeSlash, FaInfoCircle, FaCheckCircle } from 'react-icons/fa';
import { getApiUrl } from '../config/api';
import '../styles/ConfigEmailCadastro.scss';

interface ConfigEmailData {
  clienteId: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  email: string;
}

interface ConfigEmailCadastroProps {
  onSuccess?: () => void;
}

export default function ConfigEmailCadastro({ onSuccess }: ConfigEmailCadastroProps) {
  // Preenche clienteId automaticamente se possível
  const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
  const igrejaObj = igrejaData ? JSON.parse(igrejaData) : null;
  const autoClienteId = igrejaObj?.schema || '';

  const [config, setConfig] = useState<ConfigEmailData>({
    clienteId: autoClienteId,
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    email: ''
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: name === 'smtpPort' ? Number(value) : value }));
  };

  // Validação básica
  const validar = () => {
    if (!config.clienteId) return 'ID do Cliente é obrigatório.';
    if (!config.smtpHost) return 'Host SMTP é obrigatório.';
    if (!config.smtpPort || config.smtpPort < 1) return 'Porta SMTP inválida.';
    if (!config.smtpUser) return 'Usuário SMTP é obrigatório.';
    if (!config.smtpPass) return 'Senha SMTP é obrigatória.';
    if (!config.email || !config.email.includes('@')) return 'E-mail de envio inválido.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso(false);
    const valid = validar();
    if (valid) {
      setErro(valid);
      return;
    }
    setLoading(true);
    const schema = igrejaObj?.schema;
    if (!schema) {
      setErro('Schema da igreja não encontrado. Faça login novamente.');
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(getApiUrl('/api/config-email'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'schema': schema
        },
        body: JSON.stringify(config)
      });
      const result = await response.json();
      if (response.ok) {
        setSucesso(true);
        setTimeout(() => setSucesso(false), 3000);
        if (onSuccess) onSuccess();
      } else {
        setErro(result.error || 'Erro ao salvar configuração de e-mail.');
      }
    } catch {
      setErro('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="config-email-cadastro-container">
      <h2>Configuração de E-mail (SMTP)</h2>
      <p className="config-email-dica"><FaInfoCircle style={{marginRight: 6}}/> Preencha os dados do servidor SMTP da sua igreja para envio de notificações automáticas.</p>
      <form onSubmit={handleSubmit} className="config-email-cadastro-form" autoComplete="off">
        <div className="form-group">
          <label htmlFor="clienteId">ID do Cliente *</label>
          <input
            type="text"
            id="clienteId"
            name="clienteId"
            value={config.clienteId}
            onChange={handleInputChange}
            required
            disabled={!!autoClienteId || loading}
            placeholder="ID único do cliente"
            aria-describedby="dica-clienteId"
          />
          <small id="dica-clienteId" className="input-tip">Esse campo normalmente é preenchido automaticamente.</small>
        </div>
        <div className="form-group">
          <label htmlFor="smtpHost">SMTP Host *</label>
          <input
            type="text"
            id="smtpHost"
            name="smtpHost"
            value={config.smtpHost}
            onChange={handleInputChange}
            required
            disabled={loading}
            placeholder="smtp.seuprovedor.com"
            aria-describedby="dica-smtpHost"
          />
          <small id="dica-smtpHost" className="input-tip">Exemplo: smtp.gmail.com, smtp.titan.email, etc.</small>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="smtpPort">Porta *</label>
            <input
              type="number"
              id="smtpPort"
              name="smtpPort"
              value={config.smtpPort}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="587"
              min={1}
              max={65535}
              aria-describedby="dica-smtpPort"
            />
            <small id="dica-smtpPort" className="input-tip">Porta padrão: 587 (TLS) ou 465 (SSL).</small>
          </div>
          <div className="form-group">
            <label htmlFor="smtpUser">Usuário *</label>
            <input
              type="text"
              id="smtpUser"
              name="smtpUser"
              value={config.smtpUser}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="usuario@dominio.com"
              aria-describedby="dica-smtpUser"
            />
            <small id="dica-smtpUser" className="input-tip">Normalmente é o e-mail de envio.</small>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group senha-group">
            <label htmlFor="smtpPass">Senha *</label>
            <div className="senha-input-wrapper">
              <input
                type={showPass ? 'text' : 'password'}
                id="smtpPass"
                name="smtpPass"
                value={config.smtpPass}
                onChange={handleInputChange}
                required
                disabled={loading}
                placeholder="Senha do SMTP"
                aria-describedby="dica-smtpPass"
                autoComplete="new-password"
              />
              <button type="button" className="btn-toggle-pass" onClick={() => setShowPass(v => !v)} tabIndex={-1} aria-label={showPass ? 'Ocultar senha' : 'Mostrar senha'}>
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <small id="dica-smtpPass" className="input-tip">Nunca compartilhe essa senha.</small>
          </div>
          <div className="form-group">
            <label htmlFor="email">E-mail de envio *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={config.email}
              onChange={handleInputChange}
              required
              disabled={loading}
              placeholder="contato@dominio.com"
              aria-describedby="dica-email"
            />
            <small id="dica-email" className="input-tip">E-mail que será usado para enviar mensagens do sistema.</small>
          </div>
        </div>
        {erro && <div className="erro-message"><FaInfoCircle style={{marginRight: 4}}/>{erro}</div>}
        {sucesso && <div className="sucesso-message"><FaCheckCircle style={{marginRight: 4}}/>Configuração salva com sucesso!</div>}
        <button type="submit" disabled={loading} className="btn-cadastrar-config-email">
          {loading ? 'Salvando...' : 'Salvar Configuração'}
        </button>
      </form>
    </div>
  );
}
