'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, Search, Trash2, Layers, FileText, Copy, ChevronDown, ChevronUp
} from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import { ProcessTemplate } from '@/types';

export default function ModelosPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Expanded template detail
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<ProcessTemplate | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Delete confirm
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Expanded stages (show/hide questions per stage)
  const [expandedStageIds, setExpandedStageIds] = useState<Set<number>>(new Set());

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await selectionProcessService.getTemplates(searchTerm || undefined);
      setTemplates(data);
    } catch {
      setError('Erro ao carregar modelos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleExpand = async (id: number) => {
    if (expandedId === id) {
      setExpandedId(null);
      setExpandedTemplate(null);
      return;
    }
    setExpandedId(id);
    setLoadingDetail(true);
    try {
      const detail = await selectionProcessService.getTemplateById(id);
      setExpandedTemplate(detail);
    } catch {
      setExpandedTemplate(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await selectionProcessService.deleteTemplate(deleteId);
      setDeleteId(null);
      fetchTemplates();
    } catch {
      toast.error('Erro ao excluir modelo.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    try {
      await selectionProcessService.createTemplate({
        name: newName.trim(),
        description: newDescription.trim()
      });
      setShowCreateModal(false);
      setNewName('');
      setNewDescription('');
      fetchTemplates();
    } catch {
      toast.error('Erro ao criar modelo.');
    } finally {
      setCreating(false);
    }
  };

  const handleUseTemplate = (templateId: number) => {
    router.push(`/admin-panel/processos-seletivos/novo?template=${templateId}`);
  };

  const toggleStageQuestions = (stageId: number) => {
    setExpandedStageIds(prev => {
      const next = new Set(prev);
      if (next.has(stageId)) {
        next.delete(stageId);
      } else {
        next.add(stageId);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link
              href="/admin-panel/processos-seletivos"
              className="p-2 rounded-lg bg-white hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Modelos de Processo</h1>
              <p className="text-slate-500 text-sm mt-1">
                Modelos reutilizáveis com etapas e perguntas pré-configuradas
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Novo Modelo
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar modelos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400" />
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600">{error}</p>
            <button onClick={fetchTemplates} className="mt-4 text-sky-600 hover:underline text-sm">
              Tentar novamente
            </button>
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-xl border border-slate-200">
            <FileText className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhum modelo encontrado</h3>
            <p className="text-slate-400 text-sm mb-6">
              Crie um modelo vazio ou salve um processo existente como modelo.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Criar Modelo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <div
                key={template.id}
                className="bg-white border border-slate-200 rounded-xl overflow-hidden"
              >
                {/* Template row */}
                <div className="p-4 flex items-center justify-between">
                  <button
                    onClick={() => handleExpand(template.id)}
                    className="flex items-center gap-3 flex-1 min-w-0 text-left"
                  >
                    <div className="p-2 bg-sky-50 rounded-lg flex-shrink-0">
                      <Layers className="w-5 h-5 text-sky-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-900 truncate">{template.name}</h3>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        {template.description && (
                          <span className="truncate max-w-xs">{template.description}</span>
                        )}
                        <span>{template.stages_count || 0} etapas</span>
                      </div>
                    </div>
                    {expandedId === template.id ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    )}
                  </button>

                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => handleUseTemplate(template.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      Usar Modelo
                    </button>
                    <button
                      onClick={() => setDeleteId(template.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Excluir modelo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded detail */}
                {expandedId === template.id && (
                  <div className="border-t border-slate-200 bg-white/50 px-4 py-4">
                    {loadingDetail ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-400" />
                      </div>
                    ) : expandedTemplate?.stages && expandedTemplate.stages.length > 0 ? (
                      <div className="space-y-3">
                        <h4 className="text-xs font-medium text-slate-500 uppercase tracking-wider">Etapas do Modelo</h4>
                        {expandedTemplate.stages.map((stage) => {
                          const stageExpanded = expandedStageIds.has(stage.id);
                          const questionsCount = stage.questions?.length || stage.questions_count || 0;

                          return (
                            <div key={stage.id} className="bg-slate-50 rounded-lg overflow-hidden">
                              {/* Stage header - clickable to toggle questions */}
                              <button
                                onClick={() => questionsCount > 0 && toggleStageQuestions(stage.id)}
                                className={`w-full p-3 flex items-center justify-between text-left ${
                                  questionsCount > 0 ? 'hover:bg-slate-50/80 cursor-pointer' : 'cursor-default'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-sm font-medium text-slate-900 flex-shrink-0">
                                    {stage.order}. {stage.name}
                                  </span>
                                  {stage.description && (
                                    <span className="text-xs text-slate-500 truncate hidden sm:inline">
                                      — {stage.description}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 flex-shrink-0 ml-2">
                                  {stage.is_eliminatory && (
                                    <span className="px-2 py-0.5 bg-red-50/30 text-red-600 rounded">Eliminatória</span>
                                  )}
                                  <span>{questionsCount} perguntas</span>
                                  {questionsCount > 0 && (
                                    stageExpanded
                                      ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                      : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                  )}
                                </div>
                              </button>

                              {/* Questions detail - collapsible */}
                              {stageExpanded && stage.questions && stage.questions.length > 0 && (
                                <div className="border-t border-slate-200 px-3 pb-3 pt-2 space-y-2.5">
                                  {stage.questions.map((q, idx) => (
                                    <div key={q.id} className="bg-white/60 rounded-lg p-2.5">
                                      <div className="flex items-start gap-2">
                                        <span className="text-xs text-slate-500 font-medium flex-shrink-0 mt-0.5">
                                          {idx + 1}.
                                        </span>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs text-slate-600">{q.question_text}</p>
                                          <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                                              {q.question_type === 'multiple_choice' ? 'Múltipla Escolha' : 'Texto Aberto'}
                                            </span>
                                            {q.is_required && (
                                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                                                Obrigatória
                                              </span>
                                            )}
                                          </div>
                                          {q.question_type === 'multiple_choice' && q.options && q.options.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                              {q.options.map((opt, optIdx) => (
                                                <span
                                                  key={optIdx}
                                                  className="text-[11px] px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200"
                                                >
                                                  {opt}
                                                </span>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400 text-center py-2">
                        Este modelo não possui etapas. Use &quot;Salvar como Modelo&quot; em um processo existente para incluir etapas.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-bold mb-4">Novo Modelo</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1">Nome *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex.: Processo Padrão, Técnicos, Desenvolvedores..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400"
                  required
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1">Descrição</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descrição opcional do modelo..."
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-400 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setNewName(''); setNewDescription(''); }}
                  className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={creating || !newName.trim()}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
                >
                  {creating ? 'Criando...' : 'Criar Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-sm mx-4 p-6">
            <h2 className="text-lg font-bold mb-2">Excluir Modelo</h2>
            <p className="text-sm text-slate-500 mb-6">
              Tem certeza que deseja excluir este modelo? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 rounded-lg text-sm font-medium transition-colors"
              >
                {deleting ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
