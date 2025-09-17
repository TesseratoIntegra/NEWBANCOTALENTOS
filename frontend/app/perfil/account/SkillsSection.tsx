'use client';

import { useState } from 'react';
import { CandidateSkill } from '@/types';
import candidateService from '@/services/candidateService';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';

export interface SkillsSectionProps {
  skills: CandidateSkill[];
  onUpdate: (skills: CandidateSkill[]) => void;
}

export default function SkillsSection({ skills, onUpdate }: SkillsSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    skill_name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert' | '';
    years_experience: string;
  }>({
    skill_name: '',
    level: '',
    years_experience: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const submitData: Partial<CandidateSkill> = {
        skill_name: formData.skill_name,
        level: formData.level || undefined,
        years_experience: formData.years_experience ? Number(formData.years_experience) : undefined
      };

      if (editingId) {
        const updated = await candidateService.updateCandidateSkill(editingId, submitData);
        onUpdate(skills.map(skill => skill.id === editingId ? updated : skill));
        toast.success('Habilidade atualizada com sucesso!');
      } else {
        const created = await candidateService.createCandidateSkill(submitData);
        onUpdate([...skills, created]);
        toast.success('Habilidade adicionada com sucesso!');
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar habilidade:', error);
      toast.error('Erro ao salvar habilidade');
    }
  };

  const handleEdit = (skill: CandidateSkill) => {
    setFormData({
      skill_name: skill.skill_name,
      level: skill.level,
      years_experience: skill.years_experience?.toString() || ''
    });
    setEditingId(skill.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta habilidade?')) {
      try {
        await candidateService.deleteCandidateSkill(id);
        onUpdate(skills.filter(skill => skill.id !== id));
        toast.success('Habilidade excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir habilidade:', error);
        toast.error('Erro ao excluir habilidade');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      skill_name: '',
      level: '',
      years_experience: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const skillLevels = candidateService.getSkillLevels();

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-red-500';
      case 'intermediate': return 'bg-yellow-500';
      case 'advanced': return 'bg-blue-500';
      case 'expert': return 'bg-green-500';
      default: return 'bg-zinc-500';
    }
  };

  return (
    <div className="p-6">
      <div className="lg:flex justify-between items-center mb-6">
        <h2 className="text-center lg:text-right text-xl lg:text-2xl font-bold text-blue-900">Habilidades Técnicas</h2>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="w-full mt-3 lg:mt-0 lg:w-auto bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Habilidade
        </button>
      </div>

      {/* Formulário */}
      {isAdding && (
        <div className="bg-white rounded-md border border-blue-900/50 p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            {editingId ? 'Editar Habilidade' : 'Nova Habilidade'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="skill_name" className="block text-sm font-medium text-zinc-700 mb-2">
                Nome da Habilidade *
              </label>
              <input
                type="text"
                id="skill_name"
                name="skill_name"
                value={formData.skill_name}
                onChange={handleChange}
                required
                placeholder="Ex: Administração, Comunicação, Trabalho em Grupo, etc."
                className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-zinc-700 mb-2">
                  Nível *
                </label>
                <select
                  id="level"
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Selecione...</option>
                  {skillLevels.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="years_experience" className="block text-sm font-medium text-zinc-700 mb-2">
                  Anos de Experiência
                </label>
                <input
                  type="number"
                  id="years_experience"
                  name="years_experience"
                  value={formData.years_experience}
                  onChange={handleChange}
                  min="0"
                  max="50"
                  placeholder="0"
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
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
                className="bg-slate-700 hover:bg-red-600 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer duration-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lista de Habilidades */}
      <div className="space-y-4">
        {skills.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-700 mb-4">Nenhuma habilidade cadastrada</p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-900 hover:bg-blue-800 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
            >
              Adicionar Primeira Habilidade
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {skills.map((skill) => (
              <div key={skill.id} className="bg-white rounded-md border border-blue-900/50 p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-700">{skill.skill_name}</h3>
                    <div className="flex items-center mt-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${getLevelColor(skill.level)} mr-2`}></span>
                      <span className="text-zinc-700 text-sm">
                        {skillLevels.find(level => level.value === skill.level)?.label || skill.level}
                      </span>
                    </div>
                    {skill.years_experience && (
                      <p className="text-zinc-600 text-sm mt-1">
                        {skill.years_experience} {skill.years_experience === 1 ? 'ano' : 'anos'} de experiência
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEdit(skill)}
                      className="text-blue-600 hover:text-blue-500 p-1 cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(skill.id)}
                      className="text-red-600 hover:text-red-500 p-1 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
