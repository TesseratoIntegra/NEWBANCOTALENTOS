// services/adminApplicationService.ts
import axios from 'axios';
import { Application, InterviewSchedule, PaginatedResponse } from '@/types';
import AuthService from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class AdminApplicationService {
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

  /* Buscar TODAS as candidaturas (para admins) */
  async getAllApplications(params?: {
    page?: number;
    candidate?: number;
    job?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Application>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.candidate) queryParams.append('candidate', params.candidate.toString());
      if (params?.job) queryParams.append('job', params.job.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.search) queryParams.append('search', params.search);

      const response = await axios.get(
        `${this.baseUrl}/applications/?${queryParams.toString()}`,
        this.getAxiosConfig()
      );
      
      return response.data;
    } catch (error) {
      console.error('AdminApplicationService - Erro ao buscar candidaturas:', error);
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
      console.error(`AdminApplicationService - Erro ao buscar candidatura ${id}:`, error);
      throw error;
    }
  }

  /* Atualizar status da candidatura (admin/recruiter) */
  async updateApplicationStatus(id: number, status: string, notes?: string): Promise<Application> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/applications/${id}/update_status/`,
        { status, recruiter_notes: notes },
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`AdminApplicationService - Erro ao atualizar status da candidatura ${id}:`, error);
      throw error;
    }
  }

  /* Buscar estatísticas para admins */
  async getStatistics(): Promise<{
    total_applications: number;
    submitted: number;
    in_process: number;
    interview_scheduled: number;
    approved: number;
    rejected: number;
    withdrawn: number;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/applications/statistics/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('AdminApplicationService - Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  /* Buscar todas as entrevistas (para admins) */
  async getAllInterviews(params?: {
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
      console.error('AdminApplicationService - Erro ao buscar entrevistas:', error);
      throw error;
    }
  }

  /* Criar nova entrevista */
  async createInterview(interviewData: Partial<InterviewSchedule>): Promise<InterviewSchedule> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/interviews-schedules/`,
        interviewData,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('AdminApplicationService - Erro ao criar entrevista:', error);
      throw error;
    }
  }

  /* Atualizar entrevista */
  async updateInterview(id: number, interviewData: Partial<InterviewSchedule>): Promise<InterviewSchedule> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/interviews-schedules/${id}/`,
        interviewData,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error(`AdminApplicationService - Erro ao atualizar entrevista ${id}:`, error);
      throw error;
    }
  }
}

const adminApplicationService = new AdminApplicationService();
export default adminApplicationService;
