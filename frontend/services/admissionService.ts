import axios from 'axios';
import AuthService from './auth';
import {
  DocumentType,
  CandidateDocument,
  CreateDocumentType,
  DocumentReview,
  MyDocumentsResponse,
  CandidateSummaryResponse,
  PaginatedResponse,
  ApprovedAwaitingCandidate,
  DocumentsCompletedCandidate,
  AdmissionData,
  AdmissionDataCreate,
  AdmissionPrefill,
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8025';
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1';

class AdmissionService {
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

  private getMultipartConfig() {
    const accessToken = AuthService.getAccessToken();
    return {
      headers: {
        'Accept': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    };
  }

  // ============================================
  // DOCUMENT TYPES (Recrutador)
  // ============================================

  async getDocumentTypes(params?: {
    page?: number;
    search?: string;
  }): Promise<PaginatedResponse<DocumentType>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.search) queryParams.append('search', params.search);

      const url = `${this.baseUrl}/document-types/?${queryParams.toString()}`;
      const response = await axios.get(url, this.getAxiosConfig());
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipos de documento:', error);
      throw error;
    }
  }

  async getDocumentTypeById(id: number): Promise<DocumentType> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/document-types/${id}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar tipo de documento:', error);
      throw error;
    }
  }

  async createDocumentType(data: CreateDocumentType): Promise<DocumentType> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/document-types/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar tipo de documento:', error);
      throw error;
    }
  }

  async updateDocumentType(id: number, data: Partial<CreateDocumentType>): Promise<DocumentType> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/document-types/${id}/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar tipo de documento:', error);
      throw error;
    }
  }

  async deleteDocumentType(id: number): Promise<void> {
    try {
      await axios.delete(
        `${this.baseUrl}/document-types/${id}/`,
        this.getAxiosConfig()
      );
    } catch (error) {
      console.error('Erro ao excluir tipo de documento:', error);
      throw error;
    }
  }

  // ============================================
  // CANDIDATE DOCUMENTS
  // ============================================

  async getMyDocuments(): Promise<MyDocumentsResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidate-documents/my-documents/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar meus documentos:', error);
      throw error;
    }
  }

  async uploadDocument(documentTypeId: number, file: File): Promise<CandidateDocument> {
    try {
      const formData = new FormData();
      formData.append('document_type', documentTypeId.toString());
      formData.append('file', file);

      const response = await axios.post(
        `${this.baseUrl}/candidate-documents/`,
        formData,
        this.getMultipartConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar documento:', error);
      throw error;
    }
  }

  async reviewDocument(id: number, review: DocumentReview): Promise<CandidateDocument> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/candidate-documents/${id}/review/`,
        review,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao revisar documento:', error);
      throw error;
    }
  }

  async getPendingReview(): Promise<CandidateDocument[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidate-documents/pending-review/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar documentos pendentes:', error);
      throw error;
    }
  }

  async getCandidateSummary(candidateId: number): Promise<CandidateSummaryResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidate-documents/candidate-summary/${candidateId}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar resumo de documentos:', error);
      throw error;
    }
  }

  async getDocumentsCompleted(): Promise<DocumentsCompletedCandidate[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidate-documents/documents-completed/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar candidatos com documentação completa:', error);
      throw error;
    }
  }

  async getApprovedAwaitingDocuments(): Promise<ApprovedAwaitingCandidate[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/candidate-documents/approved-awaiting-documents/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar perfis aguardando documentos:', error);
      throw error;
    }
  }

  async getCandidateDocuments(params?: {
    candidate?: number;
    status?: string;
    page?: number;
  }): Promise<PaginatedResponse<CandidateDocument>> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.candidate) queryParams.append('candidate', params.candidate.toString());
      if (params?.status) queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());

      const response = await axios.get(
        `${this.baseUrl}/candidate-documents/?${queryParams.toString()}`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      throw error;
    }
  }

  // ============================================
  // ADMISSION DATA (Protheus)
  // ============================================

  async getAdmissionLookups(): Promise<Record<string, { valor: string; descricao: string }[]>> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/admission-data/lookups/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar lookups do Protheus:', error);
      return {};
    }
  }

  async getAdmissionPrefill(candidateId: number): Promise<AdmissionPrefill> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/admission-data/prefill/${candidateId}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar prefill de admissão:', error);
      throw error;
    }
  }

  async createAdmissionData(data: Partial<AdmissionDataCreate>): Promise<AdmissionData> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/admission-data/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao criar dados de admissão:', error);
      throw error;
    }
  }

  async getAdmissionByCandidate(candidateId: number): Promise<AdmissionData | null> {
    try {
      const response = await axios.get<PaginatedResponse<AdmissionData>>(
        `${this.baseUrl}/admission-data/?candidate=${candidateId}`,
        this.getAxiosConfig()
      );
      return response.data.results.length > 0 ? response.data.results[0] : null;
    } catch (error) {
      console.error('Erro ao buscar admissão do candidato:', error);
      throw error;
    }
  }

  async getAdmissionById(id: number): Promise<AdmissionData> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/admission-data/${id}/`,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados de admissão:', error);
      throw error;
    }
  }

  async updateAdmissionData(id: number, data: Partial<AdmissionDataCreate>): Promise<AdmissionData> {
    try {
      const response = await axios.patch(
        `${this.baseUrl}/admission-data/${id}/`,
        data,
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar dados de admissão:', error);
      throw error;
    }
  }

  async finalizeAdmission(id: number): Promise<AdmissionData> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/admission-data/${id}/finalize/`,
        {},
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao finalizar admissão:', error);
      throw error;
    }
  }

  async sendToProtheus(id: number): Promise<AdmissionData> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/admission-data/${id}/send-to-protheus/`,
        {},
        this.getAxiosConfig()
      );
      return response.data;
    } catch (error) {
      console.error('Erro ao enviar para Protheus:', error);
      throw error;
    }
  }
}

const admissionService = new AdmissionService();
export default admissionService;
