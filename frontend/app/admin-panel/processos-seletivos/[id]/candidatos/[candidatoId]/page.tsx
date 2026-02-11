'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
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
      toast.error('Por favor, responda todas as perguntas obrigatórias.');
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

      setAnswers({});
      setFeedback('');
      setRating(undefined);

      toast.success(evaluation === 'approved'
        ? 'Candidato aprovado na etapa!'
        : 'Candidato reprovado na etapa.');

      await fetchData();

    } catch (err) {
      console.error('Erro ao avaliar:', err);
      toast.error('Erro ao submeter avaliação.');
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
    return selectionProcessService.getCandidateStatusLabelLight(status);
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (error || !candidate) {
    return (
      <div className="bg-red-50 border border-red-500 rounded-lg p-4 text-red-600">
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
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isFinished ? 'Histórico do Candidato' : 'Avaliar Candidato'}
          </h1>
          <p className="text-slate-500">{candidate.process_title}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-lg p-6">
            <div className="flex flex-col items-center text-center mb-4">
              {candidate.candidate_image ? (
                <img
                  src={candidate.candidate_image}
                  alt={candidate.candidate_name || ''}
                  className="w-20 h-20 rounded-full object-cover mb-3"
                />
              ) : (
                <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-3">
                  <User className="h-8 w-8 text-slate-500" />
                </div>
              )}
              <h2 className="text-lg font-semibold text-slate-900">{candidate.candidate_name}</h2>
              <p className="text-slate-500 text-sm">{candidate.candidate_email}</p>
              <span className={`mt-2 inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                {statusInfo.label}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Etapa Atual:</span>
                <span className="text-slate-600">{candidate.current_stage_name || (isFinished ? 'Finalizado' : '-')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Progresso:</span>
                <span className="text-slate-600">
                  {candidate.completed_stages || 0}/{candidate.total_stages || 0} etapas
                </span>
              </div>
              {candidate.average_rating != null && candidate.average_rating > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Nota Média:</span>
                  <span className="text-slate-600 flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400" />
                    {candidate.average_rating.toFixed(1)}
                  </span>
                </div>
              )}
              {candidate.added_at && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Adicionado em:</span>
                  <span className="text-slate-600">{new Date(candidate.added_at).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Link
                href={`/admin-panel/talentos/${candidate.candidate_profile}`}
                target="_blank"
                className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors text-sm"
              >
                Ver Perfil Completo
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Stage Responses Summary (sidebar) */}
          {sortedResponses.length > 0 && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-slate-900 font-medium mb-3">Resumo das Etapas</h3>
              <div className="space-y-2">
                {sortedResponses.map((response) => {
                  const evalInfo = getEvaluationInfo(response.evaluation);
                  return (
                    <div
                      key={response.id}
                      className="flex items-center justify-between p-2 bg-slate-50 rounded"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-slate-400 text-xs">{response.stage_order}.</span>
                        <span className="text-slate-600 text-sm truncate">{response.stage_name}</span>
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
                candidate.status === 'approved' ? 'bg-emerald-50 border border-emerald-200'
                : candidate.status === 'rejected' ? 'bg-red-50 border border-red-200'
                : 'bg-amber-50 border border-amber-200'
              }`}>
                {candidate.status === 'approved' && (
                  <>
                    <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-slate-900">Candidato Aprovado</h2>
                    <p className="text-slate-500 text-sm">Processo finalizado com aprovação</p>
                  </>
                )}
                {candidate.status === 'rejected' && (
                  <>
                    <XCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-slate-900">Candidato Reprovado</h2>
                    <p className="text-slate-500 text-sm">Processo finalizado com reprovação</p>
                  </>
                )}
                {candidate.status === 'withdrawn' && (
                  <>
                    <User className="h-12 w-12 text-amber-400 mx-auto mb-2" />
                    <h2 className="text-lg font-semibold text-slate-900">Candidato Desistente</h2>
                    <p className="text-slate-500 text-sm">O candidato desistiu do processo</p>
                  </>
                )}
              </div>

              {/* Detailed Stage History */}
              {sortedResponses.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-900">Histórico Completo das Etapas</h3>
                  {sortedResponses.map((response) => {
                    const evalInfo = getEvaluationInfo(response.evaluation);
                    const stage = stagesMap[response.stage];
                    const isExpanded = expandedStages.has(response.id);
                    const responseAnswers = response.answers || {};
                    const hasDetails = Object.keys(responseAnswers).length > 0 || response.recruiter_feedback || (response.rating != null && response.rating > 0);

                    return (
                      <div key={response.id} className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                        {/* Stage Header - clickable */}
                        <button
                          onClick={() => toggleStage(response.id)}
                          className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                              response.evaluation === 'approved' ? 'bg-emerald-50 text-emerald-600'
                              : response.evaluation === 'rejected' ? 'bg-red-50 text-red-600'
                              : 'bg-slate-100 text-slate-500'
                            }`}>
                              {response.stage_order || '?'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">{response.stage_name}</p>
                              {response.evaluated_at && (
                                <p className="text-xs text-slate-400">
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
                                ? <ChevronUp className="h-4 w-4 text-slate-500" />
                                : <ChevronDown className="h-4 w-4 text-slate-500" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && hasDetails && (
                          <div className="border-t border-slate-200 p-4 space-y-4">
                            {/* Stage description */}
                            {stage?.description && (
                              <p className="text-slate-500 text-sm italic">{stage.description}</p>
                            )}

                            {/* Questions & Answers */}
                            {Object.keys(responseAnswers).length > 0 && (
                              <div className="space-y-3">
                                <h4 className="text-sm font-medium text-slate-600 flex items-center gap-2">
                                  <MessageSquare className="h-4 w-4 text-sky-600" />
                                  Perguntas e Respostas
                                </h4>
                                {Object.entries(responseAnswers).map(([qId, answer], idx) => (
                                  <div key={qId} className="bg-slate-50 rounded-lg p-3">
                                    <p className="text-sm font-medium text-slate-600 mb-1">
                                      {idx + 1}. {getQuestionText(response.stage, Number(qId))}
                                    </p>
                                    <p className="text-sm text-slate-800 bg-slate-200/50 rounded px-3 py-2">
                                      {answer || <span className="text-slate-400 italic">Sem resposta</span>}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Recruiter Feedback */}
                            {response.recruiter_feedback && (
                              <div>
                                <h4 className="text-sm font-medium text-slate-600 mb-2">Feedback do Recrutador</h4>
                                <p className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 whitespace-pre-line">
                                  {response.recruiter_feedback}
                                </p>
                              </div>
                            )}

                            {/* Rating */}
                            {response.rating != null && response.rating > 0 && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-500">Nota:</span>
                                <div className="flex gap-1">
                                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                                    <div
                                      key={n}
                                      className={`w-7 h-7 rounded text-xs flex items-center justify-center font-medium ${
                                        n <= (response.rating || 0)
                                          ? 'bg-amber-500/30 text-amber-700'
                                          : 'bg-slate-100 text-slate-400'
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
                              <p className="text-xs text-slate-400 flex items-center gap-1">
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
                <div className="bg-white rounded-lg p-4 border border-slate-200">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">Notas do Recrutador</h3>
                  <p className="text-sm text-slate-500 whitespace-pre-line">{candidate.recruiter_notes}</p>
                </div>
              )}
            </>
          ) : currentStage ? (
            <div className="bg-white rounded-lg p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-slate-900 mb-1">
                  Etapa {currentStage.order}: {currentStage.name}
                </h2>
                {currentStage.description && (
                  <p className="text-slate-500 text-sm">{currentStage.description}</p>
                )}
                {currentStage.is_eliminatory && (
                  <span className="inline-flex mt-2 px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded">
                    Etapa Eliminatória
                  </span>
                )}
              </div>

              {/* Previous stages history (collapsible) */}
              {sortedResponses.length > 0 && (
                <div className="mb-6 space-y-2">
                  <h3 className="text-sm font-medium text-slate-500 mb-2">Etapas anteriores</h3>
                  {sortedResponses.map((response) => {
                    const evalInfo = getEvaluationInfo(response.evaluation);
                    const responseAnswers = response.answers || {};
                    const isExpanded = expandedStages.has(response.id);
                    const hasDetails = Object.keys(responseAnswers).length > 0 || response.recruiter_feedback || (response.rating != null && response.rating > 0);

                    return (
                      <div key={response.id} className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                        <button
                          onClick={() => toggleStage(response.id)}
                          className="w-full flex items-center justify-between p-3 hover:bg-slate-50 transition-colors text-left"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-slate-400 text-xs">{response.stage_order}.</span>
                            <span className="text-slate-600 text-sm truncate">{response.stage_name}</span>
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
                                ? <ChevronUp className="h-3 w-3 text-slate-500" />
                                : <ChevronDown className="h-3 w-3 text-slate-500" />
                            )}
                          </div>
                        </button>

                        {isExpanded && hasDetails && (
                          <div className="border-t border-slate-200 p-3 space-y-3">
                            {Object.keys(responseAnswers).length > 0 && (
                              <div className="space-y-2">
                                {Object.entries(responseAnswers).map(([qId, answer], idx) => (
                                  <div key={qId} className="bg-slate-50 rounded p-2">
                                    <p className="text-xs font-medium text-slate-500 mb-1">
                                      {idx + 1}. {getQuestionText(response.stage, Number(qId))}
                                    </p>
                                    <p className="text-sm text-slate-700">{answer || '-'}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                            {response.recruiter_feedback && (
                              <div>
                                <p className="text-xs text-slate-500 mb-1">Feedback:</p>
                                <p className="text-sm text-slate-600 whitespace-pre-line">{response.recruiter_feedback}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="border-b border-slate-200 my-4" />
                </div>
              )}

              {/* Questions */}
              {currentStage.questions && currentStage.questions.length > 0 ? (
                <div className="space-y-6 mb-6">
                  {currentStage.questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block text-sm font-medium text-slate-600">
                        {index + 1}. {question.question_text}
                        {question.is_required && <span className="text-red-600 ml-1">*</span>}
                      </label>

                      {question.question_type === 'open_text' ? (
                        <textarea
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                          rows={3}
                          placeholder="Digite sua resposta..."
                          className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                        />
                      ) : (
                        <div className="space-y-2">
                          {question.options?.map((option, optIndex) => (
                            <label
                              key={optIndex}
                              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                answers[question.id] === option
                                  ? 'border-sky-400 bg-sky-50'
                                  : 'border-slate-300 hover:border-slate-300'
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
                                  ? 'border-sky-400'
                                  : 'border-slate-300'
                              }`}>
                                {answers[question.id] === option && (
                                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                                )}
                              </div>
                              <span className="text-slate-600">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 mb-6">Nenhuma pergunta configurada para esta etapa.</p>
              )}

              {/* Feedback & Rating */}
              <div className="border-t border-slate-200 pt-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
                    Feedback do Recrutador (opcional)
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={3}
                    placeholder="Observações sobre o candidato nesta etapa..."
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-2">
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
                            ? 'bg-sky-600 text-white'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-slate-200">
                <button
                  onClick={() => handleSubmitEvaluation('rejected')}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-5 w-5" />
                  {submitting ? 'Processando...' : 'Reprovar'}
                </button>
                <button
                  onClick={() => handleSubmitEvaluation('approved')}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-5 w-5" />
                  {submitting ? 'Processando...' : 'Aprovar e Avançar'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-slate-500">
                Candidato aguardando início ou sem etapa definida.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
