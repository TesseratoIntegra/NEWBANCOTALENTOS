import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, DollarSign, Clock, Building2 } from 'lucide-react';
import { Job } from '@/types/index';

interface JobCardProps {
  job: Job;
  companyName: string;
}

const JobCard: React.FC<JobCardProps> = ({ job, companyName }) => {
  // Mapear tipos de trabalho para português
  const jobTypeMap = {
    'full_time': 'Tempo Integral',
    'part_time': 'Meio Período',
    'contract': 'Contrato',
    'freelance': 'Freelance',
    'internship': 'Estágio'
  };

  // Mapear modelos de trabalho para português
  const typeModelsMap = {
    'in_person': 'Presencial',
    'home_office': 'Home Office',
    'hybrid': 'Híbrido'
  };

  // Função para formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para calcular dias restantes
  const getDaysRemaining = (closureDate: string) => {
    const today = new Date();
    const closure = new Date(closureDate);
    const diffTime = closure.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = getDaysRemaining(job.closure);
  const isUrgent = daysRemaining <= 7;

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
      <div className="p-6">
        {/* Header da vaga */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            <div className="flex items-center text-gray-600 mb-2">
              <Building2 className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">{companyName}</span>
            </div>
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              <span className="text-sm">{job.location}</span>
            </div>
          </div>
          
          {/* Status urgente */}
          {isUrgent && daysRemaining > 0 && (
            <div className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-medium">
              Urgente
            </div>
          )}
          
          {daysRemaining <= 0 && (
            <div className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
              Encerrado
            </div>
          )}
        </div>

        {/* Descrição */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Informações da vaga */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {jobTypeMap[job.job_type as keyof typeof jobTypeMap]}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <DollarSign className="w-4 h-4 mr-2" />
            <span className="text-sm">R$ {job.salary_range}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {typeModelsMap[job.type_models as keyof typeof typeModelsMap]}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {daysRemaining > 0 
                ? `${daysRemaining} dias restantes`
                : 'Prazo encerrado'
              }
            </span>
          </div>
        </div>

        {/* Requisitos */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Requisitos:
          </h4>
          <p className="text-sm text-gray-600 line-clamp-2">
            {job.requirements}
          </p>
        </div>

        {/* Botão de ação */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            Publicado em {formatDate(job.created_at)}
          </span>
          <Link
            href={`/vagas/empresa/${job.id}`}
            className={`px-6 py-2 rounded-lg transition-colors text-sm font-medium ${
              daysRemaining <= 0
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {daysRemaining <= 0 ? 'Encerrado' : 'Ver Detalhes'}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
