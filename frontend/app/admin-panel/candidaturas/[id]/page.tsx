'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import applicationService from '@/services/applicationService';
import candidateService from '@/services/candidateService';
import toast from 'react-hot-toast';

import { Application } from '@/types/index';

import type {
  CandidateProfile,
  CandidateEducation,
  CandidateExperience,
  CandidateLanguage,
  CandidateSkill
} from '@/types';


export default function ApplicationDetailPage() {
  const params = useParams();
  const [application, setApplication] = useState<Application | null>(null);
  const [candidata, setCandidata] = useState<CandidateProfile | null>(null);
  const [educations, setEducations] = useState<CandidateEducation[]>([]);
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [languages, setLanguages] = useState<CandidateLanguage[]>([]);
  const [detailedSkills, setDetailedSkills] = useState<CandidateSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  const applicationId = Array.isArray(params.id) ? params.id[0] : params.id;

  const formatDateToBrazilian = (dateString:string) => {
    if (!dateString) return 'Não informado';
    
    try {
      // Se a data já estiver no formato brasileiro, retorna como está
      if (dateString.includes('/')) return dateString;
      
      // Converte de yyyy-mm-dd para dd/mm/yyyy
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    } catch (error) {
      console.error(error);
      return 'Data inválida';
    }
  };

  const statusOptions = [
    { value: 'submitted', label: 'Em análise' },
    { value: 'in_process', label: 'Em processo seletivo' },
    { value: 'interview_scheduled', label: 'Entrevista agendada' },
    { value: 'approved', label: 'Aprovado' },
    { value: 'rejected', label: 'Reprovado' }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      submitted: 'bg-sky-50 text-sky-700 border border-sky-200',
      in_process: 'bg-amber-50 text-amber-700 border border-amber-200',
      interview_scheduled: 'bg-violet-50 text-violet-700 border border-violet-200',
      approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      rejected: 'bg-red-50 text-red-700 border border-red-200',
      withdrawn: 'bg-slate-100 text-slate-500 border border-slate-200'
    };
    return colors[status as keyof typeof colors] || 'bg-slate-100 text-slate-500 border border-slate-200';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      submitted: 'Em análise',
      in_process: 'Em processo seletivo',
      interview_scheduled: 'Entrevista agendada',
      approved: 'Aprovado',
      rejected: 'Reprovado',
      withdrawn: 'Retirado pelo candidato'
    };
    return labels[status as keyof typeof labels] || status;
  };

  useEffect(() => {
    const fetchApplication = async () => {
      if (!applicationId) return;
      try {
        setLoading(true);
        const data = await applicationService.getApplicationById(Number(applicationId));
        setApplication(data);
        if (data?.candidate) {
          const candidateId = Number(data.candidate_profile_id);
          const dataCandidate = await candidateService.getCandidateProfile(candidateId);
          setCandidata(dataCandidate);
          // Buscar arrays detalhados
          const [educationsData, experiencesData, skillsData, languagesData] = await Promise.all([
            candidateService.getCandidateEducations(candidateId).catch(() => ({ results: [] })),
            candidateService.getCandidateExperiences(candidateId).catch(() => ({ results: [] })),
            candidateService.getCandidateSkills(candidateId).catch(() => ({ results: [] })),
            candidateService.getCandidateLanguages(candidateId).catch(() => ({ results: [] }))
          ]);
          setEducations(educationsData.results || []);
          setExperiences(experiencesData.results || []);
          setDetailedSkills(skillsData.results || []);
          setLanguages(languagesData.results || []);
        }
      } catch (err) {
        setError('Erro ao carregar dados da candidatura');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [applicationId]);


  const handleStatusUpdate = async (newStatus: string, notes?: string) => {
    if (!application) return;

    try {
      setUpdateLoading(true);
      await applicationService.updateApplication(application.id, {
        status: newStatus as Application['status'],
        recruiter_notes: notes
      });
      
      setApplication(prev => prev ? { ...prev, status: newStatus as Application['status'], recruiter_notes: notes } : null);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      toast.error('Erro ao atualizar status da candidatura');
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const downloadResume = () => {
    if (application?.resume) {
      window.open(application.resume, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-slate-600">Carregando candidatura...</div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 space-y-4">
        <div className="text-red-600">{error || 'Candidatura não encontrada'}</div>
        <Link 
          href="/admin-panel/candidaturas"
          className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          Voltar para candidaturas
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link 
            href="/admin-panel/candidaturas"
            className="text-sky-600 hover:text-sky-500 text-sm mb-2 inline-block"
          >
            ← Voltar para candidaturas
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">
            Candidatura de {application.candidate_name || application.name}
          </h1>
          <p className="text-slate-500">
            {application.job_title} • {application.company_name}
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
          {getStatusLabel(application.status)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dados do Candidato */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-md p-6 border border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800 mb-4">Dados do Candidato</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Nome</label>
                <p className="text-slate-800">{application.candidate_name || application.name || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Telefone</label>
                <p className="text-slate-800">{application.phone || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Cidade</label>
                <p className="text-slate-800">{application.city || 'Não informado'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Estado</label>
                <p className="text-slate-800">{application.state || 'Não informado'}</p>
              </div>
              {application.linkedin && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-500 mb-1">LinkedIn</label>
                  <a 
                    href={application.linkedin} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:text-sky-500 break-all"
                  >
                    {application.linkedin}
                  </a>
                </div>
              )}
              {application.portfolio && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-500 mb-1">Portfólio</label>
                  <a 
                    href={application.portfolio} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sky-600 hover:text-sky-500 break-all"
                  >
                    {application.portfolio}
                  </a>
                </div>
              )}
              {application.salary_expectation && (
                <div>
                  <label className="block text-sm font-medium text-slate-500 mb-1">Pretensão Salarial</label>
                  <p className="text-slate-800">R$ {application.salary_expectation.toLocaleString('pt-BR')}</p>
                </div>
              )}
            </div>

            {/* Currículo */}
            {application.resume && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-500 mb-2">Currículo</label>
                <button
                  onClick={downloadResume}
                  className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Visualizar Currículo
                </button>
              </div>
            )}

            {/* Carta de Apresentação */}
            {application.cover_letter && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-500 mb-2">Carta de Apresentação</label>
                <div className="bg-slate-50 rounded-md p-4">
                  <p className="text-slate-800 whitespace-pre-wrap">{application.cover_letter}</p>
                </div>
              </div>
            )}

            {/* Observações do Candidato */}
            {application.observations && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-500 mb-2">Observações</label>
                <div className="bg-slate-50 rounded-md p-4">
                  <p className="text-slate-800 whitespace-pre-wrap">{application.observations}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-md p-6 border border-slate-200 max-w-full text-slate-900 min-h-70">
            {/* Dados detalhados do candidato */}
            {candidata && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Nome</label>
                  <p className="text-sky-500">{candidata.user_name || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Email</label>
                  <p className='text-sky-500'>{candidata.user_email || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">CPF</label>
                  <p className='text-sky-500'>{candidata.cpf || 'Não informado'}</p>
                </div>
                {/* Idade removida, não existe no tipo CandidateProfile */}
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Data de Nascimento</label>
                  <p className='text-sky-500'>
                    {formatDateToBrazilian(String(candidata.date_of_birth)) || 'Não informado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Gênero</label>
                  <p className='text-sky-500'>{candidata.gender || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Telefone Secundário</label>
                  <p className='text-sky-500'>{candidata.phone_secondary || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Cidade</label>
                  <p className='text-sky-500'>{candidata.city || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Estado</label>
                  <p className='text-sky-500'>{candidata.state || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">CEP</label>
                  <p className='text-sky-500'>{candidata.zip_code || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Endereço</label>
                  <p className='text-sky-500'>{candidata.street || ''} {candidata.number || ''} {candidata.complement || ''} {candidata.neighborhood || ''}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Resumo Profissional</label>
                  <p className='text-sky-500'>{candidata.professional_summary || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Cargo Atual</label>
                  <p className='text-sky-500'>{candidata.current_position || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Empresa Atual</label>
                  <p className='text-sky-500'>{candidata.current_company || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Nível de Escolaridade</label>
                  <p className='text-sky-500'>{candidata.education_level || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Anos de Experiência</label>
                  <p className='text-sky-500'>{candidata.experience_years || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Pretensão Salarial Mínima</label>
                  <p className='text-sky-500'>{candidata.desired_salary_min || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Pretensão Salarial Máxima</label>
                  <p className='text-sky-500'>{candidata.desired_salary_max || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Skills</label>
                  <p className='text-sky-500'>{candidata.skills || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Certificações</label>
                  <p className='text-sky-500'>{candidata.certifications || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">LinkedIn</label>
                  <p className='text-sky-500'>{candidata.linkedin_url || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">GitHub</label>
                  <p className='text-sky-500'>{candidata.github_url || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Portfólio</label>
                  <p className='text-sky-500'>{candidata.portfolio_url || 'Não informado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Disponível para trabalho</label>
                  <p className='text-sky-500'>{candidata.available_for_work ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Pode viajar</label>
                  <p className='text-sky-500'>{candidata.can_travel ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Aceita trabalho remoto</label>
                  <p className='text-sky-500'>{candidata.accepts_remote_work ? 'Sim' : 'Não'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Aceita mudança de cidade</label>
                  <p className='text-sky-500'>{candidata.accepts_relocation ? 'Sim' : 'Não'}</p>
                </div>
                <div className='col-span-2'>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Turno Preferido</label>
                  <p className='text-sky-500'>{candidata.preferred_work_shift || 'Não informado'}</p>
                </div>
             
                <div className='col-span-1'>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Educação</label>
                  {educations.length > 0 ? (
                    <ul className="list-disc ml-6">
                      {educations.map((edu: CandidateEducation) => (
                        <li key={edu.id} className="mb-2">
                          <div><span className="font-semibold">Instituição:</span> {edu.institution}</div>
                          <div><span className="font-semibold">Curso:</span> {edu.course}</div>
                          <div><span className="font-semibold">Grau:</span> {edu.degree}</div>
                          <div><span className="font-semibold">Início:</span> {formatDateToBrazilian(edu.start_date)}</div>
                          <div><span className="font-semibold">Fim:</span> {edu.end_date ? formatDateToBrazilian(edu.end_date) : (edu.is_current ? 'Cursando' : 'Não informado')}</div>
                          <div><span className="font-semibold">Descrição:</span> {edu.description}</div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sky-500">Não informado</p>}
                </div>
                <div className='col-span-1'>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Experiências</label>
                  {experiences.length > 0 ? (
                    <ul className="list-disc ml-6">
                      {experiences.map((exp: CandidateExperience) => (
                        <li key={exp.id} className="mb-2">
                          <div><span className="font-semibold">Empresa:</span> {exp.company}</div>
                          <div><span className="font-semibold">Cargo:</span> {exp.position}</div>
                          <div><span className="font-semibold">Início:</span> {formatDateToBrazilian(exp.start_date)}</div>
                          <div><span className="font-semibold">Fim:</span> {exp.end_date ? formatDateToBrazilian(exp.end_date) : (exp.is_current ? 'Atual' : 'Não informado')}</div>
                          <div><span className="font-semibold">Descrição:</span> {exp.description}</div>
                          {exp.achievements && <div><span className="font-semibold">Conquistas:</span> {exp.achievements}</div>}
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sky-500">Não informado</p>}
                </div>

                <div className='col-span-1'>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Skills Detalhadas</label>
                  {detailedSkills.length > 0 ? (
                    <ul className="list-disc ml-6">
                      {detailedSkills.map((skill: CandidateSkill) => (
                        <li key={skill.id} className="mb-2">
                          <div><span className="font-semibold">Skill:</span> {skill.skill_name}</div>
                          <div><span className="font-semibold">Nível:</span> {skill.level}</div>
                          <div><span className="font-semibold">Anos de experiência:</span> {skill.years_experience}</div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sky-500">Não informado</p>}
                </div>
                <div className='col-span-1'>
                  <label className="block text-sm font-medium mb-1 text-slate-600">Idiomas</label>
                  {languages.length > 0 ? (
                    <ul className="list-disc ml-6">
                      {languages.map((lang: CandidateLanguage) => (
                        <li key={lang.id} className="mb-2">
                          <div><span className="font-semibold">Idioma:</span> {lang.language}</div>
                          <div><span className="font-semibold">Proficiência:</span> {lang.proficiency}</div>
                          <div><span className="font-semibold">Certificado:</span> {lang.has_certificate ? `Sim (${lang.certificate_name})` : 'Não'}</div>
                        </li>
                      ))}
                    </ul>
                  ) : <p className="text-sky-500">Não informado</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Painel de Ações */}
        <div className="space-y-6">
          {/* Informações da Candidatura */}
          <div className="bg-white rounded-md p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Informações da Candidatura</h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-slate-500">Data da candidatura:</span>
                <p className="text-slate-800">{formatDate(application.applied_at)}</p>
              </div>
              {application.reviewed_at && (
                <div>
                  <span className="text-slate-500">Última análise:</span>
                  <p className="text-slate-800">{formatDate(application.reviewed_at)}</p>
                </div>
              )}
              {application.days_since_application !== undefined && (
                <div>
                  <span className="text-slate-500">Dias desde candidatura:</span>
                  <p className="text-slate-800">{application.days_since_application} dias</p>
                </div>
              )}
            </div>
          </div>

          {/* Alterar Status */}
          <div className="bg-white rounded-md p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Alterar Status</h3>
            <div className="space-y-3">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => handleStatusUpdate(option.value)}
                  disabled={updateLoading || application.status === option.value}
                  className={`w-full text-left px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    application.status === option.value
                      ? 'bg-sky-600 text-white cursor-default'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-200'
                  } ${updateLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Observações do Recrutador */}
          <div className="bg-white rounded-md p-6 border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Observações do Recrutador</h3>
            <textarea
              placeholder="Adicione suas observações sobre esta candidatura..."
              defaultValue={application.recruiter_notes || ''}
              onBlur={(e) => {
                if (e.target.value !== application.recruiter_notes) {
                  handleStatusUpdate(application.status, e.target.value);
                }
              }}
              className="w-full h-32 bg-slate-50 border border-slate-300 rounded-md px-3 py-2 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
