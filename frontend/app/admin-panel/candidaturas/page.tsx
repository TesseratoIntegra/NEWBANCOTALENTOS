'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import adminApplicationService from '@/services/adminApplicationService';
import { Application } from '@/types/index';

interface ApplicationFilters {
  status?: string;
  search?: string;
  page: number;
}

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ApplicationFilters>({ page: 1 });
  const [totalCount, setTotalCount] = useState(0);
    // Novo estado para busca

    // Novo estado para busca
    const [searchTerm, setSearchTerm] = useState('');

  const statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'submitted', label: 'Em análise' },
    { value: 'in_process', label: 'Em processo seletivo' },
    { value: 'interview_scheduled', label: 'Entrevista agendada' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'rejected', label: 'Reprovado' },
    { value: 'withdrawn', label: 'Retirado pelo candidato' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-sky-50 text-sky-700 border border-sky-200',
      in_process: 'bg-amber-50 text-amber-700 border border-amber-200',
      interview_scheduled: 'bg-violet-50 text-violet-700 border border-violet-200',
      approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border border-red-200',
      withdrawn: 'bg-slate-100 text-slate-500 border border-slate-200'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-500 border border-slate-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      submitted: 'Em análise',
      in_process: 'Em processo seletivo',
      interview_scheduled: 'Entrevista agendada',
      approved: 'Aprovado',
      rejected: 'Reprovado',
      withdrawn: 'Retirado pelo candidato'
    };
    return labels[status as keyof typeof labels] || status;
  };

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const params: { page: number; status?: string } = { page: filters.page };
        if (filters.status) params.status = filters.status;

        const response = await adminApplicationService.getAllApplications(params);

        if (Array.isArray(response)) {
          setApplications(response);
          setTotalCount(response.length);
        } else {
          setApplications(response.results || []);
          setTotalCount(response.count || 0);
        }
      } catch (err) {
        setError('Erro ao carregar candidaturas');
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, [filters]);

  const handleStatusFilter = (status: string) => {
    setFilters(prev => ({ ...prev, status: status || undefined, page: 1 }));
  };

    // Handler para busca
    const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-600">Carregando candidaturas...</div>
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
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Candidaturas Recebidas
        </h1>
        <p className="text-slate-500">
          Gerencie as candidaturas enviadas pelos candidatos
        </p>
      </div>

      {/* Input de busca */}
      <div className="flex justify-center mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchInput}
          placeholder="Buscar por nome ou vaga..."
          className="w-full max-w-md px-4 py-2 rounded-md border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-4 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-1">Total</h3>
          <p className="text-2xl font-bold text-sky-600">{totalCount}</p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-4 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-1">Em Análise</h3>
          <p className="text-2xl font-bold text-amber-600">
            {applications.filter(app => app.status === 'submitted').length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-4 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-1">Entrevistas</h3>
          <p className="text-2xl font-bold text-violet-600">
            {applications.filter(app => app.status === 'interview_scheduled').length}
          </p>
        </div>
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-4 border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600 mb-1">Aprovados</h3>
          <p className="text-2xl font-bold text-emerald-600">
            {applications.filter(app => app.status === 'approved').length}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-md p-4 border border-slate-200">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleStatusFilter(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.status === option.value || (!filters.status && !option.value)
                  ? 'bg-sky-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-200'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Candidaturas */}
      {(() => {
        // Filtragem dinâmica local
        const filteredApplications = applications.filter(app => {
          const search = searchTerm.trim().toLowerCase();
          if (!search) return true;
          const name = (app.candidate_name || app.name || '').toLowerCase();
          const job = (app.job_title || '').toLowerCase();
          return name.includes(search) || job.includes(search);
        });
        if (filteredApplications.length > 0) {
          return (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <Link
                  href={`/admin-panel/candidaturas/${application.id}`}
                  key={application.id}
                  className="block bg-white border border-slate-200 shadow-sm hover:bg-slate-50 rounded-md p-6 border border-slate-200 duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-1">
                        {application.candidate_name || application.name || 'Nome não informado'}
                      </h3>
                      <p className="text-sky-600 font-medium">
                        {application.job_title || 'Vaga não informada'}
                      </p>
                      <p className="text-slate-500 text-sm">
                        {application.company_name || 'Empresa não informada'}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {getStatusLabel(application.status)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-slate-500">
                    <div>
                      <span className="font-medium">Telefone:</span> {application.phone || 'Não informado'}
                    </div>
                    <div>
                      <span className="font-medium">Localização:</span> {application.city && application.state ? `${application.city}, ${application.state}` : 'Não informado'}
                    </div>
                    <div>
                      <span className="font-medium">Data da Candidatura:</span> {formatDate(application.applied_at)}
                    </div>
                  </div>

                  {application.salary_expectation && (
                    <div className="mt-2 text-sm text-slate-500">
                      <span className="font-medium">Pretensão Salarial:</span> R$ {application.salary_expectation.toLocaleString('pt-BR')}
                    </div>
                  )}

                  {application.linkedin && (
                    <div className="mt-2">
                      <span className="text-xs bg-sky-50 text-sky-600 px-2 py-1 rounded">
                        LinkedIn disponível
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          );
        } else {
          return (
            <div className="text-center py-12">
              <div className="text-slate-500 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhuma candidatura encontrada</h3>
              <p className="text-slate-400">
                {searchTerm
                  ? 'Nenhuma candidatura encontrada para a busca.'
                  : (filters.status 
                      ? 'Não há candidaturas com o status selecionado.' 
                      : 'Ainda não há candidaturas recebidas.')}
              </p>
            </div>
          );
        }
      })()}
    </div>
  );
}
