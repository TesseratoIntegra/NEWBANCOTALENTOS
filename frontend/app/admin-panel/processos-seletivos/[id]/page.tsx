'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Users, Layers, Play, Pause, CheckCircle, XCircle, Plus, BarChart3, BookmarkPlus } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import { SelectionProcess, ProcessStatistics } from '@/types';
import { useRouter } from 'next/navigation';

export default function ProcessoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const processId = parseInt(resolvedParams.id);
  const router = useRouter();

  const [process, setProcess] = useState<SelectionProcess | null>(null);
  const [statistics, setStatistics] = useState<ProcessStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Save as template modal
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [savingTemplate, setSavingTemplate] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [processData, statsData] = await Promise.all([
          selectionProcessService.getProcessById(processId),
          selectionProcessService.getProcessStatistics(processId)
        ]);
        setProcess(processData);
        setStatistics(statsData);
      } catch (err) {
        console.error('Erro ao buscar processo:', err);
        setError('Erro ao carregar processo seletivo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [processId]);

  const handleStatusChange = async (newStatus: 'active' | 'paused' | 'completed') => {
    if (!process) return;

    try {
      await selectionProcessService.updateProcess(processId, { status: newStatus });
      setProcess(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status do processo.');
    }
  };

  const handleSaveAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateName.trim()) return;
    setSavingTemplate(true);
    try {
      await selectionProcessService.saveProcessAsTemplate(processId, {
        name: templateName.trim(),
        description: templateDescription.trim()
      });
      setShowSaveTemplateModal(false);
      setTemplateName('');
      setTemplateDescription('');
      toast.success('Modelo salvo com sucesso!');
    } catch {
      toast.error('Erro ao salvar como modelo.');
    } finally {
      setSavingTemplate(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return selectionProcessService.getStatusLabel(status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="bg-red-50 border border-red-500 rounded-lg p-4 text-red-600">
        {error || 'Processo não encontrado.'}
      </div>
    );
  }

  const statusInfo = getStatusInfo(process.status);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/admin-panel/processos-seletivos"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{process.title}</h1>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                {statusInfo.label}
              </span>
            </div>
            {process.job_title && (
              <p className="text-slate-500 mt-1">Vaga: {process.job_title}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {process.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
              Ativar
            </button>
          )}
          {process.status === 'active' && (
            <button
              onClick={() => handleStatusChange('paused')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              <Pause className="h-4 w-4" />
              Pausar
            </button>
          )}
          {process.status === 'paused' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
              Retomar
            </button>
          )}
          {(process.status === 'active' || process.status === 'paused') && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Concluir
            </button>
          )}
          <Link
            href={`/admin-panel/processos-seletivos/${processId}/editar`}
            className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Link>
        </div>
      </div>

      {/* Description */}
      {process.description && (
        <div className="bg-white rounded-lg p-4">
          <p className="text-slate-600">{process.description}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-50 rounded-lg">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statistics.total_candidates}</p>
                <p className="text-sm text-slate-500">Total Candidatos</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statistics.candidates_by_status.approved}</p>
                <p className="text-sm text-slate-500">Aprovados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statistics.candidates_by_status.rejected}</p>
                <p className="text-sm text-slate-500">Reprovados</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-sky-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{statistics.completion_rate.toFixed(0)}%</p>
                <p className="text-sm text-slate-500">Taxa de Aprovação</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stages & Candidates Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stages Section */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-sky-600" />
              <h2 className="text-lg font-semibold text-slate-900">Etapas do Processo</h2>
            </div>
            <span className="text-slate-500">{process.stages_count || 0} etapas</span>
          </div>

          {process.stages && process.stages.length > 0 ? (
            <div className="space-y-2 mb-4">
              {process.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-sky-600 text-white text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                    <span className="text-slate-600">{stage.name}</span>
                  </div>
                  <span className="text-slate-400 text-sm">
                    {stage.questions_count || 0} perguntas
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 mb-4">Nenhuma etapa criada ainda.</p>
          )}

          <Link
            href={`/admin-panel/processos-seletivos/${processId}/etapas`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Gerenciar Etapas
          </Link>

          <button
            onClick={() => { setTemplateName(process?.title || ''); setShowSaveTemplateModal(true); }}
            className="flex items-center justify-center gap-1.5 w-full mt-2 px-3 py-1.5 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            <BookmarkPlus className="h-3.5 w-3.5" />
            Salvar etapas como modelo
          </button>
        </div>

        {/* Candidates Section */}
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-emerald-600" />
              <h2 className="text-lg font-semibold text-slate-900">Candidatos</h2>
            </div>
            <span className="text-slate-500">{process.candidates_count || 0} candidatos</span>
          </div>

          {statistics && statistics.candidates_by_stage.length > 0 ? (
            <div className="space-y-2 mb-4">
              {statistics.candidates_by_stage.map((stageInfo) => (
                <div
                  key={stageInfo.stage_id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <span className="text-slate-600">{stageInfo.stage_name}</span>
                  <span className="text-slate-500">
                    {stageInfo.candidates_count} candidatos
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-500 mb-4">Nenhum candidato no processo ainda.</p>
          )}

          <Link
            href={`/admin-panel/processos-seletivos/${processId}/candidatos`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            <Users className="h-4 w-4" />
            Gerenciar Candidatos
          </Link>
        </div>
      </div>

      {/* Dates Info */}
      {(process.start_date || process.end_date) && (
        <div className="bg-white rounded-lg p-4">
          <div className="flex flex-wrap gap-6 text-sm">
            {process.start_date && (
              <div>
                <span className="text-slate-500">Data de Início: </span>
                <span className="text-slate-600">
                  {new Date(process.start_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {process.end_date && (
              <div>
                <span className="text-slate-500">Data de Término: </span>
                <span className="text-slate-600">
                  {new Date(process.end_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            <div>
              <span className="text-slate-500">Criado em: </span>
              <span className="text-slate-600">
                {new Date(process.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Save as Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Salvar como Modelo</h2>
            <p className="text-sm text-slate-500 mb-4">
              As etapas e perguntas deste processo serão salvas como um modelo reutilizável.
            </p>
            <form onSubmit={handleSaveAsTemplate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Nome do Modelo *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex.: Processo Padrão, Técnicos..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Descrição</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Descrição opcional..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTemplate || !templateName.trim()}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
                >
                  {savingTemplate ? 'Salvando...' : 'Salvar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
