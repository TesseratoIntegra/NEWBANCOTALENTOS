'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import applicationService from '@/services/applicationService';
import { Application } from '@/types/index';

export default function ApplicationDetailPage() {
  const params = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const applicationId = Array.isArray(params.id) ? params.id[0] : params.id;

  const statusOptions = [
    { value: 'submitted', label: 'Em análise' },
    { value: 'in_process', label: 'Em processo seletivo' },
    { value: 'interview_scheduled', label: 'Entrevista agendada' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'rejected', label: 'Reprovado' }
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
    const fetchApplication = async () => {
      if (!applicationId) return;
      
      try {
        setLoading(true);
        const data = await applicationService.getApplicationById(Number(applicationId));
        setApplication(data);
      } catch (err) {
        setError('Erro ao carregar dados da candidatura');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  const handleStatusUpdate = async (newStatus: string, notes?: string) => {
    if (!application) return;

    try {
      setUpdateLoading(true);
      await applicationService.updateApplication(application.id, {
        status: newStatus as Application['status'],
        recruiter_notes: notes
      });
      
      setApplication(prev => prev ? { ...prev, status: newStatus as Application['status'], recruiter_notes: notes } : null);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      alert('Erro ao atualizar status da candidatura');
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadResume = () => {
    if (application?.resume) {
      window.open(application.resume, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-zinc-300">Carregando candidatura...</div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-400">{error || 'Candidatura não encontrada'}</div>
        <Link 
          href="/admin-panel/candidaturas"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Voltar para candidaturas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/admin-panel/candidaturas"
            className="text-indigo-400 hover:text-indigo-300 text-sm mb-2 inline-block"
          >
            ← Voltar para candidaturas
          </Link>
          <h1 className="text-3xl font-bold text-zinc-100">
            Candidatura de {application.candidate_name || application.name}
          </h1>
          <p className="text-zinc-400">
            {application.job_title} • {application.company_name}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
          {getStatusLabel(application.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados do Candidato */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-800 rounded-md p-6 border border-zinc-700">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Dados do Candidato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Nome</label>
                <p className="text-zinc-100">{application.candidate_name || application.name || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Telefone</label>
                <p className="text-zinc-100">{application.phone || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Cidade</label>
                <p className="text-zinc-100">{application.city || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-1">Estado</label>
                <p className="text-zinc-100">{application.state || 'Não informado'}</p>
              </div>
              {application.linkedin && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">LinkedIn</label>
                  <a 
                    href={application.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 break-all"
                  >
                    {application.linkedin}
                  </a>
                </div>
              )}
              {application.portfolio && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Portfólio</label>
                  <a 
                    href={application.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-indigo-400 hover:text-indigo-300 break-all"
                  >
                    {application.portfolio}
                  </a>
                </div>
              )}
              {application.salary_expectation && (
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-1">Pretensão Salarial</label>
                  <p className="text-zinc-100">R$ {application.salary_expectation.toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>

            {/* Currículo */}
            {application.resume && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Currículo</label>
                <button
                  onClick={downloadResume}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Visualizar Currículo
                </button>
              </div>
            )}

            {/* Carta de Apresentação */}
            {application.cover_letter && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Carta de Apresentação</label>
                <div className="bg-zinc-700 rounded-md p-4">
                  <p className="text-zinc-100 whitespace-pre-wrap">{application.cover_letter}</p>
                </div>
              </div>
            )}

            {/* Observações do Candidato */}
            {application.observations && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-zinc-400 mb-2">Observações</label>
                <div className="bg-zinc-700 rounded-md p-4">
                  <p className="text-zinc-100 whitespace-pre-wrap">{application.observations}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Painel de Ações */}
        <div className="space-y-6">
          {/* Informações da Candidatura */}
          <div className="bg-zinc-800 rounded-md p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Informações da Candidatura</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-zinc-400">Data da candidatura:</span>
                <p className="text-zinc-100">{formatDate(application.applied_at)}</p>
              </div>
              {application.reviewed_at && (
                <div>
                  <span className="text-zinc-400">Última análise:</span>
                  <p className="text-zinc-100">{formatDate(application.reviewed_at)}</p>
                </div>
              )}
              {application.days_since_application !== undefined && (
                <div>
                  <span className="text-zinc-400">Dias desde candidatura:</span>
                  <p className="text-zinc-100">{application.days_since_application} dias</p>
                </div>
              )}
            </div>
          </div>

          {/* Alterar Status */}
          <div className="bg-zinc-800 rounded-md p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Alterar Status</h3>
            <div className="space-y-3">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleStatusUpdate(option.value)}
                  disabled={updateLoading || application.status === option.value}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    application.status === option.value
                      ? 'bg-indigo-600 text-white cursor-default'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  } ${updateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações do Recrutador */}
          <div className="bg-zinc-800 rounded-md p-6 border border-zinc-700">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Observações do Recrutador</h3>
            <textarea
              placeholder="Adicione suas observações sobre esta candidatura..."
              defaultValue={application.recruiter_notes || ''}
              onBlur={(e) => {
                if (e.target.value !== application.recruiter_notes) {
                  handleStatusUpdate(application.status, e.target.value);
                }
              }}
              className="w-full h-32 bg-zinc-700 border border-zinc-600 rounded-md px-3 py-2 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
