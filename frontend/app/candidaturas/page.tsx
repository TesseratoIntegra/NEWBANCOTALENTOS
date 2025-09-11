'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import SplitText from '@/components/SliptText';
import * as Icon from 'react-bootstrap-icons'
import { 
  Briefcase, 
  Calendar, 
  MapPin, 
  Building2, 
  Clock,
  Eye,
  Trash2,
  Loader2
} from 'lucide-react';
import applicationService from '@/services/applicationService';
import { Application } from '@/types';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const ApplicationsPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  //const [selectedStatus, setSelectedStatus] = useState('');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalApplications, setTotalApplications] = useState(0);

  // Carregar candidaturas
  const loadApplications = React.useCallback(async (page: number = 1) => {
    if (!isAuthenticated || user?.user_type !== 'candidate') {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const params: { page: number; status?: string } = { page };
      //if (selectedStatus) params.status = selectedStatus;

      const response = await applicationService.getMyApplications(params);
      
      // Verificar se a resposta é paginada ou um array direto
      if (Array.isArray(response)) {
        // Resposta direta (array)
        setApplications(response);
        setTotalApplications(response.length);
        setTotalPages(1); // Sem paginação
        setCurrentPage(1);
      } else {
        // Resposta paginada
        const results = response?.results || [];
        const count = response?.count || 0;
        
        setApplications(results);
        setTotalApplications(count);
        setTotalPages(Math.ceil(count / 20));
        setCurrentPage(page);
      }
    } catch (err) {
      setError('Erro ao carregar candidaturas. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user, 
    //selectedStatus
  ]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  useEffect(() => {
    if (currentPage === 1) {
      loadApplications(1);
    } else {
      setCurrentPage(1);
    }
  }, [
    //selectedStatus, 
    currentPage, loadApplications]);

  useEffect(() => {
    if (currentPage > 1) {
      loadApplications(currentPage);
    }
  }, [currentPage, loadApplications]);

  // Formatação de status
  const formatStatus = (status: string): { label: string; color: string } => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      submitted: { label: 'Em Análise', color: 'bg-yellow-600/80' },
      in_process: { label: 'Em Análise', color: 'bg-yellow-600/80' },
      interview_scheduled: { label: 'Em Análise', color: 'bg-yellow-600/80' },
      approved: { label: 'Em Análise', color: 'bg-yellow-600/80' },
      rejected: { label: 'Em Análise', color: 'bg-yellow-600/80' },
      withdrawn: { label: 'Retirada', color: 'bg-gray-600' }
    };
    return statusMap[status] || { label: status, color: 'bg-gray-600' };
  };

  // Formatação do tipo de trabalho
  const formatJobType = (jobType: string): string => {
    const typeMap: { [key: string]: string } = {
      'full-time': 'Tempo Integral',
      'part-time': 'Meio Período',
      'contract': 'Contrato',
      'temporary': 'Temporário',
      'internship': 'Estágio',
      'freelance': 'Freelance'
    };
    return typeMap[jobType] || jobType;
  };

  // Cancelar candidatura
  const handleWithdraw = async (applicationId: number) => {
    if (!confirm('Tem certeza que deseja retirar esta candidatura?')) {
      return;
    }

    try {
      await applicationService.deleteApplication(applicationId);
      loadApplications(currentPage);
    } catch (err) {
      console.error('Erro ao retirar candidatura:', err);
    }
  };

  // Componente de paginação
  const Pagination = () => (
    <div className="flex justify-center items-center space-x-4 mt-8">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-zinc-800 text-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition"
      >
        Anterior
      </button>
      <span className="text-zinc-300">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-zinc-800 text-slate-800 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition"
      >
        Próxima
      </button>
    </div>
  );

  // Verificar autenticação
  if (!isAuthenticated || user?.user_type !== 'candidate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex flex-col justify-center items-center">
        <Navbar />
        <main className="pt-24 pb-12">
          <div className="max-w-4xl mx-auto px-6 text-center flex flex-col justify-center items-center">
            <Icon.PersonLock className='w-12 h-12 text-blue-900'/>
            <h1 className="text-2xl font-bold text-blue-900 my-2">É necessário fazer Login</h1>
            <p className="text-slate-700 mb-7">
              Esta página é exclusiva para candidatos. Faça login como candidato para continuar.
            </p>
            <Link
              href="/login"
              className="bg-gradient-to-r from-yellow-400 to-yellow-300 hover:opacity-70 text-slate-900 px-6 py-3 rounded-md transition font-semibold"
            >
              Fazer Login
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8">
            <SplitText
              text="Minhas Candidaturas"
              className="text-3xl lg:text-4xl text-blue-900 mb-2 quicksand"
              delay={30}
              duration={1}
            />
            <p className="text-slate-600">
              {totalApplications} {totalApplications === 1 ? 'candidatura encontrada' : 'candidaturas encontradas'}
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
              <span className="ml-2 text-slate-700">Carregando candidaturas...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => loadApplications(currentPage)}
                className="bg-blue-600 hover:bg-blue-700 text-yellow-400 px-4 py-2 rounded-md transition"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Applications List */}
          {!loading && !error && (
            <>
              {applications && applications.length > 0 ? (
                <>
                  <div className="space-y-6 2xl:min-h-[50vh]">
                    {applications.map(application => {
                      const statusInfo = formatStatus(application.status);

                      return (
                        <div 
                          key={application.id}
                          className="bg-white/40 backdrop-blur-sm border border-blue-900/50 rounded-md p-6"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                                {application.job_title || 'Vaga não encontrada'}
                              </h3>
                              <div className="flex items-center space-x-4 text-sm text-slate-600 mb-3">
                                <div className="flex items-center space-x-1">
                                  <Building2 className="w-4 h-4" />
                                  <span>{application.company_name || 'Empresa não encontrada'}</span>
                                </div>
                                {application.job_location && (
                                  <div className="flex items-center space-x-1">
                                    <MapPin className="w-4 h-4" />
                                    <span>{application.job_location}</span>
                                  </div>
                                )}
                                {application.job_type && (
                                  <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{formatJobType(application.job_type)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-xs text-slate-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-3 h-3" />
                                  <span>Candidatou-se em {new Date(application.applied_at).toLocaleDateString('pt-BR')}</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <span className={`px-3 py-1 text-white text-sm rounded-full ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </div>
                          </div>

                          {application.cover_letter && (
                            <div className="mb-4">
                              <p className="text-sm text-slate-600 mb-1">Carta de apresentação:</p>
                              <p className="text-slate-700 text-sm leading-relaxed">
                                {application.cover_letter}
                              </p>
                            </div>
                          )}

                          <div className="flex justify-between items-center">
                            <div className="flex space-x-3">
                              {application.job && (
                                <Link
                                  href={`/vagas/empresa/${application.job}`}
                                  className="inline-flex items-center space-x-1 text-blue-800 hover:text-blue-900 text-sm transition"
                                >
                                  <Eye className="w-4 h-4" />
                                  <span>Ver detalhes da vaga</span>
                                </Link>
                              )}
                            </div>
                            
                            {(application.status === 'submitted' || application.status === 'in_process') && (
                              <button
                                onClick={() => handleWithdraw(application.id)}
                                className="inline-flex items-center space-x-1 text-red-600 hover:text-red-400 text-sm transition cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                                <span>Retirar candidatura</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {totalPages > 1 && <Pagination />}
                </>
              ) : (
                <div className="text-center py-12 lg:min-h-[50vh] 2xl:min-h-[55vh] flex flex-col justify-center items-center">
                  <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">
                    Nenhuma candidatura encontrada
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Você ainda não se candidatou a nenhuma vaga. Explore as oportunidades disponíveis!
                  </p>
                  <Link
                    href="/#vagas"
                    className="bg-gradient-to-r from-yellow-400 to-yellow-300 hover:opacity-70 text-slate-900 px-6 py-3 rounded-md transition font-semibold"
                  >
                    Ver Vagas Disponíveis
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      <Footer/>
    </div>
  );
};

export default ApplicationsPage;
