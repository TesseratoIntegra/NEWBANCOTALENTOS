'use client';

import { useState } from 'react';
import { Job } from '@/types/index';

interface JobFilters {
  dateRange: string;
  jobType: string;
  typeModels: string;
  isActive: string;
  location: string;
}

interface JobFiltersProps {
  jobs: Job[];
  onFiltersChange: (filteredJobs: Job[]) => void;
}

export default function JobFiltersComponent({ jobs, onFiltersChange }: JobFiltersProps) {
  const [filters, setFilters] = useState<JobFilters>({
    dateRange: '',
    jobType: '',
    typeModels: '',
    isActive: '',
    location: ''
  });

  const handleFilterChange = (key: keyof JobFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    applyFilters(newFilters);
  };

  const applyFilters = (currentFilters: JobFilters) => {
    let filteredJobs = [...jobs];

    // Filtro por data
    if (currentFilters.dateRange) {
      const now = new Date();
      const days = parseInt(currentFilters.dateRange);
      const dateThreshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      filteredJobs = filteredJobs.filter(job => 
        new Date(job.created_at) >= dateThreshold
      );
    }

    // Filtro por tipo de contrato
    if (currentFilters.jobType) {
      filteredJobs = filteredJobs.filter(job => job.job_type === currentFilters.jobType);
    }

    // Filtro por modalidade
    if (currentFilters.typeModels) {
      filteredJobs = filteredJobs.filter(job => job.type_models === currentFilters.typeModels);
    }

    // Filtro por status ativo/inativo
    if (currentFilters.isActive) {
      const isActive = currentFilters.isActive === 'true';
      filteredJobs = filteredJobs.filter(job => job.is_active === isActive);
    }

    // Filtro por localização
    if (currentFilters.location) {
      filteredJobs = filteredJobs.filter(job => 
        job.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }

    onFiltersChange(filteredJobs);
  };

  const clearFilters = () => {
    const emptyFilters = {
      dateRange: '',
      jobType: '',
      typeModels: '',
      isActive: '',
      location: ''
    };
    setFilters(emptyFilters);
    onFiltersChange(jobs);
  };

  // Obter valores únicos para os filtros
  const uniqueLocations = [...new Set(jobs.map(job => job.location))];
  const uniqueJobTypes = [...new Set(jobs.map(job => job.job_type))];
  const uniqueTypeModels = [...new Set(jobs.map(job => job.type_models))];

  const getJobTypeLabel = (type: string) => {
    const labels = {
      'full_time': 'Tempo Integral',
      'part_time': 'Meio Período',
      'contract': 'Contrato',
      'freelance': 'Freelance',
      'internship': 'Estágio'
    };
    return labels[type as keyof typeof labels] || type;
  };

  const getTypeModelsLabel = (type: string) => {
    const labels = {
      'in_person': 'Presencial',
      'home_office': 'Home Office',
      'hybrid': 'Híbrido'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 space-y-4">
      <div className="flex items-center justify-between">
        <button
          onClick={clearFilters}
          className="text-sm text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
        >
          Limpar Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Filtro por Data */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Período
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full bg-slate-100 border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
          >
            <option value="">Todos os períodos</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 3 meses</option>
            <option value="365">Último ano</option>
          </select>
        </div>

        {/* Filtro por Tipo de Contrato */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Tipo de Contrato
          </label>
          <select
            value={filters.jobType}
            onChange={(e) => handleFilterChange('jobType', e.target.value)}
            className="w-full bg-slate-100 border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
          >
            <option value="">Todos os tipos</option>
            {uniqueJobTypes.map(type => (
              <option key={type} value={type}>
                {getJobTypeLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Modalidade */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Modalidade
          </label>
          <select
            value={filters.typeModels}
            onChange={(e) => handleFilterChange('typeModels', e.target.value)}
            className="w-full bg-slate-100 border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
          >
            <option value="">Todas as modalidades</option>
            {uniqueTypeModels.map(type => (
              <option key={type} value={type}>
                {getTypeModelsLabel(type)}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por Status */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Status
          </label>
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value)}
            className="w-full bg-slate-100 border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
          >
            <option value="">Todos os status</option>
            <option value="true">Ativas</option>
            <option value="false">Inativas</option>
          </select>
        </div>

        {/* Filtro por Localização */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Localização
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full bg-slate-100 border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:ring-2 focus:ring-sky-500 focus:border-sky-400"
          >
            <option value="">Todas as localizações</option>
            {uniqueLocations.map(location => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
