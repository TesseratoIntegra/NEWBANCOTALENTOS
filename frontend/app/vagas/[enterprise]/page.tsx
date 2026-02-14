'use client'
import React, { useState, useEffect } from 'react';
import { Job } from '@/types/index'
import { jobService } from '@/services/jobService';
import companyService from '@/services/companyService';
import { Search, Filter, Briefcase } from 'lucide-react';
import { JobCard } from '@/app/vagas/[enterprise]/components/JobCard'
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import LoadTesserato from '@/components/LoadTesserato';

// Componente principal
const JobsListingPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobType, setSelectedJobType] = useState<string>('');
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const params = useParams()
  const enterprise = params.enterprise as string

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // First get the company by slug
        const company = await companyService.getCompanyBySlug(enterprise);
        
        // Then get all jobs for that company
        const jobsResponse = await jobService.getJobsByCompany(company.id);
        setJobs(jobsResponse.results || []);

      } catch (err) {
        setError('Erro ao carregar as vagas. Tente novamente mais tarde.');
        console.error('Erro ao buscar jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [enterprise]);

  const filteredJobs = (jobs || []).filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesJobType = selectedJobType === '' || job.job_type === selectedJobType;
    return matchesSearch && matchesJobType;
  });

  const jobTypeOptions = [
    { value: '', label: 'Todos os tipos' },
    { value: 'full_time', label: 'Tempo Integral' },
    { value: 'part_time', label: 'Meio Período' },
    { value: 'contract', label: 'Contrato' },
    { value: 'freelance', label: 'Freelance' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
        <LoadTesserato/>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 rounded-md p-6 max-w-md mx-auto">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white pt-36 lg:pt-20">

      {/* Header */}
      <Navbar/>

      {/* Jobs Grid */}
      <main className="max-w-7xl lg:max-w-[93%] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:pt-4 mt-5 lg:mt-0 pb-32">

        <div className="lg:m-auto bg-zinc-100 border-blue-800 border w-[98%] lg:w-full h-12 rounded-md overflow-hidden lg:flex">
          <div className="flex h-full place-items-center text-blue-900">
            <Search className="text-slate-600 w-8 h-8 mr-[-2.3rem] pl-4 z-10" />
            <input 
              className='h-full pl-12 pr-1 w-96 outline-0 ring-0 bg-zinc-100 text-blue-900 placeholder-slate-500' 
              type="text" 
              placeholder="Buscar por título, descrição ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="ml-auto mr-[2px] flex place-items-center text-blue-900">
            <div className="lg:flex place-items-center w-full cursor-pointer">
              <Filter className="text-slate-600 w-5 h-5 mr-[-2rem] z-10 cursor-pointer" />
              <select
                className="pl-2 py-2 bg-zinc-100 border border-blue-800 rounded-md lg:rounded-md text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none min-w-[180px] text-center cursor-pointer"
                value={selectedJobType}
                onChange={(e) => setSelectedJobType(e.target.value)}
              >
                {jobTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-blue-900 mb-2">
              Nenhuma vaga encontrada
            </h3>
            <p className="text-slate-600">
              Tente ajustar seus filtros ou volte mais tarde para novas oportunidades.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredJobs.map(job => (
              <div key={job.id}                     
                onMouseEnter={() => setHoveredId(job.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                ${hoveredId !== null && hoveredId !== job.id ? 'opacity-60' : 'opacity-100'} bg-white/40 rounded-md border border-blue-900/50 shadow-lg px-6 pt-2 pb-4 hover:bg-white/60 transition-all duration-300 group relative cursor-pointer w-full`}>
              <JobCard key={job.id} job={job} company={enterprise} />
              </div>
            ))}
          </div>
        )}
      </main>
      {/* Modal de candidatura espontânea sempre aberto ao carregar a página */}
      
    </div>
  );
};

export default JobsListingPage;