// Auth types
export interface User {
  id: number;
  email: string;
  name: string;
  last_name?: string;
  user_type: 'candidate' | 'recruiter' | 'admin';
  is_active: boolean;
  is_staff?: boolean;
  is_superuser?: boolean;
  created_at: string;
  company?: number;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  last_name?: string;
  password: string;
  password2: string;
  user_type?: 'candidate' | 'recruiter' | 'admin';
}

// Company types
export interface CompanyGroup {
  id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  name: string;
  description?: string;
}

export interface Company {
  id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  name: string;
  cnpj: string;
  slug: string;
  logo?: string;
  group?: CompanyGroup;
}

export interface CompanyResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Company[];
}

export interface Job {
  id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  title: string;
  description: string;
  location: string;
  company_name?: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'freelance' | 'internship';
  type_models: 'in_person' | 'home_office' | 'hybrid';
  salary_range: string;
  requirements: string;
  responsibilities: string;
  closure: string;
  slug: string;
  company: number;
}

export interface JobsResponse {
  count: number;
  next?: string;
  previous?: string;
  results: Job[];
}

// Candidate Profile types
export interface CandidateProfile {
  id: number;
  user: number;
  user_id?: number;
  user_name?: string;
  user_email?: string;
  cpf?: string;
  date_of_birth?: string;
  gender?: 'M' | 'F' | 'O' | 'N';
  phone_secondary?: string;
  zip_code?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  current_position?: string;
  current_company?: string;
  education_level?: 'fundamental' | 'medio' | 'tecnico' | 'superior' | 'pos_graduacao' | 'mestrado' | 'doutorado';
  experience_years?: number;
  desired_salary_min?: string;
  desired_salary_max?: string;
  professional_summary?: string;
  skills?: string;
  certifications?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  available_for_work: boolean;
  can_travel: boolean;
  accepts_remote_work: boolean;
  accepts_relocation: boolean;
  preferred_work_shift?: 'morning' | 'afternoon' | 'night' | 'flexible';
  has_vehicle: boolean;
  has_cnh: boolean;
  accepts_whatsapp: boolean;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  image_profile?: string;
  applications_count?: number;
  applications_summary?: Array<{
    id: number;
    job_id: number;
    job_title: string;
    company_name?: string;
    status: string;
    applied_at?: string;
  }>;
  selection_processes_summary?: Array<{
    id: number;
    process_id: number;
    process_title: string;
    status: string;
    current_stage_name?: string;
  }>;
  // Campos do processo seletivo de perfil
  profile_status?: 'pending' | 'awaiting_review' | 'approved' | 'rejected' | 'changes_requested';
  pipeline_status?: string;
  profile_observations?: string;
  pending_observation_sections?: string[];
  profile_reviewed_at?: string;
  reviewed_by_name?: string;
  created_at: string;
  updated_at: string;
}

// Education types
export interface CandidateEducation {
  id: number;
  candidate: number;
  institution: string;
  course: string;
  degree: 'fundamental' | 'medio' | 'tecnico' | 'superior' | 'pos_graduacao' | 'mestrado' | 'doutorado';
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Experience types
export interface CandidateExperience {
  id: number;
  candidate: number;
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  description?: string;
  achievements?: string;
  created_at: string;
  updated_at: string;
  salary?: number;
}

// Skill types
export interface CandidateSkill {
  id: number;
  candidate: number;
  skill_name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  years_experience?: number;
  created_at: string;
  updated_at: string;
}

// Language types
export interface CandidateLanguage {
  id: number;
  candidate: number;
  language: string;
  proficiency: 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native';
  speaking_level: 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native';
  reading_level: 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native';
  writing_level: 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native';
  has_certificate: boolean;
  certificate_name?: string;
  created_at: string;
  updated_at: string;
}

// Application types
export interface Application {
  id: number;
  candidate: number;
  job: number;
  status: 'submitted' | 'in_process' | 'interview_scheduled' | 'approved' | 'rejected' | 'withdrawn';
  name?: string;
  phone?: string;
  state?: string;
  city?: string;
  linkedin?: string;
  portfolio?: string;
  resume?: string;
  cover_letter?: string;
  salary_expectation?: number;
  observations?: string;
  applied_at: string;
  reviewed_at?: string;
  recruiter_notes?: string;
  reviewed_by?: number;
  created_at: string;
  updated_at: string;
  // Campos do serializer de listagem
  candidate_name?: string;
  job_title?: string;
  company_name?: string;
  days_since_application?: number;
  job_location?: string;
  job_type?: string;
  candidate_profile_id?: number;
}

// Interview types
export interface InterviewSchedule {
  id: number;
  application: number;
  interview_type: 'online' | 'in_person' | 'phone';
  scheduled_date: string;
  duration_minutes: number;
  location?: string;
  meeting_link?: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  feedback?: string;
  created_at: string;
  updated_at: string;
}

// Occupation types
export interface Occupation {
  id: number;
  cbo_code: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

// Spontaneous Application types
export interface SpontaneousApplication {
  id: number;
  candidate: number;
  occupation: number;
  location_preference?: string;
  salary_expectation?: number;
  availability_date?: string;
  additional_info?: string;
  status: 'active' | 'inactive' | 'contacted';
  created_at: string;
  updated_at: string;
}

// Pagination types
export interface PaginatedResponse<T> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// API Error types
export interface APIError {
  detail?: string;
  message?: string;
  non_field_errors?: string[];
  [key: string]: string | string[] | undefined;
}

// ============================================
// SELECTION PROCESS TYPES
// ============================================

export interface SelectionProcess {
  id: number;
  title: string;
  description?: string;
  job?: number;
  job_title?: string;
  company: number;
  company_name?: string;
  created_by?: number;
  created_by_name?: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
  stages_count?: number;
  candidates_count?: number;
  candidates_approved?: number;
  candidates_rejected?: number;
  candidates_in_progress?: number;
  stages?: ProcessStage[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessStage {
  id: number;
  process: number;
  name: string;
  description?: string;
  order: number;
  is_eliminatory: boolean;
  questions_count?: number;
  questions?: StageQuestion[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StageQuestion {
  id: number;
  stage: number;
  question_text: string;
  question_type: 'multiple_choice' | 'open_text';
  options?: string[];
  order: number;
  is_required: boolean;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CandidateInProcess {
  id: number;
  process: number;
  process_title?: string;
  candidate_profile: number;
  candidate_name?: string;
  candidate_email?: string;
  candidate_image?: string;
  current_stage?: number;
  current_stage_name?: string;
  current_stage_order?: number;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected' | 'withdrawn';
  added_by?: number;
  added_by_name?: string;
  added_at: string;
  recruiter_notes?: string;
  stage_responses?: CandidateStageResponse[];
  average_rating?: number;
  completed_stages?: number;
  total_stages?: number;
  stages_info?: Array<{
    id: number;
    name: string;
    order: number;
    status: 'completed' | 'current' | 'pending';
  }>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateStageResponse {
  id: number;
  candidate_in_process: number;
  stage: number;
  stage_name?: string;
  stage_order?: number;
  evaluation: 'pending' | 'approved' | 'rejected';
  answers?: Record<number, string>;
  recruiter_feedback?: string;
  rating?: number;
  evaluated_by?: number;
  evaluated_by_name?: string;
  evaluated_at?: string;
  is_completed: boolean;
  completed_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessStatistics {
  total_candidates: number;
  candidates_by_status: {
    pending: number;
    in_progress: number;
    approved: number;
    rejected: number;
    withdrawn: number;
  };
  candidates_by_stage: Array<{
    stage_id: number;
    stage_name: string;
    stage_order: number;
    candidates_count: number;
  }>;
  average_rating: number | null;
  completion_rate: number;
}

export interface AvailableCandidate {
  id: number;
  name: string;
  email: string;
  current_position?: string;
  image_profile?: string;
  city?: string;
  state?: string;
  experience_years?: number;
  applications_summary?: Array<{
    job_id: number;
    job_title: string;
    status: string;
  }>;
}

// Create/Update types
export interface CreateSelectionProcess {
  title: string;
  description?: string;
  job?: number;
  status?: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  start_date?: string;
  end_date?: string;
}

export interface CreateProcessStage {
  process: number;
  name: string;
  description?: string;
  order: number;
  is_eliminatory?: boolean;
}

export interface CreateStageQuestion {
  stage: number;
  question_text: string;
  question_type: 'multiple_choice' | 'open_text';
  options?: string[];
  order?: number;
  is_required?: boolean;
}

export interface StageEvaluation {
  evaluation: 'approved' | 'rejected';
  answers?: Record<number, string>;
  recruiter_feedback?: string;
  rating?: number;
}

// ============================================
// PROCESS TEMPLATE TYPES
// ============================================

export interface TemplateStageQuestion {
  id: number;
  template_stage: number;
  question_text: string;
  question_type: 'multiple_choice' | 'open_text';
  options?: string[];
  order: number;
  is_required: boolean;
}

export interface TemplateStage {
  id: number;
  template: number;
  name: string;
  description?: string;
  order: number;
  is_eliminatory: boolean;
  questions_count?: number;
  questions?: TemplateStageQuestion[];
}

export interface ProcessTemplate {
  id: number;
  name: string;
  description?: string;
  stages_count?: number;
  created_by_name?: string;
  stages?: TemplateStage[];
  created_at: string;
}

// ============================================
// DOCUMENT / ADMISSION TYPES
// ============================================

export interface DocumentType {
  id: number;
  name: string;
  description?: string;
  is_required: boolean;
  accepted_formats: string;
  max_file_size_mb: number;
  order: number;
  created_by?: number;
  created_by_name?: string;
  documents_count?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateDocument {
  id: number;
  candidate: number;
  document_type: number;
  document_type_name: string;
  document_type_data?: DocumentType;
  candidate_name?: string;
  file: string;
  file_url?: string;
  original_filename: string;
  status: 'pending' | 'approved' | 'rejected';
  observations?: string;
  reviewed_by?: number;
  reviewed_by_name?: string;
  reviewed_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CandidateDocumentWithType {
  document_type: DocumentType;
  document: CandidateDocument | null;
  status: 'not_sent' | 'pending' | 'approved' | 'rejected';
}

export interface DocumentsSummary {
  total_types: number;
  required_types: number;
  sent: number;
  approved: number;
  rejected: number;
  pending: number;
  required_approved?: number;
  all_required_approved?: boolean;
}

export interface MyDocumentsResponse {
  documents: CandidateDocumentWithType[];
  summary: DocumentsSummary;
}

export interface CandidateSummaryResponse {
  candidate_id: number;
  candidate_name: string;
  documents: CandidateDocumentWithType[];
  summary: DocumentsSummary;
}

export interface CreateDocumentType {
  name: string;
  description?: string;
  is_required?: boolean;
  accepted_formats?: string;
  max_file_size_mb?: number;
  order?: number;
}

export interface DocumentReview {
  status: 'approved' | 'rejected';
  observations?: string;
}

export interface ApprovedAwaitingCandidate {
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  total_required: number;
  approved_count: number;
  pending_count: number;
  rejected_count: number;
  not_sent_count: number;
}

export interface DocumentsCompletedCandidate {
  candidate_id: number;
  candidate_name: string;
  candidate_email: string;
  total_required: number;
  approved_count: number;
}

// ============================================
// ADMISSION DATA TYPES (Protheus)
// ============================================

export interface AdmissionData {
  id: number;
  candidate: number;
  candidate_name?: string;
  candidate_email?: string;
  status: 'draft' | 'completed' | 'sent' | 'error' | 'confirmed';
  status_display?: string;
  filled_by?: number;
  filled_by_name?: string;

  // Cadastrais
  matricula: string;
  nome: string;
  nome_completo: string;
  nome_mae: string;
  nome_pai: string;
  cod_pais_origem: string;
  sexo: string;
  raca_cor: string;
  data_nascimento: string | null;
  estado_civil: string;
  nacionalidade: string;
  pais_origem: string;
  cod_nacion_rfb: string;
  bra_nasc_ext: string;
  municipio_nascimento: string;
  naturalidade_uf: string;
  cod_mun_nasc: string;
  nivel_escolaridade: string;
  email: string;
  defic_fisico: string;
  tp_deficiencia: string;
  cota_def: string;
  beneficiario_reabilitado: string;

  // Funcionais
  centro_custo: string;
  data_admissao: string | null;
  tipo_admissao: string;
  alt_admissao: string;
  dt_op_fgts: string | null;
  perc_fgts: string | null;
  tipo_conta_salario: string;
  horas_mensais: string | null;
  tp_previdencia: string;
  codigo_funcao: string;
  tp_contrato_trab: string;
  salario: string | null;
  salario_base: string | null;
  ct_tempo_parcial: string;
  perc_adiantamento: string | null;
  cod_sindicato: string;
  clau_assec: string;
  alt_cbo: string;
  tipo_pagamento: string;
  categoria_funcional: string;
  vinc_empregado: string;
  cate_esocial: string;
  venc_exper_1: string | null;
  venc_exper_2: string | null;
  venc_exame_med: string | null;
  contr_assistencial: string;
  mens_sindical: string;
  cargo: string;
  comp_sabado: string;
  cod_departamento: string;
  contr_sindical: string;
  aposentado: string;
  cod_processo: string;

  // Documentos
  pis: string;
  rg: string;
  nr_reservista: string;
  titulo_eleitor: string;
  zona_eleitoral: string;
  secao_eleitoral: string;
  cpf: string;

  // Endereço
  res_exterior: string;
  tipo_endereco: string;
  tipo_logradouro: string;
  endereco: string;
  num_endereco: string;
  desc_logradouro: string;
  municipio: string;
  nr_logradouro: string;
  bairro: string;
  estado: string;
  cod_municipio: string;
  cep: string;
  telefone: string;
  ddd_telefone: string;
  ddd_celular: string;
  numero_celular: string;

  // Benefícios
  plano_saude: string;

  // Relógio Registrador
  turno: string;
  nr_cracha: string;
  regra_apontamento: string;
  seq_ini_turno: string;
  bh_folha: string;
  acum_b_horas: string;

  // Outras Informações
  cod_retencao: string;

  // Cargos e Salários
  tabela_salarial: string;
  nivel_tabela: string;
  faixa_tabela: string;

  // Estrangeiro
  calc_inss: string;

  // Adicionais
  adc_tempo_servico: string;
  possui_periculosidade: string;
  possui_insalubridade: string;

  // Finalização
  data_inicio_trabalho: string | null;

  // Meta
  protheus_response?: Record<string, unknown>;
  sent_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type AdmissionDataCreate = Omit<AdmissionData,
  'id' | 'candidate_name' | 'candidate_email' | 'status_display' |
  'filled_by' | 'filled_by_name' | 'protheus_response' | 'sent_at' |
  'is_active' | 'created_at' | 'updated_at'
>;

// ============================================
// NOTIFICATION TYPES
// ============================================

export interface CandidateNotification {
  type: string;
  title: string;
  message: string;
  link: string;
  icon: string;
  count?: number;
}

export interface CandidateNotificationsResponse {
  count: number;
  notifications: CandidateNotification[];
}

export interface AdmissionPrefill {
  nome: string;
  nome_completo: string;
  sexo: string;
  data_nascimento: string | null;
  nivel_escolaridade: string;
  email: string;
  cpf: string;
  endereco: string;
  num_endereco: string;
  desc_logradouro: string;
  municipio: string;
  bairro: string;
  estado: string;
  cep: string;
}