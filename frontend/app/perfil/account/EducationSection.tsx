'use client';

import { useState, useEffect } from 'react';
import { CandidateEducation } from '@/types';
import candidateService from '@/services/candidateService';
import { toast } from 'react-hot-toast';
import { Edit, Trash2, Plus, Save, X } from 'lucide-react';
import * as Icon from 'react-bootstrap-icons'
import { useAuth } from '@/contexts/AuthContext';

export interface EducationSectionProps {
  educations: CandidateEducation[];
  onUpdate: (educations: CandidateEducation[]) => void;
}

export default function EducationSection({ educations: initialEducations, onUpdate }: EducationSectionProps) {
  const { setCurrentStep } = useAuth();
  const [educations, setEducations] = useState<CandidateEducation[]>(initialEducations || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    institution: '',
    course: '',
    degree: '' as CandidateEducation['degree'] | '',
    start_date: '',
    end_date: '',
    description: ''
  });

  // Buscar educações da API ao montar
  useEffect(() => {
    async function fetchEducations() {
      try {
        const response = await candidateService.getCandidateEducations();
        // Se a resposta for paginada, use response.results, senão response direto
        const educs = Array.isArray(response) ? response : response.results || [];
        setEducations(educs);
        onUpdate(educs);
      } catch (error) {
        console.error('Erro ao buscar formações:', error);
        toast.error('Erro ao buscar formações');
      }
    }
    fetchEducations();
  }, [onUpdate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.degree) {
      toast.error('Por favor, selecione um grau de formação');
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
        toast.error('A data de conclusão não pode ser anterior à data de início');
        return;
      }
    }
    
    try {
      const submitData = {
        ...formData,
        degree: formData.degree as CandidateEducation['degree'], // Ensure proper typing
        end_date: formData.end_date || undefined
      };
      
      if (editingId) {
        const updated = await candidateService.updateCandidateEducation(editingId, submitData);
        const newEducations = educations.map(edu => edu.id === editingId ? updated : edu);
        setEducations(newEducations);
        onUpdate(newEducations);
        toast.success('Formação atualizada com sucesso!');
      } else {
        const created = await candidateService.createCandidateEducation(submitData);
        const newEducations = [...educations, created];
        setEducations(newEducations);
        onUpdate(newEducations);
        toast.success('Formação adicionada com sucesso!');
      }
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar formação:', error);
      toast.error('Erro ao salvar formação');
    }
  };

  const handleEdit = (education: CandidateEducation) => {
    setFormData({
      institution: education.institution,
      course: education.course,
      degree: education.degree || '',
      start_date: education.start_date,
      end_date: education.end_date || '',
      description: education.description || ''
    });
    setEditingId(education.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir esta formação?')) {
      try {
        await candidateService.deleteCandidateEducation(id);
  const newEducations = educations.filter(edu => edu.id !== id);
  setEducations(newEducations);
  onUpdate(newEducations);
        toast.success('Formação excluída com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir formação:', error);
        toast.error('Erro ao excluir formação');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      institution: '',
      course: '',
      degree: '',
      start_date: '',
      end_date: '',
      description: ''
    });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      
      return newData;
    });
  };

  return (
    <div className="lg:p-6">
      <div className="lg:flex justify-between items-center mb-6">
        <h2 className="text-center lg:text-right text-xl lg:text-2xl font-bold text-blue-900">Formação Acadêmica</h2>
        <button
          onClick={() => setIsAdding(true)}
          disabled={isAdding}
          className="w-full mt-3 lg:mt-0 lg:w-auto bg-blue-900 hover:bg-blue-800 disabled:bg-slate-800 disabled:opacity-50 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer justify-center lg:justify-start"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Formação
        </button>
      </div>

      {/* Formulário */}
      {isAdding && (
        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">
            {editingId ? 'Editar Formação' : 'Nova Formação'}
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="institution" className="block text-sm font-medium text-zinc-700 mb-2">
                  Instituição *
                </label>
                <input
                  type="text"
                  id="institution"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  required
                  placeholder="Nome da instituição"
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="course" className="block text-sm font-medium text-zinc-700 mb-2">
                  Curso *
                </label>
                <input
                  type="text"
                  id="course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  required
                  placeholder="Nome do curso"
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="degree" className="block text-sm font-medium text-zinc-700 mb-2">
                Grau *
              </label>
              <select
                id="degree"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione...</option>
                <option value="fundamental">Ensino Fundamental</option>
                <option value="medio">Ensino Médio</option>
                <option value="tecnico">Técnico</option>
                <option value="superior">Superior</option>
                <option value="pos_graduacao">Pós-graduação</option>
                <option value="mestrado">Mestrado</option>
                <option value="doutorado">Doutorado</option>
              </select>
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
                  Data de Conclusão
                </label>
                <input
                  type="date"
                  id="end_date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleChange}
                  min={formData.start_date || undefined} // Cannot be before start date
                  className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-700 mb-2">
                Descrição
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Descreva atividades relevantes, projetos, etc."
                className="w-full px-3 py-2 bg-white border border-slate-400 rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            <div className="grid grid-cols-1 lg:flex gap-3 pt-4">
              <button
                type="submit"
                className="bg-blue-900 hover:bg-blue-800 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer duration-300"
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

      {/* Lista de Formações */}
      <div className="space-y-4">
        {educations.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-700 mb-4">Nenhuma formação cadastrada</p>
            <button
              onClick={() => setIsAdding(true)}
              className="bg-blue-900 hover:bg-blue-800 text-slate-100 px-4 py-2 rounded-md font-medium transition-colors cursor-pointer"
            >
              Adicionar Primeira Formação
            </button>
          </div>
        ) : (
          educations.map((education) => (
            <div key={education.id} className="bg-white border border-blue-900/50 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-blue-900">{education.course}</h3>
                  <p className="text-blue-700 font-medium">{education.institution}</p>
                  <p className="text-zinc-800 text-sm">
                    {education.degree === 'fundamental' && 'Ensino Fundamental'}
                    {education.degree === 'medio' && 'Ensino Médio'}
                    {education.degree === 'tecnico' && 'Técnico'}
                    {education.degree === 'superior' && 'Superior'}
                    {education.degree === 'pos_graduacao' && 'Pós-graduação'}
                    {education.degree === 'mestrado' && 'Mestrado'}
                    {education.degree === 'doutorado' && 'Doutorado'}
                  </p>
                  <div className="mt-2 text-sm text-zinc-700">
                    <span>
                      {new Date(education.start_date).toLocaleDateString('pt-BR')} - {' '}
                      {education.end_date 
                        ? new Date(education.end_date).toLocaleDateString('pt-BR')
                        : (education.is_current ? 'Em andamento' : 'Não informado')
                      }
                    </span>
                  </div>
                  {education.description && (
                    <p className="mt-2 text-zinc-700 text-sm">{education.description}</p>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(education)}
                    className="text-blue-800 hover:text-blue-600 p-1 cursor-pointer"
                    title="Editar"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(education.id)}
                    className="text-red-600 hover:text-red-500 p-1 cursor-pointer"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Botão de Salvar */}
        <div className="flex justify-center lg:justify-end pt-6 border-t border-zinc-400">
          <div onClick={()=>{setCurrentStep(1)}} className="mr-auto bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer">
            <Icon.ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </div>
          <div onClick={()=>{setCurrentStep(3)}} className="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer">
            Próximo
            <Icon.ArrowRight className="h-4 w-4 ml-2" />
          </div>
        </div>

      </div>
    </div>
  );
}
