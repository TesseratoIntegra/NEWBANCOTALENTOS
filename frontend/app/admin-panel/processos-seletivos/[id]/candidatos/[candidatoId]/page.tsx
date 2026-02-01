'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, CheckCircle, XCircle, User, ChevronRight, Star, Save } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import { CandidateInProcess, ProcessStage, StageQuestion, StageEvaluation } from '@/types';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

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

      // Buscar detalhes da etapa atual
      if (candidateData.current_stage) {
        const stageData = await selectionProcessService.getStageById(candidateData.current_stage);
        setCurrentStage(stageData);
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

    // Validar respostas obrigatórias
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

      // Atualizar dados locais
      setCandidate(prev => prev ? {
        ...prev,
        status: result.candidate_status as CandidateInProcess['status'],
        current_stage: result.current_stage || undefined,
        current_stage_name: result.current_stage_name || undefined
      } : null);

      // Limpar formulário
      setAnswers({});
      setFeedback('');
      setRating(undefined);

      // Se avançou para próxima etapa, buscar dados novamente
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

  const getStatusInfo = (status: string) => {
    return selectionProcessService.getCandidateStatusLabel(status);
  };

  const getEvaluationInfo = (evaluation: string) => {
    return selectionProcessService.getEvaluationLabel(evaluation);
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
          <h1 className="text-2xl font-bold text-white">Avaliar Candidato</h1>
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
                <span className="text-zinc-300">{candidate.current_stage_name || '-'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Progresso:</span>
                <span className="text-zinc-300">
                  {candidate.completed_stages || 0}/{candidate.total_stages || 0} etapas
                </span>
              </div>
              {candidate.average_rating && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Nota Média:</span>
                  <span className="text-zinc-300 flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-400" />
                    {candidate.average_rating.toFixed(1)}
                  </span>
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

          {/* Stage Responses History */}
          {candidate.stage_responses && candidate.stage_responses.length > 0 && (
            <div className="bg-zinc-800 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Histórico de Etapas</h3>
              <div className="space-y-2">
                {candidate.stage_responses.map((response) => {
                  const evalInfo = getEvaluationInfo(response.evaluation);
                  return (
                    <div
                      key={response.id}
                      className="flex items-center justify-between p-2 bg-zinc-700/50 rounded"
                    >
                      <span className="text-zinc-300 text-sm">{response.stage_name}</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${evalInfo.bgColor} ${evalInfo.textColor}`}>
                        {evalInfo.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Evaluation Form */}
        <div className="lg:col-span-2">
          {isFinished ? (
            <div className="bg-zinc-800 rounded-lg p-8 text-center">
              {candidate.status === 'approved' && (
                <>
                  <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">Candidato Aprovado</h2>
                  <p className="text-zinc-400">Este candidato foi aprovado no processo seletivo.</p>
                </>
              )}
              {candidate.status === 'rejected' && (
                <>
                  <XCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">Candidato Reprovado</h2>
                  <p className="text-zinc-400">Este candidato foi reprovado no processo seletivo.</p>
                </>
              )}
              {candidate.status === 'withdrawn' && (
                <>
                  <User className="h-16 w-16 text-amber-400 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-white mb-2">Candidato Desistente</h2>
                  <p className="text-zinc-400">Este candidato desistiu do processo seletivo.</p>
                </>
              )}
            </div>
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
