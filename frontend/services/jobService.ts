// services/jobService.ts
import axios from 'axios';
import { Job, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class JobService {
  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  /* Busca todas as vagas ativas com paginação */
  async getJobs(params?: {
    page?: number;
    search?: string;
    job_type?: string;
    type_models?: string;
    location?: string;
    company?: number;
  }): Promise<PaginatedResponse<Job>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.job_type) queryParams.append('job_type', params.job_type);
      if (params?.type_models) queryParams.append('type_models', params.type_models);
      if (params?.location) queryParams.append('location', params.location);
      if (params?.company) queryParams.append('company', params.company.toString());

      const url = `${this.baseUrl}/jobs/?${queryParams.toString()}`;
      console.log('URL da requisição:', url);
      console.log('Parâmetros enviados:', params);
      
      const response = await axios.get(url);
        // Aceita tanto array simples quanto formato paginado
        if (Array.isArray(response.data)) {
          return {
            count: response.data.length,
            next: undefined,
            previous: undefined,
            results: response.data
          };
        }
        return response.data;
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      throw error;
    }
  }

  /* Busca uma vaga específica por ID */
  async getJobById(id: number): Promise<Job> {
    try {
      const response = await axios.get(`${this.baseUrl}/jobs/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar vaga ${id}:`, error);
      throw error;
    }
  }

  /* Busca vaga por slug */
  async getJobBySlug(slug: string): Promise<Job> {
    try {
      const response = await axios.get(`${this.baseUrl}/jobs/`, {
        params: { slug }
      });
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      
      throw new Error('Vaga não encontrada');
    } catch (error) {
      console.error(`Erro ao buscar vaga com slug ${slug}:`, error);
      throw error;
    }
  }

  /* Criar nova vaga (apenas para recrutadores) */
  async createJob(jobData: Partial<Job>): Promise<Job> {
    try {
      const response = await axios.post(`${this.baseUrl}/jobs/`, jobData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      throw error;
    }
  }

  /* Atualizar vaga existente */
  async updateJob(id: number, jobData: Partial<Job>): Promise<Job> {
    try {
      const response = await axios.patch(`${this.baseUrl}/jobs/${id}/`, jobData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar vaga ${id}:`, error);
      throw error;
    }
  }

  /* Deletar vaga */
  async deleteJob(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/jobs/${id}/`);
    } catch (error) {
      console.error(`Erro ao deletar vaga ${id}:`, error);
      throw error;
    }
  }

  /* Buscar vagas por empresa */
  async getJobsByCompany(companyId: number, params?: {
    page?: number;
    search?: string;
  }): Promise<PaginatedResponse<Job>> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('company', companyId.toString());
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);

      const response = await axios.get(`${this.baseUrl}/jobs/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar vagas da empresa ${companyId}:`, error);
      throw error;
    }
  }

  /* Buscar tipos de trabalho disponíveis */
  getJobTypes(): Array<{ value: string; label: string }> {
    return [
      { value: 'full_time', label: 'Tempo Integral' },
      { value: 'part_time', label: 'Meio Período' },
      { value: 'internship', label: 'Estágio' },
      { value: 'contract', label: 'Contrato Temporário' }
    ];
  }

  /* Buscar modelos de trabalho disponíveis */
  getWorkModels(): Array<{ value: string; label: string }> {
    return [
      { value: 'in_person', label: 'Presencial' },
      { value: 'home_office', label: 'Remoto' },
      { value: 'hybrid', label: 'Híbrido' }
    ];
  }

  /* Formatar tipo de trabalho para exibição */
  formatJobType(jobType: string): string {
    const types: Record<string, string> = {
      full_time: 'Tempo Integral',
      part_time: 'Meio Período',
      internship: 'Estágio',
      contract: 'Contrato Temporário',
    };
    
    return types[jobType] || jobType;
  }

  /* Formatar modelo de trabalho para exibição */
  formatWorkModel(workModel: string): string {
    const models: Record<string, string> = {
      in_person: 'Presencial',
      home_office: 'Remoto',
      hybrid: 'Híbrido',
    };
    
    return models[workModel] || workModel;
  }

  /* Formatar data para exibição */
  formatDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  }

  /* Formatar faixa salarial para exibição */
  formatSalary(salaryRange: string | null | undefined): string {
    if (!salaryRange) {
      return 'Salário a combinar';
    }
    
    try {
      // Se for um número, formatar como moeda
      const numericValue = parseFloat(salaryRange);
      if (!isNaN(numericValue)) {
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        }).format(numericValue);
      }
      
      // Se já for uma string formatada, retornar como está
      return salaryRange;
    } catch (error) {
      console.error('Erro ao formatar salário:', error);
      return salaryRange;
    }
  }

  /* Verificar se uma vaga está próxima do prazo */
  isClosingInDays(closureDate: string, days: number = 7): boolean {
    try {
      const closure = new Date(closureDate);
      const now = new Date();
      const diffTime = closure.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      return diffDays <= days && diffDays > 0;
    } catch (error) {
      console.error('Erro ao verificar prazo:', error);
      return false;
    }
  }

  /* Verificar se uma vaga está vencida */
  isExpired(closureDate: string): boolean {
    try {
      const closure = new Date(closureDate);
      const now = new Date();
      return closure < now;
    } catch (error) {
      console.error('Erro ao verificar expiração:', error);
      return false;
    }
  }
}

const jobService = new JobService();
export { jobService };
export default jobService;