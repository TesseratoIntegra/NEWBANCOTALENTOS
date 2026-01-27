'use client';

import { useState } from 'react';
import { CandidateSkill } from '@/types';
import { X, Save } from 'lucide-react';

interface EditSkillModalProps {
  skill: CandidateSkill | null;
  onClose: () => void;
  onSave: (data: Partial<CandidateSkill>) => Promise<void>;
}

export default function EditSkillModal({ skill, onClose, onSave }: EditSkillModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    skill_name: skill?.skill_name || '',
    level: skill?.level || 'intermediate',
    years_experience: skill?.years_experience || 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
    } catch (error) {
      console.error('Erro ao salvar habilidade:', error);
    } finally {
      setSaving(false);
    }
  };

  const levelOptions = [
    { value: 'beginner', label: 'Iniciante' },
    { value: 'intermediate', label: 'Intermediário' },
    { value: 'advanced', label: 'Avançado' },
    { value: 'expert', label: 'Expert' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">
            {skill ? 'Editar Habilidade' : 'Nova Habilidade'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome da Habilidade *</label>
            <input
              type="text"
              name="skill_name"
              value={formData.skill_name}
              onChange={handleChange}
              required
              placeholder="Ex: React, Python, Excel..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nível *</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {levelOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Anos de Experiência</label>
            <input
              type="number"
              name="years_experience"
              value={formData.years_experience}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
