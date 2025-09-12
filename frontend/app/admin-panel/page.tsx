'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminJobService } from '@/services/adminJobService';
import adminApplicationService from '@/services/adminApplicationService';
import { Job, Application } from '@/types/index';
import JobFilters from '@/components/JobFilters';
import ApplicationCharts from '@/components/ApplicationCharts';

export default function AdminDashboard() {
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Buscar vagas
        const jobsData = await adminJobService.getJobs();
        const jobs = Array.isArray(jobsData) ? jobsData : [];
        setAllJobs(jobs);
        setFilteredJobs(jobs);

        // Buscar candidaturas usando o serviço de admin
        const applicationsData = await adminApplicationService.getAllApplications();
        const applicationsList = Array.isArray(applicationsData) 
          ? applicationsData 
          : applicationsData.results || [];
        setApplications(applicationsList);
      } catch (err) {
        setError('Erro ao carregar dados');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFiltersChange = (filtered: Job[]) => {
    setFilteredJobs(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-zinc-300">Carregando...</div>
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
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-zinc-100 mb-2">
          Dashboard Administrativo
        </h1>
        <p className="text-zinc-400">
          Gerencie candidaturas e acompanhe métricas da plataforma
        </p>


      <div className="rounded-md m-auto justify-center flex items-center mt-5">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin-panel/jobs/create"
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            + Nova Vaga
          </Link>
          <Link
            href="/admin-panel/jobs"
            className="bg-zinc-700 hover:bg-zinc-600 text-zinc-100 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Ver Todas as Vagas
          </Link>
          <Link
            href="/admin-panel/candidaturas"
            className="bg-green-700 hover:bg-green-600 text-zinc-100 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Ver Candidaturas
          </Link>
        </div>
      </div>

      </div>


      {/* Filtros */}
      <JobFilters jobs={allJobs} onFiltersChange={handleFiltersChange} />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-md p-4">
          <h3 className="text-lg font-semibold text-white/70 mb-2">
            Total Candidaturas
          </h3>
          <p className="text-3xl font-bold text-white/70">{applications.length}</p>
        </div>

        <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-md p-4">
          <h3 className="text-lg font-semibold text-green-300 mb-2">
            Aprovadas
          </h3>
          <p className="text-3xl font-bold text-green-300">
            {applications.filter(app => app.status === 'approved').length}
          </p>
        </div>

        <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-md p-4">
          <h3 className="text-lg font-semibold text-yellow-300/80 mb-2">
            Em Processo
          </h3>
          <p className="text-3xl font-bold text-yellow-200">
            {applications.filter(app => ['in_process', 'interview_scheduled'].includes(app.status)).length}
          </p>
        </div>

        <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-md p-4">
          <h3 className="text-lg font-semibold text-red-300 mb-2">
            Rejeitadas
          </h3>
          <p className="text-3xl font-bold text-red-200">
            {applications.filter(app => app.status === 'rejected').length}
          </p>
        </div>

        <div className="bg-gradient-to-r from-zinc-800 to-zinc-700 rounded-md p-4">
          <h3 className="text-lg font-semibold text-indigo-300 mb-2">
            Aguardando
          </h3>
          <p className="text-3xl font-bold text-indigo-200">
            {applications.filter(app => app.status === 'submitted').length}
          </p>
        </div>
      </div>

      {/* Candidaturas Recentes */}
      {applications.length > 0 && (
        <div className="rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-zinc-100">
              Candidaturas Recentes
            </h2>
            <Link
              href="/admin-panel/candidaturas"
              className="text-indigo-400 hover:text-indigo-300 text-sm"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 5).map((application: Application) => (
              <Link
                href={`/admin-panel/candidaturas/${application.id}`}
                key={application.id}
                className="flex items-center justify-between p-4 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-medium text-white">
                    {application.candidate_name || application.name || 'Nome não informado'}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {application.job_title || 'Vaga não informada'} • {application.city}, {application.state}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      application.status === 'submitted'
                        ? 'bg-blue-900 text-blue-300'
                        : application.status === 'in_process'
                        ? 'bg-yellow-900 text-yellow-300'
                        : application.status === 'interview_scheduled'
                        ? 'bg-purple-900 text-purple-300'
                        : application.status === 'approved'
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {application.status === 'submitted' ? 'Em análise' :
                     application.status === 'in_process' ? 'Em processo' :
                     application.status === 'interview_scheduled' ? 'Entrevista agendada' :
                     application.status === 'approved' ? 'Aprovado' :
                     application.status === 'rejected' ? 'Reprovado' : 'Retirado'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Vagas Recentes */}
      {filteredJobs.length > 0 && (
        <div className="rounded-md">
          <h2 className="text-xl font-semibold text-zinc-100 mb-4">
            Vagas Recentes
          </h2>
          <div className="space-y-3">
            {filteredJobs.slice(0, 5).map((job: Job) => (
              <Link
                href={`/admin-panel/jobs/${job.id}`}
                key={job.id}
                className='flex items-center bg-gradient-to-r from-zinc-800 to-zinc-700 hover:opacity-70 justify-between py-4 px-5 rounded-md'
              >
                <div>
                  <h3 className="text-xl font-medium text-white">{job.title}</h3>
                  <p className="text-sm text-zinc-400">
                    {job.location} • {job.type_models === 'in_person' ? 'Presencial' : 
                     job.type_models === 'home_office' ? 'Home Office' : 'Híbrido'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-medium ${
                      job.is_active
                        ? 'bg-green-900 text-green-300'
                        : 'bg-red-900 text-red-300'
                    }`}
                  >
                    {job.is_active ? 'Vaga Ativa' : 'Vaga Inativa'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Gráficos de Candidaturas */}
      <ApplicationCharts applications={applications} />

    </div>
  );
}
