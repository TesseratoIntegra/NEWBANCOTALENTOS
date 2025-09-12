'use client';

import React, { useState, useEffect } from 'react';
import ReactSelect from 'react-select';
import { X, Loader, Send, User, Phone, MapPin, DollarSign, FileText, MessageSquare } from 'lucide-react';
import candidateService from '@/services/candidateService';
import applicationService from '@/services/applicationService';
import locationService, { State, City } from '@/services/locationService';
import { toast } from 'react-hot-toast';
import SplitText from './SliptText';
import { formatTEL } from '@/functions/FormatTEL';

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  companyName: string;
  hasApplied?: boolean;
  onApplicationSuccess?: () => void;
}

interface ApplicationForm {
  name: string;
  phone: string;
  state: string;
  city: string;
  linkedin: string;
  portfolio: string;
  resume: File | null;
  observations: string;
  cover_letter: string;
  salary_expectation: string;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
  hasApplied = false,
  onApplicationSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [formData, setFormData] = useState<ApplicationForm>({
    name: '',
    phone: '',
    state: '',
    city: '',
    linkedin: '',
    portfolio: '',
    resume: null,
    observations: '',
    cover_letter: '',
    salary_expectation: ''
  });

  // Carregar dados do candidato quando o modal abre
  useEffect(() => {
    if (isOpen) {
      loadCandidateProfile();
      loadStates();
    }
  }, [isOpen, jobId]);

  // Fechar modal automaticamente se usuário já se candidatou
  useEffect(() => {
    if (isOpen && hasApplied) {
      onClose();
      toast.error('Você já se candidatou a esta vaga.');
    }
  }, [isOpen, hasApplied, onClose]);

  // Carregar cidades quando estado é selecionado
  useEffect(() => {
    if (selectedStateId) {
      loadCities(selectedStateId);
    } else {
      setCities([]);
      setFormData(prev => ({ ...prev, city: '' }));
    }
  }, [selectedStateId]);

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const statesData = await locationService.getStates();
      setStates(statesData);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      toast.error('Erro ao carregar estados');
    } finally {
      setLoadingStates(false);
    }
  };

  const loadCities = async (stateId: number) => {
    try {
      setLoadingCities(true);
      const citiesData = await locationService.getCitiesByState(stateId);
      setCities(citiesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast.error('Erro ao carregar cidades');
    } finally {
      setLoadingCities(false);
    }
  };

  const handleStateChange = (option: { value: string; label: string; id: number } | null) => {
    if (option) {
      setFormData(prev => ({
        ...prev,
        state: option.value,
        city: '' // Reset city when state changes
      }));
      setSelectedStateId(option.id);
    } else {
      setFormData(prev => ({ ...prev, state: '', city: '' }));
      setSelectedStateId(null);
    }
  };

  const handleCityChange = (option: { value: string; label: string; id: number } | null) => {
    if (option) {
      setFormData(prev => ({ ...prev, city: option.value }));
    } else {
      setFormData(prev => ({ ...prev, city: '' }));
    }
  };

  const loadCandidateProfile = async () => {
    try {
      setLoading(true);
      const candidateProfile = await candidateService.getCandidateProfile();
      
      // Preencher formulário com dados do perfil
      setFormData({
        name: candidateProfile.user_name || '',
        phone: candidateProfile.phone_secondary || '',
        state: '', // Campo vazio para o usuário preencher
        city: candidateProfile.neighborhood || '', // Usar neighborhood como base
        linkedin: candidateProfile.linkedin_url || '',
        portfolio: candidateProfile.portfolio_url || '',
        resume: null,
        observations: '',
        cover_letter: '',
        salary_expectation: candidateProfile.desired_salary_min?.toString() || ''
      });
    } catch (error) {
      console.error('Erro ao carregar perfil do candidato:', error);
      toast.error('Erro ao carregar dados do perfil. Complete manualmente os campos.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'phone') {
      newValue = formatTEL(value);
    }
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar se é PDF ou DOC/DOCX
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos PDF, DOC ou DOCX são permitidos.');
        return;
      }
      
      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 5MB.');
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        resume: file
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.name.trim()) {
      toast.error('Nome é obrigatório.');
      return;
    }
    
    if (!formData.phone.trim()) {
      toast.error('Telefone é obrigatório.');
      return;
    }
    
    if (!formData.state.trim()) {
      toast.error('Estado é obrigatório.');
      return;
    }
    
    if (!formData.city.trim()) {
      toast.error('Cidade é obrigatória.');
      return;
    }
    
    if (!formData.resume) {
      toast.error('Currículo é obrigatório.');
      return;
    }

    try {
      setSubmitting(true);
      
      // Enviar candidatura
      await applicationService.createApplication({
        job: jobId,
        name: formData.name,
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        linkedin: formData.linkedin || undefined,
        portfolio: formData.portfolio || undefined,
        observations: formData.observations || undefined,
        cover_letter: formData.cover_letter || undefined,
        salary_expectation: formData.salary_expectation ? parseFloat(formData.salary_expectation) : undefined,
        resume: formData.resume
      });
      
      toast.success('Candidatura enviada com sucesso!');
      onApplicationSuccess?.(); // Chama o callback se fornecido
      onClose();
      
    } catch (error: unknown) {
      console.error('Erro ao enviar candidatura:', error);
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: unknown } };
        const errorData = axiosError.response?.data;
        
        if (errorData && typeof errorData === 'object') {
          // Exibir erros específicos de cada campo
          Object.keys(errorData).forEach(field => {
            const fieldErrors = (errorData as Record<string, unknown>)[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(err => toast.error(`${field}: ${err}`));
            } else {
              toast.error(`${field}: ${fieldErrors}`);
            }
          });
        } else {
          toast.error('Erro ao enviar candidatura. Tente novamente.');
        }
      } else {
        toast.error('Erro ao enviar candidatura. Verifique sua conexão e tente novamente.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 ${ isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none' } duration-300`}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-50 flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
          <div>
            <SplitText
							text="Candidatar-se à vaga"
							className="text-3xl lg:text-3xl text-white quicksand"
							delay={30}
							duration={1}
						/>
            <p className="text-blue-100 mt-1">{jobTitle} - {companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="ml-2 text-gray-600">Carregando dados do perfil...</span>
          </div>
        )}

        {/* Form */}
        {!loading && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Dados Pessoais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                <User className="w-5 h-5 mr-2 text-blue-700" />
                Dados Pessoais
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-1" />
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Estado *
                  </label>
                  <ReactSelect
                    name="state"
                    value={formData.state ? {
                      value: formData.state,
                      label: states.find(s => s.sigla === formData.state)?.nome + ` (${formData.state})`,
                      id: states.find(s => s.sigla === formData.state)?.id || 0
                    } : null}
                    onChange={handleStateChange}
                    options={states.map(state => ({
                      value: state.sigla,
                      label: `${state.nome} (${state.sigla})`,
                      id: state.id
                    }))}
                    isLoading={loadingStates}
                    isClearable
                    placeholder={loadingStates ? 'Carregando...' : 'Selecione um estado'}
                    classNamePrefix="react-select"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cidade *
                  </label>
                  <ReactSelect
                    name="city"
                    value={formData.city ? {
                      value: formData.city,
                      label: formData.city,
                      id: cities.find(c => c.nome === formData.city)?.id || 0
                    } : null}
                    onChange={handleCityChange}
                    options={cities.map(city => ({
                      value: city.nome,
                      label: city.nome,
                      id: city.id
                    }))}
                    isLoading={loadingCities}
                    isClearable
                    placeholder={!selectedStateId
                      ? 'Primeiro selecione um estado'
                      : loadingCities
                      ? 'Carregando...'
                      : 'Selecione uma cidade'}
                    classNamePrefix="react-select"
                    required
                    isDisabled={!selectedStateId || loadingCities}
                  />
                </div>
              </div>
            </div>

            {/* Links Profissionais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900">Links Profissionais</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    name="linkedin"
                    value={formData.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://linkedin.com/in/seu-perfil"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Portfólio
                  </label>
                  <input
                    type="url"
                    name="portfolio"
                    value={formData.portfolio}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://seu-portfolio.com"
                  />
                </div>
              </div>
            </div>

            {/* Currículo */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-700" />
                Currículo *
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Anexar Currículo (PDF, DOC ou DOCX - máx. 5MB)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                    required
                  />
                  {formData.resume && (
                    <p className="text-sm text-green-600 mt-1">
                      ✓ {formData.resume.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-blue-900 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2 text-blue-700" />
                Informações Adicionais
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Pretensão Salarial (R$)
                </label>
                <input
                  type="number"
                  name="salary_expectation"
                  value={formData.salary_expectation}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="5000"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carta de Apresentação
                </label>
                <textarea
                  name="cover_letter"
                  value={formData.cover_letter}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descreva brevemente sua motivação para esta vaga e como você pode contribuir para a empresa..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações
                </label>
                <textarea
                  name="observations"
                  value={formData.observations}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Informações adicionais que considerar relevantes..."
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-md hover:from-blue-800 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Candidatura
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default JobApplicationModal;
