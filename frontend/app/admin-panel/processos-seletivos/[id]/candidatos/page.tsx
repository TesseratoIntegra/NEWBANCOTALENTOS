'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Plus, Search, X, Eye, UserPlus, ChevronLeft, ChevronRight } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import { SelectionProcess, CandidateInProcess, AvailableCandidate, ProcessStage, PaginatedResponse } from '@/types';

export default function CandidatosPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const processId = parseInt(resolvedParams.id);

  const [process, setProcess] = useState<SelectionProcess | null>(null);
  const [candidates, setCandidates] = useState<CandidateInProcess[]>([]);
  const [stages, setStages] = useState<ProcessStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Add candidate modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [availableCandidates, setAvailableCandidates] = useState<AvailableCandidate[]>([]);
  const [searchAvailable, setSearchAvailable] = useState('');
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [addingCandidate, setAddingCandidate] = useState(false);

  const statusOptions = selectionProcessService.getCandidateStatusOptions();

  useEffect(() => {
    fetchProcessAndStages();
  }, [processId]);

  useEffect(() => {
    fetchCandidates();
  }, [processId, currentPage, statusFilter, stageFilter, searchTerm]);

  const fetchProcessAndStages = async () => {
    try {
      const [processData, stagesData] = await Promise.all([
        selectionProcessService.getProcessById(processId),
        selectionProcessService.getStages(processId)
      ]);
      setProcess(processData);
      setStages(stagesData);
    } catch (err) {
      console.error('Erro ao buscar processo:', err);
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        process: number;
        page: number;
        status?: string;
        current_stage?: number;
        search?: string;
      } = { process: processId, page: currentPage };

      if (statusFilter) params.status = statusFilter;
      if (stageFilter) params.current_stage = parseInt(stageFilter);
      if (searchTerm) params.search = searchTerm;

      const response: PaginatedResponse<CandidateInProcess> = await selectionProcessService.getCandidatesInProcess(params);

      setCandidates(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / 10));
    } catch (err) {
      console.error('Erro ao buscar candidatos:', err);
      setError('Erro ao carregar candidatos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchAvailable = async () => {
    setLoadingAvailable(true);
    try {
      const data = await selectionProcessService.getAvailableCandidates(processId, searchAvailable);
      setAvailableCandidates(data);
    } catch (err) {
      console.error('Erro ao buscar candidatos disponíveis:', err);
    } finally {
      setLoadingAvailable(false);
    }
  };

  useEffect(() => {
    if (showAddModal) {
      handleSearchAvailable();
    }
  }, [showAddModal, searchAvailable]);

  const handleAddCandidate = async (candidateId: number) => {
    setAddingCandidate(true);
    try {
      await selectionProcessService.addCandidateToProcess(processId, candidateId);
      setShowAddModal(false);
      setSearchAvailable('');
      fetchCandidates();
    } catch (err: unknown) {
      console.error('Erro ao adicionar candidato:', err);
      alert('Erro ao adicionar candidato ao processo.');
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleRemoveCandidate = async (id: number) => {
    if (!confirm('Tem certeza que deseja remover este candidato do processo?')) return;

    try {
      await selectionProcessService.removeCandidateFromProcess(id);
      fetchCandidates();
    } catch (err) {
      console.error('Erro ao remover candidato:', err);
      alert('Erro ao remover candidato.');
    }
  };

  const getStatusInfo = (status: string) => {
    return selectionProcessService.getCandidateStatusLabel(status);
  };

  if (!process) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
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
            <h1 className="text-2xl font-bold text-white">Candidatos</h1>
            <p className="text-zinc-400">{process.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-300">
            Total: <span className="font-semibold text-white">{totalCount}</span>
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Adicionar Candidato
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-800 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todos os status</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Stage Filter */}
          <div className="w-full lg:w-48">
            <select
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas as etapas</option>
              {stages.map(stage => (
                <option key={stage.id} value={stage.id}>{stage.name}</option>
              ))}
            </select>
          </div>

          {(statusFilter || stageFilter || searchTerm) && (
            <button
              onClick={() => { setStatusFilter(''); setStageFilter(''); setSearchTerm(''); setCurrentPage(1); }}
              className="px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Candidates List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-zinc-800 rounded-lg p-12 text-center">
          <p className="text-zinc-400 mb-4">Nenhum candidato no processo.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Adicionar Candidato
          </button>
        </div>
      ) : (
        <>
          <div className="bg-zinc-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-zinc-700">
              <thead className="bg-zinc-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase">Candidato</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase">Etapa Atual</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase">Progresso</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase">Nota Média</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-700">
                {candidates.map((candidate) => {
                  const statusInfo = getStatusInfo(candidate.status);
                  return (
                    <tr key={candidate.id} className="hover:bg-zinc-700/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {candidate.candidate_image ? (
                            <Image
                              src={candidate.candidate_image}
                              alt={candidate.candidate_name || ''}
                              width={40}
                              height={40}
                              className="rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {candidate.candidate_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="text-white font-medium">{candidate.candidate_name}</p>
                            <p className="text-zinc-400 text-sm">{candidate.candidate_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-zinc-300">
                          {candidate.current_stage_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-zinc-400">
                          {candidate.completed_stages || 0}/{candidate.total_stages || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {candidate.average_rating ? (
                          <span className="text-zinc-300">{candidate.average_rating.toFixed(1)}</span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin-panel/processos-seletivos/${processId}/candidatos/${candidate.id}`}
                            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-lg transition-colors"
                            title="Avaliar"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleRemoveCandidate(candidate.id)}
                            className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-600 rounded-lg transition-colors"
                            title="Remover"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Mostrando {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalCount)} de {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-zinc-300">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-zinc-700">
              <h2 className="text-lg font-semibold text-white">Adicionar Candidato</h2>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-zinc-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 border-b border-zinc-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Buscar candidatos aprovados..."
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <p className="text-zinc-500 text-sm mt-2">
                Apenas candidatos com perfil aprovado podem ser adicionados.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loadingAvailable ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500"></div>
                </div>
              ) : availableCandidates.length === 0 ? (
                <p className="text-zinc-400 text-center py-8">
                  Nenhum candidato disponível encontrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableCandidates.map((candidate) => (
                    <div
                      key={candidate.id}
                      className="flex items-center justify-between p-3 bg-zinc-700/50 rounded-lg hover:bg-zinc-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {candidate.image_profile ? (
                          <Image
                            src={candidate.image_profile}
                            alt={candidate.name}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-zinc-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {candidate.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="text-white font-medium">{candidate.name}</p>
                          <p className="text-zinc-400 text-sm">{candidate.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddCandidate(candidate.id)}
                        disabled={addingCandidate}
                        className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                      >
                        <UserPlus className="h-4 w-4" />
                        Adicionar
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
