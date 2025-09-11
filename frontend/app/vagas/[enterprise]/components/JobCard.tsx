
import { MapPin, Clock, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { jobService } from '@/services/jobService'
import { Job } from '@/types/index';

export const JobCard: React.FC<{ job: Job, company: string }> = ({ job, company }) => {
  const isExpired = jobService.isExpired(job.closure);
  
  // Calcular dias restantes para verificar se está encerrando em breve
  const closureDate = new Date(job.closure);
  const today = new Date();
  const daysRemaining = Math.ceil((closureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isClosingSoon = daysRemaining <= 3 && daysRemaining > 0;

  return (
    <Link href={`${company}/${job.id}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-blue-900 flex justify-start text-left mb-0 p-2 w-full h-16 place-items-center border-b border-blue-900/50">
           {job.title.length > 40 ? `${job.title.slice(0, 40)}...` : job.title}
          </h3>
        </div>
        <div className="flex flex-col gap-2 absolute right-0 bottom-6">
          <span className={`px-3 py-2 rounded-l-full text-sm font-medium ${
            job.job_type === 'full_time' ? 'bg-green-400/50 text-green-800' :
            job.job_type === 'part_time' ? 'bg-yellow-400/50 text-yellow-800' :
            job.job_type === 'contract' ? 'bg-blue-400/50 text-blue-800' :
            job.job_type === 'internship' ? 'bg-cyan-400/50 text-cyan-800' :
            'bg-purple-400/50 text-purple-800'
          }`}>
            {jobService.formatJobType(job.job_type)}
          </span>
          {isClosingSoon && (
            <span className="px-3 py-2 rounded-l-full text-xs font-medium bg-red-400 text-red-800">
              Encerrando em breve
            </span>
          )}
          {isExpired && (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-400/50 text-gray-800 border border-gray-400">
              Vencido
            </span>
          )}
        </div>
      </div>

      <p className="text-slate-700 mb-2 line-clamp-2 leading-relaxed">
        {job.description}
      </p>

      <div className="grid grid-cols-1 gap-2 mb-4">
        <div className="flex items-center gap-2 text-blue-800">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{job.location}</span>
        </div>
        <div className="flex items-center gap-2 text-blue-800">
          <span className="text-sm">{jobService.formatSalary(job.salary_range)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Aberto: {jobService.formatDate(job.created_at)}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">Fecha: {jobService.formatDate(job.closure)}</span>
        </div>
      </div>

      <div className="rounded-md col-span-3 text-blue-900 font-medium py-3 w-full flex justify-start place-items-center duration-300">
        <p className='flex place-items-center gap-2 group-hover:gap-3 duration-300'>Ver detalhes <ChevronRight className="w-4 h-4"/></p>
      </div>
    </Link>
  );
};