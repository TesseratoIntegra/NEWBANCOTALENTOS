// services/applicationService.ts
import apiClient from '@/lib/axios';
import { Application, InterviewSchedule, PaginatedResponse } from '@/types';

class ApplicationService {
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

      const response = await apiClient.get(`/applications/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar candidaturas:', error);
      throw error;
    }
  }

  /* Buscar candidatura por ID */
  async getApplicationById(id: number): Promise<Application> {
    try {
      const response = await apiClient.get(`/applications/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar candidatura ${id}:`, error);
      throw error;
    }
  }

  /* Criar nova candidatura (simplificado - backend preenche dados do perfil) */
  async createApplication(data: { job: number }): Promise<Application> {
    try {
      const response = await apiClient.post('/applications/', data);
      return response.data;
    } catch (error) {
      console.error('[applicationService] Erro ao criar candidatura:', error);
      throw error;
    }
  }

  /* Atualizar candidatura */
  async updateApplication(id: number, applicationData: Partial<Application>): Promise<Application> {
    try {
      const response = await apiClient.patch(`/applications/${id}/`, applicationData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar candidatura ${id}:`, error);
      throw error;
    }
  }

  /* Deletar candidatura */
  async deleteApplication(id: number): Promise<void> {
    try {
      await apiClient.delete(`/applications/${id}/`);
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

      const response = await apiClient.get(`/applications/my_applications/?${queryParams.toString()}`);
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

      const response = await apiClient.get(`/interviews-schedules/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar entrevistas agendadas:', error);
      throw error;
    }
  }

  /* Buscar entrevista por ID */
  async getInterviewScheduleById(id: number): Promise<InterviewSchedule> {
    try {
      const response = await apiClient.get(`/interviews-schedules/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar entrevista ${id}:`, error);
      throw error;
    }
  }

  /* Criar nova entrevista */
  async createInterviewSchedule(interviewData: Partial<InterviewSchedule>): Promise<InterviewSchedule> {
    try {
      const response = await apiClient.post('/interviews-schedules/', interviewData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar entrevista:', error);
      throw error;
    }
  }

  /* Atualizar entrevista */
  async updateInterviewSchedule(id: number, interviewData: Partial<InterviewSchedule>): Promise<InterviewSchedule> {
    try {
      const response = await apiClient.patch(`/interviews-schedules/${id}/`, interviewData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar entrevista ${id}:`, error);
      throw error;
    }
  }

  /* Deletar entrevista */
  async deleteInterviewSchedule(id: number): Promise<void> {
    try {
      await apiClient.delete(`/interviews-schedules/${id}/`);
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

      const response = await apiClient.get(`/interviews-schedules/me/?${queryParams.toString()}`);
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
