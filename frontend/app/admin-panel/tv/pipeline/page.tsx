'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import candidateService from '@/services/candidateService';
import { CandidateProfile } from '@/types';
import { X, RefreshCw, Users, TrendingUp, ArrowRight } from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'pending', label: 'Em Análise', color: '#f59e0b', bg: 'bg-amber-500', bgLight: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { key: 'awaiting_review', label: 'Ag. Revisão', color: '#3b82f6', bg: 'bg-blue-500', bgLight: 'bg-blue-500/10', border: 'border-blue-500/30' },
  { key: 'approved', label: 'Aprovado', color: '#22c55e', bg: 'bg-green-500', bgLight: 'bg-green-500/10', border: 'border-green-500/30' },
  { key: 'documents_pending', label: 'Docs. Pendentes', color: '#8b5cf6', bg: 'bg-violet-500', bgLight: 'bg-violet-500/10', border: 'border-violet-500/30' },
  { key: 'in_selection_process', label: 'Proc. Seletivo', color: '#06b6d4', bg: 'bg-cyan-500', bgLight: 'bg-cyan-500/10', border: 'border-cyan-500/30' },
  { key: 'documents_complete', label: 'Docs. Completos', color: '#14b8a6', bg: 'bg-teal-500', bgLight: 'bg-teal-500/10', border: 'border-teal-500/30' },
  { key: 'admission_in_progress', label: 'Em Admissão', color: '#6366f1', bg: 'bg-indigo-500', bgLight: 'bg-indigo-500/10', border: 'border-indigo-500/30' },
  { key: 'admitted', label: 'Admitido', color: '#10b981', bg: 'bg-emerald-500', bgLight: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { key: 'changes_requested', label: 'Ag. Candidato', color: '#f97316', bg: 'bg-orange-500', bgLight: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { key: 'rejected', label: 'Reprovado', color: '#ef4444', bg: 'bg-red-500', bgLight: 'bg-red-500/10', border: 'border-red-500/30' },
];

function getInitials(name?: string) {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

export default function TVPipelinePage() {
  const router = useRouter();
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [dist, setDist] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [clock, setClock] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [stats, candidatesData] = await Promise.all([
        candidateService.getDashboardStats(),
        candidateService.getAllCandidates({ page: 1 }),
      ]);
      setDist(stats.distribution || {});
      setTotal(stats.total || 0);

      // Fetch additional pages if needed
      let allCandidates = candidatesData.results || [];
      let nextPage = candidatesData.next;
      let page = 2;
      while (nextPage && page <= 10) {
        const moreData = await candidateService.getAllCandidates({ page });
        allCandidates = [...allCandidates, ...(moreData.results || [])];
        nextPage = moreData.next;
        page++;
      }
      setCandidates(allCandidates);
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
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  // Group candidates by pipeline_status
  const groupedCandidates: Record<string, CandidateProfile[]> = {};
  for (const stage of PIPELINE_STAGES) {
    groupedCandidates[stage.key] = candidates.filter(
      (c) => (c.pipeline_status || c.profile_status || 'pending') === stage.key
    );
  }

  // Conversion rates
  const approved =
    (dist['approved'] || 0) +
    (dist['documents_pending'] || 0) +
    (dist['documents_complete'] || 0) +
    (dist['in_selection_process'] || 0) +
    (dist['admission_in_progress'] || 0) +
    (dist['admitted'] || 0);
  const docsOk =
    (dist['documents_complete'] || 0) +
    (dist['in_selection_process'] || 0) +
    (dist['admission_in_progress'] || 0) +
    (dist['admitted'] || 0);
  const admitted = dist['admitted'] || 0;
  const convRate = (num: number, den: number) =>
    den > 0 ? `${((num / den) * 100).toFixed(0)}%` : '—';

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-slate-400 text-sm">Carregando pipeline...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-slate-950/80 backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-4">
          <Image src="/img/tesserato.png" width={28} height={28} alt="Tesserato" />
          <div>
            <span className="text-base font-bold text-white quicksand">Pipeline de Candidatos</span>
            <span className="text-slate-500 text-xs ml-3">Banco de Talentos</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* KPIs inline */}
          <div className="hidden md:flex items-center gap-6 mr-6">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-lg font-bold text-white">{total}</span>
              <span className="text-xs text-slate-500">talentos</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              <span>{convRate(approved, total)} aprovação</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
              <span>{convRate(admitted, docsOk)} admissão</span>
            </div>
          </div>
          <span className="text-lg font-mono text-slate-500">{clock}</span>
          <button
            onClick={fetchData}
            className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={() => router.push('/admin-panel')}
            className="p-2 text-slate-500 hover:text-white transition-colors rounded-lg hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        <div className="flex gap-3 h-full min-w-max">
          {PIPELINE_STAGES.map((stage) => {
            const count = dist[stage.key] || 0;
            const stageCandidates = groupedCandidates[stage.key] || [];

            return (
              <div
                key={stage.key}
                className="w-56 flex-shrink-0 flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-2xl overflow-hidden"
              >
                {/* Column Header */}
                <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-xs font-semibold text-slate-200 truncate">
                        {stage.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.bgLight} ${stage.border} border`}
                      style={{ color: stage.color }}
                    >
                      {count}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${total > 0 ? Math.max((count / total) * 100, count > 0 ? 3 : 0) : 0}%`,
                        backgroundColor: stage.color,
                      }}
                    />
                  </div>
                </div>

                {/* Candidate Cards */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-hide">
                  {stageCandidates.length > 0 ? (
                    stageCandidates.map((candidate) => (
                      <div
                        key={candidate.id}
                        className="bg-white/[0.04] border border-white/[0.06] rounded-xl p-3 hover:bg-white/[0.07] transition-all duration-200 cursor-default group"
                      >
                        <div className="flex items-center gap-2.5">
                          {/* Avatar */}
                          {candidate.image_profile ? (
                            <Image
                              src={candidate.image_profile}
                              width={32}
                              height={32}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white"
                              style={{
                                backgroundColor: stage.color + '30',
                                color: stage.color,
                              }}
                            >
                              {getInitials(candidate.user_name)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-slate-200 truncate">
                              {candidate.user_name || 'Sem nome'}
                            </div>
                            <div className="text-[10px] text-slate-500 truncate">
                              {candidate.current_position || candidate.current_company || '—'}
                            </div>
                          </div>
                        </div>
                        {/* Extra info on hover */}
                        {(candidate.city || candidate.experience_years) && (
                          <div className="mt-2 pt-2 border-t border-white/5 flex items-center gap-2 flex-wrap">
                            {candidate.city && (
                              <span className="text-[9px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                                {candidate.city}
                                {candidate.state ? ` - ${candidate.state}` : ''}
                              </span>
                            )}
                            {candidate.experience_years !== undefined && candidate.experience_years > 0 && (
                              <span className="text-[9px] text-slate-500 bg-white/5 px-1.5 py-0.5 rounded">
                                {candidate.experience_years}a exp.
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-20 text-slate-600 text-[10px]">
                      Nenhum candidato
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Bar - Conversion Funnel */}
      <div className="flex-shrink-0 px-6 py-3 border-t border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Atualização automática a cada 60s
          </div>
          <div className="flex items-center gap-6">
            <ConversionBadge
              label="Cadastro → Aprovação"
              rate={convRate(approved, total)}
              color="text-green-400"
            />
            <ConversionBadge
              label="Aprovação → Docs. OK"
              rate={convRate(docsOk, approved)}
              color="text-cyan-400"
            />
            <ConversionBadge
              label="Docs. OK → Admissão"
              rate={convRate(admitted, docsOk)}
              color="text-indigo-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function ConversionBadge({
  label,
  rate,
  color,
}: {
  label: string;
  rate: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-slate-500">{label}</span>
      <span className={`text-sm font-bold ${color}`}>{rate}</span>
    </div>
  );
}
