'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import candidateService from '@/services/candidateService';
import { AIInsightsResponse } from '@/types';
import { X, RefreshCw, CheckCircle, AlertTriangle, AlertCircle, Lightbulb, Target, TrendingDown, FileDown } from 'lucide-react';

export default function TVInsightsPage() {
  const router = useRouter();
  const [insights, setInsights] = useState<AIInsightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clock, setClock] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await candidateService.getAIInsights();
      setInsights(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar insights';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes for AI (to avoid excessive API calls)
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }));
    tick();
    const interval = setInterval(tick, 30000);
    return () => clearInterval(interval);
  }, []);

  const generatePDF = async () => {
    if (!insights) return;
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(14, 165, 233); // sky-500
    doc.text('Banco de Talentos', margin, y);
    y += 8;
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text('Relatório de Insights — Inteligência Artificial', margin, y);
    y += 7;

    // Date
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Gerado em ${dateStr} às ${timeStr}`, margin, y);
    if (insights.generated_at) {
      const aiDate = new Date(insights.generated_at);
      doc.text(`Análise da IA: ${aiDate.toLocaleString('pt-BR')}`, margin, y + 5);
      y += 5;
    }
    y += 10;

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Summary
    doc.setFontSize(13);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text('Resumo Geral', margin, y);
    y += 7;
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105); // slate-600
    const summaryLines = doc.splitTextToSize(insights.summary, contentWidth);
    doc.text(summaryLines, margin, y);
    y += summaryLines.length * 5 + 8;

    // Highlights
    if (insights.highlights && insights.highlights.length > 0) {
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('Destaques', margin, y);
      y += 7;

      const highlightTypeLabel = (t: string) =>
        t === 'positive' ? '✓ Positivo' : t === 'warning' ? '⚠ Atenção' : t === 'critical' ? '✕ Crítico' : '• Info';

      const highlightRows = insights.highlights.map(h => [
        highlightTypeLabel(h.type),
        h.title,
        h.description,
      ]);

      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Tipo', 'Título', 'Descrição']],
        body: highlightRows,
        styles: { fontSize: 9, cellPadding: 3, textColor: [51, 65, 85] },
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
        columnStyles: {
          0: { cellWidth: 25 },
          1: { cellWidth: 40 },
          2: { cellWidth: contentWidth - 65 },
        },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // Bottleneck
    if (insights.bottleneck) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('Gargalo Principal', margin, y);
      y += 7;
      doc.setFontSize(10);
      doc.setTextColor(185, 28, 28); // red-700
      const bottleneckLines = doc.splitTextToSize(insights.bottleneck, contentWidth);
      doc.text(bottleneckLines, margin, y);
      y += bottleneckLines.length * 5 + 8;
    }

    // Conversion Rates
    if (insights.data?.conversion) {
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('Taxas de Conversão', margin, y);
      y += 7;

      const conv = insights.data.conversion;
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Etapa', 'Taxa']],
        body: [
          ['Cadastro → Aprovação', `${conv.cadastro_to_aprovado}%`],
          ['Aprovação → Docs OK', `${conv.aprovado_to_docs_ok}%`],
          ['Docs OK → Admissão', `${conv.docs_ok_to_admitido}%`],
        ],
        styles: { fontSize: 10, cellPadding: 4, textColor: [51, 65, 85] },
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 30, halign: 'center' } },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // Recommendations
    if (insights.recommendations && insights.recommendations.length > 0) {
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('Recomendações da IA', margin, y);
      y += 7;

      const recRows = insights.recommendations.map((rec, i) => [`${i + 1}`, rec]);
      autoTable(doc, {
        startY: y,
        margin: { left: margin, right: margin },
        head: [['#', 'Recomendação']],
        body: recRows,
        styles: { fontSize: 9, cellPadding: 4, textColor: [51, 65, 85] },
        headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
        columnStyles: { 0: { cellWidth: 10, halign: 'center' }, 1: { cellWidth: contentWidth - 10 } },
      });
      y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
    }

    // Pipeline Distribution
    if (insights.data?.distribution) {
      if (y > 230) { doc.addPage(); y = 20; }
      doc.setFontSize(13);
      doc.setTextColor(30, 41, 59);
      doc.text('Distribuição do Pipeline', margin, y);
      y += 7;

      const statusLabels: Record<string, string> = {
        pending: 'Em Análise', awaiting_review: 'Ag. Revisão', approved: 'Aprovado',
        rejected: 'Reprovado', changes_requested: 'Ag. Candidato',
        documents_pending: 'Docs. Pendentes', in_selection_process: 'Em Proc. Seletivo',
        documents_complete: 'Docs. Completos', admission_in_progress: 'Em Admissão',
        admitted: 'Admitido',
      };

      const distRows = Object.entries(insights.data.distribution)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => [statusLabels[k] || k, String(v)]);

      if (distRows.length > 0) {
        distRows.push(['Total', String(insights.data.total)]);
        autoTable(doc, {
          startY: y,
          margin: { left: margin, right: margin },
          head: [['Status', 'Quantidade']],
          body: distRows,
          styles: { fontSize: 10, cellPadding: 3, textColor: [51, 65, 85] },
          headStyles: { fillColor: [14, 165, 233], textColor: 255, fontStyle: 'bold' },
          columnStyles: { 0: { cellWidth: 80 }, 1: { cellWidth: 30, halign: 'center' } },
        });
      }
    }

    // Footer on every page
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `Banco de Talentos — Relatório de Insights IA — ${dateStr}`,
        margin,
        doc.internal.pageSize.getHeight() - 10
      );
      doc.text(
        `Página ${i} de ${totalPages}`,
        pageWidth - margin - 25,
        doc.internal.pageSize.getHeight() - 10
      );
    }

    const filename = `insights-ia-${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
  };

  const getHighlightIcon = (type: string) => {
    switch (type) {
      case 'positive': return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-amber-400" />;
      case 'critical': return <AlertCircle className="h-5 w-5 text-red-400" />;
      default: return <Lightbulb className="h-5 w-5 text-sky-400" />;
    }
  };

  const getHighlightBorder = (type: string) => {
    switch (type) {
      case 'positive': return 'border-emerald-500/30';
      case 'warning': return 'border-amber-500/30';
      case 'critical': return 'border-red-500/30';
      default: return 'border-slate-700/50';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900 text-white overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-700/50">
        <div className="flex items-center gap-4">
          <span className="text-xl font-bold text-sky-400">Banco de Talentos</span>
          <span className="text-slate-400">—</span>
          <span className="text-lg text-slate-300">Insights IA</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-2xl font-mono text-slate-400">{clock}</span>
          {insights && (
            <button onClick={generatePDF} className="p-2 text-slate-400 hover:text-white transition-colors" title="Gerar Relatório PDF">
              <FileDown className="h-5 w-5" />
            </button>
          )}
          <button onClick={fetchData} className="p-2 text-slate-400 hover:text-white transition-colors" title="Atualizar Insights">
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => router.push('/admin-panel')} className="p-2 text-slate-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading && !insights ? (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <div className="h-12 w-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Gerando insights com IA...</p>
        </div>
      ) : error && !insights ? (
        <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
          <AlertCircle className="h-12 w-12 text-red-400" />
          <p className="text-slate-400">{error}</p>
          <p className="text-xs text-slate-500">Verifique se a OPENAI_API_KEY está configurada no .env</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm transition-colors">
            Tentar Novamente
          </button>
        </div>
      ) : insights ? (
        <div className="p-8 space-y-8">
          {/* AI Summary */}
          <div className="bg-slate-800/50 border border-sky-500/20 rounded-xl p-6 text-center">
            <p className="text-xl text-slate-200 leading-relaxed">{insights.summary}</p>
            {insights.generated_at && (
              <p className="text-xs text-slate-500 mt-3">
                Gerado em {new Date(insights.generated_at).toLocaleString('pt-BR')}
              </p>
            )}
          </div>

          {/* Highlights + Bottleneck */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Highlights */}
            <div className="lg:col-span-2 space-y-3">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Destaques
              </h3>
              {insights.highlights?.map((h, i) => (
                <div key={i} className={`bg-slate-800/50 border ${getHighlightBorder(h.type)} rounded-xl p-4 flex items-start gap-3`}>
                  <div className="flex-shrink-0 mt-0.5">{getHighlightIcon(h.type)}</div>
                  <div>
                    <p className="text-sm font-medium text-white">{h.title}</p>
                    <p className="text-xs text-slate-400 mt-1">{h.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottleneck */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <TrendingDown className="h-4 w-4" /> Gargalo Principal
              </h3>
              <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-5">
                <Target className="h-8 w-8 text-red-400 mb-3" />
                <p className="text-sm text-slate-200">{insights.bottleneck}</p>
              </div>

              {/* Conversion Rates */}
              {insights.data?.conversion && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 space-y-3">
                  <h4 className="text-xs font-medium text-slate-500 uppercase">Conversão</h4>
                  <ConversionBar label="Cadastro → Aprovação" value={insights.data.conversion.cadastro_to_aprovado} />
                  <ConversionBar label="Aprovação → Docs OK" value={insights.data.conversion.aprovado_to_docs_ok} />
                  <ConversionBar label="Docs OK → Admissão" value={insights.data.conversion.docs_ok_to_admitido} />
                </div>
              )}
            </div>
          </div>

          {/* Recommendations */}
          {insights.recommendations && insights.recommendations.length > 0 && (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-400" /> Recomendações da IA
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {insights.recommendations.map((rec, i) => (
                  <div key={i} className="bg-slate-700/30 rounded-lg p-4 flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-sky-600 text-white text-xs font-bold rounded-full">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-300">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      <div className="fixed bottom-4 right-8 text-xs text-slate-600">
        Atualização automática a cada 5min
      </div>
    </div>
  );
}

function ConversionBar({ label, value }: { label: string; value: number }) {
  const color = value >= 70 ? 'bg-emerald-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs font-bold text-slate-300">{value}%</span>
      </div>
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(value, 100)}%` }} />
      </div>
    </div>
  );
}
