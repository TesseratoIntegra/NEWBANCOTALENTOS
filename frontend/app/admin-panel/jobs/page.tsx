'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminJobService } from '@/services/adminJobService';
import companyService from '@/services/companyService';
import { Job, Company } from '@/types/index';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function JobsListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Carregar vagas e empresas em paralelo
        const [jobsData, companiesData] = await Promise.all([
          adminJobService.getJobs(),
          companyService.getAllCompanies()
        ]);
        
        setJobs(Array.isArray(jobsData) ? jobsData : []);
        setCompanies(companiesData);
      } catch (err) {
        setError('Erro ao carregar dados');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta vaga?')) {
      return;
    }

    try {
      await adminJobService.deleteJob(id);
      setJobs(Array.isArray(jobs) ? jobs.filter(job => job.id !== id) : []);
    } catch (err) {
      alert('Erro ao excluir vaga');
      console.error(err);
    }
  };

  const filteredJobs = Array.isArray(jobs) ? jobs.filter(job => {
    if (filter === 'active') return job.is_active;
    if (filter === 'inactive') return !job.is_active;
    return true;
  }) : [];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getJobTypeLabel = (jobType: string) => {
    const types = {
      full_time: 'Tempo Integral',
      part_time: 'Meio Período',
      contract: 'Contrato',
      freelance: 'Freelance',
      internship: 'Estágio'
    };
    return types[jobType as keyof typeof types] || jobType;
  };

  const getTypeModelsLabel = (typeModels: string) => {
    const types = {
      in_person: 'Presencial',
      home_office: 'Home Office',
      hybrid: 'Híbrido'
    };
    return types[typeModels as keyof typeof types] || typeModels;
  };

  const getCompanyName = (companyId: number) => {
    const company = companies.find(c => c.id === companyId);
    return company ? company.name : `ID: ${companyId}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-zinc-300">Carregando vagas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-400">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Gerenciar Vagas</h1>
          <p className="text-zinc-400 mt-1">
            {filteredJobs.length} vaga(s) encontrada(s)
          </p>
        </div>
        <Link
          href="/admin-panel/jobs/create"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          + Nova Vaga
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'all'
              ? 'bg-indigo-600 text-white'
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          Todas ({jobs.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          Ativas ({Array.isArray(jobs) ? jobs.filter(j => j.is_active).length : 0})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'inactive'
              ? 'bg-red-600 text-white'
              : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
          }`}
        >
          Inativas ({Array.isArray(jobs) ? jobs.filter(j => !j.is_active).length : 0})
        </button>
      </div>

      {/* Lista de Vagas */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400">Nenhuma vaga encontrada</p>
          <Link
            href="/admin-panel/jobs/create"
            className="text-indigo-400 hover:text-indigo-300 mt-2 inline-block"
          >
            Criar primeira vaga →
          </Link>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-md border border-zinc-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Criada em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
                    Deletar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-800 cursor-pointer" onClick={() => window.location.href = `/admin-panel/jobs/${job.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-zinc-100">
                          {job.title}
                        </div>
                        <div className="text-sm text-zinc-400 truncate max-w-xs">
                          {job.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {getCompanyName(job.company)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {job.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {getJobTypeLabel(job.job_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {getTypeModelsLabel(job.type_models)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.is_active
                            ? 'bg-green-900 text-green-300'
                            : 'bg-red-900 text-red-300'
                        }`}
                      >
                        {job.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-center items-center h-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(job.id);
                          }}
                          className="text-red-400 hover:text-red-300 cursor-pointer"
                          title="Excluir"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
