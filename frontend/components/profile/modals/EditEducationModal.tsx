'use client';

import { useState } from 'react';
import { CandidateEducation } from '@/types';
import { X, Save } from 'lucide-react';
import candidateService from '@/services/candidateService';

interface EditEducationModalProps {
  education: CandidateEducation | null;
  onClose: () => void;
  onSave: (data: Partial<CandidateEducation>) => Promise<void>;
}

export default function EditEducationModal({ education, onClose, onSave }: EditEducationModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    institution: education?.institution || '',
    course: education?.course || '',
    degree: education?.degree || 'superior',
    start_date: education?.start_date || '',
    end_date: education?.end_date || '',
    is_current: education?.is_current || false,
    description: education?.description || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
    setSaving(true);
    try {
      // Prepara os dados para envio, convertendo string vazia para null
      const dataToSend = {
        ...formData,
        end_date: formData.is_current || !formData.end_date ? undefined : formData.end_date,
      };
      await onSave(dataToSend);
    } catch (error) {
      console.error('Erro ao salvar formação:', error);
    } finally {
      setSaving(false);
    }
  };

  const degreeOptions = candidateService.getEducationLevels();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">
            {education ? 'Editar Formação' : 'Nova Formação'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Curso *</label>
              <input
                type="text"
                name="course"
                value={formData.course}
                onChange={handleChange}
                required
                placeholder="Ex: Ciência da Computação"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instituição *</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                required
                placeholder="Nome da instituição"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nível *</label>
            <select
              name="degree"
              value={formData.degree}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {degreeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Início *</label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data de Conclusão</label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
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
              Cursando atualmente
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Informações adicionais sobre o curso..."
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
