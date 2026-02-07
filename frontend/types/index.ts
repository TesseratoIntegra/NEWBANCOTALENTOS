// Auth types
export interface User {
  id: number;
  email: string;
  name: string;
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
  // Campos do processo seletivo de perfil
  profile_status?: 'pending' | 'awaiting_review' | 'approved' | 'rejected' | 'changes_requested';
  profile_observations?: string;
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
}

// Create/Update types
export interface CreateSelectionProcess {
  title: string;
  description?: string;
  job?: number;
  status?: 'draft' | 'active';
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