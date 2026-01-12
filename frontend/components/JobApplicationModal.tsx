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
  const [isSubmitted, setIsSubmitted] = useState(false); // Prevenir múltiplos cliques
  const [uploadProgress, setUploadProgress] = useState(0); // Progresso de upload
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
      // Reset estados ao abrir o modal
      setIsSubmitted(false);
      setUploadProgress(0);
    }
  }, [isOpen, jobId]);

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
      // Verificar se o arquivo é válido (não é apenas uma referência do Google Drive)
      if (file.size === 0) {
        toast.error(' Este arquivo não pode ser enviado. Se você selecionou do Google Drive, faça o download do arquivo no seu celular primeiro e tente novamente.', {
          duration: 7000,
        });
        e.target.value = ''; // Limpar o input
        return;
      }

      // Verificar se é PDF ou DOC/DOCX
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Apenas arquivos PDF, DOC ou DOCX são permitidos.');
        e.target.value = ''; // Limpar o input
        return;
      }
      
      // Verificar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('O arquivo deve ter no máximo 5MB.');
        e.target.value = ''; // Limpar o input
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

    console.log('[JobApplicationModal] handleSubmit iniciado');

    // Prevenir múltiplos cliques/toques (especialmente importante no mobile)
    if (isSubmitted || submitting) {
      console.log('[JobApplicationModal] Bloqueado: já está enviando');
      toast.error('Aguarde, sua candidatura está sendo enviada...');
      return;
    }

    // Validações básicas com mensagens mobile-friendly
    if (!formData.name.trim()) {
      console.log('[JobApplicationModal] Validação falhou: nome vazio');
      toast.error('Por favor, preencha seu nome completo');
      return;
    }

    if (!formData.phone.trim()) {
      console.log('[JobApplicationModal] Validação falhou: telefone vazio');
      toast.error('Por favor, preencha seu telefone');
      return;
    }

    if (!formData.state.trim()) {
      console.log('[JobApplicationModal] Validação falhou: estado vazio');
      toast.error('Por favor, selecione seu estado');
      return;
    }

    if (!formData.city.trim()) {
      console.log('[JobApplicationModal] Validação falhou: cidade vazia');
      toast.error('Por favor, selecione sua cidade');
      return;
    }

    if (!formData.resume) {
      console.log('[JobApplicationModal] Validação falhou: sem currículo');
      toast.error('Por favor, anexe seu currículo');
      return;
    }

    // Validação adicional: verificar se o arquivo não é apenas uma referência (Google Drive)
    if (formData.resume.size === 0) {
      console.log('[JobApplicationModal] Validação falhou: arquivo vazio (possivelmente do Google Drive)');
      toast.error(' O arquivo selecionado não pode ser enviado. Se você selecionou do Google Drive, faça o download do arquivo no seu celular primeiro e tente novamente.', {
        duration: 7000,
      });
      return;
    }

    console.log('[JobApplicationModal] Todas validações passaram');

    try {
      setSubmitting(true);
      setIsSubmitted(true);
      setUploadProgress(10);

      console.log('[JobApplicationModal] Iniciando envio para API');

      // Simular progresso durante upload
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 15;
        });
      }, 300);

      console.log('[JobApplicationModal] Chamando applicationService.createApplication');

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

      console.log('[JobApplicationModal] Resposta recebida com sucesso');

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Candidatura enviada com sucesso!');
      onApplicationSuccess?.(); // Chama o callback se fornecido

      // Aguardar um pouco para mostrar 100% antes de fechar
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (error: unknown) {
      console.error('[JobApplicationModal] ERRO CAPTURADO:', error);
      console.error('[JobApplicationModal] Tipo do erro:', typeof error);
      console.error('[JobApplicationModal] Error stringified:', JSON.stringify(error, null, 2));

      // Reset estados para permitir nova tentativa
      setIsSubmitted(false);
      setUploadProgress(0);

      console.log('[JobApplicationModal] Verificando tipo de erro...');

      // Verificar se é erro relacionado a arquivo (Google Drive, arquivo vazio, etc)
      const errorMessage = (error as { message?: string })?.message || '';
      const errorString = error?.toString() || '';
      
      if (
        errorMessage.toLowerCase().includes('file') ||
        errorMessage.toLowerCase().includes('empty') ||
        errorMessage.toLowerCase().includes('network') ||
        errorString.toLowerCase().includes('file') ||
        errorString.toLowerCase().includes('empty')
      ) {
        console.log('[JobApplicationModal] Erro detectado como problema de arquivo');
        toast.error('Problema ao enviar o arquivo. Se você selecionou do Google Drive, faça o download do arquivo no seu celular primeiro e tente novamente.', {
          duration: 7000,
        });
        return;
      }

      // Verificar se é um erro do Axios
      if (error && typeof error === 'object' && 'response' in error) {
        console.log('[JobApplicationModal] É um erro do Axios');
        const axiosError = error as {
          response?: { data?: unknown; status?: number };
          code?: string;
          message?: string;
        };
        const errorData = axiosError.response?.data;
        const errorStatus = axiosError.response?.status;

        // Tratamento específico para erro 401 (não autenticado)
        if (errorStatus === 401) {
          toast.error('Sua sessão expirou. Redirecionando para login...', {
            duration: 3000,
          });
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          return;
        }

        // Tratamento para erro 500+ (erro do servidor)
        if (errorStatus && errorStatus >= 500) {
          toast.error('Erro no servidor. Tente novamente em alguns minutos.', {
            duration: 5000,
          });
          return;
        }

        // Tratamento para timeout
        if (axiosError.code === 'ECONNABORTED') {
          toast.error('Tempo esgotado. Sua conexão pode estar lenta. Tente novamente.', {
            duration: 5000,
          });
          return;
        }

        // Tratamento para erro 400 (validação)
        if (errorStatus === 400 && errorData && typeof errorData === 'object') {
          // Exibir erros específicos de cada campo com mensagens mobile-friendly
          const errors = errorData as Record<string, unknown>;
          let hasDisplayedError = false;

          Object.keys(errors).forEach(field => {
            const fieldErrors = errors[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(err => {
                // Verificar se o erro é relacionado ao currículo/arquivo
                if (field === 'resume' && typeof err === 'string') {
                  if (err.toLowerCase().includes('empty') || err.toLowerCase().includes('vazio') || err.toLowerCase().includes('invalid')) {
                    toast.error('Problema com o arquivo. Se você selecionou do Google Drive, faça o download do arquivo no seu celular primeiro e tente novamente.', {
                      duration: 7000,
                    });
                    hasDisplayedError = true;
                    return;
                  }
                }

                // Mensagens mais claras para mobile
                const fieldName = field === 'job' ? 'Vaga' :
                                  field === 'resume' ? 'Currículo' :
                                  field === 'name' ? 'Nome' :
                                  field === 'phone' ? 'Telefone' :
                                  field === 'state' ? 'Estado' :
                                  field === 'city' ? 'Cidade' :
                                  field === 'user' ? 'Usuário' : field;
                toast.error(`${fieldName}: ${err}`, {
                  duration: 5000, // Mais tempo para ler no mobile
                });
                hasDisplayedError = true;
              });
            } else if (typeof fieldErrors === 'string') {
              // Verificar se o erro é relacionado ao currículo/arquivo
              if (field === 'resume') {
                if (fieldErrors.toLowerCase().includes('empty') || fieldErrors.toLowerCase().includes('vazio') || fieldErrors.toLowerCase().includes('invalid')) {
                  toast.error('Problema com o arquivo. Se você selecionou do Google Drive, faça o download do arquivo no seu celular primeiro e tente novamente.', {
                    duration: 7000,
                  });
                  hasDisplayedError = true;
                  return;
                }
              }

              const fieldName = field === 'job' ? 'Vaga' :
                                field === 'resume' ? 'Currículo' :
                                field === 'name' ? 'Nome' :
                                field === 'phone' ? 'Telefone' :
                                field === 'state' ? 'Estado' :
                                field === 'city' ? 'Cidade' :
                                field === 'user' ? 'Usuário' : field;
              toast.error(`${fieldName}: ${fieldErrors}`, {
                duration: 5000,
              });
              hasDisplayedError = true;
            }
          });

          if (!hasDisplayedError) {
            toast.error('Dados inválidos. Verifique os campos e tente novamente.', {
              duration: 5000,
            });
          }
          return;
        }

        // Erro genérico com resposta do servidor
        if (errorData && typeof errorData === 'object') {
          const errorMessage = (errorData as { detail?: string }).detail || '';
          const errorStr = JSON.stringify(errorData).toLowerCase();
          
          // Verificar se é erro relacionado a arquivo
          if (
            errorMessage.toLowerCase().includes('file') ||
            errorMessage.toLowerCase().includes('arquivo') ||
            errorMessage.toLowerCase().includes('empty') ||
            errorMessage.toLowerCase().includes('vazio') ||
            errorStr.includes('file') ||
            errorStr.includes('empty') ||
            errorStr.includes('resume')
          ) {
            toast.error('⚠️ Problema com o arquivo. Se você selecionou do Google Drive, faça o download do arquivo no seu celular primeiro e tente novamente.', {
              duration: 7000,
            });
            return;
          }
          
          toast.error(errorMessage || 'Não foi possível enviar sua candidatura.', {
            duration: 5000,
          });
          return;
        }

        // Sem resposta do servidor (erro de rede)
        if (!axiosError.response) {
          toast.error('Problema ao enviar. Se você selecionou um arquivo do Google Drive, faça o download no seu celular primeiro e tente novamente.', {
            duration: 7000,
          });
          return;
        }
      }

      // Erro completamente desconhecido - pode ser problema com arquivo
      console.log('[JobApplicationModal] Erro não identificado, verificando se pode ser arquivo do Google Drive');
      toast.error(' Não foi possível enviar sua candidatura. Se você selecionou do Google Drive, faça o download do arquivo no seu celular primeiro e tente novamente.', {
        duration: 7000,
      });
    } finally {
      console.log('[JobApplicationModal] Finally: setSubmitting(false)');
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

            {/* Indicador de Progresso - Mobile Friendly */}
            {submitting && uploadProgress > 0 && (
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-blue-900 font-medium">
                    {uploadProgress < 100 ? 'Enviando candidatura...' : 'Candidatura enviada!'}
                  </span>
                  <span className="text-blue-700 font-bold">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-blue-500 h-3 rounded-full transition-all duration-300 ease-out shadow-sm"
                    style={{ width: `${uploadProgress}%` }}
                  >
                    <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
                {uploadProgress < 30 && (
                  <p className="text-xs text-gray-600 text-center">Preparando arquivo...</p>
                )}
                {uploadProgress >= 30 && uploadProgress < 70 && (
                  <p className="text-xs text-gray-600 text-center">Enviando currículo...</p>
                )}
                {uploadProgress >= 70 && uploadProgress < 100 && (
                  <p className="text-xs text-gray-600 text-center">Finalizando envio...</p>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer font-medium"
                disabled={submitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting || isSubmitted}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-md hover:from-blue-800 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg cursor-pointer font-medium touch-manipulation"
              >
                {submitting ? (
                  <>
                    <Loader className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                    <span className="text-base sm:text-sm">Enviando...</span>
                  </>
                ) : isSubmitted ? (
                  <>
                    <span className="text-base sm:text-sm">Enviado!</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                    <span className="text-base sm:text-sm">Enviar Candidatura</span>
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
