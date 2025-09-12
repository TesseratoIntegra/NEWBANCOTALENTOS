'use client';

import { useState, useEffect } from 'react';
import { CandidateProfile } from '@/types';
import candidateService from '@/services/candidateService';
import { Save } from 'lucide-react';

export interface PreferencesSectionProps {
  profile: CandidateProfile | null;
  onUpdate: (data: Partial<CandidateProfile>) => Promise<void>;
  saving: boolean;
}

export default function PreferencesSection({ profile, onUpdate, saving }: PreferencesSectionProps) {
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({
    available_for_work: true,
    can_travel: false,
    accepts_remote_work: true,
    accepts_relocation: false,
    preferred_work_shift: 'flexible',
    has_vehicle: false,
    has_cnh: false
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        available_for_work: profile.available_for_work,
        can_travel: profile.can_travel,
        accepts_remote_work: profile.accepts_remote_work,
        accepts_relocation: profile.accepts_relocation,
        preferred_work_shift: profile.preferred_work_shift,
        has_vehicle: profile.has_vehicle,
        has_cnh: profile.has_cnh
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onUpdate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' && e.target instanceof HTMLInputElement ? e.target.checked : value
    }));
  };

  const workShiftOptions = candidateService.getWorkShiftOptions();

  return (
    <div className="lg:p-6">
      <h2 className="text-center lg:text-right text-xl lg:text-2xl font-bold text-blue-900 mb-6">Preferências de Trabalho</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Disponibilidade */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">Disponibilidade</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="available_for_work"
                name="available_for_work"
                checked={formData.available_for_work || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white cursor-pointer"
              />
              <label htmlFor="available_for_work" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                <span className="font-medium">Disponível para trabalho</span>
                <p className="text-slate-700 text-xs mt-1">Estou ativamente procurando novas oportunidades</p>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="can_travel"
                name="can_travel"
                checked={formData.can_travel || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-wh cursor-pointerite"
              />
              <label htmlFor="can_travel" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                <span className="font-medium">Disponível para viagens</span>
                <p className="text-slate-700 text-xs mt-1">Aceito posições que exijam viagens a trabalho</p>
              </label>
            </div>
          </div>
        </div>

        {/* Modalidade de Trabalho */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">Modalidade de Trabalho</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="accepts_remote_work"
                name="accepts_remote_work"
                checked={formData.accepts_remote_work || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white cursor-pointer"
              />
              <label htmlFor="accepts_remote_work" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                <span className="font-medium">Aceita trabalho remoto</span>
                <p className="text-slate-700 text-xs mt-1">Estou confortável trabalhando remotamente</p>
              </label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="accepts_relocation"
                name="accepts_relocation"
                checked={formData.accepts_relocation || false}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white cursor-pointer"
              />
              <label htmlFor="accepts_relocation" className="ml-3 block text-sm text-zinc-700 cursor-pointer">
                <span className="font-medium">Aceita mudança de cidade</span>
                <p className="text-slate-700 text-xs mt-1">Posso me mudar para outra cidade se necessário</p>
              </label>
            </div>
          </div>
        </div>

        {/* Turno Preferido */}
        <div>
          <label htmlFor="preferred_work_shift" className="block text-sm font-medium text-zinc-700 mb-2">
            Turno Preferido
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
        </div>

        {/* Resumo das Preferências */}
        <div className="bg-white rounded-md border border-blue-900/50 p-4">
          <h4 className="text-sm font-medium text-zinc-700 mb-3">Resumo das suas preferências:</h4>
          <div className="space-y-2 text-sm text-zinc-600">
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${formData.available_for_work ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {formData.available_for_work ? 'Disponível para trabalho' : 'Indisponível para trabalho'}
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${formData.accepts_remote_work ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {formData.accepts_remote_work ? 'Aceita trabalho remoto' : 'Prefere trabalho presencial'}
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${formData.can_travel ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {formData.can_travel ? 'Disponível para viagens' : 'Não disponível para viagens'}
            </div>
            <div className="flex items-center">
              <span className={`w-2 h-2 rounded-full mr-2 ${formData.accepts_relocation ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {formData.accepts_relocation ? 'Aceita mudança de cidade' : 'Não aceita mudança de cidade'}
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 rounded-full mr-2 bg-blue-500"></span>
              Turno preferido: {workShiftOptions.find(opt => opt.value === formData.preferred_work_shift)?.label || 'Flexível'}
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-end pt-6 border-t border-zinc-400">
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
                Salvar Preferências
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
