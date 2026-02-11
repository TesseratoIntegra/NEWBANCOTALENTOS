'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { confirmDialog } from '@/lib/confirmDialog';
import { ArrowLeft, Plus, Search, X, ClipboardList, UserPlus, ChevronLeft, ChevronRight, Briefcase, MapPin, CheckSquare } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import jobService from '@/services/jobService';
import { SelectionProcess, CandidateInProcess, AvailableCandidate, ProcessStage, PaginatedResponse, Job } from '@/types';

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
  const [selectedCandidates, setSelectedCandidates] = useState<Set<number>>(new Set());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filterJobId, setFilterJobId] = useState('');

  const statusOptions = selectionProcessService.getCandidateStatusOptions();

  useEffect(() => {
    fetchProcessAndStages();
    fetchJobs();
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

  const fetchJobs = async () => {
    try {
      const response = await jobService.getJobs({ page: 1 });
      setJobs(response.results || []);
    } catch (err) {
      console.error('Erro ao buscar vagas:', err);
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
      const data = await selectionProcessService.getAvailableCandidates(
        processId,
        searchAvailable,
        filterJobId ? parseInt(filterJobId) : undefined
      );
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
  }, [showAddModal, searchAvailable, filterJobId]);

  const handleAddCandidate = async (candidateId: number) => {
    setAddingCandidate(true);
    try {
      await selectionProcessService.addCandidateToProcess(processId, candidateId);
      setShowAddModal(false);
      setSearchAvailable('');
      setSelectedCandidates(new Set());
      setFilterJobId('');
      fetchCandidates();
    } catch (err: unknown) {
      console.error('Erro ao adicionar candidato:', err);
      toast.error('Erro ao adicionar candidato ao processo.');
    } finally {
      setAddingCandidate(false);
    }
  };

  const handleAddSelected = async () => {
    if (selectedCandidates.size === 0) return;
    setAddingCandidate(true);
    try {
      const ids = Array.from(selectedCandidates);
      for (const id of ids) {
        await selectionProcessService.addCandidateToProcess(processId, id);
      }
      setShowAddModal(false);
      setSearchAvailable('');
      setSelectedCandidates(new Set());
      setFilterJobId('');
      fetchCandidates();
    } catch (err: unknown) {
      console.error('Erro ao adicionar candidatos:', err);
      toast.error('Erro ao adicionar candidatos ao processo.');
    } finally {
      setAddingCandidate(false);
    }
  };

  const toggleSelectCandidate = (id: number) => {
    setSelectedCandidates(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedCandidates.size === availableCandidates.length) {
      setSelectedCandidates(new Set());
    } else {
      setSelectedCandidates(new Set(availableCandidates.map(c => c.id)));
    }
  };

  const handleRemoveCandidate = async (id: number) => {
    if (!(await confirmDialog('Tem certeza que deseja remover este candidato do processo?'))) return;

    try {
      await selectionProcessService.removeCandidateFromProcess(id);
      fetchCandidates();
    } catch (err) {
      console.error('Erro ao remover candidato:', err);
      toast.error('Erro ao remover candidato.');
    }
  };

  const getStatusInfo = (status: string) => {
    return selectionProcessService.getCandidateStatusLabelLight(status);
  };

  const closeModal = () => {
    setShowAddModal(false);
    setSearchAvailable('');
    setSelectedCandidates(new Set());
    setFilterJobId('');
  };

  if (!process) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
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
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Candidatos</h1>
            <p className="text-slate-500">{process.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-slate-600">
            Total: <span className="font-semibold text-slate-900">{totalCount}</span>
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Adicionar Candidato
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="w-full lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
              className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-500 rounded-lg p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Candidates List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-slate-500 mb-4">Nenhum candidato no processo.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Adicionar Candidato
          </button>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Candidato</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Etapa Atual</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Progresso</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Nota Média</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {candidates.map((candidate) => {
                  const statusInfo = getStatusInfo(candidate.status);
                  return (
                    <tr key={candidate.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                            {candidate.candidate_image ? (
                              <img
                                src={candidate.candidate_image}
                                alt={candidate.candidate_name || ''}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (candidate.candidate_name || '?').charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-slate-900 font-medium">{candidate.candidate_name}</p>
                            <p className="text-slate-500 text-sm">{candidate.candidate_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-600">
                          {candidate.current_stage_name || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="text-slate-500">
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
                          <span className="text-slate-600">{candidate.average_rating.toFixed(1)}</span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin-panel/processos-seletivos/${processId}/candidatos/${candidate.id}`}
                            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Avaliar"
                          >
                            <ClipboardList className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => handleRemoveCandidate(candidate.id)}
                            className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-lg transition-colors"
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
              <p className="text-sm text-slate-500">
                Mostrando {((currentPage - 1) * 10) + 1} - {Math.min(currentPage * 10, totalCount)} de {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-slate-600">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Adicionar Candidatos</h2>
                <p className="text-slate-400 text-sm mt-0.5">
                  Apenas candidatos com perfil aprovado podem ser adicionados.
                </p>
              </div>
              <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filters */}
            <div className="px-6 py-3 border-b border-slate-200 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou email..."
                  value={searchAvailable}
                  onChange={(e) => setSearchAvailable(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterJobId}
                onChange={(e) => setFilterJobId(e.target.value)}
                className="w-full sm:w-56 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Todas as vagas</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>{job.title}</option>
                ))}
              </select>
            </div>

            {/* Select all bar */}
            {availableCandidates.length > 0 && (
              <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600">
                  <input
                    type="checkbox"
                    checked={selectedCandidates.size === availableCandidates.length && availableCandidates.length > 0}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  Selecionar todos ({availableCandidates.length})
                </label>
                {selectedCandidates.size > 0 && (
                  <span className="text-xs text-sky-600 font-medium">
                    {selectedCandidates.size} selecionado(s)
                  </span>
                )}
              </div>
            )}

            {/* Candidate List */}
            <div className="flex-1 overflow-y-auto px-6 py-3">
              {loadingAvailable ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-sky-400"></div>
                </div>
              ) : availableCandidates.length === 0 ? (
                <p className="text-slate-500 text-center py-12">
                  Nenhum candidato disponível encontrado.
                </p>
              ) : (
                <div className="space-y-2">
                  {availableCandidates.map((candidate) => {
                    const isSelected = selectedCandidates.has(candidate.id);
                    const location = [candidate.city, candidate.state].filter(Boolean).join(', ');
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => toggleSelectCandidate(candidate.id)}
                        className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-sky-50 border border-sky-200'
                            : 'bg-slate-50 border border-transparent hover:bg-slate-100'
                        }`}
                      >
                        {/* Checkbox */}
                        <div className="pt-0.5">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectCandidate(candidate.id)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                          />
                        </div>

                        {/* Photo */}
                        <div className="w-11 h-11 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                          {candidate.image_profile ? (
                            <img
                              src={candidate.image_profile}
                              alt={candidate.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            candidate.name.charAt(0).toUpperCase()
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{candidate.name}</p>
                              <p className="text-xs text-slate-500 truncate">{candidate.email}</p>
                            </div>
                            <div className="text-right flex-shrink-0">
                              {candidate.current_position && (
                                <p className="text-xs text-slate-600 font-medium">{candidate.current_position}</p>
                              )}
                              {location && (
                                <p className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                                  <MapPin className="h-3 w-3" />
                                  {location}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Applications badges */}
                          {candidate.applications_summary && candidate.applications_summary.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {candidate.applications_summary.map((app) => (
                                <span
                                  key={app.job_id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-violet-50 text-violet-700 border border-violet-200"
                                >
                                  <Briefcase className="h-3 w-3" />
                                  {app.job_title}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddSelected}
                disabled={selectedCandidates.size === 0 || addingCandidate}
                className="flex items-center gap-2 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckSquare className="h-4 w-4" />
                {addingCandidate
                  ? 'Adicionando...'
                  : `Adicionar Selecionados (${selectedCandidates.size})`
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
