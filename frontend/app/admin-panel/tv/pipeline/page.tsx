'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import candidateService from '@/services/candidateService';
import { X, RefreshCw } from 'lucide-react';

const PIPELINE_STAGES = [
  { key: 'pending', label: 'Em Análise', color: '#f59e0b' },
  { key: 'awaiting_review', label: 'Ag. Revisão', color: '#3b82f6' },
  { key: 'changes_requested', label: 'Ag. Candidato', color: '#f97316' },
  { key: 'rejected', label: 'Reprovado', color: '#ef4444' },
  { key: 'approved', label: 'Aprovado', color: '#22c55e' },
  { key: 'documents_pending', label: 'Docs. Pendentes', color: '#8b5cf6' },
  { key: 'in_selection_process', label: 'Em Proc. Seletivo', color: '#06b6d4' },
  { key: 'documents_complete', label: 'Docs. Completos', color: '#14b8a6' },
  { key: 'admission_in_progress', label: 'Em Admissão', color: '#6366f1' },
  { key: 'admitted', label: 'Admitido', color: '#10b981' },
];

export default function TVPipelinePage() {
  const router = useRouter();
  const [dist, setDist] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [clock, setClock] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const stats = await candidateService.getDashboardStats();
      setDist(stats.distribution || {});
      setTotal(stats.total || 0);
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

  // Taxas de conversão
  const approved = (dist['documents_pending'] || 0) + (dist['documents_complete'] || 0) +
    (dist['in_selection_process'] || 0) + (dist['admission_in_progress'] || 0) + (dist['admitted'] || 0);
  const docsOk = (dist['documents_complete'] || 0) + (dist['in_selection_process'] || 0) +
    (dist['admission_in_progress'] || 0) + (dist['admitted'] || 0);
  const admitted = dist['admitted'] || 0;

  const convRate = (num: number, den: number) => den > 0 ? `${(num / den * 100).toFixed(0)}%` : '—';

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
          <span className="text-lg text-slate-300">Pipeline de Candidatos</span>
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

      <div className="p-8 space-y-8">
        {/* Total KPI */}
        <div className="text-center">
          <p className="text-6xl font-bold text-white">{total}</p>
          <p className="text-lg text-slate-400 mt-1">talentos cadastrados</p>
        </div>

        {/* Pipeline Funnel */}
        <div className="max-w-5xl mx-auto space-y-4">
          {PIPELINE_STAGES.map(stage => {
            const count = dist[stage.key] || 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={stage.key} className="flex items-center gap-4">
                <span className="text-sm font-medium text-slate-300 w-40 text-right">
                  {stage.label}
                </span>
                <div className="flex-1 h-10 bg-slate-800 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-1000"
                    style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%`, backgroundColor: stage.color }}
                  />
                  {count > 0 && (
                    <span className="absolute inset-y-0 left-3 flex items-center text-sm font-bold text-white drop-shadow">
                      {count}
                    </span>
                  )}
                </div>
                <span className="text-lg font-bold text-slate-200 w-20 text-right">
                  {pct.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Conversion Rates */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-center text-sm font-medium text-slate-500 uppercase tracking-wider mb-4">
            Taxas de Conversão
          </h3>
          <div className="grid grid-cols-3 gap-6">
            <ConversionCard
              label="Cadastro → Aprovação"
              rate={convRate(approved, total)}
              from={total}
              to={approved}
            />
            <ConversionCard
              label="Aprovação → Docs. OK"
              rate={convRate(docsOk, approved)}
              from={approved}
              to={docsOk}
            />
            <ConversionCard
              label="Docs. OK → Admissão"
              rate={convRate(admitted, docsOk)}
              from={docsOk}
              to={admitted}
            />
          </div>
        </div>
      </div>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 right-8 text-xs text-slate-600">
        Atualização automática a cada 60s
      </div>
    </div>
  );
}

function ConversionCard({ label, rate, from, to }: { label: string; rate: string; from: number; to: number }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 text-center">
      <p className="text-3xl font-bold text-sky-400">{rate}</p>
      <p className="text-xs text-slate-400 mt-2">{label}</p>
      <p className="text-xs text-slate-500 mt-1">{from} → {to}</p>
    </div>
  );
}
