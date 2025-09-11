'use client'
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Clock, DollarSign, FileText, Target, CheckCircle, Loader } from 'lucide-react';
import Navbar from '@/components/Navbar';
import JobApplicationModal from '@/components/JobApplicationModal';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import CandidateService from '@/services/candidateService';
import ApplicationService from '@/services/applicationService';
import { CandidateProfile, Application } from '@/types';
import SplitText from '@/components/SliptText';
import { toast } from 'react-hot-toast';

// Types for job data
type JobData = {
  title: string;
  description: string;
  location: string;
  job_type: 'full_time' | 'part_time' | 'contract' | 'internship' | string;
  salary_range: string;
  requirements: string;
  responsibilities: string;
  created_at: string;
  updated_at: string;
  closure: string;
  company: number; // Company ID
};

type CompanyData = {
  id: number;
  name: string;
  cnpj: string;
  slug: string;
  group: number | null;
  logo?: string;
};

type CompanyGroupData = {
  id: number;
  name: string;
  description: string;
};

const JobListingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [jobData, setJobData] = useState<JobData | null>(null);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [companyGroupData, setCompanyGroupData] = useState<CompanyGroupData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [checkingApplication, setCheckingApplication] = useState<boolean>(false);
  const params = useParams();
  const id = (params as { id: string }).id;

  useEffect(() => {
    const fetchJobData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/jobs/${id}/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: JobData = await response.json();
        setJobData(data);

        // Buscar dados da empresa
        if (data.company) {
          try {
            const companyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/companies/${data.company}/`);
            if (companyResponse.ok) {
              const companyInfo: CompanyData = await companyResponse.json();
              setCompanyData(companyInfo);

              // Buscar dados do grupo empresarial se existir
              if (companyInfo.group) {
                try {
                  const groupResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/${process.env.NEXT_PUBLIC_API_VERSION}/company-groups/${companyInfo.group}/`);
                  if (groupResponse.ok) {
                    const groupInfo: CompanyGroupData = await groupResponse.json();
                    setCompanyGroupData(groupInfo);
                  }
                } catch (err) {
                  console.error('Erro ao buscar dados do grupo empresarial:', err);
                }
              }
            }
          } catch (err) {
            console.error('Erro ao buscar dados da empresa:', err);
          }
        }
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro desconhecido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchJobData();
  }, [id]);

  useEffect(() => {
    const fetchCandidateProfile = async () => {
      if (isAuthenticated && user?.user_type === 'candidate') {
        try {
          setProfileLoading(true);
          const profile = await CandidateService.getCandidateProfile();
          setCandidateProfile(profile);
        } catch (err) {
          console.error('Erro ao buscar perfil do candidato:', err);
          // Se não conseguir buscar o perfil, assume que não existe
          setCandidateProfile(null);
        } finally {
          setProfileLoading(false);
        }
      }
    };

    fetchCandidateProfile();
  }, [isAuthenticated, user]);

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (isAuthenticated && user?.user_type === 'candidate' && id) {
        try {
          setCheckingApplication(true);
          const applications = await ApplicationService.getMyApplications();
          
          // Verificar se é um array direto ou resposta paginada
          const applicationsList = Array.isArray(applications) 
            ? applications 
            : applications.results || [];
          
          // Verificar se existe candidatura para esta vaga específica
          const existingApplication = applicationsList.find((app: Application) => app.job === parseInt(id));
          setHasApplied(!!existingApplication);
        } catch (err) {
          console.error('Erro ao verificar candidatura existente:', err);
          setHasApplied(false);
        } finally {
          setCheckingApplication(false);
        }
      }
    };

    checkExistingApplication();
  }, [isAuthenticated, user, id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full_time': 'Tempo Integral',
      'part_time': 'Meio Período',
      'contract': 'Contrato',
      'internship': 'Estágio'
    };
    return types[type] || type;
  };

  const isProfileComplete = (profile: CandidateProfile | null): boolean => {
    if (!profile) return false;
    
    // Verificar se os campos essenciais estão preenchidos
    const requiredFields = [
      profile.cpf,
      profile.date_of_birth,
      profile.phone_secondary,
      profile.zip_code,
      profile.street,
      profile.number,
      profile.neighborhood,
      profile.education_level
    ];
    
    return requiredFields.every(field => field && field.toString().trim() !== '');
  };

  const handleApplicationSuccess = () => {
    setHasApplied(true);
  };

  const handleOpenApplicationModal = () => {
    if (hasApplied) {
      toast.error('Você já se candidatou a esta vaga.');
      return;
    }
    setShowApplicationModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Carregando informações da vaga...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
        <div className="text-center bg-white/40 backdrop-blur-sm rounded-md p-8 border border-zinc-500/50">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-400 text-2xl">⚠</span>
          </div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Erro ao carregar</h2>
          <p className="text-slate-600 mb-4">Não foi possível carregar os dados da vaga:</p>
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!jobData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Nenhum dado encontrado</p>
        </div>
      </div>
    );
  }

  const requirements = jobData.requirements ? jobData.requirements.split(', ') : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-200 to-white pt-16">
      {/* Header */}
      <Navbar/>

      {/* Main Content */}
      <main className="lg:max-w-[92%] mx-auto lg:px-6 lg:py-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details - Main Column */}
          <div className="lg:col-span-2 bg-white/40 backdrop-blur-sm border border-zinc-400 rounded-md p-4 pb-9 lg:p-6">
            {/* Job Title & Description */}
            <div className="bg-white/40 border border-zinc-400 px-4 pt-6 backdrop-blur-sm rounded-md">
              <div className="mb-6">
                <h2 className="text-3xl lg:text-4xl font-bold mb-3 text-blue-900 quicksand">
                  {jobData.title}
                </h2>
                <p className="text-slate-600 text-lg leading-relaxed quicksand">
                  {jobData.description}
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-2 bg-blue-900 pl-4 pr-6 py-2 rounded-full w-full lg:w-auto">
                  <MapPin className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-yellow-300">{jobData.location}</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-900 pl-4 pr-6 py-2 rounded-full w-full lg:w-auto">
                  <Clock className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-yellow-300">{getJobTypeLabel(jobData.job_type)}</span>
                </div>
                <div className="flex items-center space-x-2 bg-blue-900 pl-4 pr-6 py-2 rounded-full w-full lg:w-auto">
                  <DollarSign className="w-4 h-4 text-yellow-300" />
                  <span className="text-sm text-yellow-300">R$ {jobData.salary_range}</span>
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white/40 p-3 border border-zinc-400 backdrop-blur-sm rounded-md mt-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-3 flex items-center quicksand">
                <CheckCircle className="w-6 h-6 text-blue-500 mr-3" />
                Requisitos
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 bg-zinc-200 rounded-md border border-zinc-300/30 capitalize">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-700">{req}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="bg-white/40 border border-zinc-400 rounded-md p-3 backdrop-blur-sm mt-6">
              <h3 className="text-2xl font-bold text-blue-900 mb-3 flex items-center quicksand">
                <Target className="w-6 h-6 text-blue-500 mr-3" />
                Responsabilidades
              </h3>
              <div className="bg-zinc-200 rounded-md p-4 border border-zinc-300/30">
                <p className="text-slate-700 leading-relaxed">{jobData.responsibilities}</p>
              </div>
            </div>
          </div>



          {/* Sidebar */}
          <div className="space-y-6 lg:mx-0 mx-4">

            {/* Apply Button */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-950 rounded-md p-6 text-center sticky top-10 z-30 animate-fade">
              {!hasApplied && (
                <>
                  <SplitText
                    text="Interessado?"
                    className="text-2xl text-yellow-300 mb-2 quicksand"
                    delay={30}
                    duration={1}
                  />
                  <p className="text-slate-200 mb-6 text-sm animate-fade animate-delay-[300ms]">
                    Envie seu currículo e faça parte da equipe {companyGroupData?.name || companyData?.name || 'da empresa'}
                  </p>
                </>
              )}
              {isAuthenticated && user?.user_type === 'candidate' ? (
                profileLoading || checkingApplication ? (
                  <div className="w-full bg-zinc-200 text-zinc-500 font-bold py-3 px-6 rounded-md flex items-center justify-center">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    {profileLoading ? 'Verificando perfil...' : 'Verificando candidatura...'}
                  </div>
                ) : hasApplied ? (
                  <button 
                    disabled
                    className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-md cursor-not-allowed shadow-lg flex items-center justify-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Candidatura Enviada
                  </button>
                ) : isProfileComplete(candidateProfile) ? (
                  <button 
                    onClick={handleOpenApplicationModal}
                    className="w-full bg-yellow-300 text-blue-950 font-bold py-3 px-6 rounded-md hover:opacity-80 transition-colors duration-200 shadow-lg cursor-pointer"
                  >
                    Candidatar-se Agora
                  </button>
                ) : (
                  <button 
                    onClick={() => window.location.href = '/perfil'}
                    className="w-full bg-yellow-300 text-blue-950 font-bold py-3 px-6 rounded-md hover:opacity-80 transition-colors duration-200 shadow-lg cursor-pointer"
                  >
                    Preencha seu Perfil
                  </button>
                )
              ) : !isAuthenticated ? (
                <button 
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-yellow-300 text-blue-950 font-bold py-3 px-6 rounded-md hover:opacity-80 transition-colors duration-200 shadow-lg cursor-pointer"
                >
                  Fazer Login para Candidatar-se
                </button>
              ) : (
                <div className="w-full bg-zinc-200 text-zinc-500 font-bold py-3 px-6 rounded-md">
                  Disponível apenas para candidatos
                </div>
              )}
            </div>

            {/* Job Information */}
            <div className="bg-white/40 backdrop-blur-sm rounded-md p-6 border border-zinc-500/50 animate-fade animate-delay-[500ms]">
              <h3 className="text-xl font-bold text-blue-900 mb-6 flex items-center quicksand">
                <FileText className="w-5 h-5 text-blue-500 mr-2" />
                Informações da Vaga
              </h3>
              <div className="space-y-4">
                <div className="border-b border-zinc-300/50 pb-4">
                  <label className="text-sm text-slate-500 block mb-1">Publicado em</label>
                  <span className="text-blue-900 font-medium">{formatDate(jobData.created_at)}</span>
                </div>
                <div className="border-b border-zinc-300/50 pb-4">
                  <label className="text-sm text-slate-500 block mb-1">Atualizado em</label>
                  <span className="text-blue-900 font-medium">{formatDate(jobData.updated_at)}</span>
                </div>
                <div>
                  <label className="text-sm text-slate-500 block mb-1">Encerramento</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-red-500" />
                    <span className="text-blue-900 font-medium">{formatDate(jobData.closure)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white/40 backdrop-blur-sm rounded-md p-6 border border-zinc-500/50 animate-fade animate-delay-[700ms]">
              <h3 className="text-xl font-bold text-blue-900 mb-4 quicksand">Sobre a Empresa</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-slate-700 text-sm">
                    {companyGroupData?.name || companyData?.name || 'Carregando...'}
                  </span>
                </div>
                {companyGroupData && companyData && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-700 text-sm">{companyData.name}</span>
                  </div>
                )}
                {companyGroupData?.description && (
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-slate-700 text-sm">{companyGroupData.description}</span>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                  <span className="text-slate-700 text-sm">{jobData?.location || 'Localização não informada'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Job Application Modal */}
      {jobData && (
        <JobApplicationModal
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          jobId={parseInt(id)}
          jobTitle={jobData.title}
          companyName={companyGroupData?.name || companyData?.name || 'Empresa'}
          hasApplied={hasApplied}
          onApplicationSuccess={handleApplicationSuccess}
        />
      )}
    </div>
  );
};

export default JobListingPage;

