'use client';

import { useState, useEffect } from 'react';
import { CandidateLanguage } from '@/types';
import candidateService from '@/services/candidateService';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';


export interface LanguagesSectionProps {
  languages: CandidateLanguage[];
  onUpdate: (languages: CandidateLanguage[]) => void;
}

export default function LanguagesSection({ languages: initialLanguages, onUpdate }: LanguagesSectionProps) {
    const [userLanguages, setUserLanguages] = useState<CandidateLanguage[]>(initialLanguages);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<{
      language: string;
      proficiency: 'basic' | 'intermediate' | 'advanced' | 'fluent' | 'native' | '';
      has_certificate: boolean;
      certificate_name: string;
    }>({
      language: '',
      proficiency: '',
      has_certificate: false,
      certificate_name: ''
    });

  // Buscar idiomas da API ao montar
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await candidateService.getCandidateLanguages();
        // Se a resposta for paginada, use response.results, senão response direto
        const langs = Array.isArray(response) ? response : response.results || [];
        setUserLanguages(langs);
        onUpdate(langs);
      } catch (error) {
        console.error('Erro ao buscar idiomas:', error);
        toast.error('Erro ao buscar idiomas');
      }
    };
    fetchLanguages();
  }, [onUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.language || !formData.proficiency) {
      toast.error('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
    
    try {
      const submitData: Partial<CandidateLanguage> = {
        language: formData.language,
        proficiency: formData.proficiency || undefined,
        has_certificate: formData.has_certificate,
        certificate_name: formData.certificate_name || undefined
      };

      if (editingId) {
        const updated = await candidateService.updateCandidateLanguage(editingId, submitData);
        const newLangs = userLanguages.map(lang => lang.id === editingId ? updated : lang);
        setUserLanguages(newLangs);
        if (onUpdate) onUpdate(newLangs);
        toast.success('Idioma atualizado com sucesso!');
      } else {
        const created = await candidateService.createCandidateLanguage(submitData);
        const newLangs = [...userLanguages, created];
        setUserLanguages(newLangs);
        if (onUpdate) onUpdate(newLangs);
        toast.success('Idioma adicionado com sucesso!');
      }
      resetForm();
    } catch (error: unknown) {
      console.error('Erro ao salvar idioma:', error);
      // Extrai mensagem de erro do backend (ex: duplicata)
      const axiosError = error as { response?: { data?: Record<string, string | string[]> } };
      if (axiosError.response?.data) {
        const errorData = axiosError.response.data;
        const errorMessage = Object.values(errorData).flat().join(', ');
        toast.error(errorMessage || 'Erro ao salvar idioma');
      } else {
        toast.error('Erro ao salvar idioma');
      }
    }
  };

  const handleEdit = (language: CandidateLanguage) => {
    setFormData({
      language: language.language,
      proficiency: language.proficiency,
      has_certificate: language.has_certificate,
      certificate_name: language.certificate_name || ''
    });
    setEditingId(language.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este idioma?')) {
      try {
        await candidateService.deleteCandidateLanguage(id);
  const newLangs = userLanguages.filter(lang => lang.id !== id);
  setUserLanguages(newLangs);
  if (onUpdate) onUpdate(newLangs);
        toast.success('Idioma excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir idioma:', error);
        toast.error('Erro ao excluir idioma');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      language: '',
      proficiency: '',
      has_certificate: false,
      certificate_name: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const proficiencyLevels = candidateService.getLanguageProficiencyLevels();

  const getProficiencyColor = (proficiency: string) => {
    switch (proficiency) {
      case 'basic': return 'bg-red-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-blue-500';
      case 'fluent': return 'bg-green-500';
      case 'native': return 'bg-purple-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="lg:p-6">

      <div className="lg:flex justify-between items-center mb-6">
        <h2 className="text-center lg:text-right text-xl lg:text-2xl font-bold text-blue-900">Idiomas</h2>
        {userLanguages.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="w-full mt-3 lg:mt-0 lg:w-auto bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer justify-center lg:justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Idioma
          </button>
        )}
      </div>

      {/* Formulário */}
      {isAdding && (
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            {editingId ? 'Editar Idioma' : 'Novo Idioma'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="language" className="block text-sm font-medium text-zinc-700 mb-2">
                  Idioma *
                </label>
                <input
                  type="text"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Inglês, Espanhol, Francês..."
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="proficiency" className="block text-sm font-medium text-zinc-700 mb-2">
                  Nível de Proficiência *
                </label>
                <select
                  id="proficiency"
                  name="proficiency"
                  value={formData.proficiency}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {proficiencyLevels.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="has_certificate"
                name="has_certificate"
                checked={formData.has_certificate}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white"
              />
              <label htmlFor="has_certificate" className="ml-2 block text-sm text-zinc-700">
                Possuo certificado de proficiência
              </label>
            </div>

            {formData.has_certificate && (
              <div>
                <label htmlFor="certificate_name" className="block text-sm font-medium text-zinc-700 mb-2">
                  Nome do Certificado
                </label>
                <input
                  type="text"
                  id="certificate_name"
                  name="certificate_name"
                  value={formData.certificate_name}
                  onChange={handleChange}
                  placeholder="Ex: TOEFL, IELTS, DELE, DELF..."
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div className="grid grid-cols-1 lg:flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-900 hover:bg-blue-800 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
              >
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Atualizar' : 'Adicionar'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-slate-700 hover:bg-red-600 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Idiomas */}
      <div className="space-y-4">
        {userLanguages.length === 0 && !isAdding ? (
          <div className="text-center py-8">
            <p className="text-slate-700 mb-4">Nenhum idioma cadastrado</p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-900 hover:bg-blue-800 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
            >
              Adicionar Primeiro Idioma
            </button>
          </div>
        ) : userLanguages.length > 0 ? (
          userLanguages.map((language) => (
            <div key={language.id} className="bg-white rounded-lg border border-blue-900/50 p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900">{language.language}</h3>
                  <div className="flex items-center mt-2">
                    <span className={`inline-block w-3 h-3 rounded-full ${getProficiencyColor(language.proficiency)} mr-2`}></span>
                    <span className="text-zinc-700 text-sm">
                      {proficiencyLevels.find(level => level.value === language.proficiency)?.label || language.proficiency}
                    </span>
                  </div>
                  {language.has_certificate && language.certificate_name && (
                    <div className="mt-2 flex items-center">
                      <span className="text-blue-800 text-xs mr-1">🏆</span>
                      <span className="text-slate-700 text-sm">{language.certificate_name}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(language)}
                    className="text-blue-800 hover:text-blue-600 p-1 cursor-pointer"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(language.id)}
                    className="text-red-600 hover:text-red-500 p-1 cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : null}


      </div>
    </div>
  );
}
