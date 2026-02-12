'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import candidateService from '@/services/candidateService';
import adminApplicationService from '@/services/adminApplicationService';
import selectionProcessService from '@/services/selectionProcessService';
import { adminJobService } from '@/services/adminJobService';
import { SelectionProcess, Job } from '@/types';
import { X, RefreshCw } from 'lucide-react';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from 'recharts';

const PIPELINE_COLORS: Record<string, string> = {
  pending: '#f59e0b', awaiting_review: '#3b82f6', changes_requested: '#f97316',
  rejected: '#ef4444', approved: '#22c55e', documents_pending: '#8b5cf6',
  in_selection_process: '#06b6d4', documents_complete: '#14b8a6',
  admission_in_progress: '#6366f1', admitted: '#10b981',
};

const PIPELINE_LABELS: Record<string, string> = {
  pending: 'Em Análise', awaiting_review: 'Ag. Revisão', changes_requested: 'Ag. Candidato',
  rejected: 'Reprovado', approved: 'Aprovado', documents_pending: 'Docs. Pend.',
  in_selection_process: 'Em Proc. Sel.', documents_complete: 'Docs. Compl.',
  admission_in_progress: 'Em Admissão', admitted: 'Admitido',
};

const APP_LABELS: Record<string, string> = {
  submitted: 'Enviada', in_process: 'Em Processo', interview_scheduled: 'Entrevista',
  approved: 'Aprovada', rejected: 'Rejeitada', withdrawn: 'Retirada',
};

const APP_COLORS: Record<string, string> = {
  submitted: '#6366f1', in_process: '#f59e0b', interview_scheduled: '#8b5cf6',
  approved: '#10b981', rejected: '#ef4444', withdrawn: '#94a3b8',
};

interface AppStats {
  total_applications: number;
  submitted: number;
  in_process: number;
  interview_scheduled: number;
  approved: number;
  rejected: number;
  withdrawn: number;
}

export default function TVOverviewPage() {
  const router = useRouter();
  const [dist, setDist] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [appStats, setAppStats] = useState<AppStats | null>(null);
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [clock, setClock] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsRes, appRes, procRes, jobsRes] = await Promise.all([
        candidateService.getDashboardStats(),
        adminApplicationService.getStatistics(),
        selectionProcessService.getProcesses(),
        adminJobService.getJobs(),
      ]);
      setDist(statsRes.distribution || {});
      setTotal(statsRes.total || 0);
      setAppStats(appRes);
      const procList = Array.isArray(procRes) ? procRes : procRes.results || [];
      setProcesses(procList);
      setJobs(Array.isArray(jobsRes) ? jobsRes : []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  const activeProcesses = processes.filter(p => p.status === 'active');
  const activeJobs = jobs.filter(j => j.is_active).length;

  // Pipeline pie data
  const pipelinePie = Object.entries(dist)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({ name: PIPELINE_LABELS[k] || k, value: v, color: PIPELINE_COLORS[k] || '#64748b' }));

  // App pie data
  const appPie = appStats
    ? Object.entries(APP_LABELS)
        .map(([key, label]) => ({ name: label, value: (appStats as Record<string, number>)[key] || 0, color: APP_COLORS[key] }))
        .filter(d => d.value > 0)
    : [];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex items-center justify-center">
        <div className="h-10 w-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-sky-400">Banco de Talentos</span>
          <span className="text-slate-400">—</span>
          <span className="text-lg text-slate-300">Visão Geral</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-mono text-slate-400">{clock}</span>
          <button onClick={fetchData} className="p-2 text-slate-400 hover:text-white transition-colors">
            <RefreshCw className="h-5 w-5" />
          </button>
          <button onClick={() => router.push('/admin-panel')} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <KpiTV label="Total Talentos" value={total} color="text-sky-400" />
          <KpiTV label="Ag. Revisão" value={dist['awaiting_review'] || 0} color="text-blue-400" />
          <KpiTV label="Em Proc. Seletivo" value={dist['in_selection_process'] || 0} color="text-cyan-400" />
          <KpiTV label="Admitidos" value={dist['admitted'] || 0} color="text-emerald-400" />
          <KpiTV label="Vagas Ativas" value={activeJobs} color="text-violet-400" />
          <KpiTV label="Candidaturas" value={appStats?.total_applications || 0} color="text-amber-400" />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pipeline Donut */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Pipeline de Talentos</h3>
            {pipelinePie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pipelinePie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                      {pipelinePie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {pipelinePie.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">Sem dados</div>
            )}
          </div>

          {/* Applications Donut */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-2">Candidaturas</h3>
            {appPie.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={appPie} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                      {appPie.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {appPie.map(d => (
                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
                      {d.name} ({d.value})
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">Sem dados</div>
            )}
          </div>
        </div>

        {/* Active Processes */}
        {activeProcesses.length > 0 && (
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
            <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3">
              Processos Seletivos Ativos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeProcesses.slice(0, 6).map(proc => (
                <div key={proc.id} className="bg-slate-700/30 rounded-lg p-4">
                  <p className="text-sm font-medium text-white truncate">{proc.title}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {proc.candidates_count ?? 0} candidato(s)
                    {proc.candidates_approved ? ` — ${proc.candidates_approved} aprovado(s)` : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-4 right-8 text-xs text-slate-600">
        Atualização automática a cada 60s
      </div>
    </div>
  );
}

function KpiTV({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 text-center">
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-slate-400 mt-1">{label}</p>
    </div>
  );
}
