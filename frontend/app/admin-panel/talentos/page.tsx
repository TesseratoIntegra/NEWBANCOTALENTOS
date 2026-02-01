'use client';

import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Users, MapPin, Briefcase, GraduationCap, Check, X, ChevronLeft, ChevronRight, Eye, FileText } from 'lucide-react';
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

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [availableForWork, setAvailableForWork] = useState<string>('');
  const [acceptsRemote, setAcceptsRemote] = useState<string>('');
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Jobs for filter
  const [jobs, setJobs] = useState<Job[]>([]);

  const educationLevels = candidateService.getEducationLevels();

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
  }, [currentPage, searchTerm, educationLevel, availableForWork, acceptsRemote, selectedJobId]);

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
    setCurrentPage(1);
  };

  // Helper para obter label do status da candidatura
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      submitted: { label: 'Em análise', color: 'bg-amber-900/50 text-amber-300' },
      in_process: { label: 'Em processo', color: 'bg-blue-900/50 text-blue-300' },
      interview_scheduled: { label: 'Entrevista', color: 'bg-purple-900/50 text-purple-300' },
      approved: { label: 'Aprovado', color: 'bg-green-900/50 text-green-300' },
      rejected: { label: 'Reprovado', color: 'bg-red-900/50 text-red-300' },
      withdrawn: { label: 'Retirado', color: 'bg-zinc-700 text-zinc-400' },
    };
    return statusMap[status] || { label: status, color: 'bg-zinc-700 text-zinc-400' };
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
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Users className="h-7 w-7 text-indigo-400" />
            Talentos Cadastrados
          </h1>
          <p className="text-zinc-400 mt-1">
            Encontre os melhores candidatos para suas vagas
          </p>
        </div>
        <div className="text-zinc-300">
          Total: <span className="font-semibold text-white">{totalCount}</span> talentos
        </div>
      </div>

      {/* Filtros - Vaga e Busca lado a lado */}
      <div className="flex flex-col lg:flex-row gap-4 lg:items-start">
        {/* Filtro por Vaga - 35% */}
        <div className="lg:w-[35%] bg-zinc-800 rounded-lg p-4 flex gap-2">
          <div className="relative flex-1">
            <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <select
              value={selectedJobId}
              onChange={(e) => { setSelectedJobId(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
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
              className="px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
              title="Limpar filtro"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Search and Filters - 65% */}
        <div className="lg:w-[65%] bg-zinc-800 rounded-lg p-4 space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nome, cargo, habilidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              Buscar
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 border rounded-lg transition-colors flex items-center gap-2 ${
                showFilters
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-zinc-600 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              <Filter className="h-4 w-4" />
              Filtros
            </button>
          </form>

          {/* Filter Options */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-zinc-700">
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Escolaridade
                </label>
                <select
                  value={educationLevel}
                  onChange={(e) => { setEducationLevel(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todas</option>
                  {educationLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Disponível para trabalho
                </label>
                <select
                  value={availableForWork}
                  onChange={(e) => { setAvailableForWork(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1">
                  Aceita remoto
                </label>
                <select
                  value={acceptsRemote}
                  onChange={(e) => { setAcceptsRemote(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Todos</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-4 py-2 border border-zinc-600 text-zinc-300 rounded-lg hover:bg-zinc-700 transition-colors"
                >
                  Limpar filtros
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      ) : candidates.length === 0 ? (
        /* Empty State */
        <div className="text-center py-12 bg-zinc-800 rounded-lg">
          <Users className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-white mb-2">Nenhum talento encontrado</h3>
          <p className="text-zinc-400">
            Tente ajustar seus filtros ou volte mais tarde.
          </p>
        </div>
      ) : (
        /* Candidates Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((candidate) => (
            <div
              key={candidate.id}
              className="bg-zinc-800 rounded-lg p-5 border border-zinc-700 hover:border-indigo-500 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                  {candidate.image_profile ? (
                    <img
                      src={candidate.image_profile}
                      alt={candidate.user_name || 'Candidato'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    candidate.user_name?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white truncate">
                    {candidate.user_name || 'Nome não informado'}
                  </h3>
                  <p className="text-sm text-indigo-400 truncate">
                    {candidate.current_position || 'Cargo não informado'}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">
                    {candidate.city && candidate.state
                      ? `${candidate.city}, ${candidate.state}`
                      : 'Localização não informada'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Briefcase className="h-4 w-4 flex-shrink-0" />
                  <span>
                    {candidate.experience_years
                      ? `${candidate.experience_years} anos de experiência`
                      : 'Experiência não informada'
                    }
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <GraduationCap className="h-4 w-4 flex-shrink-0" />
                  <span>{getEducationLabel(candidate.education_level)}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  candidate.available_for_work
                    ? 'bg-green-900/50 text-green-300'
                    : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {candidate.available_for_work ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Disponível
                </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  candidate.accepts_remote_work
                    ? 'bg-blue-900/50 text-blue-300'
                    : 'bg-zinc-700 text-zinc-400'
                }`}>
                  {candidate.accepts_remote_work ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Remoto
                </span>
              </div>

              {/* Candidaturas */}
              {candidate.applications_summary && candidate.applications_summary.length > 0 && (
                <div className="mb-4 space-y-2">
                  <span className="text-xs text-zinc-500 font-medium">Candidaturas:</span>
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
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-zinc-700 text-zinc-400">
                        +{candidate.applications_summary.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action */}
              <Link
                href={`/admin-panel/talentos/${candidate.id}`}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
              >
                <Eye className="h-4 w-4" />
                Ver perfil completo
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && candidates.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-zinc-600 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-zinc-300 px-4">
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
      )}
    </div>
  );
}
