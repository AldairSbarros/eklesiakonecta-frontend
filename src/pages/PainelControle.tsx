// ...existing imports...



import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, 
  FaChurch, 
  FaDollarSign, 
  FaCalendarAlt, 
  FaCog, 
  FaEnvelope, 
  FaBookOpen,
  FaHandsHelping,
  FaMicrophone,
  FaUserTie,
  FaSignOutAlt,
  FaCreditCard,
  FaFileAlt,
  FaShieldAlt,
  FaBell,
  FaArchive,
  FaHistory,
  FaVideo,
  FaGraduationCap,
  FaPray,
  FaHeart,
  FaMoneyBillWave,
  FaChartLine,
  FaDatabase,
  FaUserShield,
  FaSatelliteDish,
  FaCrown,
  FaFire,
  FaStar,
  FaRocket,
  FaMagic,
  FaGem,
  FaBolt,
  FaFilePdf
} from 'react-icons/fa';
import '../styles/PainelControle.scss';
import Header from '../components/Header';
import AniversariantesDoDia from '../components/AniversariantesDoDia';

interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: string;
}

interface MenuCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  gradient: string;
  route: string;
  category: 'principal' | 'gestao' | 'financeiro' | 'comunicacao' | 'relatorios' | 'sistema';
  badge?: string;
  isNew?: boolean;
  isPremium?: boolean;
}

export default function PainelControle() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [filtroAtivo, setFiltroAtivo] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Verificar autenticação - sempre obrigatória
    const token = localStorage.getItem('eklesiakonecta_token');
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    
    if (!token) {
      console.log('Token não encontrado, redirecionando para login...');
      navigate('/login', {
        state: {
          message: 'Sessão expirada. Faça login novamente.'
        }
      });
      return;
    }
    
    if (!igrejaData) {
      console.log('Dados da igreja não encontrados, redirecionando para login...');
      navigate('/login');
      return;
    }
    
    try {
      const dados = JSON.parse(igrejaData);
      
      if (!dados.isLoggedIn) {
        console.log('Usuário não está marcado como logado, redirecionando para login...');
        navigate('/login');
        return;
      }
      
      // Configurar dados do usuário com perfil identificado
      const usuarioLogado: Usuario = {
        id: 1,
        nome: dados.nomePastor || 'Usuário',
        email: dados.emailPastor || '',
  perfil: dados.perfilUsuario || 'USUARIO' // Pastor, Tesoureiro, Secretário, Dirigente
      };
      
      setUsuario(usuarioLogado);
      console.log('Usuário autenticado:', usuarioLogado);
      console.log('Perfil de acesso:', usuarioLogado.perfil);
      
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      navigate('/login');
    }
  }, [navigate]);

  // Função de logout
  const handleLogout = () => {
    console.log('Fazendo logout...');
    
    // Limpar token
    localStorage.removeItem('eklesiakonecta_token');
    
    // Atualizar dados da igreja para marcar como não logado
    const igrejaData = localStorage.getItem('eklesiakonecta_igreja');
    if (igrejaData) {
      try {
        const dados = JSON.parse(igrejaData);
        dados.isLoggedIn = false;
        dados.token = null;
        dados.perfilUsuario = null;
        localStorage.setItem('eklesiakonecta_igreja', JSON.stringify(dados));
      } catch (error) {
        console.error('Erro ao atualizar dados da igreja:', error);
      }
    }
    
    // Redirecionar para login
    navigate('/login', {
      state: {
        message: 'Logout realizado com sucesso!'
      }
    });
  };

  const menuCards: MenuCard[] = [
    {
      id: 'biblia-digital',
      title: 'Bíblia Digital',
      description: 'Leia, ouça e assista capítulos da Bíblia em vários idiomas.',
      icon: <FaBookOpen />,
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      route: '/biblia',
      category: 'principal',
      badge: 'API',
      isNew: true
    },
    {
      id: 'permissoes',
      title: 'Permissões',
      description: 'Controle de acesso, cadastro e vinculação de usuários.',
      icon: <FaShieldAlt />,
      gradient: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
      route: '/permissoes',
      category: 'sistema',
      badge: 'Novo',
      isNew: true
    },
    // Card de Recuperar Senha (apenas para administrativos)
  ...(usuario && ['SUPERUSER', 'ADMIN', 'PASTOR', 'TESOUREIRO', 'SECRETARIO'].includes(usuario.perfil?.toUpperCase?.()) ? [
      {
        id: 'recuperar-senha',
        title: 'Recuperar Senha',
        description: 'Redefina sua senha ou auxilie membros.',
        icon: <FaShieldAlt />,
        gradient: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
        route: '/recuperar-senha',
        category: 'sistema' as const,
        isNew: true,
        badge: 'Segurança'
      }
    ] : []),
    {
      id: 'ministerios',
      title: 'Ministérios',
      description: 'Gestão avançada de departamentos, líderes e membros.',
      icon: <FaHandsHelping />,
      gradient: 'linear-gradient(135deg, #4f8cff 0%, #4fd1c5 100%)',
      route: '/ministerios',
      category: 'gestao',
      isNew: true,
      badge: 'Evoluído'
    },
    {
      id: 'ministerios-locais',
      title: 'Ministérios Locais',
      description: 'Gerencie departamentos específicos de cada congregação.',
      icon: <FaUsers />,
      gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      route: '/ministerios-locais',
      category: 'gestao',
      isNew: true
    },
    // Removido card duplicado de ministérios
    // FUNCIONALIDADES ADMIN
    {
      id: 'mensagens-celula',
      title: 'Mensagens da Célula',
      description: 'Gerencie e visualize mensagens e PDFs das células.',
      icon: <FaFilePdf />,
      gradient: 'linear-gradient(135deg, #8e44ad 0%, #6c3483 100%)',
      route: '/mensagens-celula',
      category: 'comunicacao',
      isNew: true
    },
    {
      id: 'cadastro-igreja',
      title: 'Cadastrar Igreja',
      description: 'Adicionar uma nova igreja ao sistema',
      icon: <FaChurch />,
      gradient: 'linear-gradient(135deg, #4f8cff 0%, #2563eb 100%)',
      route: '/churches',
      category: 'sistema',
      isNew: true
    },
    {
      id: 'cadastro-congregacao',
      title: 'Cadastrar Congregação',
      description: 'Adicionar uma nova congregação',
      icon: <FaChurch />,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      route: '/congregacoes',
      category: 'sistema',
      isNew: true
    },
    {
      id: 'cadastro-celula',
      title: 'Cadastrar Célula',
      description: 'Adicionar uma nova célula',
      icon: <FaHandsHelping />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      route: '/celulas',
      category: 'sistema',
      isNew: true
    },
    {
      id: 'config-email',
      title: 'Configurar E-mail',
      description: 'Configuração SMTP para notificações',
      icon: <FaEnvelope />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      route: '/config-email',
      category: 'sistema',
      isNew: true
    },
    {
      id: 'login-membro',
      title: 'Login do Membro',
      description: 'Acesso exclusivo para membros',
      icon: <FaUsers />,
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      route: '/login-membro',
      category: 'sistema',
      isNew: true
    },
    // PRINCIPAIS - GESTÃO DE PESSOAS
    {
      id: 'membros',
      title: 'Membros',
      description: 'Cadastro e gestão de membros da igreja',
      icon: <FaUsers />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: '/membros',
      category: 'principal',
      badge: '847'
    },
    {
      id: 'pastores',
      title: 'Pastores',
      description: 'Gestão de cadastro, edição e remoção de pastores.',
      icon: <FaUserTie />,
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      route: '/pastores',
      category: 'principal',
      badge: 'Novo',
      isNew: true
    },
    {
      id: 'congregacoes',
      title: 'Congregações',
      description: 'Administrar congregações e locais',
      icon: <FaChurch />,
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      route: '/congregacoes',
      category: 'gestao',
      badge: '5'
    },
    {
      id: 'usuarios',
      title: 'Usuários',
      description: 'Gestão de usuários e permissões',
      icon: <FaUserShield />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      route: '/usuarios',
      category: 'sistema',
      badge: '23'
    },

    // CÉLULAS, DISCIPULADO E ENCONTROS
    {
      id: 'celulas',
      title: 'Células',
      description: 'Grupos pequenos e comunhão',
      icon: <FaHandsHelping />,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      route: '/celulas',
      category: 'principal',
      badge: '34',
      isNew: true
    },
    {
      id: 'discipulado',
      title: 'Discipulado',
      description: 'Acompanhamento e crescimento espiritual',
      icon: <FaPray />,
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      route: '/discipulado',
      category: 'principal',
      badge: '67'
    },
    {
      id: 'encontros',
      title: 'Encontros',
      description: 'Gestão de encontros, reuniões e eventos especiais',
      icon: <FaCalendarAlt />,
      gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      route: '/encontros',
      category: 'principal',
      isNew: true
    },
    {
      id: 'escola-lideres',
      title: 'Escola de Líderes',
      description: 'Treinamento e capacitação ministerial',
      icon: <FaGraduationCap />,
      gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
      route: '/escola-lideres',
      category: 'gestao',
      badge: '156'
    },

    // FINANCEIRO - O CORAÇÃO DO SISTEMA
    {
      id: 'financeiro',
      title: 'Dashboard Financeiro',
      description: 'Visão geral das finanças da igreja',
      icon: <FaChartLine />,
      gradient: 'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)',
      route: '/dashboard-financeiro',
      category: 'financeiro',
      badge: 'HOT',
      isNew: true
    },
    {
      id: 'ofertas-dizimos',
      title: 'Ofertas & Dízimos',
      description: 'Registre ofertas ou dízimos com comprovante, valor e data.',
      icon: <FaHeart />,
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      route: '/ofertas',
      category: 'financeiro',
      badge: 'Novo',
      isNew: true
    },
    {
      id: 'despesas',
      title: 'Despesas',
      description: 'Controle de gastos e despesas gerais',
      icon: <FaCreditCard />,
      gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
      route: '/despesas',
      category: 'financeiro',
      badge: 'R$ 12.8K'
    },
    {
      id: 'faturas',
      title: 'Faturas',
      description: 'Gestão de faturas e cobranças',
      icon: <FaFileAlt />,
      gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)',
      route: '/faturas',
      category: 'financeiro',
      isNew: true
    },
    {
      id: 'receitas',
      title: 'Receitas',
      description: 'Registro de entradas financeiras',
      icon: <FaMoneyBillWave />,
      gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      route: '/receitas',
      category: 'financeiro',
      badge: 'R$ 78.5K'
    },
    {
      id: 'investimentos',
      title: 'Investimentos',
      description: 'Gestão de investimentos da igreja',
      icon: <FaChartLine />,
      gradient: 'linear-gradient(135deg, #fdcbf1 0%, #e6dee9 100%)',
      route: '/investimentos',
      category: 'financeiro',
      badge: 'R$ 125K',
      isPremium: true
    },

    // EVENTOS E PROGRAMAÇÃO
    {
      id: 'eventos',
      title: 'Eventos & Cultos',
      description: 'Programação e eventos da igreja',
      icon: <FaCalendarAlt />,
      gradient: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
      route: '/eventos',
      category: 'gestao',
      badge: '28'
    },
    {
      id: 'sermoes',
      title: 'Sermões',
      description: 'Biblioteca de sermões e pregações',
      icon: <FaBookOpen />,
      gradient: 'linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)',
      route: '/sermoes',
      category: 'gestao',
      badge: '342'
    },
    {
      id: 'ministerios',
      title: 'Ministérios',
      description: 'Gestão de ministérios e departamentos',
      icon: <FaMicrophone />,
      gradient: 'linear-gradient(135deg, #ff758c 0%, #ff7eb3 100%)',
      route: '/ministerios',
      category: 'gestao',
      badge: '18'
    },

    // COMUNICAÇÃO E MÍDIA
    {
      id: 'mensagens',
      title: 'Mensagens',
      description: 'Comunicação interna e avisos',
      icon: <FaEnvelope />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      route: '/mensagens',
      category: 'comunicacao',
      badge: '156'
    },
    {
      id: 'notificacoes',
      title: 'Notificações',
      description: 'WhatsApp, Email e comunicações',
      icon: <FaBell />,
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      route: '/notificacoes',
      category: 'comunicacao',
      badge: 'NEW',
      isNew: true
    },
    {
      id: 'lives',
      title: 'Transmissões',
      description: 'Lives e transmissões ao vivo',
      icon: <FaVideo />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: '/lives',
      category: 'comunicacao',
      badge: 'LIVE',
      isPremium: true
    },
    {
      id: 'radio',
      title: 'Web Rádio',
      description: 'Transmissão de rádio online',
      icon: <FaSatelliteDish />,
      gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      route: '/radio',
      category: 'comunicacao',
      badge: 'ON AIR',
      isPremium: true
    },

    // RELATÓRIOS E ANALYTICS
    {
      id: 'relatorios',
      title: 'Relatórios',
      description: 'Relatórios completos e estatísticas',
      icon: <FaFileAlt />,
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      route: '/relatorios',
      category: 'relatorios',
      badge: 'PDF'
    },
    {
      id: 'relatorio-exportacao',
      title: 'Exportar Relatório Mensal',
      description: 'Exportação de dizimistas em Excel/PDF',
      icon: <FaFileAlt />,
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      route: '/relatorio-exportacao',
      category: 'relatorios',
      isNew: true
    },
    {
      id: 'dashboard',
      title: 'Analytics',
      description: 'Dashboards e métricas avançadas',
      icon: <FaRocket />,
      gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
      route: '/dashboard',
      category: 'relatorios',
      badge: 'PRO',
      isPremium: true
    },

    // SISTEMA E CONFIGURAÇÕES
    {
      id: 'arquivos',
      title: 'Arquivos',
      description: 'Gestão de documentos e arquivos',
      icon: <FaArchive />,
      gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
      route: '/arquivos',
      category: 'sistema',
      badge: '2.1GB'
    },
    {
      id: 'logs',
      title: 'Logs do Sistema',
      description: 'Auditoria e logs de atividades',
      icon: <FaHistory />,
      gradient: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)',
      route: '/logs',
      category: 'sistema',
      badge: '1.2K'
    },
    {
      id: 'permissoes',
      title: 'Permissões',
      description: 'Controle de acesso e segurança',
      icon: <FaShieldAlt />,
      gradient: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)',
      route: '/permissoes',
      category: 'sistema',
      badge: 'SEC'
    },
    {
      id: 'backup',
      title: 'Backup',
      description: 'Backup e restauração de dados',
      icon: <FaDatabase />,
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      route: '/backup',
      category: 'sistema',
      badge: 'AUTO',
      isPremium: true
    },
    {
      id: 'configuracoes',
      title: 'Configurações',
      description: 'Configurações gerais do sistema',
      icon: <FaCog />,
      gradient: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
      route: '/configuracoes',
      category: 'sistema'
    }
  ];

  const categorias = [
    { id: 'todos', label: 'Todos os Módulos', icon: <FaFire /> },
    { id: 'principal', label: 'Gestão Principal', icon: <FaCrown /> },
    { id: 'financeiro', label: 'Financeiro', icon: <FaDollarSign /> },
    { id: 'gestao', label: 'Gestão Geral', icon: <FaChurch /> },
    { id: 'comunicacao', label: 'Comunicação', icon: <FaEnvelope /> },
    { id: 'relatorios', label: 'Relatórios', icon: <FaChartLine /> },
    { id: 'sistema', label: 'Sistema', icon: <FaCog /> }
  ];

  const cardsFiltrados = menuCards.filter(card => {
    const matchCategoria = filtroAtivo === 'todos' || card.category === filtroAtivo;
    const matchSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       card.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCategoria && matchSearch;
  });

  const handleCardClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="painel-admin">
      <Header variant="panel" showNavigation={true} />

      {/* Barra superior com informações do usuário */}
      <section className="user-info-section">
        <div className="user-info-container">
          <div className="user-details">
            {usuario && (
              <>
                <span className="user-name">Bem-vindo, {usuario.nome}</span>
                <span className="user-perfil">
                  {usuario.perfil === 'PASTOR' && '🧑‍💼 Pastor'}
                  {usuario.perfil === 'TESOUREIRO' && '💰 Tesoureiro'}
                  {usuario.perfil === 'SECRETARIO' && '📋 Secretário'}
                  {usuario.perfil === 'DIRIGENTE' && '👨‍💻 Dirigente'}
                  {!['PASTOR', 'TESOUREIRO', 'SECRETARIO', 'DIRIGENTE'].includes(usuario.perfil) && `👤 ${usuario.perfil}`}
                </span>
              </>
            )}
          </div>
          <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Sair do sistema"
          >
            <FaSignOutAlt />
            <span>Sair</span>
          </button>
        </div>
      </section>

      {/* Botão de cadastro de igreja (apenas para ADMIN/PASTOR) */}
  {usuario && ['SUPERUSER', 'ADMIN', 'PASTOR'].includes(usuario.perfil?.toUpperCase?.()) && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', margin: '1rem 2rem 0 0' }}>
          <button
            className="btn-cadastrar-igreja"
            style={{
              background: '#4f8cff', color: '#fff', border: 'none', borderRadius: 6, padding: '0.7rem 1.5rem', fontWeight: 600, cursor: 'pointer', fontSize: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.07)'
            }}
            onClick={() => navigate('/churches')}
          >
            <FaChurch style={{ marginRight: 8 }} /> Cadastrar Nova Igreja
          </button>
        </div>
      )}

      {/* Card de aniversariantes do dia - alerta para pastor/dirigente */}
      <section className="alerta-aniversariantes-section" style={{display:'flex',justifyContent:'center',margin:'32px 0'}}>
        <AniversariantesDoDia />
      </section>

      {/* Filtros de Categoria */}
      <section className="filtros-section">
        <div className="filtros-container">
        {/* ...existing cards... */}
        <div className="dashboard-card">
          <a href="/VisitantesCelulaPage">
            <img src="/public/favicon.png" alt="Visitantes" style={{ width: 48, height: 48 }} />
            <h3>Visitantes das Células</h3>
            <p>Cadastre e visualize visitantes vinculados às reuniões de célula.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/VisitantesCultoPage">
            <img src="/public/favicon.png" alt="Visitantes Culto" style={{ width: 48, height: 48 }} />
            <h3>Visitantes dos Cultos</h3>
            <p>Cadastre e visualize visitantes vinculados aos cultos.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/VendasPage">
            <img src="/public/favicon.png" alt="Vendas" style={{ width: 48, height: 48 }} />
            <h3>Gestão de Vendas</h3>
            <p>Cadastre, edite e visualize vendas e upgrades.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/LancamentoSemanalPage">
            <img src="/public/favicon.png" alt="Lançamento Semanal" style={{ width: 48, height: 48 }} />
            <h3>Lançamento Semanal</h3>
            <p>Entradas semanais das congregações da área.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/PermissoesPage">
            <img src="/public/favicon.png" alt="Permissões" style={{ width: 48, height: 48 }} />
            <h3>Permissões de Usuários</h3>
            <p>Gerencie permissões vinculadas aos usuários.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/UsuariosPage">
            <img src="/public/favicon.png" alt="Usuários" style={{ width: 48, height: 48 }} />
            <h3>Gestão de Usuários</h3>
            <p>Cadastre, edite e remova usuários do sistema.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/SermaoAIGenerator">
            <img src="/public/favicon.png" alt="SansãoIA" style={{ width: 48, height: 48 }} />
            <h3>SansãoIA</h3>
            <p>Gerador de sermão bíblico com IA.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/RecuperarSenha">
            <img src="/public/favicon.png" alt="Recuperar Senha" style={{ width: 48, height: 48 }} />
            <h3>Recuperar Senha</h3>
            <p>Solicite recuperação de senha por e-mail.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/RedefinirSenha">
            <img src="/public/favicon.png" alt="Redefinir Senha" style={{ width: 48, height: 48 }} />
            <h3>Redefinir Senha</h3>
            <p>Redefina sua senha usando o token recebido.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/ReuniaoCelula">
            <img src="/public/favicon.png" alt="Reuniões de Célula" style={{ width: 48, height: 48 }} />
            <h3>Reuniões de Célula</h3>
            <p>Cadastre, edite e visualize reuniões das células.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/relatorio-celulas">
            <img src="/public/favicon.png" alt="Relatório de Células" style={{ width: 48, height: 48 }} />
            <h3>Relatório de Células</h3>
            <p>Visualize o relatório das células cadastradas.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/relatorio-financeiro">
            <img src="/public/favicon.png" alt="Relatório Financeiro" style={{ width: 48, height: 48 }} />
            <h3>Relatório Financeiro</h3>
            <p>Visualize o relatório financeiro da igreja.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/relatorio-discipulado">
            <img src="/public/favicon.png" alt="Relatório Discipulado" style={{ width: 48, height: 48 }} />
            <h3>Relatório de Discipulado</h3>
            <p>Visualize o relatório de discipulado por discipulador.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/encontros">
            <img src="/public/favicon.png" alt="Encontros" style={{ width: 48, height: 48 }} />
            <h3>Registro de Encontros</h3>
            <p>Cadastre e consulte encontros realizados na igreja.</p>
          </a>
        </div>
        <div className="dashboard-card">
          <a href="/Receitas">
            <img src="/public/favicon.png" alt="Receitas" style={{ width: 48, height: 48 }} />
            <h3>Receitas Financeiras</h3>
            <p>Cadastro e consulta de receitas financeiras da igreja.</p>
          </a>
        </div>
          <div className="dashboard-card">
            <a href="/PresencasCelula">
              <img src="/public/favicon.png" alt="Presenças" style={{ width: 48, height: 48 }} />
              <h3>Presença nas Células</h3>
              <p>Registrar e consultar presenças de membros e discipulandos nas células.</p>
            </a>
          </div>
          {categorias.map(categoria => (
            <button
              key={categoria.id}
              className={`filtro-btn ${filtroAtivo === categoria.id ? 'ativo' : ''}`}
              onClick={() => setFiltroAtivo(categoria.id)}
            >
              {categoria.icon}
              <span>{categoria.label}</span>
              {categoria.id === 'todos' && <FaStar className="star-icon" />}
            </button>
          ))}
          <input
            type="text"
            className="search-input"
            placeholder="Buscar módulo..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ marginLeft: '1rem', padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid #ddd', fontSize: '1rem' }}
          />
        </div>
      </section>

      {/* Grid Principal de Cards */}
      <main className="painel-main">
        <div className="cards-grid">
          {cardsFiltrados.map((card, index) => (
            <div
              key={card.id}
              className={`menu-card ${card.isPremium ? 'premium' : ''} ${card.isNew ? 'new' : ''}`}
              onClick={() => handleCardClick(card.route)}
              style={{
                background: card.gradient,
                animationDelay: `${index * 0.1}s`
              }}
            >
              {card.isPremium && (
                <div className="premium-badge">
                  <FaGem /> PREMIUM
                </div>
              )}
              
              {card.isNew && (
                <div className="new-badge">
                  <FaBolt /> NOVO
                </div>
              )}

              <div className="card-icon-container">
                <div className="card-icon">
                  {card.icon}
                </div>
                <div className="icon-glow"></div>
              </div>

              <div className="card-content">
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </div>

              {card.badge && (
                <div className="card-badge">
                  {card.badge}
                </div>
              )}

              <div className="card-hover-effect">
                <FaRocket className="hover-icon" />
                <span>Acessar Módulo</span>
              </div>

              <div className="card-particles">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className={`card-particle card-particle-${i + 1}`}></div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {cardsFiltrados.length === 0 && (
          <div className="no-results">
            <FaMagic size={64} />
            <h3>Nenhum módulo encontrado</h3>
            <p>Tente buscar por outro termo ou categoria</p>
          </div>
        )}
      </main>

      {/* Footer com estatísticas */}
      <footer className="painel-footer">
        <div className="stats-container">
          <div className="stat-item">
            <FaUsers className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">847</span>
              <span className="stat-label">Membros</span>
            </div>
          </div>
          <div className="stat-item">
            <FaDollarSign className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">R$ 125K</span>
              <span className="stat-label">Arrecadado</span>
            </div>
          </div>
          <div className="stat-item">
            <FaHandsHelping className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">34</span>
              <span className="stat-label">Células Ativas</span>
            </div>
          </div>
          <div className="stat-item">
            <FaChartLine className="stat-icon" />
            <div className="stat-info">
              <span className="stat-number">+15%</span>
              <span className="stat-label">Crescimento</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}