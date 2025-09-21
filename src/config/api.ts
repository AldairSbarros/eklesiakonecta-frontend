// Detecta automaticamente o ambiente
const isDevelopment = import.meta.env.DEV;

// Base URL da API (produção deve ser HTTPS sem porta)
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.eklesia.app.br';

const ensureLeadingSlash = (path: string) => (path.startsWith('/') ? path : `/${path}`);

// Função auxiliar para construir URLs de API
export const getApiUrl = (endpoint: string) => {
  const ep = ensureLeadingSlash(endpoint);
  if (isDevelopment) {
    // Em desenvolvimento, use proxy do Vite para "/api" (vite.config.ts)
    return ep;
  }
  // Em produção combine com base URL
  return `${API_URL}${ep}`;
};
