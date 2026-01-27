'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronRight, Building2, Search, Zap, MapPin, Clock, Monitor, Calendar, Filter, X } from 'lucide-react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import jobService from '@/services/jobService';
import companyService from '@/services/companyService';
import { Job, Company } from '@/types';
import JobApplicationModalStart from '@/components/JobApplicationModalStart';
import { useAuth } from '@/contexts/AuthContext';
import SplitText from '@/components/SliptText';
import ScrollReveal from '@/components/ScrollReveal';
import LoadChiap from '@/components/LoadChiap';

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Filtros
  const [filters, setFilters] = useState({
    company: '',
    location: '',
    jobType: '',
    workModel: '',
    search: ''
  });
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  /* Candidatura Espontânea - DESATIVADA TEMPORARIAMENTE
  useEffect(() => {
    async function checkSpontaneousApplication() {
      if (isAuthenticated && user?.user_type === 'candidate') {
        // Chama o serviço para buscar candidaturas espontâneas do usuário
        const response = await import('@/services/spontaneousService').then(mod => mod.default.getMySpontaneousApplications());
          // Se não houver candidaturas (array vazio ou objeto vazio), exibe o modal após 3s
          const isEmpty =
            (Array.isArray(response) && response.length === 0) ||
            (response && Array.isArray(response.results) && response.results.length === 0);
          if (isEmpty) {
            const timer = setTimeout(() => setShowModal(true), 3000);
            return () => clearTimeout(timer);
          } else {
            setShowModal(false);
          }
      } else {
        setShowModal(false);
      }
    }
    checkSpontaneousApplication();
  }, [isAuthenticated, user]);
  */

  // Função para carregar todas as empresas (sem paginação)
  const loadCompanies = async () => {
    try {
      const companiesList = await companyService.getAllCompanies();
      setCompanies(Array.isArray(companiesList) ? companiesList : []);
    } catch (err) {
      console.error('Erro ao carregar empresas:', err);
    }
  };

  // Função para carregar todas as vagas (para filtros)
  const loadAllJobs = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const allJobsData = await jobService.getJobs();
      const jobsArray = Array.isArray(allJobsData?.results) ? allJobsData.results : [];
      setAllJobs(jobsArray);
      setJobs(jobsArray);
      setTotalJobs(Array.isArray(jobsArray) ? jobsArray.length : 0);
    } catch (err) {
      setError('Erro ao carregar todas as vagas. Tente novamente.');
      console.error('Erro ao carregar todas as vagas:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Função para aplicar filtros
  const applyFilters = React.useCallback(() => {
    let filtered = allJobs;

    // Filtro por status ativo (sempre aplicado)
    filtered = filtered.filter(job => job.is_active === true);

    // Filtro por vagas não expiradas
    filtered = filtered.filter(job => !jobService.isExpired(job.closure));

    // Filtro por empresa
    if (filters.company) {
      filtered = filtered.filter(job => job.company.toString() === filters.company);
    }

    // Filtro por localização
    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Filtro por tipo de trabalho
    if (filters.jobType) {
      filtered = filtered.filter(job => job.job_type === filters.jobType);
    }

    // Filtro por modelo de trabalho
    if (filters.workModel) {
      filtered = filtered.filter(job => job.type_models === filters.workModel);
    }

    // Filtro por busca de texto
    if (filters.search) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    setJobs(filtered);
    setTotalJobs(Array.isArray(filtered) ? filtered.length : 0);
    setCurrentPage(1);
  }, [allJobs, filters]);

  // Aplicar filtros quando mudarem
  useEffect(() => {
    if (Array.isArray(allJobs) && allJobs.length > 0) {
      applyFilters();
    }
  }, [filters, allJobs, applyFilters]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadAllJobs();
    loadCompanies();
  }, [loadAllJobs]);

  // Obter localizações únicas
  const getUniqueLocations = (): string[] => {
    if (!Array.isArray(allJobs)) return [];
    const locations = allJobs.map(job => job.location);
    return [...new Set(locations)].sort();
  };

  // Obter vagas da página atual
  const getCurrentPageJobs = (): Job[] => {
    const itemsPerPage = 20;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    // Filtra jobs expiradas antes de paginar
    const validJobs = Array.isArray(jobs)
      ? jobs.filter(job => !jobService.isExpired(job.closure))
      : [];
    return validJobs.slice(startIndex, endIndex);
  };

  // Mock data para as features da plataforma
  const featuresData = [
    {
      icon: Search,
      title: "Busca Inteligente",
      description: "Sistema avançado de busca que conecta perfis e vagas com base em compatibilidade real, não apenas palavras-chave."
    },
    {
      icon: Building2,
      title: "Empresas Premium",
      description: "Parceria com as melhores empresas do mercado, oferecendo oportunidades exclusivas e de alta qualidade."
    },
    {
      icon: Zap,
      title: "Processo Ágil",
      description: "Candidature-se com apenas alguns cliques e acompanhe o status das suas aplicações em tempo real."
    }
  ];

  // Mock data para os passos "Como funciona"
  const howItWorksData = [
    {
      step: 1,
      title: "Explore Empresas",
      description: "Navegue por nossa rede de empresas e descubra oportunidades que combinam com seu perfil."
    },
    {
      step: 2,
      title: "Candidate-se",
      description: "Aplique-se às vagas que se alinham com seus objetivos e competências com apenas alguns cliques."
    },
    {
      step: 3,
      title: "Conquiste sua Vaga",
      description: "Acompanhe o status das suas candidaturas para conquistar sua próxima oportunidade."
    }
  ];

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white">
      <Navbar/>
      
      {/* Hero Section */}
      <Hero/>

      {/* Features Section */}
      <section className="pt-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
              <SplitText
                text="Por que escolher nossa plataforma?"
                className="text-2xl lg:text-4xl font-bold text-blue-900 mb-2 quicksand"
                delay={30}
                duration={0.6}
              />
              <ScrollReveal>
                <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                  Oferecemos uma experiência completa e diferenciada para conectar os melhores talentos às empresas mais inovadoras do mercado.
                </p>
              </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <ScrollReveal delay={400 * index} key={index}>
                <div className=" px-6 py-6 rounded-md border-blue-900/50 border duration-300 hover:transform hover:-translate-y-2">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-800 to-blue-900 rounded-md flex items-center justify-center mb-3 transition-transform">
                    <IconComponent className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-1 quicksand">{feature.title}</h3>
                  <p className="text-slate-800 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="pt-16 pb-10 mt-20 px-4 border-t border-blue-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6">
            <SplitText
              text="Como funciona"
              className="text-2xl lg:text-4xl font-bold text-blue-900 mb-2 quicksand"
              delay={30}
              duration={0.6}
            />
            <ScrollReveal>
            <p className="text-lg text-slate-600 max-w-7xl mx-auto">
              Um processo simples e eficiente para conectar você às melhores oportunidades do mercado.
            </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorksData.map((item, index) => (
              <ScrollReveal delay={400 * index} key={index}>
              <div className={`relative ${index === howItWorksData.length - 1 ? '' : ''}`}>
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-800 to-blue-900 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-100 font-bold text-2xl">
                    {item.step}
                  </div>
                  <h3 className="text-2xl font-bold text-blue-900 mb-1 quicksand">{item.title}</h3>
                  <p className="text-slate-600" id='avaliable'>
                    {item.description}
                  </p>
                </div>
                {index < howItWorksData.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-[1.9rem] transform -translate-y-1/2 text-blue-500">
                    <ChevronRight className="w-8 h-8" />
                  </div>
                )}
              </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section - All Jobs with Filters */}
      <section className="pb-20 pt-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-4">
            <SplitText
              text="Vagas Disponíveis"
              className="text-2xl lg:text-4xl font-bold text-blue-900 mb-2 quicksand"
              delay={30}
              duration={0.6}
            />
            <ScrollReveal>
              <p className="text-lg text-slate-600 max-w-3xl mx-auto">
                {totalJobs} {totalJobs === 1 ? 'vaga disponível' : 'vagas disponíveis'}
              </p>
            </ScrollReveal>
          </div>

          {/* Main Content - Filters + Jobs */}
          <div className="flex flex-col lg:flex-row gap-8 p-4 rounded-md border border-slate-400">
            {/* Sidebar com Filtros */}
            <div className="lg:w-80 flex-shrink-0">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex items-center space-x-2 bg-zinc-100 hover:bg-zinc-700 text-blue-900 px-4 py-2 rounded-md transition"
                >
                  <Filter className="w-4 h-4" />
                  <span>Filtros</span>
                  {showMobileFilters && <X className="w-4 h-4" />}
                </button>
              </div>

              {/* Filters Panel */}
              <div className={`
                lg:block bg-blue-900 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-6 h-fit
                ${showMobileFilters ? 'block' : 'hidden'}
                lg:sticky lg:top-24
              `}>
                <div className="flex items-center justify-between lg:justify-start mb-4 border-b border-yellow-300">
                  <h3 className="text-lg font-semibold text-yellow-300 quicksand">Filtros</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden text-slate-600 hover:text-blue-900"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="space-y-4">

                  {/* Filtro por empresa */}
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      Empresa
                    </label>
                    <select
                      value={filters.company}
                      onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-100 border border-zinc-600 rounded-md text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Todas as empresas</option>
                      {(Array.isArray(companies) ? companies : []).map(company => (
                        <option key={company.id} value={company.id.toString()}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por localização */}
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      Localização
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-100 border border-zinc-600 rounded-md text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Todas as localizações</option>
                      {getUniqueLocations().map(location => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por tipo de contrato */}
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      Tipo de Contrato
                    </label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-100 border border-zinc-600 rounded-md text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Todos os tipos</option>
                      <option value="full_time">Tempo Integral</option>
                      <option value="part_time">Meio Período</option>
                      <option value="internship">Estágio</option>
                      <option value="contract">Contrato</option>
                    </select>
                  </div>

                  {/* Filtro por modelo de trabalho */}
                  <div>
                    <label className="block text-sm font-medium text-slate-100 mb-2">
                      Modelo de Trabalho
                    </label>
                    <select
                      value={filters.workModel}
                      onChange={(e) => setFilters(prev => ({ ...prev, workModel: e.target.value }))}
                      className="w-full px-3 py-2 bg-zinc-100 border border-zinc-600 rounded-md text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    >
                      <option value="">Todos os modelos</option>
                      <option value="in_person">Presencial</option>
                      <option value="home_office">Remoto</option>
                      <option value="hybrid">Híbrido</option>
                    </select>
                  </div>

                  {/* Botão para limpar filtros */}
                  <button
                    onClick={() => setFilters({
                      company: '',
                      location: '',
                      jobType: '',
                      workModel: '',
                      search: ''
                    })}
                    className="w-full px-4 py-2 bg-yellow-300 hover:opacity-80 text-blue-950 rounded-md transition text-sm font-medium cursor-pointer"
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">
              {/* Loading */}
              {loading && (
                <div className="flex justify-center place-items-center items-center h-full">
                  <LoadChiap></LoadChiap>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => loadAllJobs()}
                    className="bg-blue-900 hover:bg-blue-800 text-slate-100 px-4 py-2 rounded-md transition"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Jobs Grid */}
              {!loading && !error && (
                <>
                  {jobs.length > 0 ? (
                    <>
                      <div className="space-y-4 mb-8">
                        <div className='relative'>
                        <input
                          type="text"
                          placeholder="Pesquise por título ou descrição..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="w-full px-3 py-3 bg-white border border-zinc-500 rounded-md text-zinc-500 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pl-11"
                        />
                        <Search className='absolute left-3 -translate-y-1/2 top-1/2 text-zinc-500'/>
                        </div>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                        {getCurrentPageJobs().map(job => {
                          const isClosingSoon = jobService.isClosingInDays(job.closure, 7);
                          const isExpired = jobService.isExpired(job.closure);

                          return (
                            <Link 
                              key={job.id} 
                              href={`${isAuthenticated ? `/vagas/${job.company}/${job.id}` : '/login'}`} 
                              className='bg-white/40 backdrop-blur-sm border border-zinc-700/50 rounded-md p-4 sm:p-6 transition-all duration-300 block hover:scale-102'
                            >
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xl sm:text-2xl font-semibold text-blue-900 quicksand break-words">{job.title}</h3>
                                  
                                    <p className="text-zinc-700 mb-4 line-clamp-3 text-sm sm:text-base">
                                      {job.description}
                                    </p>

                                    <div className="grid grid-cols-1 md:grid-cols-2 text-sm text-slate-600">
                                      <div className="flex items-center gap-1">
                                        <Building2 className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{job.company_name || 'Empresa não informada'}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <MapPin className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{job.location}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 md:mt-2">
                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{jobService.formatJobType(job.job_type)}</span>
                                      </div>
                                      <div className="flex items-center space-x-1 md:mt-2">
                                        <Monitor className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{jobService.formatWorkModel(job.type_models)}</span>
                                      </div>
                                    </div>

                                      <div className="flex place-items-center space-x-2 flex-shrink-0 mt-5">
                                        {isExpired ? (
                                          <span className="px-3 py-1 bg-red-600 text-white text-xs rounded-full whitespace-nowrap">
                                            Expirada
                                          </span>
                                        ) : isClosingSoon ? (
                                          <span className="px-3 py-1 bg-yellow-300 text-blue-900 font-bold text-xs rounded-full whitespace-nowrap h-full">
                                            Expira em breve
                                          </span>
                                        ) : (
                                          <span className="px-3 py-1 bg-green-600 text-white text-xs rounded-full whitespace-nowrap">
                                            Aberta
                                          </span>
                                        )}
                                        <div className="flex place-items-center space-x-1 text-xs text-zinc-600 bg-zinc-200 px-2 py-1 rounded-full">
                                          <Calendar className="w-3 h-3" />
                                          <span className="whitespace-nowrap">Até {jobService.formatDate(job.closure)}</span>
                                        </div>
                                      </div>
                                      
                                  </div>
                                </div>

                              {job.salary_range && (
                                <div className="mb-4">
                                  <span className="text-sm text-slate-600">Salário: </span>
                                  <span className="text-blue-800 font-semibold text-sm sm:text-base">{isAuthenticated ? job.salary_range : 'Faça seu login para visualizar'}</span>
                                </div>
                              )}

                              <div className="flex justify-between items-center">
                                {isAuthenticated && user?.user_type === 'candidate' && !isExpired && (
                                  <div
                                    className="bg-blue-900 hover:bg-blue-900/80 text-yellow-300 px-3 sm:px-4 py-2 rounded-md text-sm duration-300 transition cursor-pointer"
                                  >
                                    Candidatar-se
                                  </div>
                                )}
                              </div>
                            </Link>
                          );
                        })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 h-full flex place-items-center items-center justify-center flex-col">
                      <p className="text-slate-600 text-lg">
                        Nenhuma vaga encontrada com os filtros selecionados.
                      </p>
                      <p className="text-zinc-500 text-sm mt-2">
                        Tente ajustar os filtros para ver mais resultados.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Candidatura Espontânea Modal - DESATIVADO TEMPORARIAMENTE
      {isAuthenticated && user?.user_type === 'candidate' && <JobApplicationModalStart show={showModal} onClose={() => setShowModal(false)} />}
      */}

    </div>
  );
};

export default Home;