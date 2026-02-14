'use client'
import dynamic from 'next/dynamic';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Search, MapPin, Clock, Monitor, Calendar, Filter, X, Smartphone, ArrowRight, Puzzle, RefreshCw, Database, Zap, Briefcase, BrainCircuit, Sparkles, BarChart3, TrendingUp } from 'lucide-react';
import Hero from '@/components/Hero';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import jobService from '@/services/jobService';
import companyService from '@/services/companyService';
import { Job, Company } from '@/types';
import JobApplicationModalStart from '@/components/JobApplicationModalStart';
import { useAuth } from '@/contexts/AuthContext';
const SplitText = dynamic(() => import('@/components/SliptText'), { ssr: false });
import ScrollReveal from '@/components/ScrollReveal';
import LoadTesserato from '@/components/LoadTesserato';

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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white">
      <Navbar/>
      
      {/* Hero Section */}
      <Hero/>

      {/* Integrations Strip */}
      <section className="py-14 px-4 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal animation="fadeInUp">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-5 py-2 mb-4">
                <Puzzle className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-slate-300 font-medium tracking-wide">Integrações</span>
              </div>
              <h2 className="text-2xl lg:text-4xl font-bold text-white mb-3 quicksand">
                Conectamos com seus sistemas
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Integração direta com ERPs e sistemas de gestão que sua empresa já utiliza.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-5xl mx-auto mb-12">
            {[
              { name: "Protheus", desc: "TOTVS Protheus", icon: Database, color: "from-blue-500 to-blue-600" },
              { name: "OpenAI", desc: "Insights com IA", icon: BrainCircuit, color: "from-emerald-500 to-teal-600" },
              { name: "API REST", desc: "Integração customizada", icon: Zap, color: "from-amber-500 to-amber-600" },
              { name: "ERP", desc: "Sistemas de gestão", icon: RefreshCw, color: "from-purple-500 to-purple-600" },
              { name: "RH", desc: "Folha e admissão", icon: Briefcase, color: "from-green-500 to-green-600" },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={150 * i} animation="fadeInUp">
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 text-center hover:bg-white/8 transition-all duration-300 group">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-white font-semibold text-sm quicksand mb-1">{item.name}</div>
                  <div className="text-slate-400 text-xs">{item.desc}</div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          {/* Highlight Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-5xl mx-auto">
            {/* Protheus highlight */}
            <ScrollReveal animation="fadeInLeft">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                    <Database className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white quicksand">Integração com Protheus</h3>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">
                  Sincronize vagas, candidatos e processos admissionais diretamente com o TOTVS Protheus.
                  Elimine retrabalho e mantenha seus dados unificados.
                </p>
                <a
                  href="https://wa.me/5516992416689?text=Olá! Gostaria de saber mais sobre a integração com Protheus."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  Saiba mais
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            </ScrollReveal>

            {/* OpenAI Insights highlight */}
            <ScrollReveal animation="fadeInRight">
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 h-full relative overflow-hidden">
                {/* Subtle AI glow */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white quicksand">Insights com OpenAI</h3>
                      <span className="text-[10px] text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">Powered by GPT</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-4">
                    Relatórios inteligentes gerados por IA. Analise gargalos no pipeline, taxas de conversão,
                    perfil dos candidatos e receba recomendações automáticas para otimizar seu recrutamento.
                  </p>
                  {/* Mini mockup - AI insights preview */}
                  <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2 text-[10px]">
                      <BrainCircuit className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Insight gerado pela IA</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed italic">
                      &ldquo;O gargalo principal está na etapa de Documentos Pendentes. 38% dos candidatos aprovados não avançam.
                      Recomendo automatizar o envio de lembretes via WhatsApp.&rdquo;
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <div className="flex items-center gap-1">
                        <BarChart3 className="w-3 h-3 text-blue-400" />
                        <span className="text-slate-500 text-[9px]">Relatórios</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-400" />
                        <span className="text-slate-500 text-[9px]">Conversões</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span className="text-slate-500 text-[9px]">Recomendações</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/8 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <ScrollReveal animation="fadeInUp">
            <h2 className="text-2xl lg:text-4xl font-bold text-white mb-4 quicksand">
              Pronto para transformar o recrutamento da sua empresa?
            </h2>
            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
              Agende uma demonstração e veja como o Banco de Talentos funciona na prática.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="https://wa.me/5511999999999?text=Olá! Gostaria de agendar uma demonstração do Banco de Talentos."
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-white px-8 py-4 rounded-xl text-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 quicksand font-bold"
              >
                <Smartphone className="w-5 h-5" />
                Fale Conosco
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <Link
                href="#avaliable"
                className="group glass text-slate-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/15 quicksand"
              >
                Ver Vagas Disponíveis
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Featured Jobs Section - Dark theme matching site */}
      <section className="pb-20 pt-16 px-4 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden" id="avaliable">
        <div className="absolute top-20 right-10 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <SplitText
              text="Vagas Disponíveis"
              className="text-2xl lg:text-4xl font-bold text-white mb-2 quicksand"
              delay={30}
              duration={0.6}
            />
            <ScrollReveal>
              <p className="text-lg text-slate-400 max-w-3xl mx-auto mb-1">
                Confira vagas reais publicadas por empresas que já usam a plataforma.
              </p>
              <p className="text-sm text-slate-500">
                {totalJobs} {totalJobs === 1 ? 'vaga disponível' : 'vagas disponíveis'}
              </p>
            </ScrollReveal>
          </div>

          {/* Main Content - Filters + Jobs */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar com Filtros */}
            <div className="lg:w-72 flex-shrink-0">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <button
                  onClick={() => setShowMobileFilters(!showMobileFilters)}
                  className="flex items-center space-x-2 bg-white/10 border border-white/10 text-slate-200 px-4 py-2.5 rounded-xl transition hover:bg-white/15"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros</span>
                  {showMobileFilters && <X className="w-4 h-4 ml-auto" />}
                </button>
              </div>

              {/* Filters Panel */}
              <div className={`
                lg:block bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 h-fit
                ${showMobileFilters ? 'block' : 'hidden'}
                lg:sticky lg:top-24
              `}>
                <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                  <h3 className="text-sm font-semibold text-yellow-400 quicksand uppercase tracking-wider">Filtros</h3>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="lg:hidden text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Filtro por empresa */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Empresa
                    </label>
                    <select
                      value={filters.company}
                      onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                    >
                      <option value="" className="bg-slate-900">Todas as empresas</option>
                      {(Array.isArray(companies) ? companies : []).map(company => (
                        <option key={company.id} value={company.id.toString()} className="bg-slate-900">
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por localização */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Localização
                    </label>
                    <select
                      value={filters.location}
                      onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                    >
                      <option value="" className="bg-slate-900">Todas as localizações</option>
                      {getUniqueLocations().map(location => (
                        <option key={location} value={location} className="bg-slate-900">
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por tipo de contrato */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Tipo de Contrato
                    </label>
                    <select
                      value={filters.jobType}
                      onChange={(e) => setFilters(prev => ({ ...prev, jobType: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                    >
                      <option value="" className="bg-slate-900">Todos os tipos</option>
                      <option value="full_time" className="bg-slate-900">Tempo Integral</option>
                      <option value="part_time" className="bg-slate-900">Meio Período</option>
                      <option value="internship" className="bg-slate-900">Estágio</option>
                      <option value="contract" className="bg-slate-900">Contrato</option>
                    </select>
                  </div>

                  {/* Filtro por modelo de trabalho */}
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                      Modelo de Trabalho
                    </label>
                    <select
                      value={filters.workModel}
                      onChange={(e) => setFilters(prev => ({ ...prev, workModel: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm"
                    >
                      <option value="" className="bg-slate-900">Todos os modelos</option>
                      <option value="in_person" className="bg-slate-900">Presencial</option>
                      <option value="home_office" className="bg-slate-900">Remoto</option>
                      <option value="hybrid" className="bg-slate-900">Híbrido</option>
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
                    className="w-full px-4 py-2.5 bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 text-slate-900 rounded-xl transition text-sm font-bold cursor-pointer quicksand"
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
                <div className="flex justify-center place-items-center items-center h-64">
                  <LoadTesserato />
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <p className="text-red-400 mb-4">{error}</p>
                  <button
                    onClick={() => loadAllJobs()}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl transition text-sm font-medium"
                  >
                    Tentar novamente
                  </button>
                </div>
              )}

              {/* Jobs Grid */}
              {!loading && !error && (
                <>
                  {jobs.length > 0 ? (
                    <div className="space-y-4">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Pesquise por título ou descrição..."
                          value={filters.search}
                          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 text-sm pl-11"
                        />
                        <Search className="absolute left-3.5 -translate-y-1/2 top-1/2 text-slate-500 w-4 h-4" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getCurrentPageJobs().map(job => {
                          const isClosingSoon = jobService.isClosingInDays(job.closure, 7);
                          const isExpired = jobService.isExpired(job.closure);

                          return (
                            <Link
                              key={job.id}
                              href={`${isAuthenticated ? `/vagas/${job.company}/${job.id}` : '/login'}`}
                              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 sm:p-6 transition-all duration-300 block hover:bg-white/8 hover:border-white/20 hover:shadow-xl hover:shadow-blue-500/5 group"
                            >
                              <div className="flex-1 min-w-0">
                                <h3 className="text-lg sm:text-xl font-semibold text-white quicksand break-words mb-2 group-hover:text-yellow-400 transition-colors">{job.title}</h3>

                                <p className="text-slate-400 mb-4 line-clamp-2 text-sm leading-relaxed">
                                  {job.description}
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm mb-4">
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    <Building2 className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                    <span className="truncate text-xs">{job.company_name || 'Empresa não informada'}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    <MapPin className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                    <span className="truncate text-xs">{job.location}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    <Clock className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                    <span className="truncate text-xs">{jobService.formatJobType(job.job_type)}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-slate-400">
                                    <Monitor className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                                    <span className="truncate text-xs">{jobService.formatWorkModel(job.type_models)}</span>
                                  </div>
                                </div>

                                {job.salary_range && (
                                  <div className="mb-4 flex items-center gap-2">
                                    <span className="text-xs text-slate-500">Salário:</span>
                                    <span className="text-yellow-400 font-semibold text-sm">{isAuthenticated ? job.salary_range : 'Faça login para ver'}</span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    {isExpired ? (
                                      <span className="px-2.5 py-1 bg-red-500/20 text-red-400 text-[10px] rounded-full font-medium">
                                        Expirada
                                      </span>
                                    ) : isClosingSoon ? (
                                      <span className="px-2.5 py-1 bg-yellow-400/20 text-yellow-400 font-bold text-[10px] rounded-full">
                                        Expira em breve
                                      </span>
                                    ) : (
                                      <span className="px-2.5 py-1 bg-green-500/20 text-green-400 text-[10px] rounded-full font-medium">
                                        Aberta
                                      </span>
                                    )}
                                    <div className="flex items-center gap-1 text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded-full">
                                      <Calendar className="w-3 h-3" />
                                      <span>Até {jobService.formatDate(job.closure)}</span>
                                    </div>
                                  </div>
                                  {isAuthenticated && user?.user_type === 'candidate' && !isExpired && (
                                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300">
                                      Candidatar-se
                                    </div>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16 flex items-center justify-center flex-col">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                        <Search className="w-8 h-8 text-slate-500" />
                      </div>
                      <p className="text-slate-300 text-lg font-medium quicksand">
                        Nenhuma vaga encontrada
                      </p>
                      <p className="text-slate-500 text-sm mt-2">
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