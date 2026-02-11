'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Users, MapPin, Briefcase, GraduationCap, Check, X, ChevronLeft, ChevronRight, Eye, FileText, UserCheck, ClipboardList, LayoutGrid, LayoutList, Bell } from 'lucide-react';
import Link from 'next/link';
import candidateService from '@/services/candidateService';
import jobService from '@/services/jobService';
import { CandidateProfile, PaginatedResponse, Job } from '@/types';

export default function TalentosPage() {
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // View mode
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [availableForWork, setAvailableForWork] = useState<string>('');
  const [acceptsRemote, setAcceptsRemote] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [profileStatus, setProfileStatus] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Jobs for filter
  const [jobs, setJobs] = useState<Job[]>([]);

  const educationLevels = candidateService.getEducationLevels();
  const profileStatusOptions = candidateService.getProfileStatusOptions();

  // Fetch jobs for filter dropdown
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobService.getJobs({ page: 1 });
        setJobs(response.results || []);
      } catch (err) {
        console.error('Erro ao buscar vagas:', err);
      }
    };
    fetchJobs();
  }, []);

  const fetchCandidates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Parameters<typeof candidateService.getAllCandidates>[0] = {
        page: currentPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (educationLevel) params.education_level = educationLevel;
      if (availableForWork === 'true') params.available_for_work = true;
      if (availableForWork === 'false') params.available_for_work = false;
      if (acceptsRemote === 'true') params.accepts_remote_work = true;
      if (acceptsRemote === 'false') params.accepts_remote_work = false;
      if (selectedJobId) params.applied_to_job = parseInt(selectedJobId);
      if (profileStatus) params.profile_status = profileStatus;

      const response: PaginatedResponse<CandidateProfile> = await candidateService.getAllCandidates(params);

      setCandidates(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / 10));
    } catch (err) {
      console.error('Erro ao buscar talentos:', err);
      setError('Erro ao carregar talentos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, educationLevel, availableForWork, acceptsRemote, selectedJobId, profileStatus]);

  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchCandidates();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEducationLevel('');
    setAvailableForWork('');
    setAcceptsRemote('');
    setSelectedJobId('');
    setProfileStatus('');
    setCurrentPage(1);
  };

  // Helper para obter label do status da candidatura
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      submitted: { label: 'Em análise', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
      in_process: { label: 'Em processo', color: 'bg-sky-50 text-sky-700 border border-sky-200' },
      interview_scheduled: { label: 'Entrevista', color: 'bg-violet-50 text-violet-700 border border-violet-200' },
      approved: { label: 'Aprovado', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
      rejected: { label: 'Reprovado', color: 'bg-red-50 text-red-700 border border-red-200' },
      withdrawn: { label: 'Retirado', color: 'bg-slate-100 text-slate-500 border border-slate-200' },
    };
    return statusMap[status] || { label: status, color: 'bg-slate-100 text-slate-500 border border-slate-200' };
  };

  // Helper para obter label do status do pipeline
  const getProfileStatusInfo = (status?: string) => {
    const statusMap: Record<string, { label: string; bgColor: string; textColor: string }> = {
      pending: { label: 'Em análise', bgColor: 'bg-amber-50 border border-amber-200', textColor: 'text-amber-700' },
      awaiting_review: { label: 'Aguardando Revisão', bgColor: 'bg-sky-50 border border-sky-200', textColor: 'text-sky-700' },
      approved: { label: 'Aprovado', bgColor: 'bg-emerald-50 border border-emerald-200', textColor: 'text-emerald-700' },
      documents_pending: { label: 'Docs. Pendentes', bgColor: 'bg-violet-50 border border-violet-200', textColor: 'text-violet-700' },
      documents_complete: { label: 'Docs. Completos', bgColor: 'bg-teal-50 border border-teal-200', textColor: 'text-teal-700' },
      admission_in_progress: { label: 'Em Admissão', bgColor: 'bg-indigo-50 border border-indigo-200', textColor: 'text-indigo-700' },
      admitted: { label: 'Admitido', bgColor: 'bg-emerald-100 border border-emerald-300', textColor: 'text-emerald-800' },
      rejected: { label: 'Reprovado', bgColor: 'bg-red-50 border border-red-200', textColor: 'text-red-700' },
      changes_requested: { label: 'Aguardando Candidato', bgColor: 'bg-orange-50 border border-orange-200', textColor: 'text-orange-700' },
    };
    return statusMap[status || 'pending'] || statusMap.pending;
  };

  const getEducationLabel = (level?: string) => {
    if (!level) return '-';
    const found = educationLevels.find(e => e.value === level);
    return found ? found.label : level;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-7 w-7 text-sky-600" />
            Talentos Cadastrados
          </h1>
          <p className="text-slate-500 mt-1">
            Encontre os melhores candidatos para suas vagas
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-slate-600">
            Total: <span className="font-semibold text-slate-900">{totalCount}</span> talentos
          </div>
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'cards' ? 'bg-sky-100 text-sky-700' : 'text-slate-400 hover:text-slate-600'}`}
              title="Visualização em cards"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-sky-100 text-sky-700' : 'text-slate-400 hover:text-slate-600'}`}
              title="Visualização em lista"
            >
              <LayoutList className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filtros Principais - 3 colunas de 1/3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Filtro por Vaga */}
        <div className="bg-white rounded-lg p-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Filtrar por Vaga
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <select
                value={selectedJobId}
                onChange={(e) => { setSelectedJobId(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
              >
                <option value="">Todas as vagas</option>
                {jobs.map(job => (
                  <option key={job.id} value={job.id}>
                    {job.title} {job.company_name ? `- ${job.company_name}` : ''}
                  </option>
                ))}
              </select>
            </div>
            {selectedJobId && (
              <button
                onClick={() => { setSelectedJobId(''); setCurrentPage(1); }}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                title="Limpar filtro"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Filtro por Status do Perfil */}
        <div className="bg-white rounded-lg p-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Status do Perfil
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <select
                value={profileStatus}
                onChange={(e) => { setProfileStatus(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 appearance-none cursor-pointer"
              >
                <option value="">Todos os status</option>
                {profileStatusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            {profileStatus && (
              <button
                onClick={() => { setProfileStatus(''); setCurrentPage(1); }}
                className="px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors"
                title="Limpar filtro"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>

        {/* Busca */}
        <div className="bg-white rounded-lg p-4">
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Buscar Talento
          </label>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-500" />
              <input
                type="text"
                placeholder="Nome, cargo, habilidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
            >
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Filtros Avançados */}
      <div className="bg-white rounded-lg p-4">
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 text-sm font-medium transition-colors ${
            showFilters
              ? 'text-sky-600'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Filter className="h-4 w-4" />
          {showFilters ? 'Ocultar filtros avançados' : 'Mostrar filtros avançados'}
        </button>

        {/* Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 mt-4 border-t border-slate-200">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Escolaridade
              </label>
              <select
                value={educationLevel}
                onChange={(e) => { setEducationLevel(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Todas</option>
                {educationLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Disponível para trabalho
              </label>
              <select
                value={availableForWork}
                onChange={(e) => { setAvailableForWork(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Aceita remoto
              </label>
              <select
                value={acceptsRemote}
                onChange={(e) => { setAcceptsRemote(e.target.value); setCurrentPage(1); }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Todos</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 border border-slate-300 text-slate-600 rounded-lg hover:bg-white transition-colors"
              >
                Limpar todos os filtros
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-400"></div>
        </div>
      ) : candidates.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-white rounded-lg">
          <Users className="h-16 w-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-slate-900 mb-2">Nenhum talento encontrado</h3>
          <p className="text-slate-500">
            Tente ajustar seus filtros ou volte mais tarde.
          </p>
        </div>
      ) : (
        /* Candidates Grid */
        viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className={`bg-white rounded-lg p-5 border transition-colors ${
                candidate.profile_status === 'awaiting_review'
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-200 hover:border-sky-400'
              }`}
            >
              {/* Notificação de perfil alterado */}
              {candidate.profile_status === 'awaiting_review' && (
                <Link
                  href={`/admin-panel/talentos/${candidate.id}`}
                  className="flex items-center gap-2 mb-3 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700 hover:bg-amber-100 transition-colors"
                >
                  <Bell className="h-4 w-4 flex-shrink-0 animate-pulse" />
                  <span><strong>Perfil alterado</strong> — candidato atualizou informações. Clique para revisar.</span>
                </Link>
              )}
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                  {candidate.image_profile ? (
                    <img
                      src={candidate.image_profile}
                      alt={`${candidate.user_name || ''}${candidate.user_last_name ? ` ${candidate.user_last_name}` : ''}`.trim() || 'Candidato'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (candidate.user_name || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {`${candidate.user_name || ''}${candidate.user_last_name ? ` ${candidate.user_last_name}` : ''}`.trim() || 'Nome não informado'}
                  </h3>
                  <p className="text-sm text-sky-600 truncate">
                    {candidate.current_position || 'Cargo não informado'}
                  </p>
                  {/* Badge de status do perfil */}
                  {(() => {
                    const statusInfo = getProfileStatusInfo(candidate.pipeline_status || candidate.profile_status);
                    return (
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                        {statusInfo.label}
                      </span>
                    );
                  })()}
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {candidate.city && candidate.state
                      ? `${candidate.city}, ${candidate.state}`
                      : 'Localização não informada'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {candidate.experience_years
                      ? `${candidate.experience_years} anos de experiência`
                      : 'Experiência não informada'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                  <span>{getEducationLabel(candidate.education_level)}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  candidate.available_for_work
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {candidate.available_for_work ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Disponível
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  candidate.accepts_remote_work
                    ? 'bg-sky-50 text-sky-700 border border-sky-200'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {candidate.accepts_remote_work ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Remoto
                </span>
              </div>

              {/* Processos Seletivos */}
              {candidate.selection_processes_summary && candidate.selection_processes_summary.length > 0 && (
                <div className="mb-4 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Processos Seletivos:</span>
                  <div className="flex flex-wrap gap-1">
                    {candidate.selection_processes_summary.slice(0, 3).map((sp) => {
                      const isActive = sp.status === 'pending' || sp.status === 'in_progress';
                      const colorClass = isActive
                        ? 'bg-sky-50 text-sky-700 border border-sky-200'
                        : sp.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sp.status === 'rejected'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-slate-100 text-slate-500 border border-slate-200';
                      return (
                        <span
                          key={sp.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${colorClass}`}
                          title={`${sp.process_title} — ${sp.current_stage_name || sp.status}`}
                        >
                          <ClipboardList className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{sp.process_title}</span>
                        </span>
                      );
                    })}
                    {candidate.selection_processes_summary.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-100 text-slate-500 border border-slate-200">
                        +{candidate.selection_processes_summary.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Candidaturas */}
              {candidate.applications_summary && candidate.applications_summary.length > 0 && (
                <div className="mb-4 space-y-2">
                  <span className="text-xs text-slate-400 font-medium">Candidaturas:</span>
                  <div className="flex flex-wrap gap-1">
                    {candidate.applications_summary.slice(0, 3).map((app) => {
                      const statusInfo = getStatusLabel(app.status);
                      return (
                        <span
                          key={app.id}
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${statusInfo.color}`}
                          title={`${app.job_title}${app.company_name ? ` - ${app.company_name}` : ''} (${statusInfo.label})`}
                        >
                          <FileText className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate max-w-[120px]">{app.job_title}</span>
                        </span>
                      );
                    })}
                    {candidate.applications_summary.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-slate-100 text-slate-500 border border-slate-200">
                        +{candidate.applications_summary.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action */}
              <Link
                href={`/admin-panel/talentos/${candidate.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-sm"
              >
                <Eye className="h-4 w-4" />
                Ver perfil completo
              </Link>
            </div>
          ))}
        </div>
        ) : (
        /* Candidates List/Table */
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wider">Talento</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wider">Cargo</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wider">Localização</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wider">Escolaridade</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wider">Experiência</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wider">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wider">Disponível</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-sky-600 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {candidates.map((candidate) => {
                  const statusInfo = getProfileStatusInfo(candidate.pipeline_status || candidate.profile_status);
                  const fullName = `${candidate.user_name || ''}${candidate.user_last_name ? ` ${candidate.user_last_name}` : ''}`.trim() || 'Nome não informado';
                  return (
                    <tr key={candidate.id} className={`transition-colors ${
                      candidate.profile_status === 'awaiting_review'
                        ? 'bg-amber-50/50 hover:bg-amber-50'
                        : 'hover:bg-slate-50'
                    }`}>
                      {/* Talento (foto + nome) */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-sky-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                              {candidate.image_profile ? (
                                <img
                                  src={candidate.image_profile}
                                  alt={fullName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                (candidate.user_name || '?').charAt(0).toUpperCase()
                              )}
                            </div>
                            {candidate.profile_status === 'awaiting_review' && (
                              <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center" title="Perfil alterado pelo candidato">
                                <Bell className="h-2.5 w-2.5 text-amber-900" />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <Link href={`/admin-panel/talentos/${candidate.id}`} className="font-medium text-slate-900 hover:text-sky-600 transition-colors">
                              {fullName}
                            </Link>
                            {candidate.profile_status === 'awaiting_review' && (
                              <p className="text-[11px] text-amber-600 font-medium">Perfil alterado — revisar</p>
                            )}
                          </div>
                        </div>
                      </td>
                      {/* Cargo */}
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {candidate.current_position || '-'}
                      </td>
                      {/* Localização */}
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {candidate.city && candidate.state
                          ? `${candidate.city}, ${candidate.state}`
                          : '-'
                        }
                      </td>
                      {/* Escolaridade */}
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {getEducationLabel(candidate.education_level)}
                      </td>
                      {/* Experiência */}
                      <td className="px-4 py-3 text-sm text-slate-500">
                        {candidate.experience_years ? `${candidate.experience_years} anos` : '-'}
                      </td>
                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                          {statusInfo.label}
                        </span>
                      </td>
                      {/* Disponível / Remoto */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                            candidate.available_for_work
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {candidate.available_for_work ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            Disp.
                          </span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${
                            candidate.accepts_remote_work
                              ? 'bg-sky-50 text-sky-700 border border-sky-200'
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}>
                            {candidate.accepts_remote_work ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            Rem.
                          </span>
                        </div>
                      </td>
                      {/* Ações */}
                      <td className="px-4 py-3 text-center">
                        <Link
                          href={`/admin-panel/talentos/${candidate.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors text-xs font-medium"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver perfil
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        )
      )}

      {/* Pagination */}
      {!loading && candidates.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-slate-600 px-4">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-slate-300 text-slate-600 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
