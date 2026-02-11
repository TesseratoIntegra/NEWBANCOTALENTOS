'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-hot-toast';
import {
  ArrowLeft,
  User,
  MapPin,
  Briefcase,
  GraduationCap,
  Phone,
  Mail,
  Linkedin,
  Github,
  Globe,
  Check,
  X,
  Calendar,
  DollarSign,
  Car,
  Plane,
  Clock,
  Download,
  Building,
  BookOpen,
  Languages,
  Award,
  FileText,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  ExternalLink
} from 'lucide-react';
import candidateService from '@/services/candidateService';
import applicationService from '@/services/applicationService';
import selectionProcessService from '@/services/selectionProcessService';
import admissionService from '@/services/admissionService';
import ProfileStatusModal from '@/components/admin/ProfileStatusModal';
import {
  CandidateProfile,
  CandidateEducation,
  CandidateExperience,
  CandidateSkill,
  CandidateLanguage,
  CandidateInProcess,
  Application,
  PaginatedResponse,
  CandidateDocumentWithType,
  DocumentsSummary
} from '@/types';

const SECTION_KEY_TO_LABEL: Record<string, string> = {
  dadosPessoais: 'Dados Pessoais',
  profissional: 'Informações Profissionais',
  formacao: 'Formação Acadêmica',
  experiencia: 'Experiência Profissional',
  habilidades: 'Habilidades',
  idiomas: 'Idiomas',
};

const LABEL_TO_SECTION_KEY: Record<string, string> = {
  'Dados Pessoais': 'dadosPessoais',
  'Informações Profissionais': 'profissional',
  'Formação Acadêmica': 'formacao',
  'Experiência Profissional': 'experiencia',
  'Habilidades': 'habilidades',
  'Idiomas': 'idiomas',
};

function parseSectionObservations(text: string): Record<string, string> {
  const result: Record<string, string> = {};
  const sectionRegex = /\[([^\]]+)\]\n([\s\S]*?)(?=\n\[|$)/g;
  let match;
  while ((match = sectionRegex.exec(text)) !== null) {
    const key = LABEL_TO_SECTION_KEY[match[1].trim()];
    if (key) result[key] = match[2].trim();
  }
  return result;
}

function AdminSectionAlert({ sectionKey, profile }: { sectionKey: string; profile: CandidateProfile }) {
  const showStatuses = ['changes_requested', 'awaiting_review'];
  if (!showStatuses.includes(profile.profile_status || '') || !profile.profile_observations) return null;

  const observations = parseSectionObservations(profile.profile_observations);
  const text = observations[sectionKey];
  if (!text) return null;

  // awaiting_review = candidato ja completou tudo → tudo verde
  const isCompleted = profile.profile_status === 'awaiting_review'
    || !(profile.pending_observation_sections || []).includes(sectionKey);

  return (
    <div className={`flex items-start gap-2 rounded-lg px-3 py-2 mb-3 text-sm ${
      isCompleted
        ? 'bg-emerald-50 border border-emerald-200'
        : 'bg-orange-50 border border-orange-200'
    }`}>
      <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
        isCompleted ? 'bg-green-500' : 'bg-orange-500 animate-pulse'
      }`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${isCompleted ? 'text-emerald-600' : 'text-orange-600'}`}>
          {isCompleted ? 'Candidato atualizou esta seção' : 'Pendente — aguardando candidato'}
        </p>
        <p className={`text-xs mt-0.5 ${isCompleted ? 'text-emerald-400 line-through' : 'text-orange-500'}`}>{text}</p>
      </div>
    </div>
  );
}

function getSectionRingClass(sectionKey: string, profile: CandidateProfile): string {
  const showStatuses = ['changes_requested', 'awaiting_review'];
  if (!showStatuses.includes(profile.profile_status || '') || !profile.profile_observations) return '';
  const observations = parseSectionObservations(profile.profile_observations);
  if (!observations[sectionKey]) return '';
  if (profile.profile_status === 'awaiting_review') return 'ring-2 ring-emerald-300';
  const pending = profile.pending_observation_sections || [];
  return pending.includes(sectionKey) ? 'ring-2 ring-orange-300' : 'ring-2 ring-emerald-300';
}

function AdminStructuredObservations({ text, isRejected, pendingSections }: { text: string; isRejected?: boolean; pendingSections?: string[] }) {
  const sectionRegex = /\[([^\]]+)\]\n([\s\S]*?)(?=\n\[|$)/g;
  const sections: { title: string; content: string }[] = [];
  let match;

  while ((match = sectionRegex.exec(text)) !== null) {
    sections.push({ title: match[1].trim(), content: match[2].trim() });
  }

  if (sections.length === 0) {
    return <p className="text-slate-600 text-sm whitespace-pre-line">{text}</p>;
  }

  const borderColor = isRejected ? 'border-red-200' : 'border-orange-200';
  const titleColor = isRejected ? 'text-red-600' : 'text-orange-600';

  return (
    <div className="space-y-2">
      {sections.map((section, idx) => {
        const sectionKey = LABEL_TO_SECTION_KEY[section.title];
        const isCompleted = pendingSections && sectionKey && !pendingSections.includes(sectionKey);

        return (
          <div key={idx} className={`border-l-2 ${isCompleted ? 'border-emerald-200' : borderColor} pl-3 py-1`}>
            <div className="flex items-center gap-2">
              {pendingSections && sectionKey && (
                isCompleted
                  ? <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
              )}
              <p className={`text-sm font-semibold ${isCompleted ? 'text-emerald-600' : titleColor}`}>
                {section.title}
                {isCompleted && <span className="font-normal text-emerald-500 ml-2">— Atualizado pelo candidato</span>}
              </p>
            </div>
            <p className="text-slate-600 text-sm whitespace-pre-line">{section.content}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function TalentoDetalhesPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = Number(params.id);

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [educations, setEducations] = useState<CandidateEducation[]>([]);
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [languages, setLanguages] = useState<CandidateLanguage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [candidateProcesses, setCandidateProcesses] = useState<CandidateInProcess[]>([]);
  const [candidateDocs, setCandidateDocs] = useState<CandidateDocumentWithType[]>([]);
  const [docsSummary, setDocsSummary] = useState<DocumentsSummary | null>(null);
  const [reviewingDoc, setReviewingDoc] = useState<number | null>(null);
  const [reviewObs, setReviewObs] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [defaultModalStatus, setDefaultModalStatus] = useState<'approved' | 'rejected' | 'changes_requested' | undefined>(undefined);

  const educationLevels = candidateService.getEducationLevels();
  const skillLevels = candidateService.getSkillLevels();
  const languageProficiency = candidateService.getLanguageProficiencyLevels();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [profileData, eduData, expData, skillData, langData] = await Promise.all([
          candidateService.getCandidateProfile(candidateId),
          candidateService.getCandidateEducations(candidateId),
          candidateService.getCandidateExperiences(candidateId),
          candidateService.getCandidateSkills(candidateId),
          candidateService.getCandidateLanguages(candidateId),
        ]);

        setProfile(profileData);
        setEducations(eduData.results || []);
        setExperiences(expData.results || []);
        setSkills(skillData.results || []);
        setLanguages(langData.results || []);

        // Buscar candidaturas do usuário (usando user_id ou user)
        const userId = profileData.user_id || profileData.user;
        if (userId) {
          try {
            const appsData = await applicationService.getApplications({ candidate: userId });
            setApplications(appsData.results || []);
          } catch (appErr) {
            console.error('Erro ao buscar candidaturas:', appErr);
          }
        }

        // Buscar processos seletivos do candidato
        try {
          const processData = await selectionProcessService.getCandidatesInProcess({ candidate_profile: candidateId });
          setCandidateProcesses(processData.results || []);
        } catch (processErr) {
          console.error('Erro ao buscar processos do candidato:', processErr);
        }

        // Buscar documentos do candidato
        try {
          const docsData = await admissionService.getCandidateSummary(candidateId);
          setCandidateDocs(docsData.documents || []);
          setDocsSummary(docsData.summary || null);
        } catch (docErr) {
          console.error('Erro ao buscar documentos do candidato:', docErr);
        }
      } catch (err) {
        console.error('Erro ao buscar dados do talento:', err);
        setError('Erro ao carregar dados do talento.');
      } finally {
        setLoading(false);
      }
    };

    if (candidateId) {
      fetchData();
    }
  }, [candidateId]);

  const getEducationLabel = (level?: string) => {
    if (!level) return '-';
    const found = educationLevels.find(e => e.value === level);
    return found ? found.label : level;
  };

  const getSkillLabel = (level?: string) => {
    if (!level) return '-';
    const found = skillLevels.find(e => e.value === level);
    return found ? found.label : level;
  };

  const getLanguageLabel = (level?: string) => {
    if (!level) return '-';
    const found = languageProficiency.find(e => e.value === level);
    return found ? found.label : level;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const formatCurrency = (value?: string | number) => {
    if (!value) return '-';
    let num: number;
    if (typeof value === 'string') {
      const cleaned = value.replace(/[^\d,]/g, '').replace(',', '.');
      num = parseFloat(cleaned);
    } else {
      num = value;
    }
    if (isNaN(num)) return '-';
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getProfileStatusInfo = (status?: string) => {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
      pending: { label: 'Em análise', bgColor: 'bg-amber-50', textColor: 'text-amber-700', borderColor: 'border-amber-200' },
      awaiting_review: { label: 'Aguardando Revisão', bgColor: 'bg-sky-50', textColor: 'text-sky-700', borderColor: 'border-sky-200' },
      approved: { label: 'Aprovado', bgColor: 'bg-emerald-50', textColor: 'text-emerald-700', borderColor: 'border-emerald-200' },
      rejected: { label: 'Reprovado', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' },
      changes_requested: { label: 'Aguardando Candidato', bgColor: 'bg-orange-50', textColor: 'text-orange-700', borderColor: 'border-orange-200' },
    };
    return statusMap[status || 'pending'] || statusMap.pending;
  };

  const handleReviewDocument = async (docId: number, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !reviewObs.trim()) {
      toast.error('Informe o motivo da rejeição.');
      return;
    }
    try {
      await admissionService.reviewDocument(docId, { status, observations: reviewObs });
      setReviewingDoc(null);
      setReviewObs('');
      // Refresh documents
      const docsData = await admissionService.getCandidateSummary(candidateId);
      setCandidateDocs(docsData.documents || []);
      setDocsSummary(docsData.summary || null);
      toast.success(status === 'approved' ? 'Documento aprovado!' : 'Documento rejeitado.');
    } catch (err) {
      console.error('Erro ao revisar documento:', err);
      toast.error('Erro ao revisar documento.');
    }
  };

  const handleUpdateProfileStatus = async (
    status: 'approved' | 'rejected' | 'changes_requested',
    observations: string
  ) => {
    try {
      const response = await candidateService.updateProfileStatus(candidateId, status, observations);
      toast.success(
        status === 'approved'
          ? 'Perfil aprovado com sucesso!'
          : status === 'changes_requested'
          ? 'Observações enviadas ao candidato!'
          : 'Perfil reprovado.'
      );
      // Atualizar o perfil localmente (incluindo pending_observation_sections da resposta)
      setProfile((prev) =>
        prev ? {
          ...prev,
          profile_status: status,
          profile_observations: observations,
          pending_observation_sections: response.pending_observation_sections || [],
          profile_reviewed_at: response.profile_reviewed_at,
        } : prev
      );
      setShowStatusModal(false);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status do perfil.');
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">{error || 'Talento não encontrado'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          href="/admin-panel/talentos"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar para lista
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {(() => {
            const statusInfo = getProfileStatusInfo(profile.profile_status);
            return (
              <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                {profile.profile_status === 'approved' ? <CheckCircle className="h-4 w-4" /> :
                 profile.profile_status === 'rejected' ? <X className="h-4 w-4" /> :
                 <AlertCircle className="h-4 w-4" />}
                {statusInfo.label}
              </span>
            );
          })()}
          <button
            onClick={() => handleUpdateProfileStatus('approved', '')}
            className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full text-sm font-medium transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <CheckCircle className="h-4 w-4" />
            Aprovar
          </button>
          <button
            onClick={() => setShowStatusModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-full text-sm font-medium transition-all cursor-pointer"
          >
            <AlertCircle className="h-4 w-4" />
            Observações
          </button>
          <button
            onClick={() => { setDefaultModalStatus('rejected'); setShowStatusModal(true); }}
            className="inline-flex items-center gap-2 px-5 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-full text-sm font-medium transition-all cursor-pointer"
          >
            <X className="h-4 w-4" />
            Reprovar
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className={`bg-white rounded-lg p-6 border border-slate-200 ${getSectionRingClass('dadosPessoais', profile)}`}>
        <AdminSectionAlert sectionKey="dadosPessoais" profile={profile} />
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
              {profile.image_profile ? (
                <img
                  src={profile.image_profile}
                  alt={`${profile.user_name || ''} ${profile.user_last_name || ''}`.trim() || 'Candidato'}
                  className="w-full h-full object-cover"
                />
              ) : (
                (profile.user_name || '?').charAt(0).toUpperCase()
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-1">
              {`${profile.user_name || ''} ${profile.user_last_name || ''}`.trim() || 'Nome não informado'}
            </h1>
            <p className="text-lg text-sky-600 mb-4">
              {profile.current_position || 'Cargo não informado'}
              {profile.current_company && (
                <span className="text-slate-500"> em {profile.current_company}</span>
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.user_email && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <a href={`mailto:${profile.user_email}`} className="hover:text-sky-600">
                    {profile.user_email}
                  </a>
                </div>
              )}
              {profile.phone_secondary && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-4 w-4 text-slate-400" />
                  {profile.phone_secondary}
                </div>
              )}
              {(profile.city || profile.state) && (
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {[profile.city, profile.state].filter(Boolean).join(', ')}
                </div>
              )}
              {profile.experience_years && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Briefcase className="h-4 w-4 text-slate-400" />
                  {profile.experience_years} anos de experiência
                </div>
              )}
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 rounded-lg hover:bg-sky-600 transition-colors text-slate-600 hover:text-white"
                  title="LinkedIn"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900"
                  title="GitHub"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors text-slate-600 hover:text-slate-900"
                  title="Portfólio"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>

            {/* Availability Flags */}
            <div className="flex flex-wrap gap-2 mt-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                profile.available_for_work
                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}>
                {profile.available_for_work ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                Disponível
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                profile.accepts_remote_work
                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}>
                {profile.accepts_remote_work ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                Remoto
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                profile.accepts_relocation
                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}>
                {profile.accepts_relocation ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                Mudança
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                profile.can_travel
                  ? 'bg-slate-100 text-slate-700 border border-slate-300'
                  : 'bg-slate-50 text-slate-400 border border-slate-200'
              }`}>
                {profile.can_travel ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                Viagens
              </span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex-shrink-0 md:self-start">
            {(() => {
              const statusInfo = getProfileStatusInfo(profile.profile_status);
              return (
                <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                  {profile.profile_status === 'approved' ? <CheckCircle className="h-4 w-4" /> :
                   profile.profile_status === 'rejected' ? <X className="h-4 w-4" /> :
                   profile.profile_status === 'awaiting_review' ? <Clock className="h-4 w-4" /> :
                   <AlertCircle className="h-4 w-4" />}
                  {statusInfo.label}
                </span>
              );
            })()}
          </div>
        </div>
      </div>

      {/* Profile Observations Alert */}
      {profile.profile_observations && (
        <div className={`rounded-lg p-4 border ${
          profile.profile_status === 'rejected'
            ? 'bg-red-50 border-red-200'
            : profile.profile_status === 'awaiting_review'
            ? 'bg-emerald-50 border-emerald-200'
            : 'bg-orange-50 border-orange-200'
        }`}>
          <div className="flex items-start gap-3">
            {profile.profile_status === 'awaiting_review' ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-emerald-600" />
            ) : (
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                profile.profile_status === 'rejected' ? 'text-red-600' : 'text-orange-600'
              }`} />
            )}
            <div className="flex-1">
              <h3 className={`font-medium ${
                profile.profile_status === 'rejected' ? 'text-red-600'
                : profile.profile_status === 'awaiting_review' ? 'text-emerald-600'
                : 'text-orange-600'
              }`}>
                {profile.profile_status === 'rejected'
                  ? 'Motivo da Reprovação'
                  : profile.profile_status === 'awaiting_review'
                  ? 'Candidato concluiu as alterações solicitadas'
                  : 'Observações Enviadas'}
              </h3>
              <div className="mt-2 space-y-2">
                <AdminStructuredObservations
                  text={profile.profile_observations}
                  isRejected={profile.profile_status === 'rejected'}
                  pendingSections={profile.profile_status === 'changes_requested'
                    ? profile.pending_observation_sections
                    : profile.profile_status === 'awaiting_review'
                    ? []
                    : undefined}
                />
              </div>
              {profile.profile_reviewed_at && (
                <p className="text-slate-400 text-xs mt-2">
                  Enviado em {new Date(profile.profile_reviewed_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
              {['changes_requested', 'awaiting_review'].includes(profile.profile_status || '') && (() => {
                const sectionRegex = /\[([^\]]+)\]/g;
                const allKeys: string[] = [];
                let m;
                while ((m = sectionRegex.exec(profile.profile_observations || '')) !== null) {
                  const key = LABEL_TO_SECTION_KEY[m[1].trim()];
                  if (key) allKeys.push(key);
                }
                const total = allKeys.length;
                const pendingSections = profile.profile_status === 'awaiting_review'
                  ? []
                  : (profile.pending_observation_sections || []);
                const pending = pendingSections.length;
                const completed = total - pending;

                if (total === 0) return null;

                return (
                  <div className="mt-3 bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600 font-medium">Progresso do candidato</span>
                      <span className="text-slate-500">{completed} de {total} seções atualizadas</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(completed / total) * 100}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {allKeys.map(key => (
                        <span
                          key={key}
                          className={`text-xs px-2 py-1 rounded-full ${
                            !pendingSections.includes(key)
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-orange-50 text-orange-600'
                          }`}
                        >
                          {!pendingSections.includes(key) ? '✓ ' : '○ '}
                          {SECTION_KEY_TO_LABEL[key] || key}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Summary */}
          {(profile.professional_summary || parseSectionObservations(profile.profile_observations || '')['profissional']) && (
            <div className={`bg-white rounded-lg p-6 border border-slate-200 ${getSectionRingClass('profissional', profile)}`}>
              <AdminSectionAlert sectionKey="profissional" profile={profile} />
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-sky-600" />
                Resumo Profissional
              </h2>
              <p className="text-slate-600 whitespace-pre-line">{profile.professional_summary || 'Nenhum resumo cadastrado'}</p>
            </div>
          )}

          {/* Experience */}
          <div className={`bg-white rounded-lg p-6 border border-slate-200 ${getSectionRingClass('experiencia', profile)}`}>
            <AdminSectionAlert sectionKey="experiencia" profile={profile} />
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-sky-600" />
              Experiência Profissional
            </h2>
            {experiences.length === 0 ? (
              <p className="text-slate-400 text-sm">Nenhuma experiência cadastrada</p>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-sky-400 pl-4">
                    <h3 className="font-medium text-slate-900">{exp.position}</h3>
                    <p className="text-sky-600 text-sm">{exp.company}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {formatDate(exp.start_date)} - {exp.is_current ? 'Atual' : formatDate(exp.end_date)}
                    </p>
                    {exp.description && (
                      <p className="text-slate-500 text-sm mt-2">{exp.description}</p>
                    )}
                    {exp.achievements && (
                      <p className="text-slate-500 text-sm mt-1">
                        <span className="text-slate-400">Conquistas:</span> {exp.achievements}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className={`bg-white rounded-lg p-6 border border-slate-200 ${getSectionRingClass('formacao', profile)}`}>
            <AdminSectionAlert sectionKey="formacao" profile={profile} />
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-sky-600" />
              Formação Acadêmica
            </h2>
            {educations.length === 0 ? (
              <p className="text-slate-400 text-sm">Nenhuma formação cadastrada</p>
            ) : (
              <div className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-sky-400 pl-4">
                    <h3 className="font-medium text-slate-900">{edu.course}</h3>
                    <p className="text-sky-600 text-sm">{edu.institution}</p>
                    <p className="text-slate-400 text-xs mt-1">
                      {getEducationLabel(edu.degree)} | {formatDate(edu.start_date)} - {edu.is_current ? 'Cursando' : formatDate(edu.end_date)}
                    </p>
                    {edu.description && (
                      <p className="text-slate-500 text-sm mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Processos Seletivos */}
          {candidateProcesses.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-sky-600" />
                Processos Seletivos ({candidateProcesses.length})
              </h2>
              <div className="space-y-4">
                {candidateProcesses.map((cp) => {
                  const statusInfo = selectionProcessService.getCandidateStatusLabel(cp.status);
                  const stages = cp.stages_info || [];
                  return (
                    <Link
                      key={cp.id}
                      href={`/admin-panel/processos-seletivos/${cp.process}/candidatos/${cp.id}`}
                      className="block p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-medium text-slate-900 truncate">
                          {cp.process_title || `Processo #${cp.process}`}
                        </p>
                        <div className="flex items-center gap-2 ml-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                            {statusInfo.label}
                          </span>
                          <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-sky-600 transition-colors flex-shrink-0" />
                        </div>
                      </div>
                      {stages.length > 0 && (
                        <div className="flex items-center gap-1">
                          {stages.map((stage, idx) => (
                            <div key={stage.id} className="flex items-center flex-1 min-w-0">
                              <div className="flex flex-col items-center flex-1 min-w-0">
                                <div className={`w-full h-2 rounded-full ${
                                  stage.status === 'completed'
                                    ? 'bg-green-500'
                                    : stage.status === 'current'
                                    ? 'bg-sky-500'
                                    : 'bg-slate-200'
                                }`} />
                                <span className={`text-[10px] mt-1 truncate max-w-full px-0.5 text-center ${
                                  stage.status === 'completed'
                                    ? 'text-emerald-600 font-medium'
                                    : stage.status === 'current'
                                    ? 'text-sky-500 font-semibold'
                                    : 'text-slate-400'
                                }`}>
                                  {stage.status === 'completed' && <CheckCircle className="w-3 h-3 inline mr-0.5 -mt-0.5" />}
                                  {stage.name}
                                </span>
                              </div>
                              {idx < stages.length - 1 && (
                                <div className={`w-1 h-2 flex-shrink-0 ${
                                  stage.status === 'completed' ? 'bg-emerald-300' : 'bg-slate-200'
                                }`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Documentos */}
          {candidateDocs.length > 0 && (
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-sky-600" />
                Documentos
                {docsSummary && (
                  <span className="text-sm font-normal text-slate-500 ml-2">
                    {docsSummary.approved} de {docsSummary.required_types} obrigatórios aprovados
                  </span>
                )}
              </h2>

              {/* Progress bar */}
              {docsSummary && docsSummary.required_types > 0 && (
                <div className="mb-4">
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${(docsSummary.approved / docsSummary.required_types) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {candidateDocs.map((item) => {
                  const docType = item.document_type;
                  const doc = item.document;
                  const status = item.status;

                  return (
                    <div key={docType.id} className={`p-3 rounded-lg border ${
                      status === 'approved' ? 'bg-emerald-50 border-emerald-200' :
                      status === 'rejected' ? 'bg-red-50 border-red-200' :
                      status === 'pending' ? 'bg-amber-50 border-amber-200' :
                      'bg-slate-100/30 border-slate-300'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900 font-medium text-sm">{docType.name}</span>
                            {docType.is_required && (
                              <span className="text-red-600 text-xs">*</span>
                            )}
                            <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                              status === 'approved' ? 'bg-emerald-50 text-emerald-600' :
                              status === 'rejected' ? 'bg-red-50 text-red-600' :
                              status === 'pending' ? 'bg-amber-50 text-amber-700' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {status === 'approved' ? 'Aprovado' :
                               status === 'rejected' ? 'Rejeitado' :
                               status === 'pending' ? 'Pendente' :
                               'Não enviado'}
                            </span>
                          </div>
                          {doc && (
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-slate-500">{doc.original_filename}</span>
                              {doc.file_url && (
                                <a
                                  href={doc.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sky-600 hover:text-sky-500 text-xs"
                                >
                                  <Download className="h-3 w-3 inline" /> Ver
                                </a>
                              )}
                            </div>
                          )}
                          {doc?.observations && (
                            <p className="text-xs text-slate-400 mt-1">Obs: {doc.observations}</p>
                          )}
                        </div>

                        {/* Review Buttons */}
                        {doc && status === 'pending' && (
                          <div className="flex items-center gap-2 ml-3">
                            {reviewingDoc === doc.id ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={reviewObs}
                                  onChange={(e) => setReviewObs(e.target.value)}
                                  placeholder="Observação (obrigatória p/ rejeição)"
                                  className="px-2 py-1 bg-slate-100 border border-slate-300 rounded text-xs text-slate-900 placeholder-slate-400 w-48"
                                />
                                <button
                                  onClick={() => handleReviewDocument(doc.id, 'approved')}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs"
                                  title="Aprovar"
                                >
                                  <Check className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => handleReviewDocument(doc.id, 'rejected')}
                                  className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs"
                                  title="Rejeitar"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => { setReviewingDoc(null); setReviewObs(''); }}
                                  className="text-slate-500 hover:text-slate-900 text-xs"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setReviewingDoc(doc.id)}
                                className="px-3 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs"
                              >
                                Revisar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Candidaturas */}
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-sky-600" />
              Candidaturas ({applications.length})
            </h2>
            {applications.length === 0 ? (
              <p className="text-slate-400 text-sm">Nenhuma candidatura registrada</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                    submitted: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Em análise' },
                    in_process: { bg: 'bg-sky-50', text: 'text-sky-700', label: 'Em processo' },
                    interview_scheduled: { bg: 'bg-violet-50', text: 'text-violet-700', label: 'Entrevista' },
                    approved: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Aprovado' },
                    rejected: { bg: 'bg-red-50', text: 'text-red-700', label: 'Reprovado' },
                    withdrawn: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Retirado' },
                  };
                  const config = statusConfig[app.status] || statusConfig.submitted;

                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900 truncate">
                          {app.job_title || `Vaga #${app.job}`}
                        </p>
                        {app.company_name && (
                          <p className="text-sm text-slate-500 truncate">{app.company_name}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(app.applied_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-3 ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Skills */}
          <div className={`bg-white rounded-lg p-6 border border-slate-200 ${getSectionRingClass('habilidades', profile)}`}>
            <AdminSectionAlert sectionKey="habilidades" profile={profile} />
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-sky-600" />
              Habilidades
            </h2>
            {skills.length === 0 && !profile.skills ? (
              <p className="text-slate-400 text-sm">Nenhuma habilidade cadastrada</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-sky-50 text-sky-500 rounded-full text-sm"
                    title={getSkillLabel(skill.level)}
                  >
                    {skill.skill_name}
                  </span>
                ))}
                {profile.skills && skills.length === 0 && (
                  <p className="text-slate-600 text-sm">{profile.skills}</p>
                )}
              </div>
            )}
          </div>

          {/* Languages */}
          <div className={`bg-white rounded-lg p-6 border border-slate-200 ${getSectionRingClass('idiomas', profile)}`}>
            <AdminSectionAlert sectionKey="idiomas" profile={profile} />
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Languages className="h-5 w-5 text-sky-600" />
              Idiomas
            </h2>
            {languages.length === 0 ? (
              <p className="text-slate-400 text-sm">Nenhum idioma cadastrado</p>
            ) : (
              <div className="space-y-3">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center">
                    <span className="text-slate-600">{lang.language}</span>
                    <span className="text-sm text-sky-600">{getLanguageLabel(lang.proficiency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-lg p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-sky-600" />
              Informações Adicionais
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Escolaridade</span>
                <span className="text-slate-600">{getEducationLabel(profile.education_level)}</span>
              </div>
              {(profile.desired_salary_min || profile.desired_salary_max) && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Pretensão salarial</span>
                  <span className="text-slate-600">
                    {formatCurrency(profile.desired_salary_min)} - {formatCurrency(profile.desired_salary_max)}
                  </span>
                </div>
              )}
              {profile.preferred_work_shift && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Turno preferido</span>
                  <span className="text-slate-600">
                    {profile.preferred_work_shift === 'morning' ? 'Manhã' :
                     profile.preferred_work_shift === 'afternoon' ? 'Tarde' :
                     profile.preferred_work_shift === 'night' ? 'Noite' : 'Flexível'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-400">Possui veículo</span>
                <span className="text-slate-600">{profile.has_vehicle ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Possui CNH</span>
                <span className="text-slate-600">{profile.has_cnh ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </div>

          {/* Certifications */}
          {profile.certifications && (
            <div className="bg-white rounded-lg p-6 border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-sky-600" />
                Certificações
              </h2>
              <p className="text-slate-600 text-sm whitespace-pre-line">{profile.certifications}</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Status Modal */}
      <ProfileStatusModal
        show={showStatusModal}
        candidateName={`${profile.user_name || ''} ${profile.user_last_name || ''}`.trim() || 'Candidato'}
        currentStatus={getProfileStatusInfo(profile.profile_status).label}
        profile={profile}
        educations={educations}
        experiences={experiences}
        skills={skills}
        languages={languages}
        onConfirm={handleUpdateProfileStatus}
        onClose={() => { setShowStatusModal(false); setDefaultModalStatus(undefined); }}
        defaultStatus={defaultModalStatus}
      />
    </div>
  );
}
