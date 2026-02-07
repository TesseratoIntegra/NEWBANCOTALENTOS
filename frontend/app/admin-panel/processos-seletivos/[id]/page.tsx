'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
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
      alert('Erro ao atualizar status do processo.');
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
      alert('Modelo salvo com sucesso!');
    } catch {
      alert('Erro ao salvar como modelo.');
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !process) {
    return (
      <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
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
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white">{process.title}</h1>
              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                {statusInfo.label}
              </span>
            </div>
            {process.job_title && (
              <p className="text-zinc-400 mt-1">Vaga: {process.job_title}</p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {process.status === 'draft' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <Play className="h-4 w-4" />
              Ativar
            </button>
          )}
          {process.status === 'active' && (
            <button
              onClick={() => handleStatusChange('paused')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
            >
              <Pause className="h-4 w-4" />
              Pausar
            </button>
          )}
          {process.status === 'paused' && (
            <button
              onClick={() => handleStatusChange('active')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
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
          <button
            onClick={() => { setTemplateName(process?.title || ''); setShowSaveTemplateModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <BookmarkPlus className="h-4 w-4" />
            Salvar como Modelo
          </button>
          <Link
            href={`/admin-panel/processos-seletivos/${processId}/editar`}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-colors"
          >
            <Edit className="h-4 w-4" />
            Editar
          </Link>
        </div>
      </div>

      {/* Description */}
      {process.description && (
        <div className="bg-zinc-800 rounded-lg p-4">
          <p className="text-zinc-300">{process.description}</p>
        </div>
      )}

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/50 rounded-lg">
                <Users className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{statistics.total_candidates}</p>
                <p className="text-sm text-zinc-400">Total Candidatos</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-900/50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{statistics.candidates_by_status.approved}</p>
                <p className="text-sm text-zinc-400">Aprovados</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-900/50 rounded-lg">
                <XCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{statistics.candidates_by_status.rejected}</p>
                <p className="text-sm text-zinc-400">Reprovados</p>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-900/50 rounded-lg">
                <BarChart3 className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{statistics.completion_rate.toFixed(0)}%</p>
                <p className="text-sm text-zinc-400">Taxa de Aprovação</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stages & Candidates Quick Access */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stages Section */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-white">Etapas do Processo</h2>
            </div>
            <span className="text-zinc-400">{process.stages_count || 0} etapas</span>
          </div>

          {process.stages && process.stages.length > 0 ? (
            <div className="space-y-2 mb-4">
              {process.stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-indigo-600 text-white text-sm font-medium rounded-full">
                      {index + 1}
                    </span>
                    <span className="text-zinc-300">{stage.name}</span>
                  </div>
                  <span className="text-zinc-500 text-sm">
                    {stage.questions_count || 0} perguntas
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 mb-4">Nenhuma etapa criada ainda.</p>
          )}

          <Link
            href={`/admin-panel/processos-seletivos/${processId}/etapas`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Gerenciar Etapas
          </Link>
        </div>

        {/* Candidates Section */}
        <div className="bg-zinc-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-400" />
              <h2 className="text-lg font-semibold text-white">Candidatos</h2>
            </div>
            <span className="text-zinc-400">{process.candidates_count || 0} candidatos</span>
          </div>

          {statistics && statistics.candidates_by_stage.length > 0 ? (
            <div className="space-y-2 mb-4">
              {statistics.candidates_by_stage.map((stageInfo) => (
                <div
                  key={stageInfo.stage_id}
                  className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg"
                >
                  <span className="text-zinc-300">{stageInfo.stage_name}</span>
                  <span className="text-zinc-400">
                    {stageInfo.candidates_count} candidatos
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-zinc-400 mb-4">Nenhum candidato no processo ainda.</p>
          )}

          <Link
            href={`/admin-panel/processos-seletivos/${processId}/candidatos`}
            className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Users className="h-4 w-4" />
            Gerenciar Candidatos
          </Link>
        </div>
      </div>

      {/* Dates Info */}
      {(process.start_date || process.end_date) && (
        <div className="bg-zinc-800 rounded-lg p-4">
          <div className="flex flex-wrap gap-6 text-sm">
            {process.start_date && (
              <div>
                <span className="text-zinc-400">Data de Início: </span>
                <span className="text-zinc-300">
                  {new Date(process.start_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            {process.end_date && (
              <div>
                <span className="text-zinc-400">Data de Término: </span>
                <span className="text-zinc-300">
                  {new Date(process.end_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
            <div>
              <span className="text-zinc-400">Criado em: </span>
              <span className="text-zinc-300">
                {new Date(process.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Save as Template Modal */}
      {showSaveTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-zinc-800 border border-zinc-700 rounded-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Salvar como Modelo</h2>
            <p className="text-sm text-zinc-400 mb-4">
              As etapas e perguntas deste processo serão salvas como um modelo reutilizável.
            </p>
            <form onSubmit={handleSaveAsTemplate} className="space-y-4">
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Nome do Modelo *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Ex.: Processo Padrão, Técnicos..."
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-zinc-400 mb-1">Descrição</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="Descrição opcional..."
                  rows={3}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveTemplateModal(false)}
                  className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={savingTemplate || !templateName.trim()}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg text-sm font-medium text-white transition-colors"
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
