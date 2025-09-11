import axios from 'axios';
import Cookies from 'js-cookie';
import { User, RegisterRequest, AuthTokens } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';
const BASE_API_URL = `${API_URL}/api/${API_VERSION}`;

class AuthService {
  // Funções auxiliares
  getAccessToken() {
    return Cookies.get('accessToken');
  }

  getRefreshToken() {
    return Cookies.get('refreshToken');
  }

  setAccessToken(token: string) {
    Cookies.set('accessToken', token, {
      expires: 7, // 7 dias
      secure: window.location.protocol === 'https:',
      sameSite: 'strict'
    });
  }

  setRefreshToken(token: string) {
    Cookies.set('refreshToken', token, {
      expires: 7, // 7 dias
      secure: window.location.protocol === 'https:',
      sameSite: 'strict'
    });
  }

  setUser(user: User): void {
    Cookies.set('user', JSON.stringify(user), {
      expires: 7, // 7 dias
      secure: window.location.protocol === 'https:',
      sameSite: 'strict'
    });
  }

  getUser(): User | null {
    const userString = Cookies.get('user');
    return userString ? JSON.parse(userString) : null;
  }

  logout() {
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');
    Cookies.remove('user');
  }

  isTokenExpired(token: string): boolean {
    if (!token) return true;
    
    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  // Função para configurar interceptors
  setupAxiosInterceptors(): void {
    // Clear any existing interceptors to avoid duplicates
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();
    
    axios.interceptors.request.use(
      (config) => {
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Interceptor para lidar com tokens expirados/inválidos
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // Se o erro for 401 (não autorizado) e ainda não tentou renovar
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          const refreshToken = this.getRefreshToken();
          
          if (refreshToken) {
            try {
              // Tenta renovar o token usando o refresh token
              const response = await axios.post(`${BASE_API_URL}/accounts/token/refresh/`, {
                refresh: refreshToken,
              });
              
              const { access } = response.data;
              this.setAccessToken(access);
              
              // Refaz a requisição original com o novo token
              originalRequest.headers.Authorization = `Bearer ${access}`;
              return axios(originalRequest);
              
            } catch (refreshError) {
              // Se falhar ao renovar, faz logout
              this.logout();
              return Promise.reject(refreshError);
            }
          } else {
            // Se não há refresh token, faz logout
            this.logout();
          }
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Função para login
  async login(email: string, password: string): Promise<AuthTokens> {
    console.log('AuthService.login called with:', { email, password: '***' });
    console.log('BASE_API_URL:', BASE_API_URL);
    
    const response = await axios.post(`${BASE_API_URL}/accounts/login/`, {
      email,
      password,
    });

    console.log('AuthService.login response:', response.data);
    
    const { access, refresh, user } = response.data;
    
    this.setAccessToken(access);
    this.setRefreshToken(refresh);
    this.setUser(user);
    
    console.log('AuthService.login - tokens and user saved');
    
    return { user, access, refresh };
  }

  // Função para registro
  async register(userData: RegisterRequest): Promise<AuthTokens> {
    const response = await axios.post(`${BASE_API_URL}/registers/`, userData);
    
    const { access, refresh, user } = response.data;
    
    this.setAccessToken(access);
    this.setRefreshToken(refresh);
    this.setUser(user);
    
    return { user, access, refresh };
  }

  // Função para obter usuário atual
  async getCurrentUser(): Promise<User> {
    const token = this.getAccessToken();
    
    if (!token) {
      throw new Error('Token não encontrado');
    }

    // Primeiro tenta obter do storage local
    const localUser = this.getUser();
    if (localUser) {
      return localUser;
    }

    // Se não encontrar no storage, faz logout (dados corrompidos)
    throw new Error('Usuário não encontrado no storage local');
  }

  // Verificar se está autenticado
  isAuthenticated() {
    return !!this.getAccessToken();
  }

  // Verificar se o token é válido
  isTokenValid(token: string) {
    return !!token && token.length > 0;
  }

  // Renovar token manualmente
  async refreshToken() {
    const refreshTokenValue = this.getRefreshToken();
    
    if (!refreshTokenValue) {
      throw new Error('Refresh token não encontrado');
    }

    try {
      const response = await axios.post(`${BASE_API_URL}/accounts/token/refresh/`, {
        refresh: refreshTokenValue,
      });

      const { access } = response.data;
      this.setAccessToken(access);
      
      return access;
    } catch (error) {
      this.logout();
      throw error;
    }
  }
}

// Create a singleton instance
const authServiceInstance = new AuthService();

export default authServiceInstance;