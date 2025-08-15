// Detecta automaticamente o ambiente
const isDevelopment = import.meta.env.DEV;

// URL base da API para requisições
export const API_URL = isDevelopment 
  ? '' // Em desenvolvimento, usa o proxy local (caminho relativo)
  : 'http://api.eklesia.app.br:3001'; // Em produção, usa a URL completa

// Função auxiliar para construir URLs de API
export const getApiUrl = (endpoint: string) => {
  if (isDevelopment) {
    // Em desenvolvimento, retorna apenas o endpoint para usar o proxy
    return endpoint;
  } else {
    // Em produção, combina com a URL base
    return `${API_URL}${endpoint}`;
  }
};
