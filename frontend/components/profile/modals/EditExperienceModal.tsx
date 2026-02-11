'use client';

import { useState } from 'react';
import { CandidateExperience } from '@/types';
import { X, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import DateInput from '@/components/ui/DateInput';

interface EditExperienceModalProps {
  experience: CandidateExperience | null;
  onClose: () => void;
  onSave: (data: Partial<CandidateExperience>) => Promise<void>;
}

export default function EditExperienceModal({ experience, onClose, onSave }: EditExperienceModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    company: experience?.company || '',
    position: experience?.position || '',
    start_date: experience?.start_date || '',
    end_date: experience?.end_date || '',
    is_current: experience?.is_current || false,
    description: experience?.description || '',
    achievements: experience?.achievements || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.is_current && !formData.end_date) {
      toast.error('Data de término é obrigatória se não for trabalho atual.');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Descrição das atividades é obrigatória.');
      return;
    }

    setSaving(true);
    try {
      const dataToSend = {
        company: formData.company,
        position: formData.position,
        start_date: formData.start_date,
        end_date: formData.is_current ? null : formData.end_date,
        is_current: formData.is_current,
        description: formData.description,
        achievements: formData.achievements || '',
      };
      await onSave(dataToSend);
    } catch (error) {
      console.error('Erro ao salvar experiência:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">
            {experience ? 'Editar Experiência' : 'Nova Experiência'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cargo *</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                placeholder="Ex: Desenvolvedor Full Stack"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Empresa *</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="Nome da empresa"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início *</label>
              <DateInput
                name="start_date"
                value={formData.start_date}
                onChange={(iso) => setFormData(prev => ({ ...prev, start_date: iso }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Data de Término {!formData.is_current && '*'}
              </label>
              <DateInput
                name="end_date"
                value={formData.end_date}
                onChange={(iso) => setFormData(prev => ({ ...prev, end_date: iso }))}
                disabled={formData.is_current}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_current"
              name="is_current"
              checked={formData.is_current}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
            />
            <label htmlFor="is_current" className="ml-2 block text-sm text-slate-700 cursor-pointer">
              Trabalho atualmente nesta empresa
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição das Atividades *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Descreva suas principais atividades e responsabilidades..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Conquistas</label>
            <textarea
              name="achievements"
              value={formData.achievements}
              onChange={handleChange}
              rows={3}
              placeholder="Liste suas principais conquistas e realizações..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
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
