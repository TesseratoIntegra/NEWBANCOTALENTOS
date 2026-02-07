'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import candidateService from '@/services/candidateService';
import { CandidateProfile, CandidateEducation, CandidateExperience, CandidateSkill, CandidateLanguage } from '@/types';
import { toast } from 'react-hot-toast';
import PersonalInfoSection from '@/app/perfil/account/PersonalInfoSection';
import ProfessionalInfoSection from '@/app/perfil/account/ProfessionalInfoSection';
import EducationExperienceSection from '@/app/perfil/account/EducationExperienceSection';
import SkillsLanguagesSection from '@/app/perfil/account/SkillsLanguagesSection';
import Navbar from '@/components/Navbar';
import SplitText from '@/components/SliptText';
import LoadChiap from '@/components/LoadChiap';

export default function CreateProfilePage() {
  const router = useRouter();
  const { user, currentStep, setCurrentStep } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [educations, setEducations] = useState<CandidateEducation[]>([]);
  const [experiences, setExperiences] = useState<CandidateExperience[]>([]);
  const [skills, setSkills] = useState<CandidateSkill[]>([]);
  const [languages, setLanguages] = useState<CandidateLanguage[]>([]);

  const formSteps = [
    { id: 'personal', label: 'Dados Pessoais' },
    { id: 'professional', label: 'Perfil Profissional' },
    { id: 'education-experience', label: 'Formação e Experiência' },
    { id: 'skills-languages', label: 'Habilidades e Idiomas' },
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
        candidateService.getCandidateEducations().catch(() => []),
        candidateService.getCandidateExperiences().catch(() => []),
        candidateService.getCandidateSkills().catch(() => []),
        candidateService.getCandidateLanguages().catch(() => [])
      ]);

      if (profileData && currentStep >= 3) {
        router.push('/perfil');
        return;
      }

      setProfile(profileData);
      setEducations(Array.isArray(educationsData) ? educationsData : educationsData.results || []);
      setExperiences(Array.isArray(experiencesData) ? experiencesData : experiencesData.results || []);
      setSkills(Array.isArray(skillsData) ? skillsData : skillsData.results || []);
      setLanguages(Array.isArray(languagesData) ? languagesData : languagesData.results || []);
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      toast.error('Erro ao carregar informações do perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (data: Partial<CandidateProfile>): Promise<CandidateProfile | null> => {
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
      setCurrentStep(currentStep === 1 ? 2 : currentStep === 3 ? 3 : 1);
      return updatedProfile;
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);

      if (error.response?.data) {
        const errorData = error.response.data;
        const errorMessages = Object.entries(errorData)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        toast.error(errorMessages || 'Erro ao atualizar perfil', { duration: 5000 });
      } else {
        toast.error('Erro ao atualizar perfil');
      }
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleWizardComplete = () => {
    toast.success('Perfil criado com sucesso!');
    router.push('/perfil');
  };

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
                text="Criar Perfil"
                className="text-3xl lg:text-4xl text-blue-900 mb-2 quicksand"
                delay={30}
                duration={1}
              />
              <SplitText
                text="Preencha suas informações para encontrar as melhores oportunidades"
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
            switch (formSteps[currentStep]?.id) {
              case 'personal':
                return <PersonalInfoSection profile={profile} onUpdate={handleProfileUpdate} onProfileChange={setProfile} saving={saving} />;
              case 'professional':
                return <ProfessionalInfoSection profile={profile} onUpdate={handleProfileUpdate} saving={saving} />;
              case 'education-experience':
                return (
                  <EducationExperienceSection
                    educations={educations}
                    experiences={experiences}
                    onUpdateEducations={setEducations}
                    onUpdateExperiences={setExperiences}
                  />
                );
              case 'skills-languages':
                return (
                  <SkillsLanguagesSection
                    skills={skills}
                    languages={languages}
                    onUpdateSkills={setSkills}
                    onUpdateLanguages={setLanguages}
                    onComplete={handleWizardComplete}
                  />
                );
              default:
                return null;
            }
          })()}
        </div>
      </div>
    </div>
  );
}
