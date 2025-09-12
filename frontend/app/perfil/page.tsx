'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import candidateService from '@/services/candidateService';
import { CandidateProfile, CandidateEducation, CandidateExperience, CandidateSkill, CandidateLanguage } from '@/types';
import { toast } from 'react-hot-toast';
import PersonalInfoSection from '@/app/perfil/account/PersonalInfoSection';
import ProfessionalInfoSection from '@/app/perfil/account/ProfessionalInfoSection';
import EducationSection from '@/app/perfil/account/EducationSection';
import ExperienceSection from '@/app/perfil/account/ExperienceSection';
import SkillsSection from '@/app/perfil/account/SkillsSection';
import LanguagesSection from '@/app/perfil/account/LanguagesSection';
import PreferencesSection from '@/app/perfil/account/PreferencesSection';
import Navbar from '@/components/Navbar';
import SplitText from '@/components/SliptText';
import * as Icon from 'react-bootstrap-icons'
import LoadChiap from '@/components/LoadChiap';
// ...removido: ícones não utilizados...

export default function AccountPage() {
  const { user, wizzardStep } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [educations, setEducations] = useState<CandidateEducation[]>([]);
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [languages, setLanguages] = useState<CandidateLanguage[]>([]);
  
  // ...existing code...
  const [currentStep, setCurrentStep] = useState(0);

  // Wizard steps (declarado após handleProfileUpdate)
  const formSteps = [
    {
      id: 'personal',
      label: 'Dados Pessoais',
      component: PersonalInfoSection,
      getProps: () => ({ profile, onUpdate: handleProfileUpdate, saving }),
    },
    {
      id: 'professional',
      label: 'Dados Profissionais',
      component: ProfessionalInfoSection,
      getProps: () => ({ profile, onUpdate: handleProfileUpdate, saving }),
    },
    {
      id: 'education',
      label: 'Formação',
      component: EducationSection,
      getProps: () => ({ educations, onUpdate: setEducations }),
    },
    {
      id: 'experience',
      label: 'Experiência',
      component: ExperienceSection,
      getProps: () => ({ experiences, onUpdate: setExperiences }),
    },
    {
      id: 'skills',
      label: 'Habilidades',
      component: SkillsSection,
      getProps: () => ({ skills, onUpdate: setSkills }),
    },
    {
      id: 'languages',
      label: 'Idiomas',
      component: LanguagesSection,
      getProps: () => ({ languages, onUpdate: setLanguages }),
    },
    {
      id: 'preferences',
      label: 'Preferências',
      component: PreferencesSection,
      getProps: () => ({ profile, onUpdate: handleProfileUpdate, saving }),
    },
  ];

  useEffect(() => {
    if (user?.user_type === 'candidate') {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const [profileData, educationsData, experiencesData, skillsData, languagesData] = await Promise.all([
        candidateService.getCandidateProfile().catch(() => null),
        candidateService.getCandidateEducations().catch(() => ({ results: [] })),
        candidateService.getCandidateExperiences().catch(() => ({ results: [] })),
        candidateService.getCandidateSkills().catch(() => ({ results: [] })),
        candidateService.getCandidateLanguages().catch(() => ({ results: [] }))
      ]);

      setProfile(profileData);
      setEducations(educationsData.results || []);
      setExperiences(experiencesData.results || []);
      setSkills(skillsData.results || []);
      setLanguages(languagesData.results || []);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar informações do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (data: Partial<CandidateProfile>) => {
    try {
      setSaving(true);
      let updatedProfile;
      
      if (profile) {
        updatedProfile = await candidateService.updateCandidateProfile(profile.id, data);
      } else {
        updatedProfile = await candidateService.createCandidateProfile(data);
      }
      
      setProfile(updatedProfile);
      toast.success('Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  // ...removido: tabs não utilizado...

  if (user?.user_type !== 'candidate') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-blue-900 mb-4">Acesso Negado</h1>
          <p className="text-slate-600">Esta página é apenas para candidatos.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white flex items-center justify-center">
        <LoadChiap/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-zinc-100 to-white">
      <Navbar/>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-0 py-8">
        {/* Header */}
        <div className="sticky top-12 lg:top-14 bg-white rounded-t-md pt-4 mt-10 pb-4 z-10">
        <div className="mb-4 text-center">
              <SplitText
                text="Minha Conta"
                className="text-3xl lg:text-4xl text-blue-900 mb-2 quicksand"
                delay={30}
                duration={1}
              />
              <SplitText
                text="Mantenha suas informações atualizadas para melhores oportunidades"
                className="text-base text-zinc-500 mb-2 quicksand"
                delay={20}
                duration={0.7}
              />
          <p className="text-slate-600">
            
          </p>
        </div>

        {/* Wizard Progress */}
        <div className="flex flex-wrap gap-y-4 items-center justify-center ">
          {formSteps.map((step, idx) => (
            <div key={step.id} className="flex items-center">
              <div
                className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs border-2 transition-colors animate-fade-right animate-delay-[${idx * 100}ms]
                  ${idx < currentStep ? 'bg-green-300 text-green-700 border-green-600' : idx >= 0 && idx < 2 ? idx === currentStep ? 'bg-red-300 text-red-700 border-red-600' : 'bg-white text-red-800 border-red-300' : idx === currentStep ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-blue-900 border-blue-300'}
                `}
              >
                {idx + 1}
              </div>
              {idx < formSteps.length - 1 && (
                <div className={`w-8 h-1 bg-blue-300 mx-1 animate-fade-right animate-delay-[${idx * 100}ms]`} />
              )}
            </div>
          ))}
        </div>
        </div>

        {/* Wizard Content */}
        <div className="bg-white rounded-md shadow p-6 2xl:overflow-y-auto 2xl:max-h-[37rem]">
          {(() => {
            switch (formSteps[currentStep].id) {
              case 'personal':
                return <PersonalInfoSection profile={profile} onUpdate={handleProfileUpdate} saving={saving} />;
              case 'professional':
                return <ProfessionalInfoSection profile={profile} onUpdate={handleProfileUpdate} saving={saving} />;
              case 'education':
                return <EducationSection educations={educations} onUpdate={setEducations} />;
              case 'experience':
                return <ExperienceSection experiences={experiences} onUpdate={setExperiences} />;
              case 'skills':
                return <SkillsSection skills={skills} onUpdate={setSkills} />;
              case 'languages':
                return <LanguagesSection languages={languages} onUpdate={setLanguages} />;
              case 'preferences':
                return <PreferencesSection profile={profile} onUpdate={handleProfileUpdate} saving={saving} />;
              default:
                return null;
            }
          })()}
        </div>

        {/* Wizard Navigation */}
        <div className="flex justify-between mt-6">
          <button
            className="px-4 py-2 bg-blue-100 hover:bg-blue-300 text-blue-900 rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex place-items-center gap-x-2"
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
          >
            <Icon.ArrowLeft/> Anterior
          </button>
          
          <button
            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex place-items-center gap-x-2"
            onClick={() => {setCurrentStep((prev) => Math.min(prev + 1, formSteps.length - 1)); window.scrollTo({ top: 0, behavior: 'smooth' });}}
            disabled={currentStep === formSteps.length - 1 || currentStep < 2 && currentStep === wizzardStep}
          >
            Próximo <Icon.ArrowRight/>
          </button>
        </div>
      </div>
    </div>
  );
}
