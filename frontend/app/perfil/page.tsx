'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import candidateService from '@/services/candidateService';
import applicationService from '@/services/applicationService';
import { CandidateProfile, CandidateEducation, CandidateExperience, CandidateSkill, CandidateLanguage, Application, CandidateInProcess } from '@/types';
import selectionProcessService from '@/services/selectionProcessService';
import { toast } from 'react-hot-toast';
import Navbar from '@/components/Navbar';
import LoadChiap from '@/components/LoadChiap';
import * as Icon from 'react-bootstrap-icons';
import { MapPin, Mail, Phone, Linkedin, Github, Globe, Briefcase, GraduationCap, Award, Languages, Settings, Edit2, Plus, Trash2, X, AlertCircle, CheckCircle, ClipboardList } from 'lucide-react';

// Componentes de Modal
import EditPersonalInfoModal from '@/components/profile/modals/EditPersonalInfoModal';
import EditProfessionalInfoModal from '@/components/profile/modals/EditProfessionalInfoModal';
import EditExperienceModal from '@/components/profile/modals/EditExperienceModal';
import EditEducationModal from '@/components/profile/modals/EditEducationModal';
import EditSkillModal from '@/components/profile/modals/EditSkillModal';
import EditLanguageModal from '@/components/profile/modals/EditLanguageModal';
import EditPreferencesModal from '@/components/profile/modals/EditPreferencesModal';
import ApplicationsSection from '@/components/profile/ApplicationsSection';
import SelectionProcessesSection from '@/components/profile/SelectionProcessesSection';
import Link from 'next/link';
import { FileText } from 'lucide-react';

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

function SectionAlert({ sectionKey, profile }: { sectionKey: string; profile: CandidateProfile }) {
  if (profile.profile_status !== 'changes_requested' || !profile.profile_observations) return null;

  const observations = parseSectionObservations(profile.profile_observations);
  const text = observations[sectionKey];
  if (!text) return null;

  const pending = profile.pending_observation_sections || [];
  const isPending = pending.includes(sectionKey);
  const isCompleted = !isPending;

  return (
    <div className={`flex items-start gap-2 rounded-lg px-3 py-2 mb-3 text-sm ${
      isCompleted
        ? 'bg-green-50 border border-green-200'
        : 'bg-orange-50 border border-orange-200'
    }`}>
      <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${
        isCompleted ? 'bg-green-500' : 'bg-orange-500 animate-pulse'
      }`} />
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${isCompleted ? 'text-green-700' : 'text-orange-700'}`}>
          {isCompleted ? 'Seção atualizada' : 'Pendência do recrutador'}
        </p>
        <p className={`text-xs mt-0.5 ${isCompleted ? 'text-green-600 line-through' : 'text-orange-600'}`}>{text}</p>
      </div>
    </div>
  );
}

function StructuredObservations({ text, isRejected, pendingSections }: { text: string; isRejected?: boolean; pendingSections?: string[] }) {
  // Try to parse structured format: [Section Name]\ncontent
  const sectionRegex = /\[([^\]]+)\]\n([\s\S]*?)(?=\n\[|$)/g;
  const sections: { title: string; content: string }[] = [];
  let match;

  while ((match = sectionRegex.exec(text)) !== null) {
    sections.push({ title: match[1].trim(), content: match[2].trim() });
  }

  // If no structured sections found, render as plain text
  if (sections.length === 0) {
    return <p className="text-slate-700 text-sm whitespace-pre-line">{text}</p>;
  }

  // Map section titles to keys for checking pending status
  const LABEL_TO_KEY: Record<string, string> = {
    'Dados Pessoais': 'dadosPessoais',
    'Informações Profissionais': 'profissional',
    'Formação Acadêmica': 'formacao',
    'Experiência Profissional': 'experiencia',
    'Habilidades': 'habilidades',
    'Idiomas': 'idiomas',
  };

  const borderColor = isRejected ? 'border-red-300' : 'border-orange-300';
  const titleColor = isRejected ? 'text-red-800' : 'text-orange-800';

  return (
    <div className="space-y-2">
      {sections.map((section, idx) => {
        const sectionKey = LABEL_TO_KEY[section.title];
        const isCompleted = pendingSections && sectionKey && !pendingSections.includes(sectionKey);

        return (
          <div key={idx} className={`border-l-2 ${isCompleted ? 'border-green-300' : borderColor} pl-3 py-1`}>
            <div className="flex items-center gap-2">
              {pendingSections && sectionKey && (
                isCompleted
                  ? <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  : <AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
              )}
              <p className={`text-sm font-semibold ${isCompleted ? 'text-green-800' : titleColor}`}>
                {section.title}
                {isCompleted && <span className="font-normal text-green-600 ml-2">— Atualizado</span>}
              </p>
            </div>
            <p className="text-slate-700 text-sm whitespace-pre-line">{section.content}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function ProfileViewPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [educations, setEducations] = useState<CandidateEducation[]>([]);
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [languages, setLanguages] = useState<CandidateLanguage[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [myProcesses, setMyProcesses] = useState<CandidateInProcess[]>([]);

  // Estados dos modais
  const [editPersonalModal, setEditPersonalModal] = useState(false);
  const [editProfessionalModal, setEditProfessionalModal] = useState(false);
  const [editExperienceModal, setEditExperienceModal] = useState<CandidateExperience | null | 'new'>(null);
  const [editEducationModal, setEditEducationModal] = useState<CandidateEducation | null | 'new'>(null);
  const [editSkillModal, setEditSkillModal] = useState<CandidateSkill | null | 'new'>(null);
  const [editLanguageModal, setEditLanguageModal] = useState<CandidateLanguage | null | 'new'>(null);
  const [editPreferencesModal, setEditPreferencesModal] = useState(false);
  const [showApprovedBanner, setShowApprovedBanner] = useState(false);

  useEffect(() => {
    if (user?.user_type === 'candidate') {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, educationsData, experiencesData, skillsData, languagesData, applicationsData, processesData] = await Promise.all([
        candidateService.getCandidateProfile().catch(() => null),
        candidateService.getCandidateEducations().catch(() => []),
        candidateService.getCandidateExperiences().catch(() => []),
        candidateService.getCandidateSkills().catch(() => []),
        candidateService.getCandidateLanguages().catch(() => []),
        applicationService.getMyApplications().catch(() => []),
        selectionProcessService.getMyProcesses().catch(() => [])
      ]);

      // Se não tem perfil, redirecionar para o wizard de criação
      if (!profileData) {
        router.push('/perfil/criar');
        return;
      }

      setProfile(profileData);
      setEducations(Array.isArray(educationsData) ? educationsData : educationsData.results || []);
      setExperiences(Array.isArray(experiencesData) ? experiencesData : experiencesData.results || []);
      setSkills(Array.isArray(skillsData) ? skillsData : skillsData.results || []);
      setLanguages(Array.isArray(languagesData) ? languagesData : languagesData.results || []);
      setApplications(Array.isArray(applicationsData) ? applicationsData : applicationsData.results || []);
      setMyProcesses(Array.isArray(processesData) ? processesData : []);

      // Mostrar banner de aprovação apenas na primeira vez
      if (profileData.profile_status === 'approved') {
        const dismissed = localStorage.getItem('profile_approved_banner_dismissed');
        if (!dismissed) {
          setShowApprovedBanner(true);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar informações do perfil');
    } finally {
      setLoading(false);
    }
  };

  // Funções auxiliares
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8025';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
  };

  const getProficiencyLevel = (proficiency: string) => {
    const levels: Record<string, number> = {
      'basic': 1,
      'intermediate': 3,
      'advanced': 4,
      'fluent': 5,
      'native': 5
    };
    return levels[proficiency] || 1;
  };

  const getProficiencyLabel = (proficiency: string) => {
    const labels: Record<string, string> = {
      'basic': 'Básico',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado',
      'fluent': 'Fluente',
      'native': 'Nativo'
    };
    return labels[proficiency] || proficiency;
  };

  const getSkillLevelLabel = (level: string) => {
    const labels: Record<string, string> = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário',
      'advanced': 'Avançado',
      'expert': 'Expert'
    };
    return labels[level] || level;
  };

  const getDegreeLabel = (degree: string) => {
    const labels: Record<string, string> = {
      'fundamental': 'Ensino Fundamental',
      'medio': 'Ensino Médio',
      'tecnico': 'Técnico',
      'superior': 'Graduação',
      'pos_graduacao': 'Pós-Graduação',
      'mestrado': 'Mestrado',
      'doutorado': 'Doutorado'
    };
    return labels[degree] || degree;
  };

  // Handlers de atualização
  const handleProfileUpdate = async (data: Partial<CandidateProfile>) => {
    try {
      if (profile) {
        const updated = await candidateService.updateCandidateProfile(profile.id, data);
        setProfile(updated);
        toast.success('Perfil atualizado com sucesso!');
        return updated;
      }
      return null;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
      return null;
    }
  };

  const handleDeleteExperience = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta experiência?')) return;
    try {
      await candidateService.deleteCandidateExperience(id);
      setExperiences(prev => prev.filter(e => e.id !== id));
      toast.success('Experiência excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir experiência');
    }
  };

  const handleDeleteEducation = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta formação?')) return;
    try {
      await candidateService.deleteCandidateEducation(id);
      setEducations(prev => prev.filter(e => e.id !== id));
      toast.success('Formação excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir formação');
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta habilidade?')) return;
    try {
      await candidateService.deleteCandidateSkill(id);
      setSkills(prev => prev.filter(s => s.id !== id));
      toast.success('Habilidade excluída com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir habilidade');
    }
  };

  const handleDeleteLanguage = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este idioma?')) return;
    try {
      await candidateService.deleteCandidateLanguage(id);
      setLanguages(prev => prev.filter(l => l.id !== id));
      toast.success('Idioma excluído com sucesso!');
    } catch (error) {
      toast.error('Erro ao excluir idioma');
    }
  };

  if (user?.user_type !== 'candidate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Acesso Negado</h1>
          <p className="text-slate-600">Esta página é apenas para candidatos.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
        <LoadChiap />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">

        {/* Profile Status Alert */}
        {profile && (profile.profile_status === 'changes_requested' || profile.profile_status === 'rejected') && profile.profile_observations && (
          <div className={`rounded-lg p-4 mb-6 border ${
            profile.profile_status === 'rejected'
              ? 'bg-red-50 border-red-200'
              : 'bg-orange-50 border-orange-200'
          }`}>
            <div className="flex items-start gap-3">
              <AlertCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${
                profile.profile_status === 'rejected' ? 'text-red-600' : 'text-orange-600'
              }`} />
              <div className="flex-1">
                <h3 className={`font-semibold ${
                  profile.profile_status === 'rejected' ? 'text-red-800' : 'text-orange-800'
                }`}>
                  {profile.profile_status === 'rejected'
                    ? 'Perfil Reprovado'
                    : 'Pendências no Perfil'}
                </h3>
                <div className="mt-2 space-y-3">
                  <StructuredObservations
                    text={profile.profile_observations}
                    isRejected={profile.profile_status === 'rejected'}
                    pendingSections={profile.profile_status === 'changes_requested' ? profile.pending_observation_sections : undefined}
                  />
                </div>
                {profile.profile_reviewed_at && (
                  <p className="text-slate-500 text-xs mt-2">
                    Enviado em {new Date(profile.profile_reviewed_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                )}
                {profile.profile_status === 'changes_requested' && profile.pending_observation_sections && profile.pending_observation_sections.length > 0 && (() => {
                  // Parse total sections from observations
                  const sectionRegex = /\[([^\]]+)\]/g;
                  const LABEL_TO_KEY: Record<string, string> = {
                    'Dados Pessoais': 'dadosPessoais',
                    'Informações Profissionais': 'profissional',
                    'Formação Acadêmica': 'formacao',
                    'Experiência Profissional': 'experiencia',
                    'Habilidades': 'habilidades',
                    'Idiomas': 'idiomas',
                  };
                  const allKeys: string[] = [];
                  let m;
                  while ((m = sectionRegex.exec(profile.profile_observations || '')) !== null) {
                    const key = LABEL_TO_KEY[m[1].trim()];
                    if (key) allKeys.push(key);
                  }
                  const total = allKeys.length;
                  const pending = profile.pending_observation_sections.length;
                  const completed = total - pending;

                  if (total === 0) return null;

                  return (
                    <div className="mt-3 bg-white/60 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-700 font-medium">Progresso das atualizações</span>
                        <span className="text-slate-600">{completed} de {total} seções atualizadas</span>
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
                              !profile.pending_observation_sections!.includes(key)
                                ? 'bg-green-100 text-green-700'
                                : 'bg-orange-100 text-orange-700'
                            }`}
                          >
                            {!profile.pending_observation_sections!.includes(key) ? '✓ ' : '○ '}
                            {SECTION_KEY_TO_LABEL[key] || key}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })()}
                <p className="text-slate-600 text-sm mt-3">
                  <strong>Atualize seu perfil</strong> de acordo com as observações acima para continuar no processo seletivo.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Profile Status Badge (if approved) */}
        {showApprovedBanner && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold text-green-800">Perfil Aprovado</h3>
                  <p className="text-green-700 text-sm">Seu perfil foi aprovado no processo seletivo. Continue se candidatando às vagas!</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowApprovedBanner(false);
                  localStorage.setItem('profile_approved_banner_dismissed', 'true');
                }}
                className="text-green-600 hover:text-green-800 p-1 rounded transition-colors flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Documents Banner (only after approved in selection process) */}
        {myProcesses.some(p => p.status === 'approved') && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-blue-800">Envio de Documentos</h3>
                  <p className="text-blue-700 text-sm">Você foi aprovado no processo seletivo! Envie os documentos solicitados para continuar o processo de admissão.</p>
                </div>
              </div>
              <Link
                href="/perfil/documentos"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex-shrink-0"
              >
                <FileText className="h-4 w-4" />
                Ver Documentos
              </Link>
            </div>
          </div>
        )}

        {/* Profile Status Badge (if awaiting review) */}
        {profile?.profile_status === 'awaiting_review' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <div>
                <h3 className="font-semibold text-blue-800">Aguardando Revisão</h3>
                <p className="text-blue-700 text-sm">Seu perfil foi atualizado e está aguardando revisão do recrutador. Você será notificado quando houver uma resposta.</p>
              </div>
            </div>
          </div>
        )}

        {/* Selection Process Notification Banner */}
        {myProcesses.length > 0 && myProcesses.some(p => ['pending', 'in_progress'].includes(p.status)) && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="h-5 w-5 text-indigo-600" />
              <div>
                <h3 className="font-semibold text-indigo-800">
                  Você está em {myProcesses.filter(p => ['pending', 'in_progress'].includes(p.status)).length} processo(s) seletivo(s)
                </h3>
                <p className="text-indigo-700 text-sm">Veja abaixo o andamento dos seus processos seletivos.</p>
              </div>
            </div>
          </div>
        )}

        {/* Header do Perfil */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
          profile && profile.profile_status === 'changes_requested' && profile.pending_observation_sections?.includes('dadosPessoais')
            ? 'ring-2 ring-orange-300'
            : ''
        }`}>
          {profile && <SectionAlert sectionKey="dadosPessoais" profile={profile} />}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Foto */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 border-4 border-blue-500">
                {profile?.image_profile ? (
                  <Image
                    src={getImageUrl(profile.image_profile) || ''}
                    alt="Foto de perfil"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Icon.PersonFill className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
              <button
                onClick={() => setEditPersonalModal(true)}
                className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Informações principais */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-blue-900">{user?.name}{user?.last_name ? ` ${user.last_name}` : ''}</h1>
              <p className="text-lg text-slate-600">{profile?.current_position || 'Cargo não informado'}</p>

              <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                {profile?.city && profile?.state && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city}, {profile.state}
                  </span>
                )}
                {user?.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {user.email}
                  </span>
                )}
                {profile?.phone_secondary && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {profile.phone_secondary}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-3 mt-3">
                {profile?.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile?.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" className="text-slate-700 hover:text-slate-900">
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {profile?.portfolio_url && (
                  <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-800">
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="flex flex-col gap-2">
              {profile?.available_for_work ? (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
                  Disponível
                </span>
              ) : (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                  <span className="w-2 h-2 rounded-full bg-red-500 mr-2"></span>
                  Indisponível
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Sobre Mim */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
          profile && profile.profile_status === 'changes_requested' && profile.pending_observation_sections?.includes('profissional')
            ? 'ring-2 ring-orange-300'
            : ''
        }`}>
          {profile && <SectionAlert sectionKey="profissional" profile={profile} />}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Icon.PersonVcard className="w-5 h-5" />
              Sobre Mim
            </h2>
            <button
              onClick={() => setEditProfessionalModal(true)}
              className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>
          <p className="text-slate-600 whitespace-pre-line">
            {profile?.professional_summary || 'Nenhum resumo profissional cadastrado.'}
          </p>
        </div>

        {/* Experiência Profissional */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
          profile && profile.profile_status === 'changes_requested' && profile.pending_observation_sections?.includes('experiencia')
            ? 'ring-2 ring-orange-300'
            : ''
        }`}>
          {profile && <SectionAlert sectionKey="experiencia" profile={profile} />}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experiência Profissional
            </h2>
            <button
              onClick={() => setEditExperienceModal('new')}
              className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>

          {experiences.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhuma experiência cadastrada.</p>
          ) : (
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id} className="border-l-4 border-blue-500 pl-4 py-2 relative group">
                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => setEditExperienceModal(exp)}
                      className="text-slate-400 hover:text-blue-500 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteExperience(exp.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-800">{exp.position}</h3>
                  <p className="text-slate-600">{exp.company}</p>
                  <p className="text-sm text-slate-500">
                    {formatDate(exp.start_date)} - {exp.is_current ? 'Atualmente' : formatDate(exp.end_date)}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-slate-600 mt-2 whitespace-pre-line">{exp.description}</p>
                  )}
                  {exp.achievements && (
                    <div className="mt-2">
                      <p className="text-sm font-medium text-slate-700">Conquistas:</p>
                      <p className="text-sm text-slate-600 whitespace-pre-line">{exp.achievements}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Formação Acadêmica */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
          profile && profile.profile_status === 'changes_requested' && profile.pending_observation_sections?.includes('formacao')
            ? 'ring-2 ring-orange-300'
            : ''
        }`}>
          {profile && <SectionAlert sectionKey="formacao" profile={profile} />}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5" />
              Formação Acadêmica
            </h2>
            <button
              onClick={() => setEditEducationModal('new')}
              className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>

          {educations.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhuma formação cadastrada.</p>
          ) : (
            <div className="space-y-4">
              {educations.map((edu) => (
                <div key={edu.id} className="border-l-4 border-emerald-500 pl-4 py-2 relative group">
                  <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => setEditEducationModal(edu)}
                      className="text-slate-400 hover:text-blue-500 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteEducation(edu.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-slate-800">{edu.course}</h3>
                  <p className="text-slate-600">{edu.institution}</p>
                  <p className="text-sm text-slate-500">
                    {getDegreeLabel(edu.degree)} | {formatDate(edu.start_date)} - {edu.is_current ? 'Cursando' : formatDate(edu.end_date)}
                  </p>
                  {edu.description && (
                    <p className="text-sm text-slate-600 mt-2">{edu.description}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habilidades */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
          profile && profile.profile_status === 'changes_requested' && profile.pending_observation_sections?.includes('habilidades')
            ? 'ring-2 ring-orange-300'
            : ''
        }`}>
          {profile && <SectionAlert sectionKey="habilidades" profile={profile} />}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Habilidades
            </h2>
            <button
              onClick={() => setEditSkillModal('new')}
              className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>

          {skills.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhuma habilidade cadastrada.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="group relative inline-flex items-center px-3 py-2 rounded-full bg-blue-100 text-blue-800 text-sm"
                >
                  <span>{skill.skill_name}</span>
                  <span className="ml-2 text-xs text-blue-600">({getSkillLevelLabel(skill.level)})</span>
                  <div className="absolute -right-1 -top-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                    <button
                      onClick={() => setEditSkillModal(skill)}
                      className="bg-white rounded-full p-1 shadow-md text-blue-500 hover:text-blue-700"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skill.id)}
                      className="bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Idiomas */}
        <div className={`bg-white rounded-lg shadow-md p-6 mb-6 ${
          profile && profile.profile_status === 'changes_requested' && profile.pending_observation_sections?.includes('idiomas')
            ? 'ring-2 ring-orange-300'
            : ''
        }`}>
          {profile && <SectionAlert sectionKey="idiomas" profile={profile} />}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Languages className="w-5 h-5" />
              Idiomas
            </h2>
            <button
              onClick={() => setEditLanguageModal('new')}
              className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors flex items-center gap-1"
            >
              <Plus className="w-5 h-5" />
              Adicionar
            </button>
          </div>

          {languages.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Nenhum idioma cadastrado.</p>
          ) : (
            <div className="space-y-3">
              {languages.map((lang) => (
                <div key={lang.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <span className="font-medium text-slate-700 w-32">{lang.language}</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`w-3 h-3 rounded-full ${
                            level <= getProficiencyLevel(lang.proficiency)
                              ? 'bg-blue-500'
                              : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-slate-500">{getProficiencyLabel(lang.proficiency)}</span>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <button
                      onClick={() => setEditLanguageModal(lang)}
                      className="text-slate-400 hover:text-blue-500 p-1"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteLanguage(lang.id)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preferências de Trabalho */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Preferências de Trabalho
            </h2>
            <button
              onClick={() => setEditPreferencesModal(true)}
              className="text-blue-500 hover:text-blue-700 p-2 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Edit2 className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${profile?.available_for_work ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-slate-600">
                {profile?.available_for_work ? 'Disponível para trabalho' : 'Indisponível'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${profile?.accepts_remote_work ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-slate-600">
                {profile?.accepts_remote_work ? 'Aceita remoto' : 'Apenas presencial'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${profile?.can_travel ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-slate-600">
                {profile?.can_travel ? 'Disponível para viagens' : 'Não viaja'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${profile?.accepts_relocation ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-sm text-slate-600">
                {profile?.accepts_relocation ? 'Aceita mudança' : 'Não muda de cidade'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${profile?.has_vehicle ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <span className="text-sm text-slate-600">
                {profile?.has_vehicle ? 'Possui veículo' : 'Sem veículo'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${profile?.has_cnh ? 'bg-green-500' : 'bg-slate-300'}`}></span>
              <span className="text-sm text-slate-600">
                {profile?.has_cnh ? 'Possui CNH' : 'Sem CNH'}
              </span>
            </div>
          </div>
        </div>

        {/* Meus Processos Seletivos */}
        {myProcesses.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Meus Processos Seletivos
              </h2>
            </div>
            <SelectionProcessesSection processes={myProcesses} />
          </div>
        )}

        {/* Minhas Candidaturas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Minhas Candidaturas
            </h2>
            <Link
              href="/candidaturas"
              className="text-blue-500 hover:text-blue-700 text-sm font-medium"
            >
              Ver todas
            </Link>
          </div>
          <ApplicationsSection applications={applications} />
        </div>

      </div>

      {/* Modais */}
      {editPersonalModal && profile && (
        <EditPersonalInfoModal
          profile={profile}
          user={user}
          onClose={() => setEditPersonalModal(false)}
          onSave={async (data) => {
            const result = await handleProfileUpdate(data);
            if (result) setEditPersonalModal(false);
          }}
          onProfileChange={setProfile}
        />
      )}

      {editProfessionalModal && profile && (
        <EditProfessionalInfoModal
          profile={profile}
          onClose={() => setEditProfessionalModal(false)}
          onSave={async (data) => {
            const result = await handleProfileUpdate(data);
            if (result) setEditProfessionalModal(false);
          }}
        />
      )}

      {editExperienceModal && (
        <EditExperienceModal
          experience={editExperienceModal === 'new' ? null : editExperienceModal}
          onClose={() => setEditExperienceModal(null)}
          onSave={async (data) => {
            if (editExperienceModal === 'new') {
              const newExp = await candidateService.createCandidateExperience(data);
              setExperiences(prev => [...prev, newExp]);
            } else {
              const updated = await candidateService.updateCandidateExperience(editExperienceModal.id, data);
              setExperiences(prev => prev.map(e => e.id === updated.id ? updated : e));
            }
            setEditExperienceModal(null);
            toast.success('Experiência salva com sucesso!');
            // Reload profile to update pending_observation_sections
            const updatedProfile = await candidateService.getCandidateProfile().catch(() => null);
            if (updatedProfile) setProfile(updatedProfile);
          }}
        />
      )}

      {editEducationModal && (
        <EditEducationModal
          education={editEducationModal === 'new' ? null : editEducationModal}
          onClose={() => setEditEducationModal(null)}
          onSave={async (data) => {
            if (editEducationModal === 'new') {
              const newEdu = await candidateService.createCandidateEducation(data);
              setEducations(prev => [...prev, newEdu]);
            } else {
              const updated = await candidateService.updateCandidateEducation(editEducationModal.id, data);
              setEducations(prev => prev.map(e => e.id === updated.id ? updated : e));
            }
            setEditEducationModal(null);
            toast.success('Formação salva com sucesso!');
            // Reload profile to update pending_observation_sections
            const updatedProfile = await candidateService.getCandidateProfile().catch(() => null);
            if (updatedProfile) setProfile(updatedProfile);
          }}
        />
      )}

      {editSkillModal && (
        <EditSkillModal
          skill={editSkillModal === 'new' ? null : editSkillModal}
          onClose={() => setEditSkillModal(null)}
          onSave={async (data) => {
            if (editSkillModal === 'new') {
              const newSkill = await candidateService.createCandidateSkill(data);
              setSkills(prev => [...prev, newSkill]);
            } else {
              const updated = await candidateService.updateCandidateSkill(editSkillModal.id, data);
              setSkills(prev => prev.map(s => s.id === updated.id ? updated : s));
            }
            setEditSkillModal(null);
            toast.success('Habilidade salva com sucesso!');
            // Reload profile to update pending_observation_sections
            const updatedProfile = await candidateService.getCandidateProfile().catch(() => null);
            if (updatedProfile) setProfile(updatedProfile);
          }}
        />
      )}

      {editLanguageModal && (
        <EditLanguageModal
          language={editLanguageModal === 'new' ? null : editLanguageModal}
          onClose={() => setEditLanguageModal(null)}
          onSave={async (data) => {
            if (editLanguageModal === 'new') {
              const newLang = await candidateService.createCandidateLanguage(data);
              setLanguages(prev => [...prev, newLang]);
            } else {
              const updated = await candidateService.updateCandidateLanguage(editLanguageModal.id, data);
              setLanguages(prev => prev.map(l => l.id === updated.id ? updated : l));
            }
            setEditLanguageModal(null);
            toast.success('Idioma salvo com sucesso!');
            // Reload profile to update pending_observation_sections
            const updatedProfile = await candidateService.getCandidateProfile().catch(() => null);
            if (updatedProfile) setProfile(updatedProfile);
          }}
        />
      )}

      {editPreferencesModal && profile && (
        <EditPreferencesModal
          profile={profile}
          onClose={() => setEditPreferencesModal(false)}
          onSave={async (data) => {
            const result = await handleProfileUpdate(data);
            if (result) setEditPreferencesModal(false);
          }}
        />
      )}
    </div>
  );
}
