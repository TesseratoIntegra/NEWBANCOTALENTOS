'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminJobService } from '@/services/adminJobService';
import companyService from '@/services/companyService';
import { Job, Company } from '@/types/index';
import { TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { confirmDialog } from '@/lib/confirmDialog';

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
    if (!(await confirmDialog('Tem certeza que deseja excluir esta vaga?'))) {
      return;
    }

    try {
      await adminJobService.deleteJob(id);
      setJobs(Array.isArray(jobs) ? jobs.filter(job => job.id !== id) : []);
    } catch (err) {
      toast.error('Erro ao excluir vaga');
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

  const handleDownloadExcel = () => {
    if (filteredJobs.length === 0) {
      toast.error('Não há vagas para exportar');
      return;
    }

    // Preparar os dados para o Excel
    const excelData = filteredJobs.map(job => ({
      'Vaga (Título)': job.title,
      'Empresa': getCompanyName(job.company),
      'Localização': job.location,
      'Tipo': getJobTypeLabel(job.job_type),
      'Modelo': getTypeModelsLabel(job.type_models),
      'Status': job.is_active ? 'Ativa' : 'Inativa',
      'Criada em': formatDate(job.created_at)
    }));

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vagas');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 30 }, // Vaga (Título)
      { wch: 25 }, // Empresa
      { wch: 20 }, // Localização
      { wch: 15 }, // Tipo
      { wch: 15 }, // Modelo
      { wch: 10 }, // Status
      { wch: 12 }  // Criada em
    ];
    ws['!cols'] = colWidths;

    // Gerar nome do arquivo
    const fileName = `vagas_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;

    // Fazer download
    XLSX.writeFile(wb, fileName);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-600">Carregando vagas...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Gerenciar Vagas</h1>
          <p className="text-slate-500 mt-1">
            {filteredJobs.length} vaga(s) encontrada(s)
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {filteredJobs.length > 0 && (
            <button
              onClick={handleDownloadExcel}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors cursor-pointer"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Baixar Excel</span>
            </button>
          )}
          <Link
            href="/admin-panel/jobs/create"
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            + Nova Vaga
          </Link>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex space-x-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'all'
              ? 'bg-sky-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Todas ({jobs.length})
        </button>
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'active'
              ? 'bg-green-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Ativas ({Array.isArray(jobs) ? jobs.filter(j => j.is_active).length : 0})
        </button>
        <button
          onClick={() => setFilter('inactive')}
          className={`px-4 py-2 rounded-md font-medium transition-colors ${
            filter === 'inactive'
              ? 'bg-red-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Inativas ({Array.isArray(jobs) ? jobs.filter(j => !j.is_active).length : 0})
        </button>
      </div>

      {/* Lista de Vagas */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-slate-500">Nenhuma vaga encontrada</p>
          <Link
            href="/admin-panel/jobs/create"
            className="text-sky-600 hover:text-sky-500 mt-2 inline-block"
          >
            Criar primeira vaga →
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 shadow-sm rounded-md border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Título
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Modelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Criada em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                    Deletar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white cursor-pointer" onClick={() => window.location.href = `/admin-panel/jobs/${job.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-slate-800">
                          {job.title}
                        </div>
                        <div className="text-sm text-slate-500 truncate max-w-xs">
                          {job.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {getCompanyName(job.company)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {job.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {getJobTypeLabel(job.job_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {getTypeModelsLabel(job.type_models)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.is_active
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {job.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                      {formatDate(job.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex justify-center items-center h-full">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(job.id);
                          }}
                          className="text-red-600 hover:text-red-700 cursor-pointer"
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
