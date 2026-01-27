'use client';

import { useState } from 'react';
import { CandidateProfile } from '@/types';
import { X, Save } from 'lucide-react';
import candidateService from '@/services/candidateService';

interface EditProfessionalInfoModalProps {
  profile: CandidateProfile;
  onClose: () => void;
  onSave: (data: Partial<CandidateProfile>) => Promise<void>;
}

export default function EditProfessionalInfoModal({ profile, onClose, onSave }: EditProfessionalInfoModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    current_position: profile.current_position || '',
    current_company: profile.current_company || '',
    education_level: profile.education_level || '',
    experience_years: profile.experience_years || 0,
    desired_salary_min: profile.desired_salary_min || '',
    desired_salary_max: profile.desired_salary_max || '',
    professional_summary: profile.professional_summary || '',
    linkedin_url: profile.linkedin_url || '',
    github_url: profile.github_url || '',
    portfolio_url: profile.portfolio_url || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } finally {
      setSaving(false);
    }
  };

  const educationOptions = candidateService.getEducationLevels();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">Editar Dados Profissionais</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cargo e Empresa */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cargo Atual/Desejado</label>
              <input
                type="text"
                name="current_position"
                value={formData.current_position}
                onChange={handleChange}
                placeholder="Ex: Desenvolvedor Full Stack"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empresa Atual</label>
              <input
                type="text"
                name="current_company"
                value={formData.current_company}
                onChange={handleChange}
                placeholder="Nome da empresa"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Escolaridade e Experiência */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Escolaridade</label>
              <select
                name="education_level"
                value={formData.education_level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione</option>
                {educationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Anos de Experiência</label>
              <input
                type="number"
                name="experience_years"
                value={formData.experience_years}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Pretensão Salarial */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pretensão Salarial Mínima</label>
              <input
                type="text"
                name="desired_salary_min"
                value={formData.desired_salary_min}
                onChange={handleChange}
                placeholder="R$ 0,00"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pretensão Salarial Máxima</label>
              <input
                type="text"
                name="desired_salary_max"
                value={formData.desired_salary_max}
                onChange={handleChange}
                placeholder="R$ 0,00"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Resumo Profissional */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Resumo Profissional</label>
            <textarea
              name="professional_summary"
              value={formData.professional_summary}
              onChange={handleChange}
              rows={5}
              placeholder="Fale um pouco sobre você, sua experiência e objetivos profissionais..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Links */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Links Profissionais</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn</label>
                <input
                  type="url"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/seu-perfil"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">GitHub</label>
                <input
                  type="url"
                  name="github_url"
                  value={formData.github_url}
                  onChange={handleChange}
                  placeholder="https://github.com/seu-usuario"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Portfólio</label>
                <input
                  type="url"
                  name="portfolio_url"
                  value={formData.portfolio_url}
                  onChange={handleChange}
                  placeholder="https://seu-portfolio.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white px-6 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
