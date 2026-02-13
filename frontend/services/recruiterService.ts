import axios from 'axios';
import { Recruiter, CreateRecruiterRequest, UpdateRecruiterRequest } from '@/types';
import AuthService from '@/services/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class RecruiterService {
  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  private getAuthHeaders() {
    const token = AuthService.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getRecruiters(): Promise<Recruiter[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/recruiters/`, {
        headers: this.getAuthHeaders(),
      });
      if (response.data.results) {
        return response.data.results;
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar recrutadores:', error);
      throw error;
    }
  }

  async createRecruiter(data: CreateRecruiterRequest): Promise<Recruiter> {
    try {
      const response = await axios.post(`${this.baseUrl}/recruiters/`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao criar recrutador:', error);
      throw error;
    }
  }

  async updateRecruiter(id: number, data: UpdateRecruiterRequest): Promise<Recruiter> {
    try {
      const response = await axios.patch(`${this.baseUrl}/recruiters/${id}/`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar recrutador:', error);
      throw error;
    }
  }

  async deleteRecruiter(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/recruiters/${id}/`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error) {
      console.error('Erro ao deletar recrutador:', error);
      throw error;
    }
  }
}

const recruiterService = new RecruiterService();
export default recruiterService;
