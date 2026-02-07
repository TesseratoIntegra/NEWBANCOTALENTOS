'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, XCircle, User, ChevronRight, Star, MessageSquare, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import { CandidateInProcess, ProcessStage, StageQuestion, StageEvaluation, CandidateStageResponse } from '@/types';

export default function AvaliarCandidatoPage({
  params
}: {
  params: Promise<{ id: string; candidatoId: string }>
}) {
  const resolvedParams = use(params);
  const processId = parseInt(resolvedParams.id);
  const candidateInProcessId = parseInt(resolvedParams.candidatoId);

  const [candidate, setCandidate] = useState<CandidateInProcess | null>(null);
  const [currentStage, setCurrentStage] = useState<ProcessStage | null>(null);
  const [stagesMap, setStagesMap] = useState<Record<number, ProcessStage>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedStages, setExpandedStages] = useState<Set<number>>(new Set());

  // Evaluation form
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number | undefined>(undefined);

  useEffect(() => {
    fetchData();
  }, [candidateInProcessId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const candidateData = await selectionProcessService.getCandidateInProcessById(candidateInProcessId);
      setCandidate(candidateData);

      // Buscar detalhes da etapa atual (se ativa)
      if (candidateData.current_stage) {
        const stageData = await selectionProcessService.getStageById(candidateData.current_stage);
        setCurrentStage(stageData);
      }

      // Buscar detalhes das etapas com perguntas (para histórico)
      if (candidateData.stage_responses && candidateData.stage_responses.length > 0) {
        const uniqueStageIds = [...new Set(candidateData.stage_responses.map(r => r.stage))];
        const stagePromises = uniqueStageIds.map(id =>
          selectionProcessService.getStageById(id).catch(() => null)
        );
        const stages = await Promise.all(stagePromises);
        const map: Record<number, ProcessStage> = {};
        stages.forEach(s => { if (s) map[s.id] = s; });
        setStagesMap(map);

        // Expandir todas as etapas por padrão se processo finalizado
        const isFinished = ['approved', 'rejected', 'withdrawn'].includes(candidateData.status);
        if (isFinished) {
          setExpandedStages(new Set(candidateData.stage_responses.map(r => r.id)));
        }
      }
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar dados do candidato.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmitEvaluation = async (evaluation: 'approved' | 'rejected') => {
    if (!candidate || !currentStage) return;

    const requiredQuestions = currentStage.questions?.filter(q => q.is_required) || [];
    const missingAnswers = requiredQuestions.filter(q => !answers[q.id]?.trim());

    if (missingAnswers.length > 0) {
      alert('Por favor, responda todas as perguntas obrigatórias.');
      return;
    }

    setSubmitting(true);
    try {
      const evaluationData: StageEvaluation = {
        evaluation,
        answers,
        recruiter_feedback: feedback,
        rating
      };

      const result = await selectionProcessService.evaluateCandidate(candidateInProcessId, evaluationData);

      setCandidate(prev => prev ? {
        ...prev,
        status: result.candidate_status as CandidateInProcess['status'],
        current_stage: result.current_stage || undefined,
        current_stage_name: result.current_stage_name || undefined
      } : null);

      setAnswers({});
      setFeedback('');
      setRating(undefined);

      if (result.current_stage && result.current_stage !== currentStage.id) {
        fetchData();
      }

      alert(evaluation === 'approved'
        ? 'Candidato aprovado na etapa!'
        : 'Candidato reprovado na etapa.');

    } catch (err) {
      console.error('Erro ao avaliar:', err);
      alert('Erro ao submeter avaliação.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStage = (responseId: number) => {
    setExpandedStages(prev => {
      const next = new Set(prev);
      if (next.has(responseId)) next.delete(responseId);
      else next.add(responseId);
      return next;
    });
  };

  const getStatusInfo = (status: string) => {
    return selectionProcessService.getCandidateStatusLabel(status);
  };

  const getEvaluationInfo = (evaluation: string) => {
    return selectionProcessService.getEvaluationLabel(evaluation);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getQuestionText = (stageId: number, questionId: number): string => {
    const stage = stagesMap[stageId];
    if (!stage?.questions) return `Pergunta #${questionId}`;
    const q = stage.questions.find(q => q.id === questionId);
    return q?.question_text || `Pergunta #${questionId}`;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
        {error || 'Candidato não encontrado.'}
      </div>
    );
  }

  const statusInfo = getStatusInfo(candidate.status);
  const isFinished = candidate.status === 'approved' || candidate.status === 'rejected' || candidate.status === 'withdrawn';
  const sortedResponses = [...(candidate.stage_responses || [])].sort((a, b) => (a.stage_order || 0) - (b.stage_order || 0));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-panel/processos-seletivos/${processId}/candidatos`}
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {isFinished ? 'Histórico do Candidato' : 'Avaliar Candidato'}
          </h1>
          <p className="text-zinc-400">{candidate.process_title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-800 rounded-lg p-6">
            <div className="flex flex-col items-center text-center mb-4">
              {candidate.candidate_image ? (
                <Image
                  src={candidate.candidate_image}
                  alt={candidate.candidate_name || ''}
                  width={80}
                  height={80}
                  className="rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-zinc-600 rounded-full flex items-center justify-center mb-3">
                  <User className="h-8 w-8 text-zinc-400" />
                </div>
              )}
              <h2 className="text-lg font-semibold text-white">{candidate.candidate_name}</h2>
              <p className="text-zinc-400 text-sm">{candidate.candidate_email}</p>
              <span className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="border-t border-zinc-700 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Etapa Atual:</span>
                <span className="text-zinc-300">{candidate.current_stage_name || (isFinished ? 'Finalizado' : '-')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Progresso:</span>
                <span className="text-zinc-300">
                  {candidate.completed_stages || 0}/{candidate.total_stages || 0} etapas
                </span>
              </div>
              {candidate.average_rating != null && candidate.average_rating > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Nota Média:</span>
                  <span className="text-zinc-300 flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400" />
                    {candidate.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
              {candidate.added_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Adicionado em:</span>
                  <span className="text-zinc-300">{new Date(candidate.added_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link
                href={`/admin-panel/talentos/${candidate.candidate_profile}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 rounded-lg transition-colors text-sm"
              >
                Ver Perfil Completo
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Stage Responses Summary (sidebar) */}
          {sortedResponses.length > 0 && (
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Resumo das Etapas</h3>
              <div className="space-y-2">
                {sortedResponses.map((response) => {
                  const evalInfo = getEvaluationInfo(response.evaluation);
                  return (
                    <div
                      key={response.id}
                      className="flex items-center justify-between p-2 bg-zinc-700/50 rounded"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-500 text-xs">{response.stage_order}.</span>
                        <span className="text-zinc-300 text-sm truncate">{response.stage_name}</span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {response.rating != null && response.rating > 0 && (
                          <span className="text-amber-400 text-xs flex items-center gap-0.5">
                            <Star className="h-3 w-3" />
                            {response.rating}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded text-xs ${evalInfo.bgColor} ${evalInfo.textColor}`}>
                          {evalInfo.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          {isFinished ? (
            <>
              {/* Status Banner */}
              <div className={`rounded-lg p-6 text-center ${
                candidate.status === 'approved' ? 'bg-green-900/20 border border-green-700/50'
                : candidate.status === 'rejected' ? 'bg-red-900/20 border border-red-700/50'
                : 'bg-amber-900/20 border border-amber-700/50'
              }`}>
                {candidate.status === 'approved' && (
                  <>
                    <CheckCircle className="h-12 w-12 text-green-400 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-white">Candidato Aprovado</h2>
                    <p className="text-zinc-400 text-sm">Processo finalizado com aprovação</p>
                  </>
                )}
                {candidate.status === 'rejected' && (
                  <>
                    <XCircle className="h-12 w-12 text-red-400 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-white">Candidato Reprovado</h2>
                    <p className="text-zinc-400 text-sm">Processo finalizado com reprovação</p>
                  </>
                )}
                {candidate.status === 'withdrawn' && (
                  <>
                    <User className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-white">Candidato Desistente</h2>
                    <p className="text-zinc-400 text-sm">O candidato desistiu do processo</p>
                  </>
                )}
              </div>

              {/* Detailed Stage History */}
              {sortedResponses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-white">Histórico Completo das Etapas</h3>
                  {sortedResponses.map((response) => {
                    const evalInfo = getEvaluationInfo(response.evaluation);
                    const stage = stagesMap[response.stage];
                    const isExpanded = expandedStages.has(response.id);
                    const responseAnswers = response.answers || {};
                    const hasDetails = Object.keys(responseAnswers).length > 0 || response.recruiter_feedback || (response.rating != null && response.rating > 0);

                    return (
                      <div key={response.id} className="bg-zinc-800 rounded-lg border border-zinc-700 overflow-hidden">
                        {/* Stage Header - clickable */}
                        <button
                          onClick={() => toggleStage(response.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-zinc-750 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              response.evaluation === 'approved' ? 'bg-green-900/50 text-green-400'
                              : response.evaluation === 'rejected' ? 'bg-red-900/50 text-red-400'
                              : 'bg-zinc-700 text-zinc-400'
                            }`}>
                              {response.stage_order || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-white truncate">{response.stage_name}</p>
                              {response.evaluated_at && (
                                <p className="text-xs text-zinc-500">
                                  Avaliado em {formatDate(response.evaluated_at)}
                                  {response.evaluated_by_name && ` por ${response.evaluated_by_name}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                            {response.rating != null && response.rating > 0 && (
                              <span className="text-amber-400 text-sm flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                {response.rating}/10
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${evalInfo.bgColor} ${evalInfo.textColor}`}>
                              {evalInfo.label}
                            </span>
                            {hasDetails && (
                              isExpanded
                                ? <ChevronUp className="h-4 w-4 text-zinc-400" />
                                : <ChevronDown className="h-4 w-4 text-zinc-400" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && hasDetails && (
                          <div className="border-t border-zinc-700 p-4 space-y-4">
                            {/* Stage description */}
                            {stage?.description && (
                              <p className="text-zinc-400 text-sm italic">{stage.description}</p>
                            )}

                            {/* Questions & Answers */}
                            {Object.keys(responseAnswers).length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-indigo-400" />
                                  Perguntas e Respostas
                                </h4>
                                {Object.entries(responseAnswers).map(([qId, answer], idx) => (
                                  <div key={qId} className="bg-zinc-700/50 rounded-lg p-3">
                                    <p className="text-sm font-medium text-zinc-300 mb-1">
                                      {idx + 1}. {getQuestionText(response.stage, Number(qId))}
                                    </p>
                                    <p className="text-sm text-zinc-100 bg-zinc-600/50 rounded px-3 py-2">
                                      {answer || <span className="text-zinc-500 italic">Sem resposta</span>}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Recruiter Feedback */}
                            {response.recruiter_feedback && (
                              <div>
                                <h4 className="text-sm font-medium text-zinc-300 mb-2">Feedback do Recrutador</h4>
                                <p className="text-sm text-zinc-300 bg-zinc-700/50 rounded-lg p-3 whitespace-pre-line">
                                  {response.recruiter_feedback}
                                </p>
                              </div>
                            )}

                            {/* Rating */}
                            {response.rating != null && response.rating > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-zinc-400">Nota:</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <div
                                      key={n}
                                      className={`w-7 h-7 rounded text-xs flex items-center justify-center font-medium ${
                                        n <= (response.rating || 0)
                                          ? 'bg-amber-500/30 text-amber-300'
                                          : 'bg-zinc-700 text-zinc-500'
                                      }`}
                                    >
                                      {n}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Timestamps */}
                            {response.completed_at && (
                              <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Concluído em {formatDate(response.completed_at)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recruiter Notes */}
              {candidate.recruiter_notes && (
                <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                  <h3 className="text-sm font-medium text-zinc-300 mb-2">Notas do Recrutador</h3>
                  <p className="text-sm text-zinc-400 whitespace-pre-line">{candidate.recruiter_notes}</p>
                </div>
              )}
            </>
          ) : currentStage ? (
            <div className="bg-zinc-800 rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white mb-1">
                  Etapa {currentStage.order}: {currentStage.name}
                </h2>
                {currentStage.description && (
                  <p className="text-zinc-400 text-sm">{currentStage.description}</p>
                )}
                {currentStage.is_eliminatory && (
                  <span className="inline-flex mt-2 px-2 py-0.5 bg-red-900/50 text-red-300 text-xs rounded">
                    Etapa Eliminatória
                  </span>
                )}
              </div>

              {/* Previous stages history (collapsible) */}
              {sortedResponses.length > 0 && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-sm font-medium text-zinc-400 mb-2">Etapas anteriores</h3>
                  {sortedResponses.map((response) => {
                    const evalInfo = getEvaluationInfo(response.evaluation);
                    const responseAnswers = response.answers || {};
                    const isExpanded = expandedStages.has(response.id);
                    const hasDetails = Object.keys(responseAnswers).length > 0 || response.recruiter_feedback || (response.rating != null && response.rating > 0);

                    return (
                      <div key={response.id} className="bg-zinc-700/30 rounded-lg border border-zinc-700 overflow-hidden">
                        <button
                          onClick={() => toggleStage(response.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-zinc-700/50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-zinc-500 text-xs">{response.stage_order}.</span>
                            <span className="text-zinc-300 text-sm truncate">{response.stage_name}</span>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                            {response.rating != null && response.rating > 0 && (
                              <span className="text-amber-400 text-xs flex items-center gap-0.5">
                                <Star className="h-3 w-3" />{response.rating}
                              </span>
                            )}
                            <span className={`px-2 py-0.5 rounded text-xs ${evalInfo.bgColor} ${evalInfo.textColor}`}>
                              {evalInfo.label}
                            </span>
                            {hasDetails && (
                              isExpanded
                                ? <ChevronUp className="h-3 w-3 text-zinc-400" />
                                : <ChevronDown className="h-3 w-3 text-zinc-400" />
                            )}
                          </div>
                        </button>

                        {isExpanded && hasDetails && (
                          <div className="border-t border-zinc-700 p-3 space-y-3">
                            {Object.keys(responseAnswers).length > 0 && (
                              <div className="space-y-2">
                                {Object.entries(responseAnswers).map(([qId, answer], idx) => (
                                  <div key={qId} className="bg-zinc-700/50 rounded p-2">
                                    <p className="text-xs font-medium text-zinc-400 mb-1">
                                      {idx + 1}. {getQuestionText(response.stage, Number(qId))}
                                    </p>
                                    <p className="text-sm text-zinc-200">{answer || '-'}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {response.recruiter_feedback && (
                              <div>
                                <p className="text-xs text-zinc-400 mb-1">Feedback:</p>
                                <p className="text-sm text-zinc-300 whitespace-pre-line">{response.recruiter_feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="border-b border-zinc-700 my-4" />
                </div>
              )}

              {/* Questions */}
              {currentStage.questions && currentStage.questions.length > 0 ? (
                <div className="space-y-6 mb-6">
                  {currentStage.questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block text-sm font-medium text-zinc-300">
                        {index + 1}. {question.question_text}
                        {question.is_required && <span className="text-red-400 ml-1">*</span>}
                      </label>

                      {question.question_type === 'open_text' ? (
                        <textarea
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          rows={3}
                          placeholder="Digite sua resposta..."
                          className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                        />
                      ) : (
                        <div className="space-y-2">
                          {question.options?.map((option, optIndex) => (
                            <label
                              key={optIndex}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                answers[question.id] === option
                                  ? 'border-indigo-500 bg-indigo-900/20'
                                  : 'border-zinc-600 hover:border-zinc-500'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`question_${question.id}`}
                                value={option}
                                checked={answers[question.id] === option}
                                onChange={() => handleAnswerChange(question.id, option)}
                                className="sr-only"
                              />
                              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                answers[question.id] === option
                                  ? 'border-indigo-500'
                                  : 'border-zinc-500'
                              }`}>
                                {answers[question.id] === option && (
                                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                )}
                              </div>
                              <span className="text-zinc-300">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-400 mb-6">Nenhuma pergunta configurada para esta etapa.</p>
              )}

              {/* Feedback & Rating */}
              <div className="border-t border-zinc-700 pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Feedback do Recrutador (opcional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Observações sobre o candidato nesta etapa..."
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nota (1-10)
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setRating(n)}
                        className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                          rating === n
                            ? 'bg-indigo-600 text-white'
                            : 'bg-zinc-700 text-zinc-400 hover:bg-zinc-600'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-zinc-700">
                <button
                  onClick={() => handleSubmitEvaluation('rejected')}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  {submitting ? 'Processando...' : 'Reprovar'}
                </button>
                <button
                  onClick={() => handleSubmitEvaluation('approved')}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  {submitting ? 'Processando...' : 'Aprovar e Avançar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-zinc-800 rounded-lg p-8 text-center">
              <p className="text-zinc-400">
                Candidato aguardando início ou sem etapa definida.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
