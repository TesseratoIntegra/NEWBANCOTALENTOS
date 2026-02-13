'use client';

import { useState, useEffect } from 'react';
import { formatRS } from '@/functions/FormatRS';
import { CandidateProfile } from '@/types';
import candidateService from '@/services/candidateService';
import { ArrowRight, ArrowLeft } from 'react-bootstrap-icons';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export interface ProfessionalInfoSectionProps {
  profile: CandidateProfile | null;
  onUpdate: (data: Partial<CandidateProfile>) => Promise<CandidateProfile | null>;
  saving: boolean;
}

export default function ProfessionalInfoSection({ profile, onUpdate, saving }: ProfessionalInfoSectionProps) {
  const { setWizardStep, setCurrentStep } = useAuth();
  type EducationLevelType = "" | "fundamental" | "medio" | "tecnico" | "superior" | "pos_graduacao" | "mestrado" | "doutorado";
  interface FormDataType {
    education_level?: EducationLevelType;
    desired_salary_min?: string;
    desired_salary_max?: string;
    professional_summary?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
    available_for_work?: boolean;
    can_travel?: boolean;
    accepts_remote_work?: boolean;
    accepts_relocation?: boolean;
    preferred_work_shift?: 'morning' | 'afternoon' | 'night' | 'flexible';
    has_vehicle?: boolean;
    has_cnh?: boolean;
  }
  const [formData, setFormData] = useState<FormDataType>({
    education_level: '',
    desired_salary_min: '',
    desired_salary_max: '',
    professional_summary: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    available_for_work: true,
    can_travel: false,
    accepts_remote_work: true,
    accepts_relocation: false,
    preferred_work_shift: 'flexible',
    has_vehicle: false,
    has_cnh: false
  });
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    async function fetchProfile() {
      if (!profile) {
        try {
          const data = await candidateService.getCandidateProfile();
          if (data) {
            setFormData({
              education_level: (data.education_level as EducationLevelType) || '',
              desired_salary_min: data.desired_salary_min !== undefined ? String(data.desired_salary_min) : '',
              desired_salary_max: data.desired_salary_max !== undefined ? String(data.desired_salary_max) : '',
              professional_summary: data.professional_summary || '',
              linkedin_url: data.linkedin_url || '',
              github_url: data.github_url || '',
              portfolio_url: data.portfolio_url || '',
              available_for_work: data.available_for_work ?? true,
              can_travel: data.can_travel ?? false,
              accepts_remote_work: data.accepts_remote_work ?? true,
              accepts_relocation: data.accepts_relocation ?? false,
              preferred_work_shift: data.preferred_work_shift || 'flexible',
              has_vehicle: data.has_vehicle ?? false,
              has_cnh: data.has_cnh ?? false
            });
            const allFilled = (
              data.education_level &&
              typeof data.desired_salary_min === 'number' && data.desired_salary_min >= 0 &&
              typeof data.desired_salary_max === 'number' && data.desired_salary_max >= 0 &&
              data.professional_summary && data.professional_summary !== ''
            );
            if (allFilled) {
              setWizardStep(2);
            }
          }
        } catch (error) {
          console.log(error)
        }
      } else {
        setFormData({
          education_level: (profile.education_level as EducationLevelType) || '',
          desired_salary_min: profile.desired_salary_min !== undefined ? String(profile.desired_salary_min) : '',
          desired_salary_max: profile.desired_salary_max !== undefined ? String(profile.desired_salary_max) : '',
          professional_summary: profile.professional_summary || '',
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          portfolio_url: profile.portfolio_url || '',
          available_for_work: profile.available_for_work ?? true,
          can_travel: profile.can_travel ?? false,
          accepts_remote_work: profile.accepts_remote_work ?? true,
          accepts_relocation: profile.accepts_relocation ?? false,
          preferred_work_shift: profile.preferred_work_shift || 'flexible',
          has_vehicle: profile.has_vehicle ?? false,
          has_cnh: profile.has_cnh ?? false
        });
        const allFilled = (
          profile.education_level &&
          typeof profile.desired_salary_min === 'number' && profile.desired_salary_min >= 0 &&
          typeof profile.desired_salary_max === 'number' && profile.desired_salary_max >= 0 &&
          profile.professional_summary && profile.professional_summary !== ''
        );
        if (allFilled) {
          setWizardStep(2);
        }
      }
    }
    fetchProfile();
  }, [profile, setWizardStep]);

  useEffect(() => {
    if (profile) {
      setFormData({
        education_level: (profile.education_level as EducationLevelType) || '',
        desired_salary_min: profile.desired_salary_min !== undefined ? String(profile.desired_salary_min) : '',
        desired_salary_max: profile.desired_salary_max !== undefined ? String(profile.desired_salary_max) : '',
        professional_summary: profile.professional_summary || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || '',
        available_for_work: profile.available_for_work ?? true,
        can_travel: profile.can_travel ?? false,
        accepts_remote_work: profile.accepts_remote_work ?? true,
        accepts_relocation: profile.accepts_relocation ?? false,
        preferred_work_shift: profile.preferred_work_shift || 'flexible',
        has_vehicle: profile.has_vehicle ?? false,
        has_cnh: profile.has_cnh ?? false
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const newErrors: { [key: string]: boolean } = {};
    if (!formData.education_level) newErrors.education_level = true;
    if (!formData.desired_salary_min || formData.desired_salary_min.trim() === '') newErrors.desired_salary_min = true;
    if (!formData.desired_salary_max || formData.desired_salary_max.trim() === '') newErrors.desired_salary_max = true;
    if (!formData.professional_summary || formData.professional_summary.trim() === '') newErrors.professional_summary = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    const submitData: Partial<CandidateProfile> = {
      ...formData,
      education_level: formData.education_level === '' ? undefined : formData.education_level,
      desired_salary_min:
        formData.desired_salary_min !== '' && formData.desired_salary_min !== undefined
          ? formatRS(formData.desired_salary_min)
          : undefined,
      desired_salary_max:
        formData.desired_salary_max !== '' && formData.desired_salary_max !== undefined
          ? formatRS(formData.desired_salary_max)
          : undefined,
    };
    await onUpdate(submitData);
    setWizardStep(2);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (name === 'desired_salary_min' || name === 'desired_salary_max') {
      const raw = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: raw }));
    } else if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
      }));
    }
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const educationLevels = candidateService.getEducationLevels();
  const workShiftOptions = candidateService.getWorkShiftOptions();

  return (
    <div className="lg:p-6">
      <h2 className="text-center lg:text-right text-xl lg:text-2xl font-bold text-blue-900 mb-6">Perfil Profissional</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Escolaridade */}
        <div>
          <label htmlFor="education_level" className="block text-sm font-medium text-zinc-700 mb-2">
            Nível de Escolaridade
            <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">Obrigatório</span>
          </label>
          <select
            id="education_level"
            name="education_level"
            value={formData.education_level || ''}
            onChange={handleChange}
            className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.education_level ? 'border-red-500' : 'border-slate-400'}`}
          >
            <option value="">Selecione...</option>
            {educationLevels.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-400 mt-1">Seu nível mais alto de formação concluída ou em andamento</p>
          {errors.education_level && <span className="text-xs text-red-600">Campo obrigatório</span>}
        </div>

        {/* Pretensão Salarial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="desired_salary_min" className="block text-sm font-medium text-zinc-700 mb-2">
              Pretensão Salarial Mínima (R$)
              <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">Obrigatório</span>
            </label>
            <input
              type="text"
              id="desired_salary_min"
              name="desired_salary_min"
              value={formData.desired_salary_min ? formatRS(formData.desired_salary_min) : ''}
              onChange={handleChange}
              inputMode="numeric"
              placeholder="R$ 0,00"
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.desired_salary_min ? 'border-red-500' : 'border-slate-400'}`}
              maxLength={25}
            />
            <p className="text-xs text-slate-400 mt-1">Valor mínimo que você espera receber</p>
            {errors.desired_salary_min && <span className="text-xs text-red-600">Campo obrigatório</span>}
          </div>

          <div>
            <label htmlFor="desired_salary_max" className="block text-sm font-medium text-zinc-700 mb-2">
              Pretensão Salarial Máxima (R$)
              <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">Obrigatório</span>
            </label>
            <input
              type="text"
              id="desired_salary_max"
              name="desired_salary_max"
              value={formData.desired_salary_max ? formatRS(formData.desired_salary_max) : ''}
              onChange={handleChange}
              inputMode="numeric"
              placeholder="R$ 0,00"
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.desired_salary_max ? 'border-red-500' : 'border-slate-400'}`}
              maxLength={25}
            />
            <p className="text-xs text-slate-400 mt-1">Valor máximo da sua pretensão salarial</p>
            {errors.desired_salary_max && <span className="text-xs text-red-600">Campo obrigatório</span>}
          </div>
        </div>

        {/* Resumo Profissional */}
        <div>
          <label htmlFor="professional_summary" className="block text-sm font-medium text-zinc-700 mb-2">
            Resumo Profissional
            <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600">Obrigatório</span>
          </label>
          <textarea
            id="professional_summary"
            name="professional_summary"
            value={formData.professional_summary || ''}
            onChange={handleChange}
            rows={4}
            placeholder="Descreva sua experiência profissional, objetivos e principais conquistas..."
            className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${errors.professional_summary ? 'border-red-500' : 'border-slate-400'}`}
          />
          <p className="text-xs text-slate-400 mt-1">Escreva um breve resumo sobre sua carreira, habilidades e objetivos</p>
          {errors.professional_summary && <span className="text-xs text-red-600">Campo obrigatório</span>}
        </div>

        {/* Links Profissionais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">Links Profissionais</h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-zinc-700 mb-2">
                LinkedIn
                <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Opcional</span>
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/seuperfil"
                className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">Link do seu perfil no LinkedIn</p>
            </div>

            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-zinc-700 mb-2">
                GitHub
                <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Opcional</span>
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url || ''}
                onChange={handleChange}
                placeholder="https://github.com/seuusuario"
                className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">Link do seu perfil no GitHub</p>
            </div>

            <div>
              <label htmlFor="portfolio_url" className="block text-sm font-medium text-zinc-700 mb-2">
                Portfólio
                <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Opcional</span>
              </label>
              <input
                type="url"
                id="portfolio_url"
                name="portfolio_url"
                value={formData.portfolio_url || ''}
                onChange={handleChange}
                placeholder="https://seuportfolio.com"
                className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-slate-400 mt-1">Link do seu site ou portfólio online</p>
            </div>
          </div>
        </div>

        {/* Preferências de Trabalho */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">Preferências de Trabalho</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center">
                <input type="checkbox" id="available_for_work" name="available_for_work" checked={formData.available_for_work || false} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white cursor-pointer" />
                <label htmlFor="available_for_work" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                  <span className="font-medium">Disponível para trabalho</span>
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-7">Indica que você está buscando novas oportunidades</p>
            </div>

            <div>
              <div className="flex items-center">
                <input type="checkbox" id="accepts_remote_work" name="accepts_remote_work" checked={formData.accepts_remote_work || false} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white cursor-pointer" />
                <label htmlFor="accepts_remote_work" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                  <span className="font-medium">Aceita trabalho remoto</span>
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-7">Aceita vagas 100% remotas ou híbridas</p>
            </div>

            <div>
              <div className="flex items-center">
                <input type="checkbox" id="can_travel" name="can_travel" checked={formData.can_travel || false} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white cursor-pointer" />
                <label htmlFor="can_travel" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                  <span className="font-medium">Disponível para viagens</span>
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-7">Aceita vagas que exijam viagens frequentes</p>
            </div>

            <div>
              <div className="flex items-center">
                <input type="checkbox" id="accepts_relocation" name="accepts_relocation" checked={formData.accepts_relocation || false} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white cursor-pointer" />
                <label htmlFor="accepts_relocation" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                  <span className="font-medium">Aceita mudança de cidade</span>
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-7">Aceita se mudar para outra cidade ou estado</p>
            </div>

            <div>
              <div className="flex items-center">
                <input type="checkbox" id="has_vehicle" name="has_vehicle" checked={formData.has_vehicle || false} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white cursor-pointer" />
                <label htmlFor="has_vehicle" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                  <span className="font-medium">Possui veículo</span>
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-7">Tem carro ou moto própria</p>
            </div>

            <div>
              <div className="flex items-center">
                <input type="checkbox" id="has_cnh" name="has_cnh" checked={formData.has_cnh || false} onChange={handleChange} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white cursor-pointer" />
                <label htmlFor="has_cnh" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                  <span className="font-medium">Possui CNH</span>
                </label>
              </div>
              <p className="text-xs text-slate-400 mt-1 ml-7">Tem Carteira Nacional de Habilitação</p>
            </div>
          </div>

          <div>
            <label htmlFor="preferred_work_shift" className="block text-sm font-medium text-zinc-700 mb-2">
              Turno Preferido
              <span className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">Opcional</span>
            </label>
            <select
              id="preferred_work_shift"
              name="preferred_work_shift"
              value={formData.preferred_work_shift || 'flexible'}
              onChange={handleChange}
              className="w-full md:w-1/2 px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {workShiftOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-400 mt-1">Turno de trabalho de sua preferência</p>
          </div>
        </div>

        {/* Botões */}
        <div className="flex justify-center lg:justify-end pt-6 border-t border-zinc-400">
          <div onClick={() => { setCurrentStep(0) }} className="mr-auto bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </div>
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
