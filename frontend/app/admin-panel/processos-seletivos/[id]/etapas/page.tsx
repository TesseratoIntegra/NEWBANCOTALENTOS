'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit, ChevronDown, ChevronUp, GripVertical, Save, X } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import { SelectionProcess, ProcessStage, StageQuestion, CreateProcessStage, CreateStageQuestion } from '@/types';

export default function EtapasPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const processId = parseInt(resolvedParams.id);

  const [process, setProcess] = useState<SelectionProcess | null>(null);
  const [stages, setStages] = useState<ProcessStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Expanded stages for showing questions
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());

  // New stage form
  const [showNewStageForm, setShowNewStageForm] = useState(false);
  const [newStage, setNewStage] = useState<Partial<CreateProcessStage>>({ name: '', description: '', is_eliminatory: true });

  // Edit stage
  const [editingStage, setEditingStage] = useState<number | null>(null);
  const [editStageData, setEditStageData] = useState<Partial<CreateProcessStage>>({});

  // New question form
  const [showNewQuestionFor, setShowNewQuestionFor] = useState<number | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<CreateStageQuestion>>({
    question_text: '',
    question_type: 'open_text',
    options: [],
    is_required: true
  });
  const [newOptionText, setNewOptionText] = useState('');

  useEffect(() => {
    fetchData();
  }, [processId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [processData, stagesData] = await Promise.all([
        selectionProcessService.getProcessById(processId),
        selectionProcessService.getStages(processId)
      ]);
      setProcess(processData);
      setStages(stagesData);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar etapas.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStage = (stageId: number) => {
    setExpandedStages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stageId)) {
        newSet.delete(stageId);
      } else {
        newSet.add(stageId);
      }
      return newSet;
    });
  };

  const handleCreateStage = async () => {
    if (!newStage.name) return;

    try {
      const order = stages.length + 1;
      await selectionProcessService.createStage({
        process: processId,
        name: newStage.name,
        description: newStage.description || '',
        order,
        is_eliminatory: newStage.is_eliminatory ?? true
      });
      setNewStage({ name: '', description: '', is_eliminatory: true });
      setShowNewStageForm(false);
      fetchData();
    } catch (err) {
      console.error('Erro ao criar etapa:', err);
      alert('Erro ao criar etapa. Verifique se o limite de 8 etapas não foi atingido.');
    }
  };

  const handleUpdateStage = async (stageId: number) => {
    try {
      await selectionProcessService.updateStage(stageId, editStageData);
      setEditingStage(null);
      setEditStageData({});
      fetchData();
    } catch (err) {
      console.error('Erro ao atualizar etapa:', err);
      alert('Erro ao atualizar etapa.');
    }
  };

  const handleDeleteStage = async (stageId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta etapa?')) return;

    try {
      await selectionProcessService.deleteStage(stageId);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir etapa:', err);
      alert('Erro ao excluir etapa.');
    }
  };

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    setNewQuestion(prev => ({
      ...prev,
      options: [...(prev.options || []), newOptionText.trim()]
    }));
    setNewOptionText('');
  };

  const handleRemoveOption = (index: number) => {
    setNewQuestion(prev => ({
      ...prev,
      options: (prev.options || []).filter((_, i) => i !== index)
    }));
  };

  const handleCreateQuestion = async (stageId: number) => {
    if (!newQuestion.question_text) return;

    try {
      const questions = stages.find(s => s.id === stageId)?.questions || [];
      await selectionProcessService.createQuestion({
        stage: stageId,
        question_text: newQuestion.question_text,
        question_type: newQuestion.question_type || 'open_text',
        options: newQuestion.question_type === 'multiple_choice' ? newQuestion.options : undefined,
        order: questions.length + 1,
        is_required: newQuestion.is_required ?? true
      });
      setNewQuestion({ question_text: '', question_type: 'open_text', options: [], is_required: true });
      setShowNewQuestionFor(null);
      fetchData();
    } catch (err) {
      console.error('Erro ao criar pergunta:', err);
      alert('Erro ao criar pergunta.');
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) return;

    try {
      await selectionProcessService.deleteQuestion(questionId);
      fetchData();
    } catch (err) {
      console.error('Erro ao excluir pergunta:', err);
      alert('Erro ao excluir pergunta.');
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link
            href={`/admin-panel/processos-seletivos/${processId}`}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Etapas do Processo</h1>
            <p className="text-zinc-400">{process.title}</p>
          </div>
        </div>
        {stages.length < 8 && (
          <button
            onClick={() => setShowNewStageForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Nova Etapa
          </button>
        )}
      </div>

      {/* New Stage Form */}
      {showNewStageForm && (
        <div className="bg-zinc-800 rounded-lg p-4 border border-indigo-500">
          <h3 className="text-lg font-medium text-white mb-4">Nova Etapa</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Nome da Etapa</label>
              <input
                type="text"
                value={newStage.name || ''}
                onChange={(e) => setNewStage(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Triagem, Entrevista Técnica..."
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1">Descrição (opcional)</label>
              <textarea
                value={newStage.description || ''}
                onChange={(e) => setNewStage(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_eliminatory"
                checked={newStage.is_eliminatory ?? true}
                onChange={(e) => setNewStage(prev => ({ ...prev, is_eliminatory: e.target.checked }))}
                className="rounded border-zinc-600 bg-zinc-700 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="is_eliminatory" className="text-sm text-zinc-300">
                Etapa eliminatória (reprovação elimina o candidato)
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleCreateStage}
                disabled={!newStage.name}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Criar Etapa
              </button>
              <button
                onClick={() => { setShowNewStageForm(false); setNewStage({ name: '', description: '', is_eliminatory: true }); }}
                className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stages List */}
      {stages.length === 0 ? (
        <div className="bg-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-400 mb-4">Nenhuma etapa criada ainda.</p>
          <button
            onClick={() => setShowNewStageForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Criar Primeira Etapa
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {stages.map((stage, index) => (
            <div key={stage.id} className="bg-zinc-800 rounded-lg overflow-hidden">
              {/* Stage Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <GripVertical className="h-5 w-5 text-zinc-500" />
                  <span className="flex items-center justify-center w-8 h-8 bg-indigo-600 text-white text-sm font-bold rounded-full">
                    {index + 1}
                  </span>
                  {editingStage === stage.id ? (
                    <input
                      type="text"
                      value={editStageData.name || stage.name}
                      onChange={(e) => setEditStageData(prev => ({ ...prev, name: e.target.value }))}
                      className="px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <div>
                      <h3 className="text-white font-medium">{stage.name}</h3>
                      {stage.description && (
                        <p className="text-zinc-400 text-sm">{stage.description}</p>
                      )}
                    </div>
                  )}
                  {stage.is_eliminatory && (
                    <span className="px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded">
                      Eliminatória
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 text-sm mr-2">
                    {stage.questions_count || 0} perguntas
                  </span>
                  {editingStage === stage.id ? (
                    <>
                      <button
                        onClick={() => handleUpdateStage(stage.id)}
                        className="p-2 text-green-400 hover:bg-zinc-700 rounded-lg"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { setEditingStage(null); setEditStageData({}); }}
                        className="p-2 text-zinc-400 hover:bg-zinc-700 rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setEditingStage(stage.id); setEditStageData({ name: stage.name, description: stage.description }); }}
                        className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStage(stage.id)}
                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-700 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => toggleStage(stage.id)}
                    className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg"
                  >
                    {expandedStages.has(stage.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Questions (expanded) */}
              {expandedStages.has(stage.id) && (
                <div className="border-t border-zinc-700 p-4 bg-zinc-900/50">
                  {stage.questions && stage.questions.length > 0 ? (
                    <div className="space-y-3 mb-4">
                      {stage.questions.map((question, qIndex) => (
                        <div key={question.id} className="flex items-start justify-between p-3 bg-zinc-800 rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-zinc-500 text-sm">{qIndex + 1}.</span>
                              <span className="text-zinc-300">{question.question_text}</span>
                              {question.is_required && (
                                <span className="text-red-400 text-xs">*</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-xs rounded ${
                                question.question_type === 'multiple_choice'
                                  ? 'bg-blue-900/50 text-blue-300'
                                  : 'bg-zinc-700 text-zinc-400'
                              }`}>
                                {question.question_type === 'multiple_choice' ? 'Múltipla Escolha' : 'Texto Aberto'}
                              </span>
                              {question.question_type === 'multiple_choice' && question.options && (
                                <span className="text-zinc-500 text-xs">
                                  ({question.options.length} opções)
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteQuestion(question.id)}
                            className="p-1 text-zinc-500 hover:text-red-400"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-sm mb-4">Nenhuma pergunta nesta etapa.</p>
                  )}

                  {/* New Question Form */}
                  {showNewQuestionFor === stage.id ? (
                    <div className="bg-zinc-800 rounded-lg p-4 border border-indigo-500">
                      <h4 className="text-white font-medium mb-3">Nova Pergunta</h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-zinc-400 mb-1">Texto da Pergunta</label>
                          <textarea
                            value={newQuestion.question_text || ''}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, question_text: e.target.value }))}
                            rows={2}
                            placeholder="Digite a pergunta..."
                            className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                          />
                        </div>
                        <div className="flex gap-4">
                          <div>
                            <label className="block text-sm text-zinc-400 mb-1">Tipo</label>
                            <select
                              value={newQuestion.question_type || 'open_text'}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, question_type: e.target.value as 'multiple_choice' | 'open_text' }))}
                              className="px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                              <option value="open_text">Texto Aberto</option>
                              <option value="multiple_choice">Múltipla Escolha</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id={`required_${stage.id}`}
                              checked={newQuestion.is_required ?? true}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, is_required: e.target.checked }))}
                              className="rounded border-zinc-600 bg-zinc-700 text-indigo-600"
                            />
                            <label htmlFor={`required_${stage.id}`} className="text-sm text-zinc-300">Obrigatória</label>
                          </div>
                        </div>

                        {newQuestion.question_type === 'multiple_choice' && (
                          <div>
                            <label className="block text-sm text-zinc-400 mb-1">Opções</label>
                            <div className="flex gap-2 mb-2">
                              <input
                                type="text"
                                value={newOptionText}
                                onChange={(e) => setNewOptionText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAddOption()}
                                placeholder="Digite uma opção..."
                                className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                              />
                              <button
                                onClick={handleAddOption}
                                type="button"
                                className="px-3 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg"
                              >
                                Adicionar
                              </button>
                            </div>
                            {newQuestion.options && newQuestion.options.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {newQuestion.options.map((opt, i) => (
                                  <span
                                    key={i}
                                    className="flex items-center gap-1 px-2 py-1 bg-zinc-700 text-zinc-300 rounded text-sm"
                                  >
                                    {opt}
                                    <button onClick={() => handleRemoveOption(i)} className="text-zinc-500 hover:text-red-400">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCreateQuestion(stage.id)}
                            disabled={!newQuestion.question_text || (newQuestion.question_type === 'multiple_choice' && (!newQuestion.options || newQuestion.options.length < 2))}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg disabled:opacity-50"
                          >
                            Criar Pergunta
                          </button>
                          <button
                            onClick={() => { setShowNewQuestionFor(null); setNewQuestion({ question_text: '', question_type: 'open_text', options: [], is_required: true }); }}
                            className="px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowNewQuestionFor(stage.id)}
                      className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Pergunta
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
