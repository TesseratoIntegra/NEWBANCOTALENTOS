// services/candidateService.ts
import axios from 'axios';
import { 
  CandidateProfile, 
  CandidateEducation, 
  CandidateExperience, 
  CandidateSkill, 
  CandidateLanguage,
  PaginatedResponse 
} from '@/types';

import AuthService from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class CandidateService {
  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  // === CANDIDATE PROFILE ===
  
  /* Buscar perfil do candidato */
  async getCandidateProfile(candidateId?: number): Promise<CandidateProfile> {
    try {
      const url = candidateId 
        ? `${this.baseUrl}/candidates/profiles/${candidateId}/`
        : `${this.baseUrl}/candidates/profiles/me/`;
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfil do candidato:', error);
      throw error;
    }
  }

  async getAllCandidates(): Promise<CandidateProfile> {
    try {
      const url = `${this.baseUrl}/candidates/profiles/`;
      const token = AuthService.getAccessToken();
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const response = await axios.get(url, { headers });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar candidatos:', error);
      throw error;
    }
  }

  /* Criar perfil do candidato */
  async createCandidateProfile(profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/profiles/`, profileData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar perfil do candidato:', error);
      throw error;
    }
  }

  /* Atualizar perfil do candidato */
  async updateCandidateProfile(profileId: number, profileData: Partial<CandidateProfile>): Promise<CandidateProfile> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/profiles/${profileId}/`, profileData);
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
      
      const response = await axios.patch(`${this.baseUrl}/candidates/profiles/${profileId}/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao fazer upload da imagem de perfil:', error);
      throw error;
    }
  }

  // === EDUCATION ===

  /* Buscar educação do candidato */
  async getCandidateEducations(candidateId?: number): Promise<PaginatedResponse<CandidateEducation>> {
    try {
      const params = candidateId ? { candidate: candidateId } : {};
      const response = await axios.get(`${this.baseUrl}/candidates/educations/`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar educação do candidato:', error);
      throw error;
    }
  }

  /* Criar educação do candidato */
  async createCandidateEducation(educationData: Partial<CandidateEducation>): Promise<CandidateEducation> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/educations/`, educationData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar educação do candidato:', error);
      throw error;
    }
  }

  /* Atualizar educação do candidato */
  async updateCandidateEducation(educationId: number, educationData: Partial<CandidateEducation>): Promise<CandidateEducation> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/educations/${educationId}/`, educationData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar educação do candidato:', error);
      throw error;
    }
  }

  /* Deletar educação do candidato */
  async deleteCandidateEducation(educationId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/candidates/educations/${educationId}/`);
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
      const response = await axios.get(`${this.baseUrl}/candidates/experiences/`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar experiência do candidato:', error);
      throw error;
    }
  }

  /* Criar experiência do candidato */
  async createCandidateExperience(experienceData: Partial<CandidateExperience>): Promise<CandidateExperience> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/experiences/`, experienceData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar experiência do candidato:', error);
      throw error;
    }
  }

  /* Atualizar experiência do candidato */
  async updateCandidateExperience(experienceId: number, experienceData: Partial<CandidateExperience>): Promise<CandidateExperience> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/experiences/${experienceId}/`, experienceData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar experiência do candidato:', error);
      throw error;
    }
  }

  /* Deletar experiência do candidato */
  async deleteCandidateExperience(experienceId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/candidates/experiences/${experienceId}/`);
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
      const response = await axios.get(`${this.baseUrl}/candidates/skills/`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar habilidades do candidato:', error);
      throw error;
    }
  }
    /** Buscar todos os idiomas (sem paginação) */
    async fetchAllLanguages(): Promise<CandidateLanguage[]> {
      try {
        const response = await axios.get(`${this.baseUrl}/candidates/languages/`);
        return response.data;
      } catch (error) {
        console.error('Erro ao buscar todos os idiomas:', error);
        throw error;
      }
    }

  /* Criar habilidade do candidato */
  async createCandidateSkill(skillData: Partial<CandidateSkill>): Promise<CandidateSkill> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/skills/`, skillData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar habilidade do candidato:', error);
      throw error;
    }
  }

  /* Atualizar habilidade do candidato */
  async updateCandidateSkill(skillId: number, skillData: Partial<CandidateSkill>): Promise<CandidateSkill> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/skills/${skillId}/`, skillData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar habilidade do candidato:', error);
      throw error;
    }
  }

  /* Deletar habilidade do candidato */
  async deleteCandidateSkill(skillId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/candidates/skills/${skillId}/`);
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
      const response = await axios.get(`${this.baseUrl}/candidates/languages/`, { params });
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar idiomas do candidato:', error);
      throw error;
    }
  }

  /* Criar idioma do candidato */
  async createCandidateLanguage(languageData: Partial<CandidateLanguage>): Promise<CandidateLanguage> {
    try {
      const response = await axios.post(`${this.baseUrl}/candidates/languages/`, languageData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar idioma do candidato:', error);
      throw error;
    }
  }

  /* Atualizar idioma do candidato */
  async updateCandidateLanguage(languageId: number, languageData: Partial<CandidateLanguage>): Promise<CandidateLanguage> {
    try {
      const response = await axios.patch(`${this.baseUrl}/candidates/languages/${languageId}/`, languageData);
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar idioma do candidato:', error);
      throw error;
    }
  }

  /* Deletar idioma do candidato */
  async deleteCandidateLanguage(languageId: number): Promise<void> {
    try {
      await axios.delete(`${this.baseUrl}/candidates/languages/${languageId}/`);
    } catch (error) {
      console.error('Erro ao deletar idioma do candidato:', error);
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
}

const candidateService = new CandidateService();
export default candidateService;
