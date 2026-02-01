'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Search, Filter, Eye, Edit, Trash2, Users, Layers, X, ChevronLeft, ChevronRight } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import jobService from '@/services/jobService';
import { SelectionProcess, Job, PaginatedResponse } from '@/types';

export default function ProcessosSeletivosPage() {
  const [processes, setProcesses] = useState<SelectionProcess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [jobFilter, setJobFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Jobs for filter
  const [jobs, setJobs] = useState<Job[]>([]);

  const statusOptions = selectionProcessService.getStatusOptions();

  // Fetch jobs for filter
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

  const fetchProcesses = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: {
        page: number;
        status?: string;
        job?: number;
        search?: string;
      } = { page: currentPage };

      if (statusFilter) params.status = statusFilter;
      if (jobFilter) params.job = parseInt(jobFilter);
      if (searchTerm) params.search = searchTerm;

      const response: PaginatedResponse<SelectionProcess> = await selectionProcessService.getProcesses(params);

      setProcesses(response.results || []);
      setTotalCount(response.count || 0);
      setTotalPages(Math.ceil((response.count || 0) / 10));
    } catch (err) {
      console.error('Erro ao buscar processos:', err);
      setError('Erro ao carregar processos seletivos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, jobFilter, searchTerm]);

  useEffect(() => {
    fetchProcesses();
  }, [fetchProcesses]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setJobFilter('');
    setCurrentPage(1);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este processo seletivo?')) return;

    try {
      await selectionProcessService.deleteProcess(id);
      fetchProcesses();
    } catch (err) {
      console.error('Erro ao excluir processo:', err);
      alert('Erro ao excluir processo seletivo.');
    }
  };

  const getStatusInfo = (status: string) => {
    return selectionProcessService.getStatusLabel(status);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Processos Seletivos</h1>
          <p className="text-zinc-400 mt-1">
            Gerencie seus processos seletivos e acompanhe candidatos
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-zinc-300">
            Total: <span className="font-semibold text-white">{totalCount}</span>
          </span>
          <Link
            href="/admin-panel/processos-seletivos/novo"
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Novo Processo
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-zinc-800 rounded-lg p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </form>

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

          {/* Job Filter */}
          <div className="w-full lg:w-64">
            <select
              value={jobFilter}
              onChange={(e) => { setJobFilter(e.target.value); setCurrentPage(1); }}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Todas as vagas</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
          </div>

          {(statusFilter || jobFilter || searchTerm) && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
              title="Limpar filtros"
            >
              <X className="h-5 w-5" />
            </button>
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
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
        </div>
      ) : processes.length === 0 ? (
        <div className="bg-zinc-800 rounded-lg p-12 text-center">
          <Layers className="h-12 w-12 text-zinc-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Nenhum processo seletivo encontrado</h3>
          <p className="text-zinc-400 mb-4">
            {searchTerm || statusFilter || jobFilter
              ? 'Tente ajustar os filtros de busca.'
              : 'Crie seu primeiro processo seletivo para começar.'}
          </p>
          {!searchTerm && !statusFilter && !jobFilter && (
            <Link
              href="/admin-panel/processos-seletivos/novo"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              Criar Processo
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className="bg-zinc-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-700">
                <thead className="bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Processo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Vaga
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Etapas
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Candidatos
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-700">
                  {processes.map((process) => {
                    const statusInfo = getStatusInfo(process.status);
                    return (
                      <tr key={process.id} className="hover:bg-zinc-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <Link
                              href={`/admin-panel/processos-seletivos/${process.id}`}
                              className="text-white font-medium hover:text-indigo-400 transition-colors"
                            >
                              {process.title}
                            </Link>
                            {process.description && (
                              <p className="text-zinc-400 text-sm mt-1 line-clamp-1">
                                {process.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {process.job_title ? (
                            <span className="text-zinc-300">{process.job_title}</span>
                          ) : (
                            <span className="text-zinc-500 italic">Sem vaga</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                            {statusInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-zinc-300">{process.stages_count || 0}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex flex-col items-center">
                            <span className="text-zinc-300">{process.candidates_count || 0}</span>
                            {(process.candidates_approved || 0) > 0 && (
                              <span className="text-green-400 text-xs">
                                {process.candidates_approved} aprovados
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Link
                              href={`/admin-panel/processos-seletivos/${process.id}`}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-lg transition-colors"
                              title="Visualizar"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              href={`/admin-panel/processos-seletivos/${process.id}/editar`}
                              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-600 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDelete(process.id)}
                              className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-600 rounded-lg transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
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
    </div>
  );
}
