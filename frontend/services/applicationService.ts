// services/applicationService.ts
import axios from 'axios';
import { Application, InterviewSchedule, PaginatedResponse } from '@/types';
import AuthService from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class ApplicationService {
  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  // Helper method to get axios config with auth headers
  private getAuthHeaders() {
    const token = AuthService.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Helper method to create axios config with auth headers
  private getAxiosConfig(config?: { headers?: Record<string, string> }) {
    return {
      ...config,
      headers: {
        ...this.getAuthHeaders(),
        ...config?.headers,
      },
    };
  }

  // === APPLICATIONS ===

  /* Buscar candidaturas */
  async getApplications(params?: {
    page?: number;
    candidate?: number;
    job?: number;
    status?: string;
  }): Promise<PaginatedResponse<Application>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.candidate) queryParams.append('candidate', params.candidate.toString());
      if (params?.job) queryParams.append('job', params.job.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await axios.get(
        `${this.baseUrl}/applications/?${queryParams.toString()}`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error);
      throw error;
    }
  }

  /* Buscar candidatura por ID */
  async getApplicationById(id: number): Promise<Application> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/applications/${id}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar candidatura ${id}:`, error);
      throw error;
    }
  }

  /* Criar nova candidatura */
  async createApplication(applicationData: {
    job: number;
    name: string;
    phone: string;
    state: string;
    city: string;
    linkedin?: string;
    portfolio?: string;
    resume: File;
    cover_letter?: string;
    salary_expectation?: number;
    observations?: string;
  }): Promise<Application> {
    try {
      const formData = new FormData();
      
      // Campos obrigatórios
      formData.append('job', applicationData.job.toString());
      formData.append('name', applicationData.name);
      formData.append('phone', applicationData.phone);
      formData.append('state', applicationData.state);
      formData.append('city', applicationData.city);
      formData.append('resume', applicationData.resume);
      
      // Campos opcionais
      if (applicationData.linkedin) formData.append('linkedin', applicationData.linkedin);
      if (applicationData.portfolio) formData.append('portfolio', applicationData.portfolio);
      if (applicationData.cover_letter) formData.append('cover_letter', applicationData.cover_letter);
      if (applicationData.observations) formData.append('observations', applicationData.observations);
      if (applicationData.salary_expectation) {
        formData.append('salary_expectation', applicationData.salary_expectation.toString());
      }
      
      const response = await axios.post(
        `${this.baseUrl}/applications/`,
        formData,
        this.getAxiosConfig({
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar candidatura:', error);
      throw error;
    }
  }

  /* Atualizar candidatura */
  async updateApplication(id: number, applicationData: Partial<Application>): Promise<Application> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/applications/${id}/`,
        applicationData,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar candidatura ${id}:`, error);
      throw error;
    }
  }

  /* Deletar candidatura */
  async deleteApplication(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/applications/${id}/`,
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error(`Erro ao deletar candidatura ${id}:`, error);
      throw error;
    }
  }

  /* Buscar candidaturas do usuário atual */
  async getMyApplications(params?: {
    page?: number;
    status?: string;
  }): Promise<PaginatedResponse<Application> | Application[]> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await axios.get(
        `${this.baseUrl}/applications/my_applications/?${queryParams.toString()}`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar minhas candidaturas:', error);
      throw error;
    }
  }

  // === INTERVIEWS ===

  /* Buscar entrevistas agendadas */
  async getInterviewSchedules(params?: {
    page?: number;
    application?: number;
    status?: string;
  }): Promise<PaginatedResponse<InterviewSchedule>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.application) queryParams.append('application', params.application.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await axios.get(
        `${this.baseUrl}/interviews-schedules/?${queryParams.toString()}`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar entrevistas agendadas:', error);
      throw error;
    }
  }

  /* Buscar entrevista por ID */
  async getInterviewScheduleById(id: number): Promise<InterviewSchedule> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/interviews-schedules/${id}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar entrevista ${id}:`, error);
      throw error;
    }
  }

  /* Criar nova entrevista */
  async createInterviewSchedule(interviewData: Partial<InterviewSchedule>): Promise<InterviewSchedule> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/interviews-schedules/`,
        interviewData,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar entrevista:', error);
      throw error;
    }
  }

  /* Atualizar entrevista */
  async updateInterviewSchedule(id: number, interviewData: Partial<InterviewSchedule>): Promise<InterviewSchedule> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/interviews-schedules/${id}/`,
        interviewData,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar entrevista ${id}:`, error);
      throw error;
    }
  }

  /* Deletar entrevista */
  async deleteInterviewSchedule(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/interviews-schedules/${id}/`,
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error(`Erro ao deletar entrevista ${id}:`, error);
      throw error;
    }
  }

  /* Buscar minhas entrevistas */
  async getMyInterviewSchedules(params?: {
    page?: number;
    status?: string;
  }): Promise<PaginatedResponse<InterviewSchedule>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.status) queryParams.append('status', params.status);

      const response = await axios.get(
        `${this.baseUrl}/interviews-schedules/me/?${queryParams.toString()}`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar minhas entrevistas:', error);
      throw error;
    }
  }

  // === UTILITY METHODS ===

  /* Obter opções de status de candidatura */
  getApplicationStatusOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'pending', label: 'Pendente' },
      { value: 'reviewing', label: 'Em Análise' },
      { value: 'approved', label: 'Aprovado' },
      { value: 'rejected', label: 'Rejeitado' },
      { value: 'interview_scheduled', label: 'Entrevista Agendada' },
      { value: 'hired', label: 'Contratado' }
    ];
  }

  /* Obter label do status de candidatura */
  getApplicationStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      pending: 'Pendente',
      reviewing: 'Em Análise',
      approved: 'Aprovado',
      rejected: 'Rejeitado',
      interview_scheduled: 'Entrevista Agendada',
      hired: 'Contratado'
    };
    return statusMap[status] || status;
  }

  /* Obter opções de tipo de entrevista */
  getInterviewTypeOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'online', label: 'Online' },
      { value: 'in_person', label: 'Presencial' },
      { value: 'phone', label: 'Telefone' }
    ];
  }

  /* Obter opções de status de entrevista */
  getInterviewStatusOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'scheduled', label: 'Agendada' },
      { value: 'completed', label: 'Concluída' },
      { value: 'cancelled', label: 'Cancelada' },
      { value: 'rescheduled', label: 'Reagendada' }
    ];
  }

  /* Obter label do status de entrevista */
  getInterviewStatusLabel(status: string): string {
    const statusMap: Record<string, string> = {
      scheduled: 'Agendada',
      completed: 'Concluída',
      cancelled: 'Cancelada',
      rescheduled: 'Reagendada'
    };
    return statusMap[status] || status;
  }

  /* Verificar se o usuário pode se candidatar a uma vaga */
  async canApplyToJob(jobId: number): Promise<boolean> {
    try {
      const applications = await this.getMyApplications();
      
      // Verificar se é um array direto ou resposta paginada
      const applicationsList = Array.isArray(applications) 
        ? applications 
        : applications.results;
      
      const existingApplication = applicationsList.find((app: Application) => app.job === jobId);
      return !existingApplication;
    } catch (error) {
      console.error('Erro ao verificar se pode se candidatar:', error);
      return false;
    }
  }

  /* Formatar data de entrevista */
  formatInterviewDate(dateString: string): string {
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erro ao formatar data de entrevista:', error);
      return dateString;
    }
  }
}

const applicationService = new ApplicationService();
export default applicationService;
