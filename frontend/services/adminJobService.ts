import { Job } from '@/types/index';
import AuthService from '@/services/auth';

export interface CreateJobData {
  title: string;
  description: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  type_models: 'in_person' | 'home_office' | 'hybrid';
  salary_range: string;
  requirements: string;
  responsibilities: string;
  closure: string;
  company: number;
  is_active?: boolean;
}

export type UpdateJobData = Partial<CreateJobData>;
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class AdminJobService {

  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  // Listar todas as vagas
  async getJobs(): Promise<Job[]> {
    try {
      const accessToken = AuthService.getAccessToken();
      if (!accessToken) {
        console.log("❌ Token de acesso não encontrado nos cookies");
        throw new Error("Token de acesso ausente");
      }
      const response = await fetch(`${this.baseUrl}/jobs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar vagas: ${response.status}`);
      }

      const data = await response.json();
      // Aceita tanto array simples quanto formato paginado
      if (Array.isArray(data)) {
        return data;
      }
      return data.results;
    } catch (error) {
      console.error('Erro ao buscar vagas:', error);
      throw error;
    }
  }

  // Buscar vaga por ID
  async getJobById(id: number): Promise<Job> {
    try {
        const accessToken = AuthService.getAccessToken();
        if (!accessToken) {
            console.log("❌ Token de acesso não encontrado nos cookies");
            throw new Error("Token de acesso ausente");
        }
      const response = await fetch(`${this.baseUrl}/jobs/${id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar vaga: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar vaga:', error);
      throw error;
    }
  }

  // Criar nova vaga
  async createJob(jobData: CreateJobData): Promise<Job> {
    try {
        const accessToken = AuthService.getAccessToken();
        if (!accessToken) {
            console.log("❌ Token de acesso não encontrado nos cookies");
            throw new Error("Token de acesso ausente");
        }
      const response = await fetch(`${this.baseUrl}/jobs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao criar vaga: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao criar vaga:', error);
      throw error;
    }
  }

  // Atualizar vaga
  async updateJob(id: number, jobData: UpdateJobData): Promise<Job> {
    try {
        const accessToken = AuthService.getAccessToken();
        if (!accessToken) {
            console.log("❌ Token de acesso não encontrado nos cookies");
            throw new Error("Token de acesso ausente");
        }
      const response = await fetch(`${this.baseUrl}/jobs/${id}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(jobData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar vaga: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao atualizar vaga:', error);
      throw error;
    }
  }

  // Deletar vaga
  async deleteJob(id: number): Promise<void> {
    try {
        const accessToken = AuthService.getAccessToken();
        if (!accessToken) {
            console.log("❌ Token de acesso não encontrado nos cookies");
            throw new Error("Token de acesso ausente");
        }
      const response = await fetch(`${this.baseUrl}/jobs/${id}/`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao deletar vaga: ${response.status}`);
      }
    } catch (error) {
      console.error('Erro ao deletar vaga:', error);
      throw error;
    }
  }
}

export const adminJobService = new AdminJobService();
