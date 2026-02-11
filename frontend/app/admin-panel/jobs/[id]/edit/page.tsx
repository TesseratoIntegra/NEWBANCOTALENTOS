'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminJobService, UpdateJobData } from '@/services/adminJobService';
import companyService from '@/services/companyService';
import { Job, Company } from '@/types/index';
import { formatRS } from '@/functions/FormatRS';
import DateInput from '@/components/ui/DateInput';
import toast from 'react-hot-toast';

interface EditJobPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditJobPage({ params }: EditJobPageProps) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const resolvedParams = use(params);
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');
  const [formData, setFormData] = useState<UpdateJobData>({
    title: '',
    description: '',
    location: '',
    job_type: 'full_time',
    type_models: 'in_person',
    salary_range: '',
    requirements: '',
    responsibilities: '',
    closure: '',
    company: 0,
    is_active: true,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Carregar empresas e dados da vaga em paralelo
        const [companiesData, jobData] = await Promise.all([
          companyService.getAllCompanies(),
          adminJobService.getJobById(parseInt(resolvedParams.id))
        ]);
        setCompanies(companiesData);
        setJob(jobData);
        // Preencher o formulário com os dados existentes
        setFormData({
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          job_type: jobData.job_type,
          type_models: jobData.type_models,
          salary_range: jobData.salary_range,
          requirements: jobData.requirements,
          responsibilities: jobData.responsibilities,
          closure: jobData.closure,
          company: jobData.company,
          is_active: jobData.is_active,
        });
        // Preencher lista de requisitos
        if (jobData.requirements) {
          setRequirementsList(jobData.requirements.split(',').map(r => r.trim()).filter(r => r));
        }
      } catch (err) {
        setError('Erro ao carregar dados');
        console.error(err);
      } finally {
        setLoading(false);
        setLoadingCompanies(false);
      }
    };
    loadData();
  }, [resolvedParams.id]);

  // Atualiza o campo 'requirements' do formulário sempre que a lista mudar
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      requirements: requirementsList.join(', ')
    }));
  }, [requirementsList]);

  // Adiciona requisito ao pressionar Enter
  const handleRequirementKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && requirementInput.trim()) {
      e.preventDefault();
      setRequirementsList(prev => [...prev, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  // Remove requisito
  const handleRemoveRequirement = (idx: number) => {
    setRequirementsList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else if (name === 'salary_range') {
      // Aplica máscara de dinheiro
      setFormData(prev => ({
        ...prev,
        salary_range: formatRS(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;
    
    if (!formData.company) {
      toast.error('Por favor, selecione uma empresa');
      return;
    }
    
    setSaving(true);

    try {
      await adminJobService.updateJob(job.id, formData);
      router.push(`/admin-panel/jobs/${job.id}`);
    } catch (error) {
      toast.error('Erro ao atualizar vaga. Verifique os dados e tente novamente.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-600">Carregando vaga...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error || 'Vaga não encontrada'}</div>
          <Link
            href="/admin-panel/jobs"
            className="text-sky-600 hover:text-sky-500"
          >
            ← Voltar para lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href={`/admin-panel/jobs/${job.id}`}
            className="text-sky-600 hover:text-sky-500"
          >
            ← Voltar para detalhes
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Editar Vaga</h1>
        <p className="text-slate-500 mt-1">
          Atualize os dados da vaga: {job.title}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Informações Básicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-2">
                Título da Vaga *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ex: Desenvolvedor Frontend"
              />
            </div>
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-slate-600 mb-2">
                Localização *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ex: São Paulo, SP"
              />
            </div>
            <div>
              <label htmlFor="job_type" className="block text-sm font-medium text-slate-600 mb-2">
                Tipo de Contrato *
              </label>
              <select
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="full_time">Tempo Integral</option>
                <option value="part_time">Meio Período</option>
                <option value="contract">Contrato</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Estágio</option>
              </select>
            </div>
            <div>
              <label htmlFor="type_models" className="block text-sm font-medium text-slate-600 mb-2">
                Modelo de Trabalho *
              </label>
              <select
                id="type_models"
                name="type_models"
                value={formData.type_models}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="in_person">Presencial</option>
                <option value="home_office">Home Office</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>
            <div>
              <label htmlFor="salary_range" className="block text-sm font-medium text-slate-600 mb-2">
                Faixa Salarial
              </label>
              <input
                type="text"
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                inputMode="numeric"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ex: R$ 5.000,00"
                maxLength={15}
              />
            </div>
            <div>
              <label htmlFor="closure" className="block text-sm font-medium text-slate-600 mb-2">
                Data de Encerramento *
              </label>
              <DateInput
                id="closure"
                name="closure"
                value={formData.closure}
                onChange={(iso) => setFormData(prev => ({ ...prev, closure: iso }))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-600 mb-2">
                Empresa *
              </label>
              {loadingCompanies ? (
                <div className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-500">
                  Carregando empresas...
                </div>
              ) : (
                <select
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Selecione uma empresa</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          {/* Requisitos - igual à página de criação */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-slate-600 mb-2">Requisitos</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={requirementInput}
                onChange={e => setRequirementInput(e.target.value)}
                onKeyDown={handleRequirementKeyDown}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none"
                placeholder="Digite o requisito e pressione Enter"
              />
              <button
                type="button"
                onClick={() => {
                  if (requirementInput.trim()) {
                    setRequirementsList(prev => [...prev, requirementInput.trim()]);
                    setRequirementInput('');
                  }
                }}
                className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg font-medium"
              >Adicionar</button>
            </div>
            <ul className="mb-2">
              {requirementsList.map((req, idx) => (
                <li key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded mb-1">
                  <span className="text-slate-800 text-sm">{req}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveRequirement(idx)}
                    className="text-red-600 hover:text-red-700 text-xs ml-2"
                  >Remover</button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500">Pressione Enter ou clique em Adicionar para cada requisito.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Descrição e Detalhes
          </h2>
          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-2">
                Descrição da Vaga *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Descreva a vaga, o que a empresa faz, o ambiente de trabalho..."
              />
            </div>
            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-slate-600 mb-2">
                Responsabilidades
              </label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Descreva as principais responsabilidades do cargo..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Configurações
          </h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded bg-white"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-slate-600">
              Vaga ativa (visível para candidatos)
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link
            href={`/admin-panel/jobs/${job.id}`}
            className="px-6 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-white transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded-lg font-medium transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
