'use client';

import { useState, useEffect, useRef } from 'react';
import { formatTEL } from '@/functions/FormatTEL';
import Image from 'next/image';
import { CandidateProfile } from '@/types';
import candidateService from '@/services/candidateService';
import locationService, { State, City } from '@/services/locationService';
import { User, Camera, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export interface PersonalInfoSectionProps {
  profile: CandidateProfile | null;
  onUpdate: (data: Partial<CandidateProfile>) => Promise<void>;
  saving: boolean;
}

export default function PersonalInfoSection({ profile, onUpdate, saving }: PersonalInfoSectionProps) {
  const { wizzardStep, setWizardStep } = useAuth();
  const [formData, setFormData] = useState<Partial<CandidateProfile>>({
    cpf: '',
    date_of_birth: '',
    gender: undefined,
    phone_secondary: '',
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    state: '',
    city: ''
  });
  type RequiredField = 'cpf' | 'date_of_birth' | 'gender' | 'phone_secondary' | 'zip_code' | 'street' | 'number' | 'complement' | 'neighborhood' | 'state' | 'city';
  const [formErrors, setFormErrors] = useState<{[key in RequiredField]?: string}>({});

  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadStates();
  }, []);

  useEffect(() => {
    if (profile) {
      setFormData({
        cpf: profile.cpf || '',
        date_of_birth: profile.date_of_birth || '',
        gender: profile.gender || undefined,
        phone_secondary: profile.phone_secondary || '',
        zip_code: profile.zip_code || '',
        street: profile.street || '',
        number: profile.number || '',
        complement: profile.complement || '',
        neighborhood: profile.neighborhood || '',
        state: profile.state || '',
        city: profile.city || ''
      });

      // Se há um estado no perfil, encontrar o ID correspondente
      if (profile.state && states.length > 0) {
        const stateObj = states.find(state => state.sigla === profile.state);
        if (stateObj) {
          setSelectedStateId(stateObj.id);
        }
      }
      
      // Se existe uma imagem de perfil, configura o preview
      if (profile.image_profile) {
        setImagePreview(profile.image_profile);
      }
    }
      // Checa se algum campo está vazio
      if (profile) {
        const requiredFields = [
          { key: 'cpf', value: profile.cpf },
          { key: 'date_of_birth', value: profile.date_of_birth },
          { key: 'gender', value: profile.gender },
          { key: 'phone_secondary', value: profile.phone_secondary },
          { key: 'zip_code', value: profile.zip_code },
          { key: 'street', value: profile.street },
          { key: 'number', value: profile.number },
          { key: 'complement', value: profile.complement },
          { key: 'neighborhood', value: profile.neighborhood },
          { key: 'state', value: profile.state },
          { key: 'city', value: profile.city }
        ];
        const emptyFields = requiredFields.filter(field => !field.value || field.value === '').map(field => field.key);
        if (emptyFields.length > 0) {
          setWizardStep(0);
        } else {
          setWizardStep(1);
        }
      }
  }, [profile, states, setWizardStep]);

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
    } finally {
      setLoadingCities(false);
    }
  };

  const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = event.target.value;
    const stateObj = states.find(state => state.sigla === selectedState);
    
    setFormData(prev => ({ 
      ...prev, 
      state: selectedState,
      city: '' // Reset city when state changes
    }));
    
    if (stateObj) {
      setSelectedStateId(stateObj.id);
    } else {
      setSelectedStateId(null);
    }
  };

  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = event.target.value;
    setFormData(prev => ({ ...prev, city: selectedCity }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  // Scrolla para o topo da tela ao clicar em salvar
  window.scrollTo({ top: 0, behavior: 'smooth' });

    // Validação visual dos campos obrigatórios
    const requiredFields: RequiredField[] = [
      'cpf',
      'date_of_birth',
      'gender',
      'phone_secondary',
      'zip_code',
      'street',
      'number',
      'complement',
      'neighborhood',
      'state',
      'city'
    ];
    const newErrors: { [key in RequiredField]?: string } = {};
    requiredFields.forEach(field => {
      if (!formData[field] || formData[field] === '') {
        newErrors[field] = 'Campo obrigatório';
      }
    });

    // Validação da idade mínima
    if (formData.date_of_birth && calculateAge(formData.date_of_birth) < 14) {
      newErrors['date_of_birth'] = 'A idade mínima é de 14 anos';
    }

    setFormErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return;
    }

    // Se há uma imagem para upload, faz o upload primeiro
    if (profileImage && profile?.id) {
      try {
        await candidateService.uploadProfileImage(profile.id, profileImage);
      } catch (error) {
        console.error('Erro ao fazer upload da imagem:', error);
      }
    }
    await onUpdate(formData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      // Verifica se é uma imagem
      if (!file.type.startsWith('image/')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Verifica o tamanho (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('A imagem deve ter no máximo 5MB.');
        return;
      }
      
      setProfileImage(file);
      
      // Cria preview da imagem
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref not found');
    }
  };

  const formatCEP = (value: string) => {
    // Remove tudo que não for número
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara do CEP (00000-000)
    if (numericValue.length <= 5) {
      return numericValue;
    }
    return `${numericValue.slice(0, 5)}-${numericValue.slice(5, 8)}`;
  };

  const formatCPF = (value: string) => {
    // Remove tudo que não for número
    const numericValue = value.replace(/\D/g, '');
    
    // Aplica a máscara do CPF (000.000.000-00)
    if (numericValue.length <= 3) {
      return numericValue;
    } else if (numericValue.length <= 6) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3)}`;
    } else if (numericValue.length <= 9) {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6)}`;
    } else {
      return `${numericValue.slice(0, 3)}.${numericValue.slice(3, 6)}.${numericValue.slice(6, 9)}-${numericValue.slice(9, 11)}`;
    }
  };

  // Usa a máscara do arquivo FormatTEL.ts
  const formatPhone = (value: string) => {
    return formatTEL(value);
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'date_of_birth') {
      if (value && calculateAge(value) < 14) {
        alert('A idade mínima é de 14 anos. Por favor, insira uma data de nascimento válida.');
        return;
      }
    }
    if (name === 'zip_code') {
      const formattedValue = formatCEP(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else if (name === 'cpf') {
      const formattedValue = formatCPF(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else if (name === 'phone_secondary') {
      const formattedValue = formatPhone(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else if (name === 'emergency_contact_phone') {
      const formattedValue = formatPhone(value);
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Busca CEP na API ViaCEP
  const fetchAddressByCEP = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        // Atualiza rua, bairro, cidade e estado
        setFormData(prev => ({
          ...prev,
          street: data.logradouro || prev.street,
          neighborhood: data.bairro || prev.neighborhood,
          city: data.localidade || prev.city,
          state: data.uf || prev.state
        }));
        // Atualiza estado selecionado para carregar cidades
        const stateObj = states.find(state => state.sigla === data.uf);
        if (stateObj) {
          setSelectedStateId(stateObj.id);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
    }
  };

  const genderOptions = candidateService.getGenderOptions();

  return (
    <div className="lg:p-6">
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Foto de Perfil */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group" onClick={handleImageClick}>
            <div 
              className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-slate-400 cursor-pointer transition-all duration-200 group-hover:border-blue-200"
              onClick={handleImageClick}
            >
              {imagePreview ? (
                <Image 
                  src={imagePreview} 
                  alt="Foto de perfil" 
                  width={128}
                  height={128}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <User className="w-16 h-16 text-slate-700" />
                </div>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center cursor-pointer">
              <Camera className="w-8 h-8 text-blue-200" />
            </div>
          </div>
          
          {/* Input file - garantindo que está sendo renderizado */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            style={{ display: 'none' }}
            id="profile-image-input"
          />
          
          <p className="text-sm text-slate-700 mt-2 text-center">
            Clique na imagem para alterar a foto de perfil<br />
            <span className="text-xs">Máximo 5MB • JPG, PNG, GIF</span>
          </p>
        </div>
        {/* CPF e Data de Nascimento */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="cpf" className="block text-sm font-medium text-zinc-700 mb-2">
              CPF
            </label>
            <input
              type="text"
              id="cpf"
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              placeholder="000.000.000-00"
              maxLength={14}
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.cpf ? 'border-red-500' : 'border-slate-400'}`}
            />
            {formErrors.cpf && <p className="text-xs text-red-500 mt-1">{formErrors.cpf}</p>}
          </div>

          <div>
            <label htmlFor="date_of_birth" className="block text-sm font-medium text-zinc-700 mb-2">
              Data de Nascimento {wizzardStep}
            </label>
            <input
              type="date"
              id="date_of_birth"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.date_of_birth ? 'border-red-500' : 'border-slate-400'}`}
            />
            <p className="text-xs mt-1 text-slate-600">
              Idade mínima é 14 anos
            </p>
            {formErrors.date_of_birth && <p className="text-xs text-red-500 mt-1">{formErrors.date_of_birth}</p>}
          </div>
        </div>

        {/* Gênero e Telefone Secundário */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-zinc-700 mb-2">
              Gênero
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.gender ? 'border-red-500' : 'border-slate-400'}`}
            >
              <option value="">Selecione...</option>
              {genderOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {formErrors.gender && <p className="text-xs text-red-500 mt-1">{formErrors.gender}</p>}
          </div>

          <div>
            <label htmlFor="phone_secondary" className="block text-sm font-medium text-zinc-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              id="phone_secondary"
              name="phone_secondary"
              value={formData.phone_secondary}
              onChange={handleChange}
              placeholder="+55 (11) 99999-9999"
              maxLength={19}
              className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.phone_secondary ? 'border-red-500' : 'border-slate-400'}`}
            />
            {formErrors.phone_secondary && <p className="text-xs text-red-500 mt-1">{formErrors.phone_secondary}</p>}
          </div>
        </div>

        {/* Endereço */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700">Endereço</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="zip_code" className="block text-sm font-medium text-zinc-700 mb-2">
                CEP
              </label>
              <input
                type="text"
                id="zip_code"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                onBlur={() => fetchAddressByCEP(formData.zip_code || '')}
                placeholder="00000-000"
                maxLength={9}
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.zip_code ? 'border-red-500' : 'border-slate-400'}`}
              />
              {formErrors.zip_code && <p className="text-xs text-red-500 mt-1">{formErrors.zip_code}</p>}
            </div>

            <div className="md:col-span-2">
              <label htmlFor="street" className="block text-sm font-medium text-zinc-700 mb-2">
                Rua
              </label>
              <input
                type="text"
                id="street"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Nome da rua"
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.street ? 'border-red-500' : 'border-slate-400'}`}
              />
              {formErrors.street && <p className="text-xs text-red-500 mt-1">{formErrors.street}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="number" className="block text-sm font-medium text-zinc-700 mb-2">
                Número
              </label>
              <input
                type="text"
                id="number"
                name="number"
                value={formData.number}
                onChange={handleChange}
                placeholder="123"
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.number ? 'border-red-500' : 'border-slate-400'}`}
              />
              {formErrors.number && <p className="text-xs text-red-500 mt-1">{formErrors.number}</p>}
            </div>

            <div>
              <label htmlFor="complement" className="block text-sm font-medium text-zinc-700 mb-2">
                Complemento
              </label>
              <input
                type="text"
                id="complement"
                name="complement"
                value={formData.complement}
                onChange={handleChange}
                placeholder="Apto, Casa, etc."
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.complement ? 'border-red-500' : 'border-slate-400'}`}
              />
              {formErrors.complement && <p className="text-xs text-red-500 mt-1">{formErrors.complement}</p>}
            </div>

            <div>
              <label htmlFor="neighborhood" className="block text-sm font-medium text-zinc-700 mb-2">
                Bairro
              </label>
              <input
                type="text"
                id="neighborhood"
                name="neighborhood"
                value={formData.neighborhood}
                onChange={handleChange}
                placeholder="Nome do bairro"
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.neighborhood ? 'border-red-500' : 'border-slate-400'}`}
              />
              {formErrors.neighborhood && <p className="text-xs text-red-500 mt-1">{formErrors.neighborhood}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-zinc-700 mb-2">
                Estado *
              </label>
              <select
                id="state"
                name="state"
                value={formData.state}
                onChange={handleStateChange}
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.state ? 'border-red-500' : 'border-slate-400'}`}
                disabled={loadingStates}
              >
                <option value="">
                  {loadingStates ? 'Carregando...' : 'Selecione um estado'}
                </option>
                {states.map((state) => (
                  <option key={state.id} value={state.sigla}>
                    {state.nome} ({state.sigla})
                  </option>
                ))}
              </select>
              {formErrors.state && <p className="text-xs text-red-500 mt-1">{formErrors.state}</p>}
            </div>
            
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-zinc-700 mb-2">
                Cidade *
              </label>
              <select
                id="city"
                name="city"
                value={formData.city}
                onChange={handleCityChange}
                className={`w-full px-3 py-2 bg-white border rounded-md text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${formErrors.city ? 'border-red-500' : 'border-slate-400'}`}
                disabled={!selectedStateId || loadingCities}
              >
                <option value="">
                  {!selectedStateId 
                    ? 'Primeiro selecione um estado' 
                    : loadingCities 
                    ? 'Carregando...' 
                    : 'Selecione uma cidade'
                  }
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.nome}>
                    {city.nome}
                  </option>
                ))}
              </select>
              {formErrors.city && <p className="text-xs text-red-500 mt-1">{formErrors.city}</p>}
            </div>
          </div>
        </div>

        {/* Botão de Salvar */}
        <div className="flex justify-center lg:justify-end pt-6 border-t border-zinc-400">
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-900 hover:bg-blue-800 disabled:bg-slate-700 disabled:opacity-50 text-slate-100 px-6 py-2 rounded-md font-medium transition-colors flex items-center cursor-pointer"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                Próximo
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
