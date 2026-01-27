'use client';

import { useState } from 'react';
import { CandidateProfile } from '@/types';
import { X, Save } from 'lucide-react';
import candidateService from '@/services/candidateService';

interface EditPreferencesModalProps {
  profile: CandidateProfile;
  onClose: () => void;
  onSave: (data: Partial<CandidateProfile>) => Promise<void>;
}

export default function EditPreferencesModal({ profile, onClose, onSave }: EditPreferencesModalProps) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    available_for_work: profile.available_for_work,
    can_travel: profile.can_travel,
    accepts_remote_work: profile.accepts_remote_work,
    accepts_relocation: profile.accepts_relocation,
    preferred_work_shift: profile.preferred_work_shift || 'flexible',
    has_vehicle: profile.has_vehicle,
    has_cnh: profile.has_cnh,
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
    } finally {
      setSaving(false);
    }
  };

  const workShiftOptions = candidateService.getWorkShiftOptions();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-blue-900">Editar Preferências</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Disponibilidade */}
          <div>
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Disponibilidade</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="available_for_work"
                  name="available_for_work"
                  checked={formData.available_for_work}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="available_for_work" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                  Disponível para trabalho
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="can_travel"
                  name="can_travel"
                  checked={formData.can_travel}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="can_travel" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                  Disponível para viagens
                </label>
              </div>
            </div>
          </div>

          {/* Modalidade */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Modalidade de Trabalho</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="accepts_remote_work"
                  name="accepts_remote_work"
                  checked={formData.accepts_remote_work}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="accepts_remote_work" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                  Aceita trabalho remoto
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="accepts_relocation"
                  name="accepts_relocation"
                  checked={formData.accepts_relocation}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="accepts_relocation" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                  Aceita mudança de cidade
                </label>
              </div>
            </div>
          </div>

          {/* Turno */}
          <div className="border-t border-slate-200 pt-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Turno Preferido</label>
            <select
              name="preferred_work_shift"
              value={formData.preferred_work_shift}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {workShiftOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Veículo e CNH */}
          <div className="border-t border-slate-200 pt-4">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Mobilidade</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_vehicle"
                  name="has_vehicle"
                  checked={formData.has_vehicle}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="has_vehicle" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                  Possui veículo próprio
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="has_cnh"
                  name="has_cnh"
                  checked={formData.has_cnh}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded cursor-pointer"
                />
                <label htmlFor="has_cnh" className="ml-2 block text-sm text-slate-700 cursor-pointer">
                  Possui CNH
                </label>
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
