// services/spontaneousService.ts
import axios from 'axios';
import { Occupation, SpontaneousApplication, PaginatedResponse } from '@/types';
import AuthService from '@/services/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class SpontaneousService {
  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  // === OCCUPATIONS ===

  /* Buscar ocupações (CBO) */
  async getOccupations(params?: {
    page?: number;
    search?: string;
  }): Promise<PaginatedResponse<Occupation>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);

      const response = await axios.get(`${this.baseUrl}/occupations/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ocupações:', error);
      throw error;
    }
  }

  /* Buscar ocupação por ID */
  async getOccupationById(id: number): Promise<Occupation> {
    try {
      const response = await axios.get(`${this.baseUrl}/occupations/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar ocupação ${id}:`, error);
      throw error;
    }
  }

  /* Buscar ocupação por código CBO */
  async getOccupationByCode(cboCode: string): Promise<Occupation> {
    try {
      const response = await axios.get(`${this.baseUrl}/occupations/`, {
        params: { cbo_code: cboCode }
      });
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      
      throw new Error('Ocupação não encontrada');
    } catch (error) {
      console.error(`Erro ao buscar ocupação com código ${cboCode}:`, error);
      throw error;
    }
  }

  /* Criar nova ocupação */
  async createOccupation(occupationData: Partial<Occupation>): Promise<Occupation> {
    try {
      const response = await axios.post(`${this.baseUrl}/occupations/`, occupationData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar ocupação:', error);
      throw error;
    }
  }

  /* Atualizar ocupação */
  async updateOccupation(id: number, occupationData: Partial<Occupation>): Promise<Occupation> {
    try {
      const response = await axios.patch(`${this.baseUrl}/occupations/${id}/`, occupationData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar ocupação ${id}:`, error);
      throw error;
    }
  }

  /* Deletar ocupação */
  async deleteOccupation(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/occupations/${id}/`);
    } catch (error) {
      console.error(`Erro ao deletar ocupação ${id}:`, error);
      throw error;
    }
  }

  // === SPONTANEOUS APPLICATIONS ===

  /* Buscar candidaturas espontâneas */
  async getSpontaneousApplications(params?: {
    page?: number;
    candidate?: number;
    occupation?: number;
    status?: string;
  }): Promise<PaginatedResponse<SpontaneousApplication>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.candidate) queryParams.append('candidate', params.candidate.toString());
      if (params?.occupation) queryParams.append('occupation', params.occupation.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await axios.get(`${this.baseUrl}/spontaneous-applications/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar candidaturas espontâneas:', error);
      throw error;
    }
  }

  /* Buscar candidatura espontânea por ID */
  async getSpontaneousApplicationById(id: number): Promise<SpontaneousApplication> {
    try {
      const response = await axios.get(`${this.baseUrl}/spontaneous-applications/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar candidatura espontânea ${id}:`, error);
      throw error;
    }
  }

  /* Criar nova candidatura espontânea */
  async createSpontaneousApplication(applicationData: Partial<SpontaneousApplication>): Promise<SpontaneousApplication> {
    try {
      const response = await axios.post(`${this.baseUrl}/spontaneous-applications/`, applicationData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar candidatura espontânea:', error);
      throw error;
    }
  }

  /* Atualizar candidatura espontânea */
  async updateSpontaneousApplication(id: number, applicationData: Partial<SpontaneousApplication>): Promise<SpontaneousApplication> {
    try {
      const response = await axios.patch(`${this.baseUrl}/spontaneous-applications/${id}/`, applicationData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar candidatura espontânea ${id}:`, error);
      throw error;
    }
  }

  /* Deletar candidatura espontânea */
  async deleteSpontaneousApplication(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/spontaneous-applications/${id}/`);
    } catch (error) {
      console.error(`Erro ao deletar candidatura espontânea ${id}:`, error);
      throw error;
    }
  }

  /* Buscar minhas candidaturas espontâneas */
  async getMySpontaneousApplications(params?: {
    page?: number;
    status?: string;
  }): Promise<PaginatedResponse<SpontaneousApplication>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await axios.get(`${this.baseUrl}/spontaneous-applications/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar minhas candidaturas espontâneas:', error);
      throw error;
    }
  }

  // === UTILITY METHODS ===

  /* Obter opções de status de candidatura espontânea */
  getSpontaneousApplicationStatusOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'active', label: 'Ativa' },
      { value: 'inactive', label: 'Inativa' },
      { value: 'contacted', label: 'Contatado' }
    ];
  }

  /* Obter label do status de candidatura espontânea */
  getSpontaneousApplicationStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      active: 'Ativa',
      inactive: 'Inativa',
      contacted: 'Contatado'
    };
    return statusMap[status] || status;
  }

  /* Buscar ocupações mais populares */
  async getPopularOccupations(limit: number = 10): Promise<Occupation[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/occupations/popular/`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar ocupações populares:', error);
      throw error;
    }
  }

  /* Buscar ocupações por categoria */
  async getOccupationsByCategory(category: string): Promise<PaginatedResponse<Occupation>> {
    try {
      const response = await axios.get(`${this.baseUrl}/occupations/`, {
        params: { category },
        headers: {
          Bearer: `Bearer ${AuthService.getAccessToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar ocupações da categoria ${category}:`, error);
      throw error;
    }
  }

  /* Verificar se o candidato já tem candidatura espontânea para uma ocupação */
  async hasApplicationForOccupation(occupationId: number): Promise<boolean> {
    try {
      const applications = await this.getMySpontaneousApplications();
      const existingApplication = applications.results.find(
        app => app.occupation === occupationId && app.status === 'active'
      );
      return !!existingApplication;
    } catch (error) {
      console.error('Erro ao verificar candidatura existente:', error);
      return false;
    }
  }

  /* Formatar código CBO */
  formatCBOCode(code: string): string {
    if (!code) return '';
    
    // Remove caracteres não numéricos
    const numericCode = code.replace(/\D/g, '');
    
    // Aplica formato XXXXXX (6 dígitos)
    if (numericCode.length === 6) {
      return numericCode.replace(/^(\d{4})(\d{2})$/, '$1-$2');
    }
    
    return code;
  }

  /* Validar código CBO */
  isValidCBOCode(code: string): boolean {
    if (!code) return false;
    
    const numericCode = code.replace(/\D/g, '');
    return numericCode.length === 6;
  }
}

const spontaneousService = new SpontaneousService();
export default spontaneousService;
