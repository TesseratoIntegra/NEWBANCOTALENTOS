'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import candidateService from '@/services/candidateService';
import adminApplicationService from '@/services/adminApplicationService';
import admissionService from '@/services/admissionService';
import selectionProcessService from '@/services/selectionProcessService';
import { adminJobService } from '@/services/adminJobService';
import { SelectionProcess, Job } from '@/types/index';
import {
  Users, UserCheck, ClipboardList, FileText, Briefcase,
  ArrowRight, AlertCircle, TrendingUp, Award, Monitor,
} from 'lucide-react';

const DashboardCharts = dynamic(() => import('@/components/admin/DashboardCharts'), {
  loading: () => <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><div className="h-[360px] animate-pulse bg-slate-100 rounded-xl" /><div className="h-[360px] animate-pulse bg-slate-100 rounded-xl" /></div>,
  ssr: false,
});

// Pipeline status config — ordem do funil
const PIPELINE_STAGES = [
  { key: 'pending', label: 'Em Análise', color: '#f59e0b', bg: 'bg-amber-100', text: 'text-amber-700' },
  { key: 'awaiting_review', label: 'Ag. Revisão', color: '#3b82f6', bg: 'bg-blue-100', text: 'text-blue-700' },
  { key: 'changes_requested', label: 'Ag. Candidato', color: '#f97316', bg: 'bg-orange-100', text: 'text-orange-700' },
  { key: 'rejected', label: 'Reprovado', color: '#ef4444', bg: 'bg-red-100', text: 'text-red-700' },
  { key: 'approved', label: 'Aprovado', color: '#22c55e', bg: 'bg-green-100', text: 'text-green-700' },
  { key: 'documents_pending', label: 'Docs. Pendentes', color: '#8b5cf6', bg: 'bg-violet-100', text: 'text-violet-700' },
  { key: 'in_selection_process', label: 'Em Proc. Seletivo', color: '#06b6d4', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  { key: 'documents_complete', label: 'Docs. Completos', color: '#14b8a6', bg: 'bg-teal-100', text: 'text-teal-700' },
  { key: 'admission_in_progress', label: 'Em Admissão', color: '#6366f1', bg: 'bg-indigo-100', text: 'text-indigo-700' },
  { key: 'admitted', label: 'Admitido', color: '#10b981', bg: 'bg-emerald-200', text: 'text-emerald-800' },
];

// Candidaturas status config
const APP_STATUS_LABELS: Record<string, string> = {
  submitted: 'Enviada',
  in_process: 'Em Processo',
  interview_scheduled: 'Entrevista',
  approved: 'Aprovada',
  rejected: 'Rejeitada',
  withdrawn: 'Retirada',
};

const APP_STATUS_COLORS: Record<string, string> = {
  submitted: '#6366f1',
  in_process: '#f59e0b',
  interview_scheduled: '#8b5cf6',
  approved: '#10b981',
  rejected: '#ef4444',
  withdrawn: '#94a3b8',
};

interface DashboardStats {
  total: number;
  distribution: Record<string, number>;
}

interface AppStats {
  total_applications: number;
  submitted: number;
  in_process: number;
  interview_scheduled: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pipelineStats, setPipelineStats] = useState<DashboardStats | null>(null);
  const [appStats, setAppStats] = useState<AppStats | null>(null);
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [pendingDocsCount, setPendingDocsCount] = useState(0);
  const [awaitingDocsCount, setAwaitingDocsCount] = useState(0);
  const [docsCompletedCount, setDocsCompletedCount] = useState(0);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const results = await Promise.allSettled([
          candidateService.getDashboardStats(),
          adminApplicationService.getStatistics(),
          selectionProcessService.getProcesses(),
          admissionService.getPendingReview(),
          admissionService.getApprovedAwaitingDocuments(),
          admissionService.getDocumentsCompleted(),
          adminJobService.getJobs(),
        ]);

        if (results[0].status === 'fulfilled') setPipelineStats(results[0].value);
        if (results[1].status === 'fulfilled') setAppStats(results[1].value);
        if (results[2].status === 'fulfilled') {
          const processesRes = results[2].value;
          const procList = Array.isArray(processesRes) ? processesRes : processesRes.results || [];
          setProcesses(procList);
        }
        if (results[3].status === 'fulfilled') setPendingDocsCount(Array.isArray(results[3].value) ? results[3].value.length : 0);
        if (results[4].status === 'fulfilled') setAwaitingDocsCount(Array.isArray(results[4].value) ? results[4].value.length : 0);
        if (results[5].status === 'fulfilled') setDocsCompletedCount(Array.isArray(results[5].value) ? results[5].value.length : 0);
        if (results[6].status === 'fulfilled') setJobs(Array.isArray(results[6].value) ? results[6].value : []);
      } catch (err) {
        setError('Erro ao carregar dados do dashboard.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex items-center gap-2 text-red-500">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  const dist = pipelineStats?.distribution || {};
  const total = pipelineStats?.total || 0;

  // KPI values
  const awaitingReview = (dist['awaiting_review'] || 0);
  const inSelectionProcess = (dist['in_selection_process'] || 0);
  const admitted = (dist['admitted'] || 0);
  const activeJobs = jobs.filter(j => j.is_active).length;

  // Pipeline chart data
  const pipelineChartData = PIPELINE_STAGES
    .map(stage => ({
      name: stage.label,
      value: dist[stage.key] || 0,
      color: stage.color,
      key: stage.key,
    }))
    .filter(d => d.value > 0);

  // Application pie data
  const appPieData = appStats
    ? Object.entries(APP_STATUS_LABELS)
        .map(([key, label]) => ({
          name: label,
          value: (appStats as Record<string, number>)[key] || 0,
          color: APP_STATUS_COLORS[key],
        }))
        .filter(d => d.value > 0)
    : [];

  // Active processes
  const activeProcesses = processes.filter(p => p.status === 'active');

  // Alerts
  const alerts = [
    {
      show: awaitingReview > 0,
      icon: Users,
      label: `${awaitingReview} perfil(is) aguardando revisão`,
      href: '/admin-panel/talentos',
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      show: pendingDocsCount > 0,
      icon: FileText,
      label: `${pendingDocsCount} documento(s) pendente(s) de revisão`,
      href: '/admin-panel/documentos',
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
    {
      show: docsCompletedCount > 0,
      icon: Award,
      label: `${docsCompletedCount} candidato(s) pronto(s) para admissão`,
      href: '/admin-panel/talentos?status=documents_complete',
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      show: awaitingDocsCount > 0,
      icon: FileText,
      label: `${awaitingDocsCount} candidato(s) com documentos incompletos`,
      href: '/admin-panel/talentos?status=documents_pending',
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
  ].filter(a => a.show);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Visão geral do banco de talentos</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin-panel/jobs/create"
            className="inline-flex items-center gap-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <Briefcase className="h-4 w-4" />
            Nova Vaga
          </Link>
          <Link
            href="/admin-panel/candidaturas"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Ver Candidaturas
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={Users}
          label="Total Talentos"
          value={total}
          iconBg="bg-sky-50"
          iconColor="text-sky-600"
        />
        <KpiCard
          icon={TrendingUp}
          label="Ag. Revisão"
          value={awaitingReview}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          href="/admin-panel/talentos?status=awaiting_review"
        />
        <KpiCard
          icon={ClipboardList}
          label="Em Proc. Seletivo"
          value={inSelectionProcess}
          iconBg="bg-cyan-50"
          iconColor="text-cyan-600"
          href="/admin-panel/talentos?status=in_selection_process"
        />
        <KpiCard
          icon={UserCheck}
          label="Admitidos"
          value={admitted}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          href="/admin-panel/talentos?status=admitted"
        />
      </div>

      {/* Pipeline Funnel */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-slate-900">Funil do Pipeline</h2>
          <span className="text-xs text-slate-400">{total} talentos cadastrados</span>
        </div>
        <div className="space-y-3">
          {PIPELINE_STAGES.map(stage => {
            const count = dist[stage.key] || 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <button
                key={stage.key}
                onClick={() => router.push(`/admin-panel/talentos?status=${stage.key}`)}
                className="w-full group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-slate-600 w-32 text-left truncate">
                    {stage.label}
                  </span>
                  <div className="flex-1 h-7 bg-slate-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                      style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%`, backgroundColor: stage.color }}
                    />
                    {count > 0 && (
                      <span className="absolute inset-y-0 left-2 flex items-center text-[11px] font-semibold text-white drop-shadow-sm"
                        style={{ left: pct > 10 ? '8px' : undefined }}
                      >
                        {pct < 10 ? '' : count}
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-slate-700 w-12 text-right">
                    {count} <span className="text-slate-400 font-normal">({pct.toFixed(0)}%)</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Charts Row */}
      <DashboardCharts
        appPieData={appPieData}
        pipelineChartData={pipelineChartData}
        totalApplications={appStats?.total_applications || 0}
      />

      {/* Active Processes + Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Processes */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Processos Seletivos Ativos</h2>
            <Link href="/admin-panel/processos-seletivos" className="text-xs text-sky-600 hover:text-sky-700 font-medium">
              Ver todos
            </Link>
          </div>
          {activeProcesses.length > 0 ? (
            <div className="space-y-3">
              {activeProcesses.slice(0, 5).map(proc => (
                <Link
                  key={proc.id}
                  href={`/admin-panel/processos-seletivos/${proc.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-sky-200 hover:bg-sky-50/50 transition-colors group"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{proc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {proc.job_title || 'Sem vaga vinculada'}
                      {proc.candidates_count !== undefined && ` — ${proc.candidates_count} candidato(s)`}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-sky-500 transition-colors flex-shrink-0 ml-2" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-sm">
              Nenhum processo seletivo ativo
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Resumo Rápido</h2>
          <div className="space-y-4">
            <QuickStat label="Vagas ativas" value={activeJobs} total={jobs.length} color="bg-sky-500" />
            <QuickStat
              label="Taxa de aprovação"
              value={appStats ? appStats.approved : 0}
              total={appStats?.total_applications || 0}
              color="bg-emerald-500"
              isPercent
            />
            <QuickStat
              label="Entrevistas agendadas"
              value={appStats?.interview_scheduled || 0}
              total={appStats?.total_applications || 0}
              color="bg-violet-500"
            />
            <QuickStat
              label="Processos ativos"
              value={activeProcesses.length}
              total={processes.length}
              color="bg-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Ações Pendentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {alerts.map((alert, i) => {
              const Icon = alert.icon;
              return (
                <Link
                  key={i}
                  href={alert.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-sky-200 hover:bg-slate-50 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${alert.iconBg} flex-shrink-0`}>
                    <Icon className={`h-5 w-5 ${alert.iconColor}`} />
                  </div>
                  <span className="text-sm text-slate-700 flex-1">{alert.label}</span>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-sky-500 transition-colors flex-shrink-0" />
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* TV Dashboards */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-5 w-5 text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">TV Dashboards</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">Abra em tela cheia para exibir em televisões</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <a
            href="/admin-panel/tv/pipeline"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors group"
          >
            <TrendingUp className="h-5 w-5 text-sky-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Pipeline</p>
              <p className="text-[11px] text-slate-400">Funil + conversão</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 transition-colors flex-shrink-0" />
          </a>
          <a
            href="/admin-panel/tv/overview"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors group"
          >
            <Users className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Visão Geral</p>
              <p className="text-[11px] text-slate-400">KPIs + gráficos</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
          </a>
          <a
            href="/admin-panel/tv/insights"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors group"
          >
            <Award className="h-5 w-5 text-violet-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">Insights IA</p>
              <p className="text-[11px] text-slate-400">Análise inteligente</p>
            </div>
            <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-violet-400 transition-colors flex-shrink-0" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ---- Sub-components ---- */

function KpiCard({
  icon: Icon,
  label,
  value,
  iconBg,
  iconColor,
  href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  iconBg: string;
  iconColor: string;
  href?: string;
}) {
  const content = (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-4 ${href ? 'hover:border-sky-200 hover:shadow transition-all cursor-pointer' : ''}`}>
      <div className={`p-3 rounded-xl ${iconBg} flex-shrink-0`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuickStat({
  label,
  value,
  total,
  color,
  isPercent,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
  isPercent?: boolean;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-500">{label}</span>
        <span className="text-xs font-semibold text-slate-700">
          {isPercent ? `${pct.toFixed(1)}%` : `${value} / ${total}`}
        </span>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
    </div>
  );
}
