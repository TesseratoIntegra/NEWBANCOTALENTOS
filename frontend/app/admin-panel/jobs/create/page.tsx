'use client';

import { useState, useEffect } from 'react';
import Select from 'react-select';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { formatRS } from '@/functions/FormatRS';
import { adminJobService } from '@/services/adminJobService';
import companyService from '@/services/companyService';
import locationService, { State, City } from '@/services/locationService';
import { Company } from '@/types';
import DateInput from '@/components/ui/DateInput';
import toast from 'react-hot-toast';

type CreateCompanyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newCompany: Company) => void;
};

function CreateCompanyModal({ isOpen, onClose, onCreated }: CreateCompanyModalProps) {
  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCnpj = (value: string) => {
    
    const digits = value.replace(/\D/g, '');
    
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
      toast.error('Informe o nome da empresa');
      return;
    }
    if (!cnpj || cnpj.replace(/\D/g, '').length !== 14) {
      toast.error('Informe um CNPJ válido');
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
      toast.error('Erro ao criar empresa.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white p-6 rounded-md shadow-lg w-full max-w-md">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Criar Empresa</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="companyName" className="block text-sm text-slate-600 mb-2">Nome da Empresa *</label>
            <input
              id="companyName"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none"
              required
              placeholder="Ex: Tesserato Ltda"
            />
          </div>
          <div>
            <label htmlFor="companyCnpj" className="block text-sm text-slate-600 mb-2">CNPJ *</label>
            <input
              id="companyCnpj"
              type="text"
              value={cnpj}
              onChange={handleCnpjChange}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none"
              required
              placeholder="00.000.000/0000-00"
              maxLength={18}
              inputMode="numeric"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-md hover:bg-white">Cancelar</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-medium">{loading ? 'Salvando...' : 'Criar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function CreateJobPage() {
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [requirementsList, setRequirementsList] = useState<string[]>([]);
  const [requirementInput, setRequirementInput] = useState('');
  const router = useRouter();
  const getTomorrowDate = (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [states] = useState<State[]>(locationService.getStates());
  const [cities, setCities] = useState<City[]>([]);
  const [selectedState, setSelectedState] = useState<{ value: number; label: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState<{ value: string; label: string } | null>(null);
  const [loadingCities, setLoadingCities] = useState(false);

  // Zod schema
  const schema = z.object({
    title: z.string().min(1, 'Título obrigatório'),
    description: z.string().min(1, 'Descrição obrigatória'),
    location: z.string().min(1, 'Localização obrigatória'),
    job_type: z.enum(['full_time', 'part_time', 'contract', 'internship']),
    type_models: z.enum(['in_person', 'home_office', 'hybrid']),
    salary_min: z.string().optional(),
    salary_max: z.string().optional(),
    requirements: z.string().min(1, 'Requisitos obrigatórios'),
    responsibilities: z.string().min(1, 'Responsabilidades obrigatórias'),
    closure: z.string().min(1, 'Data obrigatória'),
    company: z.union([z.string(), z.number()]),
    is_active: z.boolean(),
  });

  type FormFields = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    setValue,
    register,
    formState: { errors },
  } = useForm<FormFields>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      job_type: 'full_time',
      type_models: 'in_person',
      salary_min: '',
      salary_max: '',
      requirements: '',
      responsibilities: '',
      closure: '',
  company: '',
      is_active: true,
    },
  });


  // Adiciona requisito ao pressionar Enter
  const handleRequirementKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && requirementInput.trim()) {
      e.preventDefault();
      setRequirementsList(prev => [...prev, requirementInput.trim()]);
      setRequirementInput('');
    }
  };

  // Remove requisito
  const handleRemoveRequirement = (idx: number) => {
    setRequirementsList(prev => prev.filter((_, i) => i !== idx));
  };

  // Atualiza o campo 'requirements' do formulário sempre que a lista mudar
  useEffect(() => {
    setValue('requirements', requirementsList.join(', '));
  }, [requirementsList, setValue]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const companiesData = await companyService.getAllCompanies();
      setCompanies(companiesData);
    } catch (error) {
      console.error('Erro ao carregar empresas:', error);
      toast.error('Erro ao carregar lista de empresas');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const handleCompanyCreated = (newCompany: Company) => {
    setCompanies(prev => [...prev, newCompany]);
    setValue('company', newCompany.id);
  };

  const loadCities = async (stateId: number) => {
    try {
      setLoadingCities(true);
      const citiesData = await locationService.getCitiesByState(stateId);
      setCities(citiesData);
    } catch (error) {
      console.error('Erro ao carregar cidades:', error);
      toast.error('Erro ao carregar lista de cidades');
    } finally {
      setLoadingCities(false);
    }
  };

  // Remove formatCurrency, pois agora serão valores numéricos simples

  const handleSalaryMinChange = (value: string) => {
    const rawValue = value.replace(/\D/g, '');
    setValue('salary_min', formatRS(rawValue));
  };

  const handleSalaryMaxChange = (value: string) => {
    const rawValue = value.replace(/\D/g, '');
    setValue('salary_max', formatRS(rawValue));
  };

  const handleStateChange = async (option: { value: number; label: string } | null) => {
    setSelectedState(option);
    setSelectedCity(null);
    setCities([]);
    setValue('location', '');
    if (option && option.value) {
      await loadCities(option.value);
    }
  };

  const handleCityChange = (option: { value: string; label: string } | null) => {
    setSelectedCity(option);
    if (option && selectedState) {
      const selectedStateData = states.find(state => state.id === selectedState.value);
      if (selectedStateData) {
        setValue('location', `${option.value}, ${selectedStateData.sigla}`);
      }
    } else {
      setValue('location', '');
    }
  };

  const onSubmit = async (data: FormFields) => {
    // Validação extra de datas
    if (data.closure) {
      const closureDate = new Date(data.closure);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (closureDate < today) {
        toast.error('A data de encerramento deve ser hoje ou uma data futura');
        return;
      }
    }
    // Validação dos salários
    if (data.salary_min && data.salary_max && parseInt(data.salary_min.replace(/\D/g, '')) > parseInt(data.salary_max.replace(/\D/g, ''))) {
      toast.error('O salário mínimo não pode ser maior que o máximo');
      return;
    }
    // Monta o salary_range no formato "min - max"
    let salaryRange = '';
    if (data.salary_min && data.salary_max) {
      salaryRange = `${data.salary_min} - ${data.salary_max}`;
    } else if (data.salary_min) {
      salaryRange = `${data.salary_min}`;
    } else if (data.salary_max) {
      salaryRange = `R$ 0,00 - ${data.salary_max}`;
    }
    // Junta requisitos
    const requirementsString = requirementsList.join(', ');
    if (!requirementsString) {
      toast.error('Adicione pelo menos um requisito');
      return;
    }
    // Validação de responsabilidades
    if (!data.responsibilities || !data.responsibilities.trim()) {
      toast.error('Preencha o campo de responsabilidades.');
      return;
    }
    setLoading(true);
    try {
      await adminJobService.createJob({
        ...data,
        salary_range: salaryRange,
        requirements: requirementsString,
        responsibilities: data.responsibilities,
        company: typeof data.company === 'string' ? Number(data.company) : data.company,
      });
      router.push('/admin-panel/jobs');
    } catch (error) {
      toast.error('Erro ao criar vaga. Verifique os dados e tente novamente.');
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
            href="/admin-panel/jobs"
            className="text-sky-600 hover:text-sky-500"
          >
            ← Voltar para lista
          </Link>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Nova Vaga</h1>
        <p className="text-slate-500 mt-1">
          Preencha os dados para criar uma nova vaga de emprego
        </p>
      </div>

  <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Informações Básicas
          </h2>
            <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-slate-600 mb-2">
                Título da Vaga *
              </label>
              <input
                type="text"
                id="title"
                {...register('title')}
                required
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Ex: Desenvolvedor Frontend"
              />
              {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="state" className="block text-sm font-medium text-slate-600 mb-2">
                  Estado *
                </label>
                <Select
                  id="state"
                  options={states.map(state => ({ value: state.id, label: `${state.nome} (${state.sigla})` }))}
                  value={selectedState}
                  onChange={handleStateChange}
                  placeholder="Selecione ou busque um estado"
                  isClearable
                  classNamePrefix="react-select"
                  styles={{
                    control: (base) => ({ ...base, backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a' }),
                    singleValue: (base) => ({ ...base, color: '#0f172a' }),
                    menu: (base) => ({ ...base, backgroundColor: '#ffffff', color: '#0f172a' }),
                    option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#e0f2fe' : '#ffffff', color: '#0f172a' }),
                  }}
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-slate-600 mb-2">
                  Cidade *
                </label>
                {loadingCities ? (
                  <div className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-500">
                    Carregando cidades...
                  </div>
                ) : (
                  <Select
                    id="city"
                    options={cities.map(city => ({ value: city.nome, label: city.nome }))}
                    value={selectedCity}
                    onChange={handleCityChange}
                    placeholder={selectedState ? "Selecione ou busque uma cidade" : "Primeiro selecione um estado"}
                    isClearable
                    isDisabled={!selectedState}
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({ ...base, backgroundColor: '#ffffff', borderColor: '#cbd5e1', color: '#0f172a', opacity: selectedState ? 1 : 0.5 }),
                      singleValue: (base) => ({ ...base, color: '#0f172a' }),
                      menu: (base) => ({ ...base, backgroundColor: '#ffffff', color: '#0f172a' }),
                      option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#e0f2fe' : '#ffffff', color: '#0f172a' }),
                    }}
                  />
                )}
              </div>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="job_type" className="block text-sm font-medium text-slate-600 mb-2">
                  Tipo de Contrato *
                </label>
                <select
                  id="job_type"
                  {...register('job_type')}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="full_time">Tempo Integral</option>
                  <option value="part_time">Meio Período</option>
                  <option value="contract">Contrato</option>
                  <option value="frelance">Freelance</option>
                  <option value="internship">Estágio</option>
                </select>
              </div>

              <div>
                <label htmlFor="type_models" className="block text-sm font-medium text-slate-600 mb-2">
                  Modelo de Trabalho *
                </label>
                <select
                  id="type_models"
                  {...register('type_models')}
                  required
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="in_person">Presencial</option>
                  <option value="home_office">Home Office</option>
                  <option value="hybrid">Híbrido</option>
                </select>
              </div>
          </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Faixa Salarial</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="salary_min"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="salary_min"
                      value={field.value}
                      onChange={e => handleSalaryMinChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Mínimo (ex: R$ 1400,00)"
                      inputMode="numeric"
                    />
                  )}
                />
                <Controller
                  name="salary_max"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="text"
                      id="salary_max"
                      value={field.value}
                      onChange={e => handleSalaryMaxChange(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Máximo (ex: R$ 3000,00)"
                      inputMode="numeric"
                    />
                  )}
                />
              </div>
            </div>

            <div>
              <label htmlFor="closure" className="block text-sm font-medium text-slate-600 mb-2">
                Data de Encerramento *
              </label>
              <Controller
                name="closure"
                control={control}
                render={({ field }) => (
                  <DateInput
                    id="closure"
                    name="closure"
                    value={field.value || ''}
                    onChange={(iso) => field.onChange(iso)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                )}
              />
              {errors.closure && <span className="text-red-500 text-xs">{errors.closure.message}</span>}
              <p className="text-xs text-slate-500 mt-1">
                A data deve ser amanhã ou uma data futura
              </p>
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-slate-600 mb-2">
                Empresa *
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                  {loadingCompanies ? (
                    <div className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-500">
                      Carregando empresas...
                    </div>
                  ) : (
                    <select
                      id="company"
                      {...register('company')}
                      required
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
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
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-medium"
                >
                  Criar nova empresa
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Descrição e Detalhes
          </h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-600 mb-2">
                Descrição da Vaga *
              </label>
              <textarea
                id="description"
                {...register('description')}
                required
                rows={4}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Descreva a vaga, o que a empresa faz, o ambiente de trabalho..."
              />
              {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-2">Requisitos *</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={requirementInput}
                  onChange={e => setRequirementInput(e.target.value)}
                  onKeyDown={handleRequirementKeyDown}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none"
                  placeholder="Digite o requisito e pressione Enter"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (requirementInput.trim()) {
                      setRequirementsList(prev => [...prev, requirementInput.trim()]);
                      setRequirementInput('');
                    }
                  }}
                  className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md font-medium"
                >Adicionar</button>
              </div>
              <ul className="mb-2">
                {requirementsList.map((req, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded mb-1">
                    <span className="text-slate-800 text-sm">{req}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRequirement(idx)}
                      className="text-red-600 hover:text-red-700 text-xs ml-2"
                    >Remover</button>
                  </li>
                ))}
              </ul>
              {errors.requirements && <span className="text-red-500 text-xs">{errors.requirements.message}</span>}
              <p className="text-xs text-slate-500">Pressione Enter ou clique em Adicionar para cada requisito.</p>
            </div>

            <div>
              <label htmlFor="responsibilities" className="block text-sm font-medium text-slate-600 mb-2">
                Responsabilidades *
              </label>
              <textarea
                id="responsibilities"
                {...register('responsibilities')}
                rows={4}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Descreva as principais responsabilidades do cargo..."
              />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 shadow-sm rounded-md p-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            Configurações
          </h2>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="h-4 w-4 text-sky-600 focus:ring-sky-500 border-slate-300 rounded bg-white"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-slate-600">
              Vaga ativa (visível para candidatos)
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <Link
            href="/admin-panel/jobs"
            className="px-6 py-2 border border-slate-300 text-slate-600 rounded-md hover:bg-white transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-sky-400 text-white rounded-md font-medium transition-colors"
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
