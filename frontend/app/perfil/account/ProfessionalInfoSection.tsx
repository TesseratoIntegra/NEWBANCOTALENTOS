'use client';

import { useState, useEffect } from 'react';
import { CandidateProfile } from '@/types';
import candidateService from '@/services/candidateService';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface ProfessionalInfoSectionProps {
  profile: CandidateProfile | null;
  onUpdate: (data: Partial<CandidateProfile>) => Promise<void>;
  saving: boolean;
}

export default function ProfessionalInfoSection({ profile, onUpdate, saving }: ProfessionalInfoSectionProps) {
  const { setWizardStep } = useAuth();
  type EducationLevelType = "" | "fundamental" | "medio" | "tecnico" | "superior" | "pos_graduacao" | "mestrado" | "doutorado";
  interface FormDataType {
    current_position?: string;
    current_company?: string;
    education_level?: EducationLevelType;
    experience_years?: number;
    desired_salary_min?: number;
    desired_salary_max?: number;
    professional_summary?: string;
    skills?: string;
    certifications?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
  }
  const [formData, setFormData] = useState<FormDataType>({
    current_position: '',
    current_company: '',
    education_level: '',
    experience_years: undefined,
    desired_salary_min: undefined,
    desired_salary_max: undefined,
    professional_summary: '',
    skills: '',
    certifications: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: boolean }>({});

  // Requisita os dados do candidato no início
  useEffect(() => {
    async function fetchProfile() {
      if (!profile) {
        try {
          const data = await candidateService.getCandidateProfile();
          if (data) {
            setFormData({
              current_position: data.current_position || '',
              current_company: data.current_company || '',
              education_level: (data.education_level as EducationLevelType) || '',
              experience_years: typeof data.experience_years === 'number' ? data.experience_years : undefined,
              desired_salary_min: typeof data.desired_salary_min === 'number' ? data.desired_salary_min : undefined,
              desired_salary_max: typeof data.desired_salary_max === 'number' ? data.desired_salary_max : undefined,
              professional_summary: data.professional_summary || '',
              skills: data.skills || '',
              certifications: data.certifications || '',
              linkedin_url: data.linkedin_url || '',
              github_url: data.github_url || '',
              portfolio_url: data.portfolio_url || ''
            });
            // Verifica se todos os campos obrigatórios estão preenchidos
            const allFilled = (
              data.current_position && data.current_position !== '' &&
              data.current_company && data.current_company !== '' &&
              data.education_level &&
              typeof data.experience_years === 'number' && data.experience_years >= 0 &&
              typeof data.desired_salary_min === 'number' && data.desired_salary_min >= 0 &&
              typeof data.desired_salary_max === 'number' && data.desired_salary_max >= 0 &&
              data.professional_summary && data.professional_summary !== '' &&
              data.skills && data.skills !== ''
            );
            if (allFilled) {
              setWizardStep(3);
            }
          }
        } catch (error) {
          // erro ao buscar perfil
          console.log(error)
        }
      } else {
        // Se já veio via prop, verifica se todos obrigatórios estão preenchidos
        setFormData({
          current_position: profile.current_position || '',
          current_company: profile.current_company || '',
          education_level: (profile.education_level as EducationLevelType) || '',
          experience_years: typeof profile.experience_years === 'number' ? profile.experience_years : undefined,
          desired_salary_min: typeof profile.desired_salary_min === 'number' ? profile.desired_salary_min : undefined,
          desired_salary_max: typeof profile.desired_salary_max === 'number' ? profile.desired_salary_max : undefined,
          professional_summary: profile.professional_summary || '',
          skills: profile.skills || '',
          certifications: profile.certifications || '',
          linkedin_url: profile.linkedin_url || '',
          github_url: profile.github_url || '',
          portfolio_url: profile.portfolio_url || ''
        });
        const allFilled = (
          profile.current_position && profile.current_position !== '' &&
          profile.current_company && profile.current_company !== '' &&
          profile.education_level &&
          typeof profile.experience_years === 'number' && profile.experience_years >= 0 &&
          typeof profile.desired_salary_min === 'number' && profile.desired_salary_min >= 0 &&
          typeof profile.desired_salary_max === 'number' && profile.desired_salary_max >= 0 &&
          profile.professional_summary && profile.professional_summary !== '' &&
          profile.skills && profile.skills !== ''
        );
        if (allFilled) {
          setWizardStep(3);
        }
      }
    }
    fetchProfile();
  }, [profile, setWizardStep]);

  useEffect(() => {
    if (profile) {
      setFormData({
        current_position: profile.current_position || '',
        current_company: profile.current_company || '',
        education_level: (profile.education_level as EducationLevelType) || '',
        experience_years: typeof profile.experience_years === 'number' ? profile.experience_years : undefined,
        desired_salary_min: typeof profile.desired_salary_min === 'number' ? profile.desired_salary_min : undefined,
        desired_salary_max: typeof profile.desired_salary_max === 'number' ? profile.desired_salary_max : undefined,
        professional_summary: profile.professional_summary || '',
        skills: profile.skills || '',
        certifications: profile.certifications || '',
        linkedin_url: profile.linkedin_url || '',
        github_url: profile.github_url || '',
        portfolio_url: profile.portfolio_url || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Validação obrigatória
    const newErrors: { [key: string]: boolean } = {};
    if (!formData.current_position || formData.current_position.trim() === '') newErrors.current_position = true;
    if (!formData.current_company || formData.current_company.trim() === '') newErrors.current_company = true;
  if (!formData.education_level) newErrors.education_level = true;
    if (formData.experience_years === undefined || formData.experience_years < 0) newErrors.experience_years = true;
    if (formData.desired_salary_min === undefined || formData.desired_salary_min < 0) newErrors.desired_salary_min = true;
    if (formData.desired_salary_max === undefined || formData.desired_salary_max < 0) newErrors.desired_salary_max = true;
    if (!formData.professional_summary || formData.professional_summary.trim() === '') newErrors.professional_summary = true;
    if (!formData.skills || formData.skills.trim() === '') newErrors.skills = true;
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }
    // Converter campos numéricos
    // Ajusta education_level para undefined se for string vazia
    const submitData: Partial<CandidateProfile> = {
      ...formData,
      education_level: formData.education_level === '' ? undefined : formData.education_level,
    };
    await onUpdate(submitData);
    setWizardStep(3); // Avança para o próximo passo do wizard
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value
    }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const educationLevels = candidateService.getEducationLevels();

  return (
    <div className="lg:p-6">
      <h2 className="text-center lg:text-right text-xl lg:text-2xl font-bold text-blue-900 mb-6">Dados Profissionais</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Posição e Empresa Atual */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="current_position" className="block text-sm font-medium text-zinc-700 mb-2">
              Cargo Atual
            </label>
            <input
              type="text"
              id="current_position"
              name="current_position"
              value={formData.current_position || ''}
              onChange={handleChange}
              placeholder="Desenvolvedor, Analista, etc."
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.current_position ? 'border-red-500' : 'border-slate-400'}`}
            />
            {errors.current_position && <span className="text-xs text-red-600">Campo obrigatório</span>}
          </div>

          <div>
            <label htmlFor="current_company" className="block text-sm font-medium text-zinc-700 mb-2">
              Empresa Atual
            </label>
            <input
              type="text"
              id="current_company"
              name="current_company"
              value={formData.current_company || ''}
              onChange={handleChange}
              placeholder="Nome da empresa"
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.current_company ? 'border-red-500' : 'border-slate-400'}`}
            />
            {errors.current_company && <span className="text-xs text-red-600">Campo obrigatório</span>}
          </div>
        </div>

        {/* Escolaridade e Anos de Experiência */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="education_level" className="block text-sm font-medium text-zinc-700 mb-2">
              Nível de Escolaridade
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
            {errors.education_level && <span className="text-xs text-red-600">Campo obrigatório</span>}
          </div>

          <div>
            <label htmlFor="experience_years" className="block text-sm font-medium text-zinc-700 mb-2">
              Anos de Experiência
            </label>
            <input
              type="number"
              id="experience_years"
              name="experience_years"
              value={formData.experience_years || ''}
              onChange={handleChange}
              min="0"
              max="50"
              placeholder="0"
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.experience_years ? 'border-red-500' : 'border-slate-400'}`}
            />
            {errors.experience_years && <span className="text-xs text-red-600">Campo obrigatório</span>}
          </div>
        </div>

        {/* Pretensão Salarial */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="desired_salary_min" className="block text-sm font-medium text-zinc-700 mb-2">
              Pretensão Salarial Mínima (R$)
            </label>
            <input
              type="number"
              id="desired_salary_min"
              name="desired_salary_min"
              value={formData.desired_salary_min || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.desired_salary_min ? 'border-red-500' : 'border-slate-400'}`}
            />
            {errors.desired_salary_min && <span className="text-xs text-red-600">Campo obrigatório</span>}
          </div>

          <div>
            <label htmlFor="desired_salary_max" className="block text-sm font-medium text-zinc-700 mb-2">
              Pretensão Salarial Máxima (R$)
            </label>
            <input
              type="number"
              id="desired_salary_max"
              name="desired_salary_max"
              value={formData.desired_salary_max || ''}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="0.00"
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.desired_salary_max ? 'border-red-500' : 'border-slate-400'}`}
            />
            {errors.desired_salary_max && <span className="text-xs text-red-600">Campo obrigatório</span>}
          </div>
        </div>

        {/* Resumo Profissional */}
        <div>
          <label htmlFor="professional_summary" className="block text-sm font-medium text-zinc-700 mb-2">
            Resumo Profissional
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
          {errors.professional_summary && <span className="text-xs text-red-600">Campo obrigatório</span>}
        </div>

        {/* Habilidades */}
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-zinc-700 mb-2">
            Habilidades e Competências
          </label>
          <textarea
            id="skills"
            name="skills"
            value={formData.skills || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Liste suas principais habilidades técnicas e comportamentais..."
            className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${errors.skills ? 'border-red-500' : 'border-slate-400'}`}
          />
          {errors.skills && <span className="text-xs text-red-600">Campo obrigatório</span>}
        </div>

        {/* Certificações */}
        <div>
          <label htmlFor="certifications" className="block text-sm font-medium text-zinc-700 mb-2">
            Certificações
          </label>
          <textarea
            id="certifications"
            name="certifications"
            value={formData.certifications || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Liste suas certificações, cursos e qualificações..."
            className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical ${errors.certifications ? 'border-red-500' : 'border-slate-400'}`}
          />
            {/* Campo não obrigatório */}
        </div>

        {/* Links Profissionais */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">Links Profissionais</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="linkedin_url" className="block text-sm font-medium text-zinc-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                id="linkedin_url"
                name="linkedin_url"
                value={formData.linkedin_url || ''}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/seuperfil"
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.linkedin_url ? 'border-red-500' : 'border-slate-400'}`}
              />
              {/* Campo não obrigatório */}
            </div>

            <div>
              <label htmlFor="github_url" className="block text-sm font-medium text-zinc-700 mb-2">
                GitHub
              </label>
              <input
                type="url"
                id="github_url"
                name="github_url"
                value={formData.github_url || ''}
                onChange={handleChange}
                placeholder="https://github.com/seuusuario"
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.github_url ? 'border-red-500' : 'border-slate-400'}`}
              />
              {/* Campo não obrigatório */}
            </div>
          </div>

          <div>
            <label htmlFor="portfolio_url" className="block text-sm font-medium text-zinc-700 mb-2">
              Portfólio
            </label>
            <input
              type="url"
              id="portfolio_url"
              name="portfolio_url"
              value={formData.portfolio_url || ''}
              onChange={handleChange}
              placeholder="https://seuportfolio.com"
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.portfolio_url ? 'border-red-500' : 'border-slate-400'}`}
            />
            {/* Campo não obrigatório */}
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-center lg:justify-end pt-6 border-t border-zinc-400">
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
                <Save className="h-4 w-4 mr-2" />
                Salvar Dados
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
