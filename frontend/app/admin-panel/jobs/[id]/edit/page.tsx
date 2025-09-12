'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminJobService, UpdateJobData } from '@/services/adminJobService';
import companyService from '@/services/companyService';
import { Job, Company } from '@/types/index';

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
      alert('Por favor, selecione uma empresa');
      return;
    }
    
    setSaving(true);

    try {
      await adminJobService.updateJob(job.id, formData);
      router.push(`/admin-panel/jobs/${job.id}`);
    } catch (error) {
      alert('Erro ao atualizar vaga. Verifique os dados e tente novamente.');
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-zinc-300">Carregando vaga...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="text-red-400 mb-4">{error || 'Vaga não encontrada'}</div>
          <Link
            href="/admin-panel/jobs"
            className="text-indigo-400 hover:text-indigo-300"
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
            className="text-indigo-400 hover:text-indigo-300"
          >
            ← Voltar para detalhes
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Editar Vaga</h1>
        <p className="text-zinc-400 mt-1">
          Atualize os dados da vaga: {job.title}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Informações Básicas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
                Título da Vaga *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Desenvolvedor Frontend"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-zinc-300 mb-2">
                Localização *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: São Paulo, SP"
              />
            </div>

            <div>
              <label htmlFor="job_type" className="block text-sm font-medium text-zinc-300 mb-2">
                Tipo de Contrato *
              </label>
              <select
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="full_time">Tempo Integral</option>
                <option value="part_time">Meio Período</option>
                <option value="contract">Contrato</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Estágio</option>
              </select>
            </div>

            <div>
              <label htmlFor="type_models" className="block text-sm font-medium text-zinc-300 mb-2">
                Modelo de Trabalho *
              </label>
              <select
                id="type_models"
                name="type_models"
                value={formData.type_models}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="in_person">Presencial</option>
                <option value="home_office">Home Office</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>

            <div>
              <label htmlFor="salary_range" className="block text-sm font-medium text-zinc-300 mb-2">
                Faixa Salarial
              </label>
              <input
                type="text"
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: R$ 5.000 - R$ 8.000"
              />
            </div>

            <div>
              <label htmlFor="closure" className="block text-sm font-medium text-zinc-300 mb-2">
                Data de Encerramento *
              </label>
              <input
                type="date"
                id="closure"
                name="closure"
                value={formData.closure}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-zinc-300 mb-2">
                Empresa *
              </label>
              {loadingCompanies ? (
                <div className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-400">
                  Carregando empresas...
                </div>
              ) : (
                <select
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Descrição e Detalhes
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                Descrição da Vaga *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Descreva a vaga, o que a empresa faz, o ambiente de trabalho..."
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-zinc-300 mb-2">
                Requisitos
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Liste os requisitos necessários para a vaga..."
              />
            </div>

            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-zinc-300 mb-2">
                Responsabilidades
              </label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Descreva as principais responsabilidades do cargo..."
              />
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 border border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Configurações
          </h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-600 rounded bg-zinc-700"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-zinc-300">
              Vaga ativa (visível para candidatos)
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link
            href={`/admin-panel/jobs/${job.id}`}
            className="px-6 py-2 border border-zinc-600 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-lg font-medium transition-colors"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
