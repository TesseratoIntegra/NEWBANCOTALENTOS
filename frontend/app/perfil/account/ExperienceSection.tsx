'use client';

import { useState, useEffect } from 'react';
import { CandidateExperience } from '@/types';
import candidateService from '@/services/candidateService';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import AuthService from '@/services/auth';
import * as Icon from 'react-bootstrap-icons'
import { useAuth } from '@/contexts/AuthContext';

export interface ExperienceSectionProps {
  experiences: CandidateExperience[];
  onUpdate: (experiences: CandidateExperience[]) => void;
}

export default function ExperienceSection({ experiences: initialExperiences, onUpdate }: ExperienceSectionProps) {
  const { setCurrentStep } = useAuth();
  const [experiences, setExperiences] = useState<CandidateExperience[]>(initialExperiences || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    achievements: ''
  });

  // Fetch experiences from API on mount
  useEffect(() => {
    async function fetchExperiences() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/candidates/experiences/`, {
                  headers: {
          'Authorization': `Bearer ${AuthService.getAccessToken()}`
        }
        });
        if (!res.ok) throw new Error('Erro ao buscar experiências');
        const data = await res.json();
        setExperiences(data);
        if (onUpdate) onUpdate(data);
      } catch (error) {
        console.error('Erro ao buscar experiências:', error);
        toast.error('Erro ao buscar experiências');
      }
    }
    fetchExperiences();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.company || !formData.position || !formData.start_date) {
      toast.error('Por favor, preencha todos os campos obrigatórios!');
      return;
    }
    
    // Validate dates
    const today = new Date();
    const startDate = new Date(formData.start_date);
    
    // Start date cannot be today or in the future
    if (startDate >= today) {
      toast.error('A data de início deve ser anterior a hoje');
      return;
    }

    // If end date is provided, it cannot be before start date
    if (formData.end_date) {
      const endDate = new Date(formData.end_date);
      if (endDate < startDate) {
        toast.error('A data de saída não pode ser anterior à data de início');
        return;
      }
    }
    
    // Prepare data for submission - convert empty end_date to undefined
    const submitData = {
      ...formData,
      end_date: formData.end_date || undefined
    };
    
    try {
      if (editingId) {
        const updated = await candidateService.updateCandidateExperience(editingId, submitData);
        setExperiences(experiences.map(exp => exp.id === editingId ? updated : exp));
        if (onUpdate) onUpdate(experiences.map(exp => exp.id === editingId ? updated : exp));
        toast.success('Experiência atualizada com sucesso!');
      } else {
        const created = await candidateService.createCandidateExperience(submitData);
        setExperiences([...experiences, created]);
        if (onUpdate) onUpdate([...experiences, created]);
        toast.success('Experiência adicionada com sucesso!');
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar experiência:', error);
      toast.error('Erro ao salvar experiência');
    }
  };

  const handleEdit = (experience: CandidateExperience) => {
    setFormData({
      company: experience.company,
      position: experience.position,
      start_date: experience.start_date,
      end_date: experience.end_date || '',
      is_current: experience.is_current,
      description: experience.description || '',
      achievements: experience.achievements || ''
    });
    setEditingId(experience.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta experiência?')) {
      try {
        await candidateService.deleteCandidateExperience(id);
  setExperiences(experiences.filter(exp => exp.id !== id));
  if (onUpdate) onUpdate(experiences.filter(exp => exp.id !== id));
        toast.success('Experiência excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir experiência:', error);
        toast.error('Erro ao excluir experiência');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      company: '',
      position: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      achievements: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
      };
      
      // If start_date is changed, clear end_date to avoid conflicts
      if (name === 'start_date' && value) {
        newData.end_date = '';
      }
      
      // If "is_current" is checked, clear end_date (current job shouldn't have end date)
      if (name === 'is_current' && (e.target as HTMLInputElement).checked) {
        newData.end_date = '';
      }
      
      return newData;
    });
  };

  return (
    <div className="lg:p-6">
      <div className="lg:flex justify-between items-center mb-6">
        <h2 className="text-center lg:text-right text-xl lg:text-2xl font-bold text-blue-900">Experiência Profissional</h2>
        {experiences.length > 0 && (
          <button
            onClick={() => setIsAdding(true)}
            disabled={isAdding}
            className="w-full mt-3 lg:mt-0 lg:w-auto bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer justify-center lg:justify-start"
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Experiência
          </button>
        )}
      </div>

      {/* Formulário */}
      {isAdding && (
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            {editingId ? 'Editar Experiência' : 'Nova Experiência'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-zinc-700 mb-2">
                  Empresa *
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  placeholder="Nome da empresa"
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-zinc-700 mb-2">
                  Cargo *
                </label>
                <input
                  type="text"
                  id="position"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                  placeholder="Seu cargo na empresa"
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-zinc-700 mb-2">
                  Data de Início *
                </label>
                <input
                  type="date"
                  id="start_date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                  max={new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]} // Yesterday
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-zinc-700 mb-2">
                  Data de Saída
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  disabled={formData.is_current}
                  min={formData.start_date || undefined} // Cannot be before start date
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
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
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-400 rounded bg-white"
              />
              <label htmlFor="is_current" className="ml-2 block text-sm text-zinc-700">
                Trabalho aqui atualmente
              </label>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-2">
                Descrição das Atividades *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Descreva suas principais atividades e responsabilidades..."
                className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            <div>
              <label htmlFor="achievements" className="block text-sm font-medium text-zinc-700 mb-2">
                Principais Conquistas
              </label>
              <textarea
                id="achievements"
                name="achievements"
                value={formData.achievements}
                onChange={handleChange}
                rows={3}
                placeholder="Projetos importantes, metas alcançadas, reconhecimentos..."
                className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

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
                className="bg-zinc-600 hover:bg-red-600 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Experiências */}
      <div className="space-y-4">
        {experiences.length === 0 && !isAdding ? (
          <div className="text-center py-8">
            <p className="text-slate-700 mb-4">Nenhuma experiência cadastrada</p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-900 hover:bg-blue-800 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
            >
              Adicionar Primeira Experiência
            </button>
          </div>
        ) : experiences.length > 0 ? (
          experiences.map((experience) => (
            <div key={experience.id} className="bg-white rounded-md p-4 border border-blue-900/50">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-slate-700">{experience.position}</h3>
                  <p className="text-blue-600 font-medium">{experience.company}</p>
                  <div className="mt-2 text-sm text-zinc-700">
                    <span>
                      {new Date(experience.start_date).toLocaleDateString('pt-BR')} - {' '}
                      {experience.is_current 
                        ? 'Presente' 
                        : experience.end_date 
                          ? new Date(experience.end_date).toLocaleDateString('pt-BR')
                          : 'Em andamento'
                      }
                    </span>
                  </div>
                  {experience.description && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-zinc-700 mb-1">Atividades:</h4>
                      <p className="text-slate-700 text-sm">{experience.description}</p>
                    </div>
                  )}
                  {experience.achievements && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-zinc-700 mb-1">Principais Conquistas:</h4>
                      <p className="text-slate-700 text-sm">{experience.achievements}</p>
                    </div>
                  )}
                  {/* Optionally display salary if present */}
                  {experience.salary && (
                    <div className="mt-3">
                      <h4 className="text-sm font-medium text-zinc-700 mb-1">Salário:</h4>
                      <p className="text-slate-700 text-sm">R$ {experience.salary}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(experience)}
                    className="text-blue-800 hover:text-blue-600 p-1 cursor-pointer"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(experience.id)}
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
        <div className="flex justify-center lg:justify-end pt-6 border-t border-zinc-400">
          <div onClick={()=>{setCurrentStep(2)}} className="mr-auto bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer">
            <Icon.ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </div>
          <div onClick={()=>{setCurrentStep(4)}} className="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer">
            Próximo
            <Icon.ArrowRight className="h-4 w-4 ml-2" />
          </div>
        </div>
      </div>
    </div>
  );
}
