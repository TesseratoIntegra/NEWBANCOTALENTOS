'use client';

import { useState } from 'react';
import { CandidateLanguage } from '@/types';
import { X, Save } from 'lucide-react';

interface EditLanguageModalProps {
  language: CandidateLanguage | null;
  onClose: () => void;
  onSave: (data: Partial<CandidateLanguage>) => Promise<void>;
}

export default function EditLanguageModal({ language, onClose, onSave }: EditLanguageModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    language: language?.language || '',
    proficiency: language?.proficiency || 'intermediate',
    speaking_level: language?.speaking_level || 'intermediate',
    reading_level: language?.reading_level || 'intermediate',
    writing_level: language?.writing_level || 'intermediate',
    has_certificate: language?.has_certificate || false,
    certificate_name: language?.certificate_name || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    } finally {
      setSaving(false);
    }
  };

  const proficiencyOptions = [
    { value: 'basic', label: 'Básico' },
    { value: 'intermediate', label: 'Intermediário' },
    { value: 'advanced', label: 'Avançado' },
    { value: 'fluent', label: 'Fluente' },
    { value: 'native', label: 'Nativo' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">
            {language ? 'Editar Idioma' : 'Novo Idioma'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Idioma *</label>
            <input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              required
              placeholder="Ex: Inglês, Espanhol..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nível Geral *</label>
            <select
              name="proficiency"
              value={formData.proficiency}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {proficiencyOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Detalhamento por Habilidade</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Conversação</label>
                <select
                  name="speaking_level"
                  value={formData.speaking_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {proficiencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Leitura</label>
                <select
                  name="reading_level"
                  value={formData.reading_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {proficiencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Escrita</label>
                <select
                  name="writing_level"
                  value={formData.writing_level}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {proficiencyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="has_certificate"
                name="has_certificate"
                checked={formData.has_certificate}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
              />
              <label htmlFor="has_certificate" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                Possuo certificação
              </label>
            </div>

            {formData.has_certificate && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome do Certificado</label>
                <input
                  type="text"
                  name="certificate_name"
                  value={formData.certificate_name}
                  onChange={handleChange}
                  placeholder="Ex: TOEFL, IELTS, DELE..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
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
