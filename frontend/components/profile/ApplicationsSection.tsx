'use client';

import { useState, useEffect, useCallback } from 'react';
import { Application } from '@/types';
import { Building2, MapPin, Calendar, Clock, Eye, Trash2, Briefcase } from 'lucide-react';
import Link from 'next/link';
import applicationService from '@/services/applicationService';
import { confirmDialog } from '@/lib/confirmDialog';

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  submitted: { color: 'text-amber-700', bgColor: 'bg-amber-100', label: 'Em análise' },
  in_process: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Em processo' },
  interview_scheduled: { color: 'text-purple-700', bgColor: 'bg-purple-100', label: 'Entrevista' },
  approved: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Aprovado' },
  rejected: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Reprovado' },
  withdrawn: { color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'Retirado' },
};

const JOB_TYPE_MAP: Record<string, string> = {
  'full-time': 'Tempo Integral',
  'part-time': 'Meio Período',
  'contract': 'Contrato',
  'temporary': 'Temporário',
  'internship': 'Estágio',
  'freelance': 'Freelance',
};

const ITEMS_PER_PAGE = 10;

export default function ApplicationsSection() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

  const loadApplications = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await applicationService.getMyApplications({ page });

      if (Array.isArray(response)) {
        setApplications(response);
        setTotalCount(response.length);
      } else {
        setApplications(response?.results || []);
        setTotalCount(response?.count || 0);
      }
      setCurrentPage(page);
    } catch {
      setApplications([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications(1);
  }, [loadApplications]);

  const handleWithdraw = async (id: number) => {
    if (!(await confirmDialog('Tem certeza que deseja retirar esta candidatura?'))) return;
    try {
      await applicationService.deleteApplication(id);
      loadApplications(currentPage);
    } catch (err) {
      console.error('Erro ao retirar candidatura:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
        <Briefcase className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <p className="text-slate-500 mb-4">Você ainda não se candidatou a nenhuma vaga.</p>
        <Link
          href="/vagas"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Explorar vagas disponíveis
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">
        {totalCount} {totalCount === 1 ? 'candidatura' : 'candidaturas'}
      </p>

      {applications.map((app) => {
        const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;

        return (
          <div
            key={app.id}
            className="p-4 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-800">
                  {app.job_title || `Vaga #${app.job}`}
                </h4>
                <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 flex-wrap">
                  {app.company_name && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {app.company_name}
                    </span>
                  )}
                  {app.job_location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {app.job_location}
                    </span>
                  )}
                  {app.job_type && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {JOB_TYPE_MAP[app.job_type] || app.job_type}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                  <Calendar className="w-3 h-3" />
                  <span>Candidatou-se em {new Date(app.applied_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig.bgColor} ${statusConfig.color} ml-3`}>
                {statusConfig.label}
              </span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
              <div>
                {app.job && (
                  <Link
                    href={`/vagas/empresa/${app.job}`}
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm transition"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver vaga</span>
                  </Link>
                )}
              </div>

              {(app.status === 'submitted' || app.status === 'in_process') && (
                <button
                  onClick={() => handleWithdraw(app.id)}
                  className="inline-flex items-center gap-1 text-red-500 hover:text-red-700 text-sm transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Retirar</span>
                </button>
              )}
            </div>
          </div>
        );
      })}

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-4">
          <button
            onClick={() => loadApplications(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm border border-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
          >
            Anterior
          </button>
          <span className="text-sm text-slate-500">
            {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => loadApplications(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm border border-slate-300 rounded-md disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition cursor-pointer"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
