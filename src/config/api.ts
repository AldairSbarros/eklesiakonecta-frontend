// Configuração da API
export const API_CONFIG = {
  baseURL: 'https://api.eklesia.app.br:3001',
  endpoints: {
    auth: '/api/auth/login',
    cadastro: '/api/cadastro-inicial',
    test: '/test'
  }
};

export const getApiUrl = (endpoint: string) => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};
