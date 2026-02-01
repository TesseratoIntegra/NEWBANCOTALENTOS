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
  AlertCircle
} from 'lucide-react';
import candidateService from '@/services/candidateService';
import applicationService from '@/services/applicationService';
import ProfileStatusModal from '@/components/admin/ProfileStatusModal';
import {
  CandidateProfile,
  CandidateEducation,
  CandidateExperience,
  CandidateSkill,
  CandidateLanguage,
  Application,
  PaginatedResponse
} from '@/types';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);

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
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getProfileStatusInfo = (status?: string) => {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string; borderColor: string }> = {
      pending: { label: 'Em análise', bgColor: 'bg-amber-900/50', textColor: 'text-amber-300', borderColor: 'border-amber-700' },
      awaiting_review: { label: 'Aguardando Revisão', bgColor: 'bg-blue-900/50', textColor: 'text-blue-300', borderColor: 'border-blue-700' },
      approved: { label: 'Aprovado', bgColor: 'bg-green-900/50', textColor: 'text-green-300', borderColor: 'border-green-700' },
      rejected: { label: 'Reprovado', bgColor: 'bg-red-900/50', textColor: 'text-red-300', borderColor: 'border-red-700' },
      changes_requested: { label: 'Aguardando Candidato', bgColor: 'bg-orange-900/50', textColor: 'text-orange-300', borderColor: 'border-orange-700' },
    };
    return statusMap[status || 'pending'] || statusMap.pending;
  };

  const handleUpdateProfileStatus = async (
    status: 'approved' | 'rejected' | 'changes_requested',
    observations: string
  ) => {
    try {
      await candidateService.updateProfileStatus(candidateId, status, observations);
      toast.success(
        status === 'approved'
          ? 'Perfil aprovado com sucesso!'
          : status === 'changes_requested'
          ? 'Observações enviadas ao candidato!'
          : 'Perfil reprovado.'
      );
      // Atualizar o perfil localmente
      setProfile((prev) =>
        prev ? { ...prev, profile_status: status, profile_observations: observations } : prev
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar
        </button>
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-6 text-center">
          <p className="text-red-200">{error || 'Talento não encontrado'}</p>
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
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Voltar para lista
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {profile.profile_status === 'approved' ? (
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/50 text-green-300 rounded-lg border border-green-700">
              <CheckCircle className="h-5 w-5" />
              Perfil Aprovado
            </span>
          ) : (
            <>
              <button
                onClick={() => handleUpdateProfileStatus('approved', '')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                <CheckCircle className="h-5 w-5" />
                Aprovar Perfil
              </button>
              <button
                onClick={() => setShowStatusModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
              >
                <AlertCircle className="h-5 w-5" />
                Observações
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Photo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-4xl overflow-hidden">
              {profile.image_profile ? (
                <img
                  src={profile.image_profile}
                  alt={profile.user_name || 'Candidato'}
                  className="w-full h-full object-cover"
                />
              ) : (
                profile.user_name?.charAt(0).toUpperCase() || '?'
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {profile.user_name || 'Nome não informado'}
            </h1>
            <p className="text-lg text-indigo-400 mb-4">
              {profile.current_position || 'Cargo não informado'}
              {profile.current_company && (
                <span className="text-zinc-400"> em {profile.current_company}</span>
              )}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.user_email && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Mail className="h-4 w-4 text-zinc-500" />
                  <a href={`mailto:${profile.user_email}`} className="hover:text-indigo-400">
                    {profile.user_email}
                  </a>
                </div>
              )}
              {profile.phone_secondary && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Phone className="h-4 w-4 text-zinc-500" />
                  {profile.phone_secondary}
                </div>
              )}
              {(profile.city || profile.state) && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <MapPin className="h-4 w-4 text-zinc-500" />
                  {[profile.city, profile.state].filter(Boolean).join(', ')}
                </div>
              )}
              {profile.experience_years && (
                <div className="flex items-center gap-2 text-zinc-300">
                  <Briefcase className="h-4 w-4 text-zinc-500" />
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
                  className="p-2 bg-zinc-700 rounded-lg hover:bg-indigo-600 transition-colors text-zinc-300 hover:text-white"
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
                  className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors text-zinc-300 hover:text-white"
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
                  className="p-2 bg-zinc-700 rounded-lg hover:bg-zinc-600 transition-colors text-zinc-300 hover:text-white"
                  title="Portfólio"
                >
                  <Globe className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Status Tags */}
          <div className="flex flex-wrap gap-2 md:flex-col md:items-end">
            {/* Profile Status Badge */}
            {(() => {
              const statusInfo = getProfileStatusInfo(profile.profile_status);
              return (
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor}`}>
                  {profile.profile_status === 'approved' ? <CheckCircle className="h-4 w-4" /> :
                   profile.profile_status === 'rejected' ? <X className="h-4 w-4" /> :
                   profile.profile_status === 'awaiting_review' ? <Clock className="h-4 w-4" /> :
                   <AlertCircle className="h-4 w-4" />}
                  {statusInfo.label}
                </span>
              );
            })()}
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              profile.available_for_work
                ? 'bg-green-900/50 text-green-300 border border-green-700'
                : 'bg-zinc-700 text-zinc-400 border border-zinc-600'
            }`}>
              {profile.available_for_work ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              Disponível
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              profile.accepts_remote_work
                ? 'bg-blue-900/50 text-blue-300 border border-blue-700'
                : 'bg-zinc-700 text-zinc-400 border border-zinc-600'
            }`}>
              {profile.accepts_remote_work ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              Remoto
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              profile.accepts_relocation
                ? 'bg-purple-900/50 text-purple-300 border border-purple-700'
                : 'bg-zinc-700 text-zinc-400 border border-zinc-600'
            }`}>
              {profile.accepts_relocation ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              Mudança
            </span>
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
              profile.can_travel
                ? 'bg-amber-900/50 text-amber-300 border border-amber-700'
                : 'bg-zinc-700 text-zinc-400 border border-zinc-600'
            }`}>
              {profile.can_travel ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              Viagens
            </span>
          </div>
        </div>
      </div>

      {/* Profile Observations Alert */}
      {profile.profile_observations && (
        <div className={`rounded-lg p-4 border ${
          profile.profile_status === 'rejected'
            ? 'bg-red-900/30 border-red-500/50'
            : 'bg-orange-900/30 border-orange-500/50'
        }`}>
          <div className="flex items-start gap-3">
            <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
              profile.profile_status === 'rejected' ? 'text-red-400' : 'text-orange-400'
            }`} />
            <div>
              <h3 className={`font-medium ${
                profile.profile_status === 'rejected' ? 'text-red-300' : 'text-orange-300'
              }`}>
                {profile.profile_status === 'rejected' ? 'Motivo da Reprovação' : 'Observações Enviadas'}
              </h3>
              <p className="text-zinc-300 mt-1 text-sm whitespace-pre-line">
                {profile.profile_observations}
              </p>
              {profile.profile_reviewed_at && (
                <p className="text-zinc-500 text-xs mt-2">
                  Enviado em {new Date(profile.profile_reviewed_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Professional Summary */}
          {profile.professional_summary && (
            <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-400" />
                Resumo Profissional
              </h2>
              <p className="text-zinc-300 whitespace-pre-line">{profile.professional_summary}</p>
            </div>
          )}

          {/* Experience */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-indigo-400" />
              Experiência Profissional
            </h2>
            {experiences.length === 0 ? (
              <p className="text-zinc-500 text-sm">Nenhuma experiência cadastrada</p>
            ) : (
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="border-l-2 border-indigo-500 pl-4">
                    <h3 className="font-medium text-white">{exp.position}</h3>
                    <p className="text-indigo-400 text-sm">{exp.company}</p>
                    <p className="text-zinc-500 text-xs mt-1">
                      {formatDate(exp.start_date)} - {exp.is_current ? 'Atual' : formatDate(exp.end_date)}
                    </p>
                    {exp.description && (
                      <p className="text-zinc-400 text-sm mt-2">{exp.description}</p>
                    )}
                    {exp.achievements && (
                      <p className="text-zinc-400 text-sm mt-1">
                        <span className="text-zinc-500">Conquistas:</span> {exp.achievements}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Education */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-400" />
              Formação Acadêmica
            </h2>
            {educations.length === 0 ? (
              <p className="text-zinc-500 text-sm">Nenhuma formação cadastrada</p>
            ) : (
              <div className="space-y-4">
                {educations.map((edu) => (
                  <div key={edu.id} className="border-l-2 border-indigo-500 pl-4">
                    <h3 className="font-medium text-white">{edu.course}</h3>
                    <p className="text-indigo-400 text-sm">{edu.institution}</p>
                    <p className="text-zinc-500 text-xs mt-1">
                      {getEducationLabel(edu.degree)} | {formatDate(edu.start_date)} - {edu.is_current ? 'Cursando' : formatDate(edu.end_date)}
                    </p>
                    {edu.description && (
                      <p className="text-zinc-400 text-sm mt-2">{edu.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Candidaturas */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-400" />
              Candidaturas ({applications.length})
            </h2>
            {applications.length === 0 ? (
              <p className="text-zinc-500 text-sm">Nenhuma candidatura registrada</p>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
                    submitted: { bg: 'bg-amber-900/50', text: 'text-amber-300', label: 'Em análise' },
                    in_process: { bg: 'bg-blue-900/50', text: 'text-blue-300', label: 'Em processo' },
                    interview_scheduled: { bg: 'bg-purple-900/50', text: 'text-purple-300', label: 'Entrevista' },
                    approved: { bg: 'bg-green-900/50', text: 'text-green-300', label: 'Aprovado' },
                    rejected: { bg: 'bg-red-900/50', text: 'text-red-300', label: 'Reprovado' },
                    withdrawn: { bg: 'bg-zinc-700', text: 'text-zinc-400', label: 'Retirado' },
                  };
                  const config = statusConfig[app.status] || statusConfig.submitted;

                  return (
                    <div key={app.id} className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white truncate">
                          {app.job_title || `Vaga #${app.job}`}
                        </p>
                        {app.company_name && (
                          <p className="text-sm text-zinc-400 truncate">{app.company_name}</p>
                        )}
                        <p className="text-xs text-zinc-500 mt-1">
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
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Award className="h-5 w-5 text-indigo-400" />
              Habilidades
            </h2>
            {skills.length === 0 && !profile.skills ? (
              <p className="text-zinc-500 text-sm">Nenhuma habilidade cadastrada</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-sm"
                    title={getSkillLabel(skill.level)}
                  >
                    {skill.skill_name}
                  </span>
                ))}
                {profile.skills && skills.length === 0 && (
                  <p className="text-zinc-300 text-sm">{profile.skills}</p>
                )}
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Languages className="h-5 w-5 text-indigo-400" />
              Idiomas
            </h2>
            {languages.length === 0 ? (
              <p className="text-zinc-500 text-sm">Nenhum idioma cadastrado</p>
            ) : (
              <div className="space-y-3">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center">
                    <span className="text-zinc-300">{lang.language}</span>
                    <span className="text-sm text-indigo-400">{getLanguageLabel(lang.proficiency)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              Informações Adicionais
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Escolaridade</span>
                <span className="text-zinc-300">{getEducationLabel(profile.education_level)}</span>
              </div>
              {(profile.desired_salary_min || profile.desired_salary_max) && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Pretensão salarial</span>
                  <span className="text-zinc-300">
                    {formatCurrency(profile.desired_salary_min)} - {formatCurrency(profile.desired_salary_max)}
                  </span>
                </div>
              )}
              {profile.preferred_work_shift && (
                <div className="flex justify-between">
                  <span className="text-zinc-500">Turno preferido</span>
                  <span className="text-zinc-300">
                    {profile.preferred_work_shift === 'morning' ? 'Manhã' :
                     profile.preferred_work_shift === 'afternoon' ? 'Tarde' :
                     profile.preferred_work_shift === 'night' ? 'Noite' : 'Flexível'}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-500">Possui veículo</span>
                <span className="text-zinc-300">{profile.has_vehicle ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Possui CNH</span>
                <span className="text-zinc-300">{profile.has_cnh ? 'Sim' : 'Não'}</span>
              </div>
            </div>
          </div>

          {/* Certifications */}
          {profile.certifications && (
            <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
              <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-indigo-400" />
                Certificações
              </h2>
              <p className="text-zinc-300 text-sm whitespace-pre-line">{profile.certifications}</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Status Modal */}
      <ProfileStatusModal
        show={showStatusModal}
        candidateName={profile.user_name || 'Candidato'}
        currentStatus={getProfileStatusInfo(profile.profile_status).label}
        onConfirm={handleUpdateProfileStatus}
        onClose={() => setShowStatusModal(false)}
      />
    </div>
  );
}
