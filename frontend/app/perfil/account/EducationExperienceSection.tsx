'use client';

import { useState } from 'react';
import { CandidateEducation, CandidateExperience } from '@/types';
import EducationSection from './EducationSection';
import ExperienceSection from './ExperienceSection';
import { ArrowLeft, ArrowRight } from 'react-bootstrap-icons';
import { useAuth } from '@/contexts/AuthContext';

export interface EducationExperienceSectionProps {
  educations: CandidateEducation[];
  experiences: CandidateExperience[];
  onUpdateEducations: (educations: CandidateEducation[]) => void;
  onUpdateExperiences: (experiences: CandidateExperience[]) => void;
}

export default function EducationExperienceSection({
  educations,
  experiences,
  onUpdateEducations,
  onUpdateExperiences,
}: EducationExperienceSectionProps) {
  const { setCurrentStep } = useAuth();
  const [activeTab, setActiveTab] = useState<'education' | 'experience'>('education');

  return (
    <div className="lg:p-6">
      <h2 className="text-center lg:text-right text-xl lg:text-2xl font-bold text-blue-900 mb-6">
        Formação e Experiência
      </h2>

      {/* Abas */}
      <div className="flex border-b border-slate-300 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('education')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors cursor-pointer ${
            activeTab === 'education'
              ? 'text-blue-900 border-b-2 border-blue-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Formação Acadêmica
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('experience')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors cursor-pointer ${
            activeTab === 'experience'
              ? 'text-blue-900 border-b-2 border-blue-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Experiência Profissional
        </button>
      </div>

      {/* Conteúdo da aba ativa */}
      {activeTab === 'education' ? (
        <EducationSection educations={educations} onUpdate={onUpdateEducations} />
      ) : (
        <ExperienceSection experiences={experiences} onUpdate={onUpdateExperiences} />
      )}

      {/* Navegação */}
      <div className="flex justify-center lg:justify-end pt-6 border-t border-zinc-400 mt-6">
        <div
          onClick={() => setCurrentStep(1)}
          className="mr-auto bg-blue-900 hover:bg-blue-800 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </div>
        <div
          onClick={() => setCurrentStep(3)}
          className="bg-blue-900 hover:bg-blue-800 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
        >
          Próximo
          <ArrowRight className="h-4 w-4 ml-2" />
        </div>
      </div>
    </div>
  );
}
