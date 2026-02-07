'use client';

import { useState } from 'react';
import { CandidateSkill, CandidateLanguage } from '@/types';
import SkillsSection from './SkillsSection';
import LanguagesSection from './LanguagesSection';
import { ArrowLeft } from 'react-bootstrap-icons';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface SkillsLanguagesSectionProps {
  skills: CandidateSkill[];
  languages: CandidateLanguage[];
  onUpdateSkills: React.Dispatch<React.SetStateAction<CandidateSkill[]>>;
  onUpdateLanguages: (languages: CandidateLanguage[]) => void;
  onComplete: () => void;
}

export default function SkillsLanguagesSection({
  skills,
  languages,
  onUpdateSkills,
  onUpdateLanguages,
  onComplete,
}: SkillsLanguagesSectionProps) {
  const { setCurrentStep } = useAuth();
  const [activeTab, setActiveTab] = useState<'skills' | 'languages'>('skills');

  return (
    <div className="lg:p-6">
      <h2 className="text-center lg:text-right text-xl lg:text-2xl font-bold text-blue-900 mb-6">
        Habilidades e Idiomas
      </h2>

      {/* Abas */}
      <div className="flex border-b border-slate-300 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors cursor-pointer ${
            activeTab === 'skills'
              ? 'text-blue-900 border-b-2 border-blue-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Habilidades
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('languages')}
          className={`flex-1 py-3 text-sm font-medium text-center transition-colors cursor-pointer ${
            activeTab === 'languages'
              ? 'text-blue-900 border-b-2 border-blue-900'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Idiomas
        </button>
      </div>

      {/* Conteúdo da aba ativa */}
      {activeTab === 'skills' ? (
        <SkillsSection skills={skills} onUpdate={onUpdateSkills} />
      ) : (
        <LanguagesSection languages={languages} onUpdate={onUpdateLanguages} />
      )}

      {/* Navegação */}
      <div className="flex justify-center lg:justify-end pt-6 border-t border-zinc-400 mt-6">
        <div
          onClick={() => setCurrentStep(2)}
          className="mr-auto bg-blue-900 hover:bg-blue-800 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </div>
        <button
          type="button"
          onClick={onComplete}
          className="bg-blue-900 hover:bg-blue-800 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
        >
          <Save className="h-4 w-4 mr-2" />
          Concluir Perfil
        </button>
      </div>
    </div>
  );
}
