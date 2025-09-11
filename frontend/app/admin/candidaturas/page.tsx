'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import adminApplicationService from '@/services/adminApplicationService';
import { Application } from '@/types/index';
import { useAuth } from '@/contexts/AuthContext';

interface ApplicationFilters {
  status?: string;
  search?: string;
  page: number;
}

export default function AdminApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ApplicationFilters>({ page: 1 });
  const [totalCount, setTotalCount] = useState(0);

  // Log user info for debugging
  useEffect(() => {
    console.log('Current user:', user);
    console.log('User type:', user?.user_type);
    console.log('Is staff:', user?.is_staff);
    console.log('Is superuser:', user?.is_superuser);
  }, [user]);

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
      submitted: 'bg-blue-900 text-blue-300',
      in_process: 'bg-yellow-900 text-yellow-300',
      interview_scheduled: 'bg-purple-900 text-purple-300',
      approved: 'bg-green-900 text-green-300',
      rejected: 'bg-red-900 text-red-300',
      withdrawn: 'bg-gray-800 text-gray-400'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-800 text-gray-400';
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
        
        console.log('Fetching applications with params:', params);
        const response = await adminApplicationService.getAllApplications(params);
        console.log('Response received:', response);
        
        if (Array.isArray(response)) {
          setApplications(response);
          setTotalCount(response.length);
        } else {
          setApplications(response.results || []);
          setTotalCount(response.count || 0);
        }
        console.log('Applications set:', response);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-zinc-300">Carregando candidaturas...</div>
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
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">
          Candidaturas Recebidas
        </h1>
        <p className="text-zinc-400">
          Gerencie as candidaturas enviadas pelos candidatos
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-md p-4 border border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-300 mb-1">Total</h3>
          <p className="text-2xl font-bold text-blue-300">{totalCount}</p>
        </div>
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-md p-4 border border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-300 mb-1">Em Análise</h3>
          <p className="text-2xl font-bold text-yellow-300">
            {applications.filter(app => app.status === 'submitted').length}
          </p>
        </div>
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-md p-4 border border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-300 mb-1">Entrevistas</h3>
          <p className="text-2xl font-bold text-purple-300">
            {applications.filter(app => app.status === 'interview_scheduled').length}
          </p>
        </div>
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-md p-4 border border-zinc-700">
          <h3 className="text-sm font-medium text-zinc-300 mb-1">Aprovados</h3>
          <p className="text-2xl font-bold text-green-300">
            {applications.filter(app => app.status === 'approved').length}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-md p-4 border border-zinc-700">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map(option => (
            <button
              key={option.value}
              onClick={() => handleStatusFilter(option.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.status === option.value || (!filters.status && !option.value)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Candidaturas */}
      {applications.length > 0 ? (
        <div className="space-y-4">
          {applications.map((application) => (
            <Link
              href={`/admin/candidaturas/${application.id}`}
              key={application.id}
              className="block bg-gradient-to-r from-zinc-900 to-zinc-800 hover:opacity-60 rounded-md p-6 border border-zinc-700 duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-zinc-100 mb-1">
                    {application.candidate_name || application.name || 'Nome não informado'}
                  </h3>
                  <p className="text-indigo-400 font-medium">
                    {application.job_title || 'Vaga não informada'}
                  </p>
                  <p className="text-zinc-400 text-sm">
                    {application.company_name || 'Empresa não informada'}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                  {getStatusLabel(application.status)}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-zinc-400">
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
                <div className="mt-2 text-sm text-zinc-400">
                  <span className="font-medium">Pretensão Salarial:</span> R$ {application.salary_expectation.toLocaleString('pt-BR')}
                </div>
              )}

              {application.linkedin && (
                <div className="mt-2">
                  <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded">
                    LinkedIn disponível
                  </span>
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-zinc-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-zinc-300 mb-2">Nenhuma candidatura encontrada</h3>
          <p className="text-zinc-500">
            {filters.status 
              ? 'Não há candidaturas com o status selecionado.' 
              : 'Ainda não há candidaturas recebidas.'}
          </p>
        </div>
      )}
    </div>
  );
}
