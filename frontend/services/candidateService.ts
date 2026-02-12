// services/candidateService.ts
import axios from 'axios';
import {
  CandidateProfile,
  CandidateEducation,
  CandidateExperience,
  CandidateSkill,
  CandidateLanguage,
  PaginatedResponse,
  CandidateNotificationsResponse
} from '@/types';

import AuthService from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class CandidateService {
  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  // Helper method to get axios config with auth headers
  private getAuthHeaders() {
    const token = AuthService.getAccessToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Helper method to create axios config with auth headers
  private getAxiosConfig(config?: { headers?: Record<string, string>; params?: any }) {
    return {
      ...config,
      headers: {
        ...this.getAuthHeaders(),
        ...config?.headers,
      },
    };
  }

  // === CANDIDATE PROFILE ===

  /* Buscar perfil do candidato */
  async getCandidateProfile(candidateId?: number): Promise<CandidateProfile> {
    try {
      const url = candidateId
        ? `${this.baseUrl}/candidates/profiles/${candidateId}/`
        : `${this.baseUrl}/candidates/profiles/me/`;

      const response = await axios.get(url, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil do candidato:', error);
      throw error;
    }
  }

  async getAllCandidates(params?: {
    page?: number;
    search?: string;
    education_level?: string;
    available_for_work?: boolean;
    accepts_remote_work?: boolean;
    accepts_relocation?: boolean;
    can_travel?: boolean;
    experience_years_min?: number;
    experience_years_max?: number;
    applied_to_job?: number;
    profile_status?: string;
  }): Promise<PaginatedResponse<CandidateProfile>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.education_level) queryParams.append('education_level', params.education_level);
      if (params?.available_for_work !== undefined) queryParams.append('available_for_work', params.available_for_work.toString());
      if (params?.accepts_remote_work !== undefined) queryParams.append('accepts_remote_work', params.accepts_remote_work.toString());
      if (params?.accepts_relocation !== undefined) queryParams.append('accepts_relocation', params.accepts_relocation.toString());
      if (params?.can_travel !== undefined) queryParams.append('can_travel', params.can_travel.toString());
      if (params?.experience_years_min !== undefined) queryParams.append('experience_years__gte', params.experience_years_min.toString());
      if (params?.experience_years_max !== undefined) queryParams.append('experience_years__lte', params.experience_years_max.toString());
      if (params?.applied_to_job !== undefined) queryParams.append('applied_to_job', params.applied_to_job.toString());
      if (params?.profile_status) queryParams.append('pipeline_status', params.profile_status);

      const url = `${this.baseUrl}/candidates/profiles/?${queryParams.toString()}`;
      const response = await axios.get(url, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      throw error;
    }
  }

  /* Criar perfil do candidato */
  async createCandidateProfile(profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/profiles/`, profileData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao criar perfil do candidato:', error);
      throw error;
    }
  }

  /* Atualizar perfil do candidato */
  async updateCandidateProfile(profileId: number, profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/profiles/${profileId}/`, profileData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar perfil do candidato:', error);
      throw error;
    }
  }

  /* Upload de imagem de perfil */
  async uploadProfileImage(profileId: number, imageFile: File): Promise<CandidateProfile> {
    try {
      const formData = new FormData();
      formData.append('image_profile', imageFile);

      const response = await axios.patch(
        `${this.baseUrl}/candidates/profiles/${profileId}/`,
        formData,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem de perfil:', error);
      throw error;
    }
  }

  /* Atualizar status do perfil (aprovar/reprovar) - apenas recrutadores/admin */
  async updateProfileStatus(
    candidateId: number,
    status: 'approved' | 'rejected' | 'changes_requested',
    observations?: string
  ): Promise<{ message: string; profile_status: string; profile_observations: string; profile_reviewed_at: string; pending_observation_sections: string[] }> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/candidates/profiles/${candidateId}/update-profile-status/`,
        { status, observations },
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar status do perfil:', error);
      throw error;
    }
  }

  // === EDUCATION ===

  /* Buscar educação do candidato */
  async getCandidateEducations(candidateId?: number): Promise<PaginatedResponse<CandidateEducation>> {
    try {
      const params = candidateId ? { candidate: candidateId } : {};
      const response = await axios.get(`${this.baseUrl}/candidates/educations/`, this.getAxiosConfig({ params }));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar educação do candidato:', error);
      throw error;
    }
  }

  /* Criar educação do candidato */
  async createCandidateEducation(educationData: Partial<CandidateEducation>): Promise<CandidateEducation> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/educations/`, educationData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao criar educação do candidato:', error);
      throw error;
    }
  }

  /* Atualizar educação do candidato */
  async updateCandidateEducation(educationId: number, educationData: Partial<CandidateEducation>): Promise<CandidateEducation> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/educations/${educationId}/`, educationData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar educação do candidato:', error);
      throw error;
    }
  }

  /* Deletar educação do candidato */
  async deleteCandidateEducation(educationId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/candidates/educations/${educationId}/`, this.getAxiosConfig());
    } catch (error) {
      console.error('Erro ao deletar educação do candidato:', error);
      throw error;
    }
  }

  // === EXPERIENCE ===

  /* Buscar experiência do candidato */
  async getCandidateExperiences(candidateId?: number): Promise<PaginatedResponse<CandidateExperience>> {
    try {
      const params = candidateId ? { candidate: candidateId } : {};
      const response = await axios.get(`${this.baseUrl}/candidates/experiences/`, this.getAxiosConfig({ params }));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar experiência do candidato:', error);
      throw error;
    }
  }

  /* Criar experiência do candidato */
  async createCandidateExperience(experienceData: Partial<CandidateExperience>): Promise<CandidateExperience> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/experiences/`, experienceData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao criar experiência do candidato:', error);
      throw error;
    }
  }

  /* Atualizar experiência do candidato */
  async updateCandidateExperience(experienceId: number, experienceData: Partial<CandidateExperience>): Promise<CandidateExperience> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/experiences/${experienceId}/`, experienceData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar experiência do candidato:', error);
      throw error;
    }
  }

  /* Deletar experiência do candidato */
  async deleteCandidateExperience(experienceId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/candidates/experiences/${experienceId}/`, this.getAxiosConfig());
    } catch (error) {
      console.error('Erro ao deletar experiência do candidato:', error);
      throw error;
    }
  }

  // === SKILLS ===

  /* Buscar habilidades do candidato */
  async getCandidateSkills(candidateId?: number): Promise<PaginatedResponse<CandidateSkill>> {
    try {
      const params = candidateId ? { candidate: candidateId } : {};
      const response = await axios.get(`${this.baseUrl}/candidates/skills/`, this.getAxiosConfig({ params }));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar habilidades do candidato:', error);
      throw error;
    }
  }
    /** Buscar todos os idiomas (sem paginação) */
    async fetchAllLanguages(): Promise<CandidateLanguage[]> {
      try {
        const response = await axios.get(`${this.baseUrl}/candidates/languages/`, this.getAxiosConfig());
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar todos os idiomas:', error);
        throw error;
      }
    }

  /* Criar habilidade do candidato */
  async createCandidateSkill(skillData: Partial<CandidateSkill>): Promise<CandidateSkill> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/skills/`, skillData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao criar habilidade do candidato:', error);
      throw error;
    }
  }

  /* Atualizar habilidade do candidato */
  async updateCandidateSkill(skillId: number, skillData: Partial<CandidateSkill>): Promise<CandidateSkill> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/skills/${skillId}/`, skillData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar habilidade do candidato:', error);
      throw error;
    }
  }

  /* Deletar habilidade do candidato */
  async deleteCandidateSkill(skillId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/candidates/skills/${skillId}/`, this.getAxiosConfig());
    } catch (error) {
      console.error('Erro ao deletar habilidade do candidato:', error);
      throw error;
    }
  }

  // === LANGUAGES ===

  /* Buscar idiomas do candidato */
  async getCandidateLanguages(candidateId?: number): Promise<PaginatedResponse<CandidateLanguage>> {
    try {
      const params = candidateId ? { candidate: candidateId } : {};
      const response = await axios.get(`${this.baseUrl}/candidates/languages/`, this.getAxiosConfig({ params }));
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar idiomas do candidato:', error);
      throw error;
    }
  }

  /* Criar idioma do candidato */
  async createCandidateLanguage(languageData: Partial<CandidateLanguage>): Promise<CandidateLanguage> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/languages/`, languageData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao criar idioma do candidato:', error);
      throw error;
    }
  }

  /* Atualizar idioma do candidato */
  async updateCandidateLanguage(languageId: number, languageData: Partial<CandidateLanguage>): Promise<CandidateLanguage> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/languages/${languageId}/`, languageData, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar idioma do candidato:', error);
      throw error;
    }
  }

  /* Deletar idioma do candidato */
  async deleteCandidateLanguage(languageId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/candidates/languages/${languageId}/`, this.getAxiosConfig());
    } catch (error) {
      console.error('Erro ao deletar idioma do candidato:', error);
      throw error;
    }
  }

  // === NOTIFICATIONS ===

  async getMyNotifications(): Promise<CandidateNotificationsResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidates/profiles/me/notifications/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return { count: 0, notifications: [] };
    }
  }

  // === DASHBOARD ===

  async getDashboardStats(): Promise<{ total: number; distribution: Record<string, number> }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidates/profiles/dashboard-stats/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas do dashboard:', error);
      throw error;
    }
  }

  async getAIInsights(): Promise<import('@/types').AIInsightsResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidates/profiles/ai-insights/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar insights da IA:', error);
      throw error;
    }
  }

  // === UTILITY METHODS ===

  /* Obter opções de nível de escolaridade */
  getEducationLevels(): Array<{ value: string; label: string }> {
    return [
      { value: 'fundamental', label: 'Ensino Fundamental' },
      { value: 'medio', label: 'Ensino Médio' },
      { value: 'tecnico', label: 'Técnico' },
      { value: 'superior', label: 'Superior' },
      { value: 'pos_graduacao', label: 'Pós-graduação' },
      { value: 'mestrado', label: 'Mestrado' },
      { value: 'doutorado', label: 'Doutorado' }
    ];
  }

  /* Obter opções de nível de habilidade */
  getSkillLevels(): Array<{ value: string; label: string }> {
    return [
      { value: 'beginner', label: 'Iniciante' },
      { value: 'intermediate', label: 'Intermediário' },
      { value: 'advanced', label: 'Avançado' },
      { value: 'expert', label: 'Especialista' }
    ];
  }

  /* Obter opções de proficiência em idiomas */
  getLanguageProficiencyLevels(): Array<{ value: string; label: string }> {
    return [
      { value: 'basic', label: 'Básico' },
      { value: 'intermediate', label: 'Intermediário' },
      { value: 'advanced', label: 'Avançado' },
      { value: 'fluent', label: 'Fluente' },
      { value: 'native', label: 'Nativo' }
    ];
  }

  /* Obter opções de gênero */
  getGenderOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'M', label: 'Masculino' },
      { value: 'F', label: 'Feminino' },
      { value: 'O', label: 'Outro' },
      { value: 'N', label: 'Prefiro não informar' }
    ];
  }

  /* Obter opções de turno de trabalho */
  getWorkShiftOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'morning', label: 'Manhã' },
      { value: 'afternoon', label: 'Tarde' },
      { value: 'night', label: 'Noite' },
      { value: 'flexible', label: 'Flexível' }
    ];
  }

  /* Obter opções de status do pipeline */
  getProfileStatusOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'pending', label: 'Em análise' },
      { value: 'awaiting_review', label: 'Aguardando Revisão' },
      { value: 'approved', label: 'Aprovado' },
      { value: 'documents_pending', label: 'Docs. Pendentes' },
      { value: 'in_selection_process', label: 'Em Proc. Seletivo' },
      { value: 'documents_complete', label: 'Docs. Completos' },
      { value: 'admission_in_progress', label: 'Em Admissão' },
      { value: 'admitted', label: 'Admitido' },
      { value: 'rejected', label: 'Reprovado' },
      { value: 'changes_requested', label: 'Aguardando Candidato' },
    ];
  }

  /* Obter label e cor do status do pipeline */
  getProfileStatusLabel(status: string): { label: string; color: string; bgColor: string } {
    const statusMap: Record<string, { label: string; color: string; bgColor: string }> = {
      pending: { label: 'Em análise', color: 'text-amber-700', bgColor: 'bg-amber-100' },
      awaiting_review: { label: 'Aguardando Revisão', color: 'text-blue-700', bgColor: 'bg-blue-100' },
      approved: { label: 'Aprovado', color: 'text-green-700', bgColor: 'bg-green-100' },
      documents_pending: { label: 'Docs. Pendentes', color: 'text-violet-700', bgColor: 'bg-violet-100' },
      in_selection_process: { label: 'Em Proc. Seletivo', color: 'text-cyan-700', bgColor: 'bg-cyan-100' },
      documents_complete: { label: 'Docs. Completos', color: 'text-teal-700', bgColor: 'bg-teal-100' },
      admission_in_progress: { label: 'Em Admissão', color: 'text-indigo-700', bgColor: 'bg-indigo-100' },
      admitted: { label: 'Admitido', color: 'text-emerald-800', bgColor: 'bg-emerald-200' },
      rejected: { label: 'Reprovado', color: 'text-red-700', bgColor: 'bg-red-100' },
      changes_requested: { label: 'Aguardando Candidato', color: 'text-orange-700', bgColor: 'bg-orange-100' },
    };
    return statusMap[status] || statusMap.pending;
  }
}

const candidateService = new CandidateService();
export default candidateService;
