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
        // Buscar vagas e candidaturas em paralelo
        const [jobsData, applicationsData] = await Promise.all([
          adminJobService.getJobs(),
          adminApplicationService.getAllApplications(),
        ]);

        const jobs = Array.isArray(jobsData) ? jobsData : [];
        setAllJobs(jobs);
        setFilteredJobs(jobs);

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
        <div className="text-slate-500">Carregando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Dashboard Administrativo
        </h1>
        <p className="text-slate-500">
          Gerencie candidaturas e acompanhe métricas da plataforma
        </p>


      <div className="rounded-md m-auto justify-center flex items-center mt-5">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/admin-panel/jobs/create"
            className="bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
          >
            + Nova Vaga
          </Link>
          <Link
            href="/admin-panel/jobs"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-6 py-3 rounded-md font-medium transition-colors"
          >
            Ver Todas as Vagas
          </Link>
          <Link
            href="/admin-panel/candidaturas"
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-md font-medium transition-colors"
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
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h3 className="text-lg font-semibold text-slate-500 mb-2">
            Total Candidaturas
          </h3>
          <p className="text-3xl font-bold text-slate-800">{applications.length}</p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h3 className="text-lg font-semibold text-emerald-600 mb-2">
            Aprovadas
          </h3>
          <p className="text-3xl font-bold text-emerald-600">
            {applications.filter(app => app.status === 'approved').length}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h3 className="text-lg font-semibold text-amber-600 mb-2">
            Em Processo
          </h3>
          <p className="text-3xl font-bold text-amber-600">
            {applications.filter(app => ['in_process', 'interview_scheduled'].includes(app.status)).length}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h3 className="text-lg font-semibold text-red-500 mb-2">
            Rejeitadas
          </h3>
          <p className="text-3xl font-bold text-red-500">
            {applications.filter(app => app.status === 'rejected').length}
          </p>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4">
          <h3 className="text-lg font-semibold text-sky-600 mb-2">
            Aguardando
          </h3>
          <p className="text-3xl font-bold text-sky-600">
            {applications.filter(app => app.status === 'submitted').length}
          </p>
        </div>
      </div>

      {/* Candidaturas Recentes */}
      {applications.length > 0 && (
        <div className="rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-slate-900">
              Candidaturas Recentes
            </h2>
            <Link
              href="/admin-panel/candidaturas"
              className="text-sky-600 hover:text-sky-500 text-sm"
            >
              Ver todas →
            </Link>
          </div>
          <div className="space-y-3">
            {applications.slice(0, 5).map((application: Application) => (
              <Link
                href={`/admin-panel/candidaturas/${application.id}`}
                key={application.id}
                className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-sm"
              >
                <div>
                  <h3 className="text-lg font-medium text-slate-900">
                    {application.candidate_name || application.name || 'Nome não informado'}
                  </h3>
                  <p className="text-sm text-slate-500">
                    {application.job_title || 'Vaga não informada'} • {application.city}, {application.state}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                      application.status === 'submitted'
                        ? 'bg-sky-50 text-sky-700 border-sky-200'
                        : application.status === 'in_process'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : application.status === 'interview_scheduled'
                        ? 'bg-violet-50 text-violet-700 border-violet-200'
                        : application.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
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
          <h2 className="text-xl font-semibold text-slate-900 mb-4">
            Vagas Recentes
          </h2>
          <div className="space-y-3">
            {filteredJobs.slice(0, 5).map((job: Job) => (
              <Link
                href={`/admin-panel/jobs/${job.id}`}
                key={job.id}
                className='flex items-center bg-white hover:bg-slate-50 justify-between py-4 px-5 rounded-lg border border-slate-200 shadow-sm transition-colors'
              >
                <div>
                  <h3 className="text-xl font-medium text-slate-900">{job.title}</h3>
                  <p className="text-sm text-slate-500">
                    {job.location} • {job.type_models === 'in_person' ? 'Presencial' :
                     job.type_models === 'home_office' ? 'Home Office' : 'Híbrido'}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`px-4 py-2 rounded-full text-xs font-medium border ${
                      job.is_active
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
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
