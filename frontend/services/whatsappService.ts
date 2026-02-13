import axios from 'axios';
import { WhatsAppTemplate } from '@/types';
import AuthService from '@/services/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class WhatsAppService {
  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  private getAuthHeaders() {
    const token = AuthService.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getTemplates(): Promise<WhatsAppTemplate[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/whatsapp/templates/`, {
        headers: this.getAuthHeaders(),
      });
      if (response.data.results) {
        return response.data.results;
      }
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar templates WhatsApp:', error);
      throw error;
    }
  }

  async updateTemplate(id: number, data: Partial<WhatsAppTemplate>): Promise<WhatsAppTemplate> {
    try {
      const response = await axios.patch(`${this.baseUrl}/whatsapp/templates/${id}/`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar template WhatsApp:', error);
      throw error;
    }
  }
}

const whatsappService = new WhatsAppService();
export default whatsappService;
