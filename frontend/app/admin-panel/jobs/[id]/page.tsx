'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminJobService } from '@/services/adminJobService';
import companyService from '@/services/companyService';
import { Job, Company } from '@/types/index';
import { PencilIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import AuthService from '@/services/auth';

import toast from 'react-hot-toast';
import { confirmDialog } from '@/lib/confirmDialog';

interface JobDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function JobDetailsPage({ params }: JobDetailsPageProps) {
  const router = useRouter();
  const [job, setJob] = useState<Job | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  interface Application {
    id: number;
    candidate_user_id: number;
    candidate_profile_id: number;
    candidate_name: string;
    job_id: number;
    job_title: string;
    company_name: string;
    status: string;
    applied_at: string;
    days_since_application: number;
    phone: string;
    city: string;
    state: string;
  }
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchJobAndCompanyAndApplications = async (jobId: string) => {
      try {
        const jobData = await adminJobService.getJobById(parseInt(jobId));
        setJob(jobData);

        // Buscar dados da empresa
        if (jobData.company) {
          try {
            const companyData = await companyService.getCompanyById(jobData.company);
            setCompany(companyData);
          } catch (companyError) {
            console.warn('Erro ao carregar empresa:', companyError);
          }
        }

        // Buscar candidaturas
        try {
          const token = AuthService.getAccessToken();
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/applications/?job=${jobId}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          if (!response.ok) throw new Error('Erro ao buscar candidaturas');
          const data = await response.json();
          // API retorna dados paginados com results ou array direto
          setApplications(Array.isArray(data) ? data : (data.results || []));
        } catch (appError) {
          console.warn('Erro ao carregar candidaturas:', appError);
        }
      } catch (err) {
        setError('Erro ao carregar vaga');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (resolvedParams && resolvedParams.id) {
      fetchJobAndCompanyAndApplications(resolvedParams.id);
    } else {
      console.log('resolvedParams ou resolvedParams.id não disponível:', resolvedParams);
    }
  }, [resolvedParams]);

  const handleDelete = async () => {
    if (!job || !(await confirmDialog('Tem certeza que deseja excluir esta vaga?'))) {
      return;
    }

    try {
      await adminJobService.deleteJob(job.id);
      router.push('/admin-panel/jobs');
    } catch (err) {
      toast.error('Erro ao excluir vaga');
      console.error(err);
    }
  };

  const handleDownloadExcel = async () => {
    if (applications.length === 0) {
      toast.error('Não há candidaturas para exportar');
      return;
    }

    const XLSX = await import('xlsx');

    // Preparar os dados para o Excel
    const excelData = applications.map(app => ({
      'Nome do Candidato': app.candidate_name,
      'Vaga': job?.title || 'N/A',
      'Status': getStatusLabel(app.status),
      'Data de Inscrição': new Date(app.applied_at).toLocaleDateString('pt-BR'),
      'Dias desde a candidatura': app.days_since_application,
      'Telefone': app.phone,
      'Estado': app.state,
      'Cidade': app.city
    }));

    // Criar workbook
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Candidaturas');

    // Ajustar largura das colunas
    const colWidths = [
      { wch: 25 }, // Nome do Candidato
      { wch: 30 }, // Vaga
      { wch: 15 }, // Status
      { wch: 15 }, // Data de Inscrição
      { wch: 15 }, // Telefone
      { wch: 20 }, // Cidade
      { wch: 10 }, // Estado
      { wch: 20 }, // Dias desde a candidatura
      { wch: 15 }, // ID da Candidatura
      { wch: 15 }  // ID do Candidato
    ];
    ws['!cols'] = colWidths;

    // Gerar nome do arquivo
    const fileName = `candidaturas_${job?.title?.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;

    // Fazer download
    XLSX.writeFile(wb, fileName);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  const getStatusLabel = (status: string) => {
    const statusLabels = {
      submitted: 'Aguardando',
      in_process: 'Aguardando',
      interview_scheduled: 'Entrevista Agendada',
      approved: 'Aprovado',
      rejected: 'Rejeitado'
    };
    return statusLabels[status as keyof typeof statusLabels] || status;
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

  // Filtragem dinâmica por nome ou cidade
  const filteredApplications = applications.filter(app => {
    const term = searchTerm.toLowerCase();
    return (
      app.candidate_name.toLowerCase().includes(term) ||
      app.city.toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/admin-panel/jobs"
            className="text-sky-600 hover:text-sky-500"
          >
            ← Voltar para lista
          </Link>
          <div className="flex items-center space-x-2">
            <Link
              href={`/admin-panel/jobs/${job.id}/edit`}
              className="flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-md font-medium transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              <span>Editar</span>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md font-medium transition-colors cursor-pointer"
            >
              <TrashIcon className="h-4 w-4" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-slate-800">{job.title}</h1>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${
              job.is_active
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-red-50 text-red-700'
            }`}
          >
            {job.is_active ? 'Ativa' : 'Inativa'}
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Informações Básicas */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Informações Básicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ...existing code... */}
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Localização
              </label>
              <p className="text-slate-800">{job.location}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Tipo de Contrato
              </label>
              <p className="text-slate-800">{getJobTypeLabel(job.job_type)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Modelo de Trabalho
              </label>
              <p className="text-slate-800">{getTypeModelsLabel(job.type_models)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Faixa Salarial
              </label>
              <p className="text-slate-800">{job.salary_range || 'Não informado'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Data de Encerramento
              </label>
              <p className="text-slate-800">
                {new Date(job.closure).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Empresa
              </label>
              <p className="text-slate-800">
                {company ? (
                  <span>
                    {company.name}
                    <span className="text-slate-500 text-sm ml-2">(ID: {job.company})</span>
                  </span>
                ) : (
                  <span className="text-slate-500">
                    ID: {job.company} (carregando nome...)
                  </span>
                )}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Status
              </label>
              <p className="text-slate-800">{job.is_active ? 'Ativa' : 'Inativa'}</p>
            </div>
          </div>
        </div>

        {/* Listagem de Candidaturas */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Candidaturas para esta vaga</h2>
            {applications.length > 0 && (
              <button
                onClick={handleDownloadExcel}
                className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md font-medium transition-colors cursor-pointer"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                <span>Baixar Excel</span>
              </button>
            )}
          </div>
          <div className="mb-4">
            <input
              type="text"
              placeholder="Pesquisar por nome ou cidade..."
              className="w-full md:w-1/2 px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          {filteredApplications.length === 0 ? (
            <div className="text-slate-500">Nenhuma candidatura encontrada para esta vaga.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Nome</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Data de Inscrição</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Telefone</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Cidade</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApplications.map(app => (
                    <tr key={app.id} className="border-b border-slate-200 hover:bg-white cursor-pointer" onClick={() => router.push(`/admin-panel/candidaturas/${app.id}`)}>
                      <td className="px-4 py-2 text-slate-800 font-medium">{app.candidate_name}</td>
                      <td className="px-4 py-2 text-slate-600">{getStatusLabel(app.status)}</td>
                      <td className="px-4 py-2 text-slate-600">{new Date(app.applied_at).toLocaleDateString('pt-BR')}</td>
                      <td className="px-4 py-2 text-slate-600">{app.phone}</td>
                      <td className="px-4 py-2 text-slate-600">{app.city}</td>
                      <td className="px-4 py-2 text-slate-600">{app.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ...existing code... */}
        {/* Descrição */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Descrição da Vaga
          </h2>
          <div className="prose prose max-w-none">
            <p className="text-slate-600 whitespace-pre-wrap">{job.description}</p>
          </div>
        </div>
        {/* Requisitos */}
        {job.requirements && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Requisitos
            </h2>
            <div className="prose prose max-w-none">
              <p className="text-slate-600 whitespace-pre-wrap">{job.requirements}</p>
            </div>
          </div>
        )}
        {/* Responsabilidades */}
        {job.responsibilities && (
          <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">
              Responsabilidades
            </h2>
            <div className="prose prose max-w-none">
              <p className="text-slate-600 whitespace-pre-wrap">{job.responsibilities}</p>
            </div>
          </div>
        )}
        {/* Metadados */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Informações do Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Criada em
              </label>
              <p className="text-slate-600">{formatDate(job.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 mb-1">
                Última atualização
              </label>
              <p className="text-slate-600">{formatDate(job.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
