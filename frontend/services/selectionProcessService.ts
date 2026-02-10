import axios from 'axios';
import AuthService from './auth';
import {
  SelectionProcess,
  ProcessStage,
  StageQuestion,
  CandidateInProcess,
  CandidateStageResponse,
  ProcessStatistics,
  AvailableCandidate,
  CreateSelectionProcess,
  CreateProcessStage,
  CreateStageQuestion,
  StageEvaluation,
  PaginatedResponse,
  ProcessTemplate
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8025';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class SelectionProcessService {
  private readonly baseUrl = `${API_BASE_URL}/api/${API_VERSION}`;

  private getAxiosConfig(extraConfig = {}) {
    const accessToken = AuthService.getAccessToken();
    return {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      ...extraConfig,
    };
  }

  // ============================================
  // SELECTION PROCESS
  // ============================================

  async getProcesses(params?: {
    page?: number;
    status?: string;
    job?: number;
    search?: string;
  }): Promise<PaginatedResponse<SelectionProcess>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.job) queryParams.append('job', params.job.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `${this.baseUrl}/selection-processes/?${queryParams.toString()}`;
      const response = await axios.get(url, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar processos seletivos:', error);
      throw error;
    }
  }

  async getProcessById(id: number): Promise<SelectionProcess> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/selection-processes/${id}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar processo seletivo:', error);
      throw error;
    }
  }

  async createProcess(data: CreateSelectionProcess): Promise<SelectionProcess> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/selection-processes/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar processo seletivo:', error);
      throw error;
    }
  }

  async updateProcess(id: number, data: Partial<CreateSelectionProcess>): Promise<SelectionProcess> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/selection-processes/${id}/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar processo seletivo:', error);
      throw error;
    }
  }

  async deleteProcess(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/selection-processes/${id}/`,
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error('Erro ao excluir processo seletivo:', error);
      throw error;
    }
  }

  async getProcessStatistics(id: number): Promise<ProcessStatistics> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/selection-processes/${id}/statistics/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      throw error;
    }
  }

  async getAvailableCandidates(processId: number, search?: string): Promise<AvailableCandidate[]> {
    try {
      const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await axios.get(
        `${this.baseUrl}/selection-processes/${processId}/available-candidates/${queryParams}`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar candidatos disponíveis:', error);
      throw error;
    }
  }

  async addCandidateToProcess(
    processId: number,
    candidateProfileId: number,
    recruiterNotes?: string
  ): Promise<CandidateInProcess> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/selection-processes/${processId}/add-candidate/`,
        {
          candidate_profile_id: candidateProfileId,
          recruiter_notes: recruiterNotes || ''
        },
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar candidato ao processo:', error);
      throw error;
    }
  }

  // ============================================
  // STAGES
  // ============================================

  async getStages(processId: number): Promise<ProcessStage[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/process-stages/?process=${processId}`,
        this.getAxiosConfig()
      );
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erro ao buscar etapas:', error);
      throw error;
    }
  }

  async getStageById(id: number): Promise<ProcessStage> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/process-stages/${id}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar etapa:', error);
      throw error;
    }
  }

  async createStage(data: CreateProcessStage): Promise<ProcessStage> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/process-stages/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar etapa:', error);
      throw error;
    }
  }

  async updateStage(id: number, data: Partial<CreateProcessStage>): Promise<ProcessStage> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/process-stages/${id}/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar etapa:', error);
      throw error;
    }
  }

  async deleteStage(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/process-stages/${id}/`,
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error('Erro ao excluir etapa:', error);
      throw error;
    }
  }

  async reorderStages(stageIds: number[]): Promise<void> {
    try {
      await axios.post(
        `${this.baseUrl}/process-stages/reorder/`,
        { stage_ids: stageIds },
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error('Erro ao reordenar etapas:', error);
      throw error;
    }
  }

  // ============================================
  // QUESTIONS
  // ============================================

  async getQuestions(stageId: number): Promise<StageQuestion[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/stage-questions/?stage=${stageId}`,
        this.getAxiosConfig()
      );
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erro ao buscar perguntas:', error);
      throw error;
    }
  }

  async createQuestion(data: CreateStageQuestion): Promise<StageQuestion> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/stage-questions/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar pergunta:', error);
      throw error;
    }
  }

  async updateQuestion(id: number, data: Partial<CreateStageQuestion>): Promise<StageQuestion> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/stage-questions/${id}/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar pergunta:', error);
      throw error;
    }
  }

  async deleteQuestion(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/stage-questions/${id}/`,
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error('Erro ao excluir pergunta:', error);
      throw error;
    }
  }

  // ============================================
  // CANDIDATES IN PROCESS
  // ============================================

  async getCandidatesInProcess(params?: {
    process?: number;
    status?: string;
    current_stage?: number;
    candidate_profile?: number;
    search?: string;
    page?: number;
  }): Promise<PaginatedResponse<CandidateInProcess>> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.process) queryParams.append('process', params.process.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.current_stage) queryParams.append('current_stage', params.current_stage.toString());
      if (params?.candidate_profile) queryParams.append('candidate_profile', params.candidate_profile.toString());
      if (params?.search) queryParams.append('search', params.search);
      if (params?.page) queryParams.append('page', params.page.toString());

      const url = `${this.baseUrl}/candidates-in-process/?${queryParams.toString()}`;
      const response = await axios.get(url, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar candidatos no processo:', error);
      throw error;
    }
  }

  async getCandidateInProcessById(id: number): Promise<CandidateInProcess> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidates-in-process/${id}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar candidato no processo:', error);
      throw error;
    }
  }

  async removeCandidateFromProcess(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/candidates-in-process/${id}/`,
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error('Erro ao remover candidato do processo:', error);
      throw error;
    }
  }

  async evaluateCandidate(
    candidateInProcessId: number,
    evaluation: StageEvaluation
  ): Promise<{
    stage_response: CandidateStageResponse;
    candidate_status: string;
    current_stage: number | null;
    current_stage_name: string | null;
  }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/candidates-in-process/${candidateInProcessId}/evaluate/`,
        evaluation,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao avaliar candidato:', error);
      throw error;
    }
  }

  async advanceCandidate(candidateInProcessId: number): Promise<CandidateInProcess> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/candidates-in-process/${candidateInProcessId}/advance/`,
        {},
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao avançar candidato:', error);
      throw error;
    }
  }

  async withdrawCandidate(candidateInProcessId: number): Promise<CandidateInProcess> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/candidates-in-process/${candidateInProcessId}/withdraw/`,
        {},
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao marcar candidato como desistente:', error);
      throw error;
    }
  }

  // ============================================
  // CANDIDATE-FACING
  // ============================================

  async getMyProcesses(): Promise<CandidateInProcess[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidates-in-process/my-processes/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar meus processos seletivos:', error);
      throw error;
    }
  }

  // ============================================
  // TEMPLATES
  // ============================================

  async getTemplates(search?: string): Promise<ProcessTemplate[]> {
    try {
      const queryParams = search ? `?search=${encodeURIComponent(search)}` : '';
      const response = await axios.get(
        `${this.baseUrl}/process-templates/${queryParams}`,
        this.getAxiosConfig()
      );
      return response.data.results || response.data;
    } catch (error) {
      console.error('Erro ao buscar modelos:', error);
      throw error;
    }
  }

  async getTemplateById(id: number): Promise<ProcessTemplate> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/process-templates/${id}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar modelo:', error);
      throw error;
    }
  }

  async createTemplate(data: { name: string; description?: string }): Promise<ProcessTemplate> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/process-templates/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar modelo:', error);
      throw error;
    }
  }

  async deleteTemplate(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/process-templates/${id}/`,
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error('Erro ao excluir modelo:', error);
      throw error;
    }
  }

  async applyTemplate(
    templateId: number,
    processData: {
      title: string;
      description?: string;
      job?: number;
      status?: string;
      start_date?: string;
      end_date?: string;
    }
  ): Promise<SelectionProcess> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/process-templates/${templateId}/apply/`,
        processData,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao aplicar modelo:', error);
      throw error;
    }
  }

  async saveProcessAsTemplate(
    processId: number,
    data: { name: string; description?: string }
  ): Promise<ProcessTemplate> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/selection-processes/${processId}/save-as-template/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao salvar como modelo:', error);
      throw error;
    }
  }

  // ============================================
  // HELPERS
  // ============================================

  getStatusOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'draft', label: 'Rascunho' },
      { value: 'active', label: 'Ativo' },
      { value: 'paused', label: 'Pausado' },
      { value: 'completed', label: 'Concluído' },
      { value: 'cancelled', label: 'Cancelado' },
    ];
  }

  getStatusLabel(status: string): { label: string; bgColor: string; textColor: string } {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string }> = {
      draft: { label: 'Rascunho', bgColor: 'bg-zinc-700', textColor: 'text-zinc-300' },
      active: { label: 'Ativo', bgColor: 'bg-green-900/50', textColor: 'text-green-300' },
      paused: { label: 'Pausado', bgColor: 'bg-amber-900/50', textColor: 'text-amber-300' },
      completed: { label: 'Concluído', bgColor: 'bg-blue-900/50', textColor: 'text-blue-300' },
      cancelled: { label: 'Cancelado', bgColor: 'bg-red-900/50', textColor: 'text-red-300' },
    };
    return statusMap[status] || statusMap.draft;
  }

  getCandidateStatusOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'pending', label: 'Aguardando Início' },
      { value: 'in_progress', label: 'Em Andamento' },
      { value: 'approved', label: 'Aprovado' },
      { value: 'rejected', label: 'Reprovado' },
      { value: 'withdrawn', label: 'Desistente' },
    ];
  }

  getCandidateStatusLabel(status: string): { label: string; bgColor: string; textColor: string } {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string }> = {
      pending: { label: 'Aguardando', bgColor: 'bg-zinc-700', textColor: 'text-zinc-300' },
      in_progress: { label: 'Em Andamento', bgColor: 'bg-blue-900/50', textColor: 'text-blue-300' },
      approved: { label: 'Aprovado', bgColor: 'bg-green-900/50', textColor: 'text-green-300' },
      rejected: { label: 'Reprovado', bgColor: 'bg-red-900/50', textColor: 'text-red-300' },
      withdrawn: { label: 'Desistente', bgColor: 'bg-amber-900/50', textColor: 'text-amber-300' },
    };
    return statusMap[status] || statusMap.pending;
  }

  getCandidateStatusLabelLight(status: string): { label: string; bgColor: string; textColor: string } {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string }> = {
      pending: { label: 'Aguardando', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
      in_progress: { label: 'Em Andamento', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
      approved: { label: 'Aprovado', bgColor: 'bg-green-100', textColor: 'text-green-700' },
      rejected: { label: 'Reprovado', bgColor: 'bg-red-100', textColor: 'text-red-700' },
      withdrawn: { label: 'Desistente', bgColor: 'bg-amber-100', textColor: 'text-amber-700' },
    };
    return statusMap[status] || statusMap.pending;
  }

  getEvaluationLabel(evaluation: string): { label: string; bgColor: string; textColor: string } {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string }> = {
      pending: { label: 'Pendente', bgColor: 'bg-zinc-700', textColor: 'text-zinc-300' },
      approved: { label: 'Aprovado', bgColor: 'bg-green-900/50', textColor: 'text-green-300' },
      rejected: { label: 'Reprovado', bgColor: 'bg-red-900/50', textColor: 'text-red-300' },
    };
    return statusMap[evaluation] || statusMap.pending;
  }
}

const selectionProcessService = new SelectionProcessService();
export default selectionProcessService;
