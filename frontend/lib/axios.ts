// lib/axios.ts
import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

// Criar instância configurada do Axios
// IMPORTANTE: NÃO definir Content-Type aqui para permitir que o axios
// detecte automaticamente (application/json para objetos, multipart/form-data para FormData)
const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api/${API_VERSION}`,
  timeout: 30000, // 30 segundos - importante para uploads e redes lentas
});

// Helper para obter token de forma segura (funciona no cliente e servidor)
const getAccessToken = (): string | undefined => {
  if (typeof window === 'undefined') return undefined;

  try {
    // Tentar obter do cookie usando browser API
    const cookies = document.cookie.split(';');
    const tokenCookie = cookies.find(c => c.trim().startsWith('accessToken='));
    return tokenCookie ? tokenCookie.split('=')[1] : undefined;
  } catch {
    return undefined;
  }
};

// Interceptor de requisição: adiciona token de autenticação automaticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta: trata erros globalmente
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Erro 401: Redireciona para login
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }

    // Erro de timeout
    if (error.code === 'ECONNABORTED') {
      error.message = 'Tempo esgotado. Verifique sua conexão e tente novamente.';
    }

    // Erro de rede (sem resposta do servidor)
    if (!error.response) {
      error.message = 'Sem conexão com o servidor. Verifique sua internet.';
    }

    // Erro 500+
    if (error.response?.status && error.response.status >= 500) {
      error.message = 'Erro no servidor. Tente novamente em alguns minutos.';
    }

    return Promise.reject(error);
  }
);

export default apiClient;
