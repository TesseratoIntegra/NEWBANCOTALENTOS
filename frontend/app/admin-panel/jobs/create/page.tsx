'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminJobService, CreateJobData } from '@/services/adminJobService';
import companyService from '@/services/companyService';
import { Company } from '@/types';
// Modal para criar empresa
// ...existing code...
type CreateCompanyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newCompany: Company) => void;
};

function CreateCompanyModal({ isOpen, onClose, onCreated }: CreateCompanyModalProps) {
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);

  // Função para aplicar máscara de CNPJ
  const formatCnpj = (value: string) => {
    // Remove tudo que não é número
    const digits = value.replace(/\D/g, '');
    // Aplica a máscara
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCnpj(formatCnpj(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Informe o nome da empresa');
      return;
    }
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
      alert('Informe um CNPJ válido');
      return;
    }
    setLoading(true);
    try {
      const newCompany = await companyService.createCompany({ name, cnpj });
      onCreated(newCompany);
      setName('');
      setCnpj('');
      onClose();
    } catch (error) {
      console.log(error);
      alert('Erro ao criar empresa.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-zinc-900 p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold text-zinc-100 mb-4">Criar Empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm text-zinc-300 mb-2">Nome da Empresa *</label>
            <input
              id="companyName"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none"
              required
              placeholder="Ex: Tesserato Ltda"
            />
          </div>
          <div>
            <label htmlFor="companyCnpj" className="block text-sm text-zinc-300 mb-2">CNPJ *</label>
            <input
              id="companyCnpj"
              type="text"
              value={cnpj}
              onChange={handleCnpjChange}
              className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none"
              required
              placeholder="00.000.000/0000-00"
              maxLength={18}
              inputMode="numeric"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-700">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium">{loading ? 'Salvando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
import locationService, { State, City } from '@/services/locationService';
// ...existing code...

export default function CreateJobPage() {
  // Modal de empresa
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const router = useRouter();
  
  // Função para obter a data de amanhã no formato YYYY-MM-DD
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState<number | ''>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [formData, setFormData] = useState<CreateJobData>({
    title: '',
    description: '',
    location: '',
    job_type: 'full_time',
    type_models: 'in_person',
    salary_range: '',
    requirements: '',
    responsibilities: '',
    closure: '',
    company: 0, // Changed to 0 as default to force selection
    is_active: true,
  });

  useEffect(() => {
    loadCompanies();
    loadStates();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companiesData = await companyService.getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      alert('Erro ao carregar lista de empresas');
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Quando uma empresa é criada
  const handleCompanyCreated = (newCompany: Company) => {
    setCompanies(prev => [...prev, newCompany]);
    setFormData(prev => ({ ...prev, company: newCompany.id }));
  };

  const loadStates = async () => {
    try {
      setLoadingStates(true);
      const statesData = await locationService.getStates();
      setStates(statesData);
    } catch (error) {
      console.error('Erro ao carregar estados:', error);
      alert('Erro ao carregar lista de estados');
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
      alert('Erro ao carregar lista de cidades');
    } finally {
      setLoadingCities(false);
    }
  };

  // Função para formatar valor monetário
  const formatCurrency = (value: string): string => {
    // Remove tudo que não é número
    const numericValue = value.replace(/\D/g, '');
    
    if (!numericValue) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const number = parseInt(numericValue) / 100;
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(number);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checkbox = e.target as HTMLInputElement;
      setFormData(prev => ({
        ...prev,
        [name]: checkbox.checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const formattedValue = formatCurrency(inputValue);
    
    setFormData(prev => ({
      ...prev,
      salary_range: formattedValue
    }));
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateId = parseInt(e.target.value);
    setSelectedState(stateId);
    setSelectedCity('');
    setCities([]);
    
    if (stateId) {
      await loadCities(stateId);
    }
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    
    // Atualizar o campo location no formData com o formato "Cidade, Estado"
    if (cityName && selectedState) {
      const selectedStateData = states.find(state => state.id === selectedState);
      if (selectedStateData) {
        setFormData(prev => ({
          ...prev,
          location: `${cityName}, ${selectedStateData.sigla}`
        }));
      }
    } else {
      setFormData(prev => ({
        ...prev,
        location: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.company) {
      alert('Por favor, selecione uma empresa');
      return;
    }
    
    // Validar se a data de encerramento não é hoje ou no passado
    if (formData.closure) {
      const closureDate = new Date(formData.closure);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Remove horas para comparar apenas a data

      if (closureDate < today) {
        alert('A data de encerramento deve ser hoje ou uma data futura');
        return;
      }
    }

    setLoading(true);

    try {
      await adminJobService.createJob(formData);
      router.push('/admin/jobs');
    } catch (error) {
      alert('Erro ao criar vaga. Verifique os dados e tente novamente.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <Link
            href="/admin/jobs"
            className="text-indigo-400 hover:text-indigo-300"
          >
            ← Voltar para lista
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-zinc-100">Nova Vaga</h1>
        <p className="text-zinc-400 mt-1">
          Preencha os dados para criar uma nova vaga de emprego
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-md p-6 border border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Informações Básicas
          </h2>
            <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-zinc-300 mb-2">
                Título da Vaga *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: Desenvolvedor Frontend"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-zinc-300 mb-2">
                  Estado *
                </label>
                {loadingStates ? (
                  <div className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-400">
                    Carregando estados...
                  </div>
                ) : (
                  <select
                    id="state"
                    name="state"
                    value={selectedState}
                    onChange={handleStateChange}
                    required
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Selecione um estado</option>
                    {states.map((state) => (
                      <option key={state.id} value={state.id}>
                        {state.nome} ({state.sigla})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-zinc-300 mb-2">
                  Cidade *
                </label>
                {loadingCities ? (
                  <div className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-400">
                    Carregando cidades...
                  </div>
                ) : (
                  <select
                    id="city"
                    name="city"
                    value={selectedCity}
                    onChange={handleCityChange}
                    required
                    disabled={!selectedState}
                    className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {selectedState ? 'Selecione uma cidade' : 'Primeiro selecione um estado'}
                    </option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.nome}>
                        {city.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <label htmlFor="job_type" className="block text-sm font-medium text-zinc-300 mb-2">
                Tipo de Contrato *
              </label>
              <select
                id="job_type"
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="full_time">Tempo Integral</option>
                <option value="part_time">Meio Período</option>
                <option value="contract">Contrato</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Estágio</option>
              </select>
            </div>

            <div>
              <label htmlFor="type_models" className="block text-sm font-medium text-zinc-300 mb-2">
                Modelo de Trabalho *
              </label>
              <select
                id="type_models"
                name="type_models"
                value={formData.type_models}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="in_person">Presencial</option>
                <option value="home_office">Home Office</option>
                <option value="hybrid">Híbrido</option>
              </select>
            </div>

            <div>
              <label htmlFor="salary_range" className="block text-sm font-medium text-zinc-300 mb-2">
                Faixa Salarial
              </label>
              <input
                type="text"
                id="salary_range"
                name="salary_range"
                value={formData.salary_range}
                onChange={handleSalaryChange}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ex: 500000 (para R$ 5.000,00)"
              />
            </div>

            <div>
              <label htmlFor="closure" className="block text-sm font-medium text-zinc-300 mb-2">
                Data de Encerramento *
              </label>
              <input
                type="date"
                id="closure"
                name="closure"
                value={formData.closure}
                onChange={handleChange}
                min={getTomorrowDate()}
                required
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-zinc-400 mt-1">
                A data deve ser amanhã ou uma data futura
              </p>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-zinc-300 mb-2">
                Empresa *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  {loadingCompanies ? (
                    <div className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-400">
                      Carregando empresas...
                    </div>
                  ) : (
                    <select
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Selecione uma empresa</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowCompanyModal(true)}
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium"
                >
                  Criar nova empresa
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-md p-6 border border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Descrição e Detalhes
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-zinc-300 mb-2">
                Descrição da Vaga *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Descreva a vaga, o que a empresa faz, o ambiente de trabalho..."
              />
            </div>

            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-zinc-300 mb-2">
                Requisitos
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Liste os requisitos necessários para a vaga..."
              />
            </div>

            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-zinc-300 mb-2">
                Responsabilidades
              </label>
              <textarea
                id="responsibilities"
                name="responsibilities"
                value={formData.responsibilities}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-md text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Descreva as principais responsabilidades do cargo..."
              />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 rounded-md p-6 border border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">
            Configurações
          </h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-zinc-600 rounded bg-zinc-700"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-zinc-300">
              Vaga ativa (visível para candidatos)
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/admin/jobs"
            className="px-6 py-2 border border-zinc-600 text-zinc-300 rounded-md hover:bg-zinc-700 transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-md font-medium transition-colors"
          >
            {loading ? 'Salvando...' : 'Criar Vaga'}
          </button>
        </div>
      </form>
      {/* Modal de criar empresa */}
      <CreateCompanyModal
        isOpen={showCompanyModal}
        onClose={() => setShowCompanyModal(false)}
        onCreated={handleCompanyCreated}
      />
    </div>
  );
}
