'use client';

import { Application } from '@/types';
import { Building2, MapPin, ExternalLink } from 'lucide-react';
import Link from 'next/link';

interface ApplicationsSectionProps {
  applications: Application[];
}

const STATUS_CONFIG: Record<string, { color: string; bgColor: string; label: string }> = {
  submitted: { color: 'text-amber-700', bgColor: 'bg-amber-100', label: 'Em análise' },
  in_process: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Em processo' },
  interview_scheduled: { color: 'text-purple-700', bgColor: 'bg-purple-100', label: 'Entrevista' },
  approved: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Aprovado' },
  rejected: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Reprovado' },
  withdrawn: { color: 'text-gray-700', bgColor: 'bg-gray-100', label: 'Retirado' },
};

export default function ApplicationsSection({ applications }: ApplicationsSectionProps) {
  if (applications.length === 0) {
    return (
      <div className="text-center py-8">
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

  const recentApplications = applications.slice(0, 5);
  const hasMore = applications.length > 5;

  return (
    <div className="space-y-3">
      {recentApplications.map((app) => {
        const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.submitted;

        return (
          <div
            key={app.id}
            className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-blue-300 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-800 truncate">
                {app.job_title || `Vaga #${app.job}`}
              </h4>
              <div className="flex items-center gap-3 text-sm text-slate-500 mt-1 flex-wrap">
                {app.company_name && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    {app.company_name}
                  </span>
                )}
                {app.job_location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {app.job_location}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 ml-4">
              <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusConfig.bgColor} ${statusConfig.color}`}>
                {statusConfig.label}
              </span>
            </div>
          </div>
        );
      })}

      {hasMore && (
        <Link
          href="/candidaturas"
          className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 font-medium py-2"
        >
          Ver todas as {applications.length} candidaturas
          <ExternalLink className="w-4 h-4" />
        </Link>
      )}
    </div>
  );
}
