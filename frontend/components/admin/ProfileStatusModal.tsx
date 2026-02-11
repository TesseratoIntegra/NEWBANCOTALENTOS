'use client';

import React, { useState, useEffect } from 'react';
import { X, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronUp, User, Briefcase, GraduationCap, Award, Languages } from 'lucide-react';
import { CandidateProfile, CandidateEducation, CandidateExperience, CandidateSkill, CandidateLanguage } from '@/types';

interface ProfileStatusModalProps {
  show: boolean;
  candidateName: string;
  currentStatus?: string;
  profile: CandidateProfile | null;
  educations: CandidateEducation[];
  experiences: CandidateExperience[];
  skills: CandidateSkill[];
  languages: CandidateLanguage[];
  onConfirm: (status: 'approved' | 'rejected' | 'changes_requested', observations: string) => Promise<void>;
  onClose: () => void;
  defaultStatus?: 'approved' | 'rejected' | 'changes_requested';
}

interface SectionFeedback {
  dadosPessoais: string;
  profissional: string;
  formacao: string;
  experiencia: string;
  habilidades: string;
  idiomas: string;
}

const SECTION_LABELS: Record<keyof SectionFeedback, string> = {
  dadosPessoais: 'Dados Pessoais',
  profissional: 'Informações Profissionais',
  formacao: 'Formação Acadêmica',
  experiencia: 'Experiência Profissional',
  habilidades: 'Habilidades',
  idiomas: 'Idiomas',
};

function buildStructuredObservations(sectionFeedback: SectionFeedback, generalNotes: string): string {
  const parts: string[] = [];

  for (const [key, label] of Object.entries(SECTION_LABELS)) {
    const text = sectionFeedback[key as keyof SectionFeedback].trim();
    if (text) {
      parts.push(`[${label}]\n${text}`);
    }
  }

  if (generalNotes.trim()) {
    parts.push(`[Observações Gerais]\n${generalNotes.trim()}`);
  }

  return parts.join('\n\n');
}

function parseSectionFeedback(observations: string): { sections: SectionFeedback; general: string } {
  const sections: SectionFeedback = {
    dadosPessoais: '',
    profissional: '',
    formacao: '',
    experiencia: '',
    habilidades: '',
    idiomas: '',
  };
  let general = '';

  if (!observations) return { sections, general };

  // Try to parse structured format
  const sectionRegex = /\[([^\]]+)\]\n([\s\S]*?)(?=\n\[|$)/g;
  let match;
  let hasStructured = false;

  while ((match = sectionRegex.exec(observations)) !== null) {
    hasStructured = true;
    const label = match[1].trim();
    const content = match[2].trim();

    // Map label back to key
    for (const [key, sectionLabel] of Object.entries(SECTION_LABELS)) {
      if (sectionLabel === label) {
        sections[key as keyof SectionFeedback] = content;
        break;
      }
    }
    if (label === 'Observações Gerais') {
      general = content;
    }
  }

  // If no structured format found, put everything in general
  if (!hasStructured) {
    general = observations;
  }

  return { sections, general };
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
}

export default function ProfileStatusModal({
  show,
  candidateName,
  currentStatus,
  profile,
  educations,
  experiences,
  skills,
  languages,
  onConfirm,
  onClose,
  defaultStatus,
}: ProfileStatusModalProps) {
  const [status, setStatus] = useState<'approved' | 'rejected' | 'changes_requested'>('changes_requested');
  const [sectionFeedback, setSectionFeedback] = useState<SectionFeedback>({
    dadosPessoais: '',
    profissional: '',
    formacao: '',
    experiencia: '',
    habilidades: '',
    idiomas: '',
  });
  const [generalNotes, setGeneralNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Reset state when modal opens
  useEffect(() => {
    if (show) {
      setStatus(defaultStatus || 'changes_requested');
      setError(null);

      // Parse existing observations if any
      if (profile?.profile_observations) {
        const parsed = parseSectionFeedback(profile.profile_observations);
        setSectionFeedback(parsed.sections);
        setGeneralNotes(parsed.general);
      } else {
        setSectionFeedback({
          dadosPessoais: '',
          profissional: '',
          formacao: '',
          experiencia: '',
          habilidades: '',
          idiomas: '',
        });
        setGeneralNotes('');
      }
    }
  }, [show, defaultStatus, profile?.profile_observations]);

  const toggleSection = (key: string) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSectionFeedback = (key: keyof SectionFeedback, value: string) => {
    setSectionFeedback(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const observations = status === 'approved'
      ? ''
      : buildStructuredObservations(sectionFeedback, generalNotes);

    // Validate observations required for non-approved
    if (status !== 'approved' && !observations.trim()) {
      setError('Preencha ao menos uma observação nas seções abaixo ou nas observações gerais.');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(status, observations);
    } catch {
      setError('Erro ao atualizar status do perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    onClose();
  };

  if (!show || !profile) return null;

  const showFeedbackAreas = status !== 'approved';

  return (
    <div className="fixed inset-0 w-full h-screen z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Revisão de Perfil</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {candidateName} {currentStatus && <span>— {currentStatus}</span>}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-slate-500 hover:text-slate-900 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-3 overflow-y-auto flex-1">

            {/* Status Selection */}
            <div className="grid grid-cols-3 gap-2">
              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  status === 'approved'
                    ? 'border-green-500 bg-emerald-50/20'
                    : 'border-slate-300 hover:border-slate-300'
                }`}
              >
                <input type="radio" name="status" value="approved" checked={status === 'approved'} onChange={() => setStatus('approved')} className="sr-only" />
                <CheckCircle className={`h-5 w-5 flex-shrink-0 ${status === 'approved' ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className={`font-medium text-sm ${status === 'approved' ? 'text-emerald-600' : 'text-slate-600'}`}>
                  Aprovar
                </span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  status === 'changes_requested'
                    ? 'border-orange-500 bg-orange-900/20'
                    : 'border-slate-300 hover:border-slate-300'
                }`}
              >
                <input type="radio" name="status" value="changes_requested" checked={status === 'changes_requested'} onChange={() => setStatus('changes_requested')} className="sr-only" />
                <AlertCircle className={`h-5 w-5 flex-shrink-0 ${status === 'changes_requested' ? 'text-orange-600' : 'text-slate-400'}`} />
                <span className={`font-medium text-sm ${status === 'changes_requested' ? 'text-orange-600' : 'text-slate-600'}`}>
                  Solicitar Alterações
                </span>
              </label>

              <label
                className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                  status === 'rejected'
                    ? 'border-red-500 bg-red-50/20'
                    : 'border-slate-300 hover:border-slate-300'
                }`}
              >
                <input type="radio" name="status" value="rejected" checked={status === 'rejected'} onChange={() => setStatus('rejected')} className="sr-only" />
                <XCircle className={`h-5 w-5 flex-shrink-0 ${status === 'rejected' ? 'text-red-600' : 'text-slate-400'}`} />
                <span className={`font-medium text-sm ${status === 'rejected' ? 'text-red-600' : 'text-slate-600'}`}>
                  Reprovar
                </span>
              </label>
            </div>

            {showFeedbackAreas && (
              <p className="text-xs text-slate-400">
                Informe ao candidato quais seções do perfil precisam de melhorias. Clique em cada seção para expandir e escrever um feedback específico.
              </p>
            )}

            {/* ===== Section: Dados Pessoais ===== */}
            <ProfileSection

              icon={<User className="h-4 w-4" />}
              label="Dados Pessoais"
              expanded={!!expandedSections.dadosPessoais}
              onToggle={() => toggleSection('dadosPessoais')}
              feedback={sectionFeedback.dadosPessoais}
              onFeedbackChange={(v) => updateSectionFeedback('dadosPessoais', v)}
              showFeedback={showFeedbackAreas}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <InfoRow label="Nome" value={profile.user_name} />
                <InfoRow label="E-mail" value={profile.user_email} />
                <InfoRow label="CPF" value={profile.cpf} />
                <InfoRow label="Telefone" value={profile.phone_secondary} />
                <InfoRow label="Data Nasc." value={profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString('pt-BR') : undefined} />
                <InfoRow label="Gênero" value={profile.gender === 'M' ? 'Masculino' : profile.gender === 'F' ? 'Feminino' : profile.gender === 'O' ? 'Outro' : profile.gender === 'N' ? 'Prefiro não informar' : undefined} />
                <InfoRow label="Cidade/UF" value={[profile.city, profile.state].filter(Boolean).join(', ') || undefined} />
                <InfoRow label="CEP" value={profile.zip_code} />
                <InfoRow label="Endereço" value={[profile.street, profile.number, profile.complement, profile.neighborhood].filter(Boolean).join(', ') || undefined} />
              </div>
            </ProfileSection>

            {/* ===== Section: Informações Profissionais ===== */}
            <ProfileSection

              icon={<Briefcase className="h-4 w-4" />}
              label="Informações Profissionais"
              expanded={!!expandedSections.profissional}
              onToggle={() => toggleSection('profissional')}
              feedback={sectionFeedback.profissional}
              onFeedbackChange={(v) => updateSectionFeedback('profissional', v)}
              showFeedback={showFeedbackAreas}
            >
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <InfoRow label="Cargo Atual" value={profile.current_position} />
                <InfoRow label="Empresa Atual" value={profile.current_company} />
                <InfoRow label="Experiência" value={profile.experience_years ? `${profile.experience_years} anos` : undefined} />
                <InfoRow label="Escolaridade" value={profile.education_level} />
              </div>
              {profile.professional_summary && (
                <p className="text-xs text-slate-500 mt-2 line-clamp-3">{profile.professional_summary}</p>
              )}
            </ProfileSection>

            {/* ===== Section: Formação Acadêmica ===== */}
            <ProfileSection

              icon={<GraduationCap className="h-4 w-4" />}
              label={`Formação Acadêmica (${educations.length})`}
              expanded={!!expandedSections.formacao}
              onToggle={() => toggleSection('formacao')}
              feedback={sectionFeedback.formacao}
              onFeedbackChange={(v) => updateSectionFeedback('formacao', v)}
              showFeedback={showFeedbackAreas}
            >
              {educations.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhuma formação cadastrada</p>
              ) : (
                <div className="space-y-2">
                  {educations.map(edu => (
                    <div key={edu.id} className="text-sm">
                      <p className="text-slate-700 font-medium">{edu.course}</p>
                      <p className="text-slate-500 text-xs">{edu.institution} — {formatDate(edu.start_date)} - {edu.is_current ? 'Cursando' : formatDate(edu.end_date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </ProfileSection>

            {/* ===== Section: Experiência Profissional ===== */}
            <ProfileSection

              icon={<Briefcase className="h-4 w-4" />}
              label={`Experiência Profissional (${experiences.length})`}
              expanded={!!expandedSections.experiencia}
              onToggle={() => toggleSection('experiencia')}
              feedback={sectionFeedback.experiencia}
              onFeedbackChange={(v) => updateSectionFeedback('experiencia', v)}
              showFeedback={showFeedbackAreas}
            >
              {experiences.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhuma experiência cadastrada</p>
              ) : (
                <div className="space-y-2">
                  {experiences.map(exp => (
                    <div key={exp.id} className="text-sm">
                      <p className="text-slate-700 font-medium">{exp.position}</p>
                      <p className="text-slate-500 text-xs">{exp.company} — {formatDate(exp.start_date)} - {exp.is_current ? 'Atual' : formatDate(exp.end_date)}</p>
                    </div>
                  ))}
                </div>
              )}
            </ProfileSection>

            {/* ===== Section: Habilidades ===== */}
            <ProfileSection

              icon={<Award className="h-4 w-4" />}
              label={`Habilidades (${skills.length})`}
              expanded={!!expandedSections.habilidades}
              onToggle={() => toggleSection('habilidades')}
              feedback={sectionFeedback.habilidades}
              onFeedbackChange={(v) => updateSectionFeedback('habilidades', v)}
              showFeedback={showFeedbackAreas}
            >
              {skills.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhuma habilidade cadastrada</p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {skills.map(skill => (
                    <span key={skill.id} className="px-2 py-0.5 bg-sky-50 text-sky-500 rounded text-xs">
                      {skill.skill_name}
                    </span>
                  ))}
                </div>
              )}
            </ProfileSection>

            {/* ===== Section: Idiomas ===== */}
            <ProfileSection

              icon={<Languages className="h-4 w-4" />}
              label={`Idiomas (${languages.length})`}
              expanded={!!expandedSections.idiomas}
              onToggle={() => toggleSection('idiomas')}
              feedback={sectionFeedback.idiomas}
              onFeedbackChange={(v) => updateSectionFeedback('idiomas', v)}
              showFeedback={showFeedbackAreas}
            >
              {languages.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Nenhum idioma cadastrado</p>
              ) : (
                <div className="space-y-1">
                  {languages.map(lang => (
                    <div key={lang.id} className="flex justify-between text-sm">
                      <span className="text-slate-600">{lang.language}</span>
                      <span className="text-slate-500 text-xs">{lang.proficiency}</span>
                    </div>
                  ))}
                </div>
              )}
            </ProfileSection>

            {/* General Notes */}
            {showFeedbackAreas && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <label className="block text-sm font-medium text-slate-600">
                  Observações Gerais
                </label>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Observações adicionais que não se encaixam em nenhuma seção específica..."
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-50/30 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex justify-end gap-3 p-4 border-t border-slate-200 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                status === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : status === 'changes_requested'
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-red-500 hover:bg-red-600 text-white'
              }`}
            >
              {loading ? 'Salvando...' : status === 'approved' ? 'Aprovar Perfil' : status === 'changes_requested' ? 'Enviar Observações' : 'Reprovar Perfil'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ============================================ */
/* Sub-components                               */
/* ============================================ */

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex gap-2 py-0.5">
      <span className="text-slate-400 flex-shrink-0">{label}:</span>
      <span className={value ? 'text-slate-600' : 'text-slate-400 italic'}>{value || 'Não informado'}</span>
    </div>
  );
}

interface ProfileSectionProps {
  icon: React.ReactNode;
  label: string;
  expanded: boolean;
  onToggle: () => void;
  feedback: string;
  onFeedbackChange: (value: string) => void;
  showFeedback: boolean;
  children: React.ReactNode;
}

function ProfileSection({
  icon,
  label,
  expanded,
  onToggle,
  feedback,
  onFeedbackChange,
  showFeedback,
  children,
}: ProfileSectionProps) {
  const hasFeedback = feedback.trim().length > 0;

  return (
    <div className={`rounded-lg border transition-colors ${hasFeedback && showFeedback ? 'border-orange-200 bg-orange-900/10' : 'border-slate-200 bg-white/50'}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2">
          <span className="text-sky-600">{icon}</span>
          <span className="text-sm font-medium text-slate-700">{label}</span>
          {hasFeedback && showFeedback && (
            <span className="ml-2 px-1.5 py-0.5 bg-orange-50 text-orange-700 rounded text-[10px] font-medium">
              Com feedback
            </span>
          )}
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Data summary */}
          <div className="bg-slate-50 rounded-lg p-3">
            {children}
          </div>

          {/* Feedback textarea */}
          {showFeedback && (
            <textarea
              value={feedback}
              onChange={(e) => onFeedbackChange(e.target.value)}
              placeholder={`O que precisa ser melhorado nesta seção?`}
              rows={2}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
            />
          )}
        </div>
      )}
    </div>
  );
}
