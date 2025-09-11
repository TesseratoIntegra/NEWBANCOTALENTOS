// services/companyService.ts
import axios from 'axios';
import { Company, CompanyGroup, PaginatedResponse } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class CompanyService {
  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  /* Buscar todas as empresas com paginação */
  async getCompanies(params?: {
    page?: number;
    search?: string;
    group?: number;
  }): Promise<PaginatedResponse<Company>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.group) queryParams.append('group', params.group.toString());

      const response = await axios.get(`${this.baseUrl}/companies/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar empresas:', error);
      throw error;
    }
  }

  /* Buscar todas as empresas (simplificado para dropdowns) */
  async getAllCompanies(): Promise<Company[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/companies/`);
      // Se a resposta tiver paginação, retorna os results
      if (response.data.results) {
        return response.data.results;
      }
      // Caso contrário, assume que é um array direto
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar todas as empresas:', error);
      throw error;
    }
  }

  /* Buscar empresa por ID */
  async getCompanyById(id: number): Promise<Company> {
    try {
      const response = await axios.get(`${this.baseUrl}/companies/${id}/`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar empresa ${id}:`, error);
      throw error;
    }
  }

  /* Buscar empresa por slug */
  async getCompanyBySlug(slug: string): Promise<Company> {
    try {
      const response = await axios.get(`${this.baseUrl}/companies/`, {
        params: { slug }
      });
      
      if (response.data.results && response.data.results.length > 0) {
        return response.data.results[0];
      }
      
      throw new Error('Empresa não encontrada');
    } catch (error) {
      console.error(`Erro ao buscar empresa com slug ${slug}:`, error);
      throw error;
    }
  }

  /* Criar nova empresa */
  async createCompany(companyData: Partial<Company>): Promise<Company> {
    try {
      const response = await axios.post(`${this.baseUrl}/companies/`, companyData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar empresa:', error);
      throw error;
    }
  }

  /* Atualizar empresa existente */
  async updateCompany(id: number, companyData: Partial<Company>): Promise<Company> {
    try {
      const response = await axios.patch(`${this.baseUrl}/companies/${id}/`, companyData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar empresa ${id}:`, error);
      throw error;
    }
  }

  /* Deletar empresa */
  async deleteCompany(id: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/companies/${id}/`);
    } catch (error) {
      console.error(`Erro ao deletar empresa ${id}:`, error);
      throw error;
    }
  }

  /* Buscar grupos de empresas */
  async getCompanyGroups(params?: {
    page?: number;
    search?: string;
  }): Promise<PaginatedResponse<CompanyGroup>> {
    try {
      const queryParams = new URLSearchParams();
      
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);

      const response = await axios.get(`${this.baseUrl}/companies-groups/?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar grupos de empresas:', error);
      throw error;
    }
  }

  /* Upload de logo da empresa */
  async uploadCompanyLogo(companyId: number, logoFile: File): Promise<Company> {
    try {
      const formData = new FormData();
      formData.append('logo', logoFile);

      const response = await axios.patch(`${this.baseUrl}/companies/${companyId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Erro ao fazer upload de logo da empresa ${companyId}:`, error);
      throw error;
    }
  }

  /* Obter URL completa da logo */
  getLogoUrl(logoPath?: string): string | null {
    if (!logoPath) return null;
    
    // Se já for uma URL completa, retorna como está
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    
    // Caso contrário, constrói a URL completa
    return `${API_BASE_URL}${logoPath}`;
  }

  /* Validar CNPJ */
  isValidCNPJ(cnpj: string): boolean {
    if (!cnpj) return false;
    
    const numericCNPJ = cnpj.replace(/\D/g, '');
    
    // Verifica se tem 14 dígitos
    if (numericCNPJ.length !== 14) return false;
    
    // Verifica se não são todos iguais
    if (/^(\d)\1+$/.test(numericCNPJ)) return false;
    
    // Validação do algoritmo
    let sum = 0;
    let weight = 2;
    
    // Primeiro dígito verificador
    for (let i = 11; i >= 0; i--) {
      sum += parseInt(numericCNPJ.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    let digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    if (parseInt(numericCNPJ.charAt(12)) !== digit) return false;
    
    // Segundo dígito verificador
    sum = 0;
    weight = 2;
    
    for (let i = 12; i >= 0; i--) {
      sum += parseInt(numericCNPJ.charAt(i)) * weight;
      weight = weight === 9 ? 2 : weight + 1;
    }
    
    digit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
    return parseInt(numericCNPJ.charAt(13)) === digit;
  }

  /* Formatar CNPJ para exibição */
  formatCNPJ(cnpj: string): string {
    if (!cnpj) return '';
    
    const numericCNPJ = cnpj.replace(/\D/g, '');
    
    if (numericCNPJ.length === 14) {
      return numericCNPJ.replace(
        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
        '$1.$2.$3/$4-$5'
      );
    }
    
    return cnpj;
  }
}

const companyService = new CompanyService();
export default companyService;