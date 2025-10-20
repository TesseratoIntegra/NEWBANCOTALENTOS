'use client';

import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import AuthService from '@/services/auth';
import applicationService from '@/services/applicationService';
import spontaneousService from '@/services/spontaneousService';
import candidateService from '@/services/candidateService';
import type { Application, Occupation, CandidateProfile } from '@/types';

// Interface completa para candidaturas espontâneas (baseada no código original)
interface SpontaneousApplicationComplete {
	id: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
	name: string;
	cpf: string;
	email: string;
	phone: string;
	city: string;
	state: string;
	neighborhood: string;
	number: string;
	complement: string;
	resume: string;
	area_1: number;
	area_2: number;
	area_3: number;
}

// Interface estendida para candidaturas normais (com campos adicionais do serializer)
interface ApplicationExtended extends Application {
	email?: string;
}

// Interface unificada para os dados das candidaturas
interface UnifiedApplication {
	id: number;
	type: 'normal' | 'spontaneous';
	name: string;
	email: string;
	phone: string;
	cpf?: string;
	gender?: 'M' | 'F' | 'O' | 'N';
	city: string;
	state: string;
	neighborhood?: string;
	number?: string;
	complement?: string;
	resume?: string;
	created_at: string;
	status?: string;
	job_title?: string;
	company_name?: string;
	candidate_profile_id?: number;
	// Campos específicos para candidaturas espontâneas
	area_1?: number;
	area_2?: number;
	area_3?: number;
	original_data: ApplicationExtended | SpontaneousApplicationComplete;
}

// Modal de detalhes
interface DetailsModalProps {
	application: UnifiedApplication | null;
	onClose: () => void;
	occupations: Occupation[];
}

function DetailsModal({ application, onClose, occupations }: DetailsModalProps) {
	if (!application) return null;

	const getOccupationTitle = (id: number) => {
		const occ = occupations.find(o => o.id === id);
		return occ ? occ.title : `ID ${id}`;
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
			<div className="bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-600/50 rounded-xl p-8 w-full max-w-4xl relative shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-zinc-400 hover:text-white bg-zinc-700/50 hover:bg-zinc-600/50 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
					aria-label="Fechar"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<div className="mb-6">
					<div className="flex items-center space-x-3 mb-4">
						<div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
							{application.name?.charAt(0)?.toUpperCase() || '?'}
						</div>
						<div>
							<h2 className="text-2xl font-bold text-white">{application.name}</h2>
							<div className="flex items-center space-x-2 mt-1">
								<span className={`px-3 py-1 rounded-full text-xs font-medium ${
									application.type === 'spontaneous' 
										? 'bg-indigo-500/20 text-indigo-300' 
										: 'bg-green-500/20 text-green-300'
								}`}>
									{application.type === 'spontaneous' ? 'Candidatura Espontânea' : 'Candidatura para Vaga'}
								</span>
								{application.status && (
									<span className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-500/20 text-zinc-300">
										{application.status}
									</span>
								)}
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Informações Pessoais */}
					<div>
						<h3 className="text-lg font-semibold text-white mb-4 flex items-center">
							<svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							Informações Pessoais
						</h3>
						<div className="space-y-3">
							<div className="bg-zinc-700/30 p-3 rounded-lg">
								<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Email</label>
								<p className="text-white mt-1">{application.email}</p>
							</div>
							<div className="bg-zinc-700/30 p-3 rounded-lg">
								<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Telefone</label>
								<p className="text-white mt-1">{application.phone}</p>
							</div>
							{application.cpf && (
								<div className="bg-zinc-700/30 p-3 rounded-lg">
									<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">CPF</label>
									<p className="text-white mt-1">{application.cpf}</p>
								</div>
							)}
						</div>
					</div>

					{/* Endereço */}
					<div>
						<h3 className="text-lg font-semibold text-white mb-4 flex items-center">
							<svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							Endereço
						</h3>
						<div className="space-y-3">
							<div className="bg-zinc-700/30 p-3 rounded-lg">
								<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Cidade/Estado</label>
								<p className="text-white mt-1">{application.city}, {application.state}</p>
							</div>
							{application.neighborhood && (
								<div className="bg-zinc-700/30 p-3 rounded-lg">
									<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Bairro</label>
									<p className="text-white mt-1">{application.neighborhood}</p>
								</div>
							)}
							{application.number && (
								<div className="bg-zinc-700/30 p-3 rounded-lg">
									<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Número</label>
									<p className="text-white mt-1">{application.number} {application.complement && `• ${application.complement}`}</p>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Informações da Candidatura */}
				<div className="mt-6 pt-6 border-t border-zinc-600/50">
					<h3 className="text-lg font-semibold text-white mb-4 flex items-center">
						<svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8z" />
						</svg>
						{application.type === 'spontaneous' ? 'Áreas de Interesse' : 'Vaga Aplicada'}
					</h3>
					
					{application.type === 'spontaneous' ? (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{application.area_1 && (
								<div className="bg-zinc-700/30 p-3 rounded-lg">
									<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Área 1</label>
									<p className="text-white mt-1">{getOccupationTitle(application.area_1)}</p>
								</div>
							)}
							{application.area_2 && (
								<div className="bg-zinc-700/30 p-3 rounded-lg">
									<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Área 2</label>
									<p className="text-white mt-1">{getOccupationTitle(application.area_2)}</p>
								</div>
							)}
							{application.area_3 && (
								<div className="bg-zinc-700/30 p-3 rounded-lg">
									<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Área 3</label>
									<p className="text-white mt-1">{getOccupationTitle(application.area_3)}</p>
								</div>
							)}
						</div>
					) : (
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="bg-zinc-700/30 p-3 rounded-lg">
								<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Vaga</label>
								<p className="text-white mt-1">{application.job_title || 'Não informado'}</p>
							</div>
							<div className="bg-zinc-700/30 p-3 rounded-lg">
								<label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Empresa</label>
								<p className="text-white mt-1">{application.company_name || 'Não informado'}</p>
							</div>
						</div>
					)}
				</div>

				{/* Currículo e Data */}
				<div className="mt-6 pt-6 border-t border-zinc-600/50">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 className="text-lg font-semibold text-white mb-3 flex items-center">
								<svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Documentos
							</h3>
							{application.resume ? (
								<a 
									href={application.resume} 
									target="_blank" 
									rel="noopener noreferrer" 
									className="flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-indigo-500/25"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<span>Baixar Currículo</span>
								</a>
							) : (
								<p className="text-zinc-400">Currículo não disponível</p>
							)}
						</div>
						<div>
							<h3 className="text-lg font-semibold text-white mb-3 flex items-center">
								<svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								Data de Cadastro
							</h3>
							<div className="bg-zinc-700/30 p-3 rounded-lg">
								<p className="text-white">{new Date(application.created_at).toLocaleString('pt-BR')}</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function TotalCandidaturas() {
	const [applications, setApplications] = useState<UnifiedApplication[]>([]);
	const [filteredApplications, setFilteredApplications] = useState<UnifiedApplication[]>([]);
	const [occupations, setOccupations] = useState<Occupation[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedApp, setSelectedApp] = useState<UnifiedApplication | null>(null);
	const [searchTerm, setSearchTerm] = useState('');
	const [filterType, setFilterType] = useState<'all' | 'normal' | 'spontaneous'>('all');

	// Função para unificar os dados das candidaturas
	const unifyApplicationData = async (
		normalApps: ApplicationExtended[], 
		spontaneousApps: unknown[]
	): Promise<UnifiedApplication[]> => {
		const unified: UnifiedApplication[] = [];

		// Processar candidaturas normais - buscar dados do perfil para obter CPF e gênero
		for (const app of normalApps) {
			console.log('Processando candidatura normal:', app);
			let candidateProfile: CandidateProfile | null = null;

			// Buscar perfil do candidato se tiver candidate_profile_id
			if (app.candidate_profile_id) {
				try {
					candidateProfile = await candidateService.getCandidateProfile(app.candidate_profile_id);
				} catch (error) {
					console.error(`Erro ao buscar perfil do candidato ${app.candidate_profile_id}:`, error);
				}
			}

			unified.push({
				id: app.id,
				type: 'normal',
				name: app.candidate_name || app.name || 'Nome não informado',
				email: app.email || 'Email não informado',
				phone: app.phone || 'Telefone não informado',
				cpf: candidateProfile?.cpf,
				gender: candidateProfile?.gender,
				city: app.city || 'Cidade não informada',
				state: app.state || 'Estado não informado',
				neighborhood: undefined,
				number: undefined,
				complement: undefined,
				resume: app.resume,
				created_at: app.applied_at || app.created_at,
				status: app.status,
				job_title: app.job_title,
				company_name: app.company_name,
				candidate_profile_id: app.candidate_profile_id,
				original_data: app
			});
		}

		// Processar candidaturas espontâneas
		spontaneousApps.forEach(appUnknown => {
			const app = appUnknown as SpontaneousApplicationComplete;
			console.log('Processando candidatura espontânea:', app);
			unified.push({
				id: app.id,
				type: 'spontaneous',
				name: app.name || 'Nome não informado',
				email: app.email || 'Email não informado',
				phone: app.phone || 'Telefone não informado',
				cpf: app.cpf,
				gender: undefined, // Candidaturas espontâneas não têm gênero no modelo atual
				city: app.city || 'Cidade não informada',
				state: app.state || 'Estado não informado',
				neighborhood: app.neighborhood,
				number: app.number,
				complement: app.complement,
				resume: app.resume,
				created_at: app.created_at,
				area_1: app.area_1,
				area_2: app.area_2,
				area_3: app.area_3,
				original_data: app
			});
		});

		return unified.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
	};

	// Carregar dados
	useEffect(() => {
		const fetchData = async () => {
			setLoading(true);
			try {
				const accessToken = AuthService.getAccessToken();
				if (!accessToken) {
					setError('Token de acesso não encontrado');
					return;
				}

				// Buscar candidaturas normais
				const normalApplicationsPromise = applicationService.getApplications();
				
				// Buscar candidaturas espontâneas
				const spontaneousApplicationsPromise = spontaneousService.getSpontaneousApplications();
				
				// Buscar ocupações
				const occupationsPromise = spontaneousService.getOccupations();

				const [normalResponse, spontaneousResponse, occupationsResponse] = await Promise.all([
					normalApplicationsPromise,
					spontaneousApplicationsPromise,
					occupationsPromise
				]);

				// Verificar se a resposta é paginada (tem .results) ou é um array direto
				const normalApps = Array.isArray(normalResponse) 
					? normalResponse as ApplicationExtended[]
					: (Array.isArray(normalResponse.results) ? normalResponse.results as ApplicationExtended[] : []);
				
				const spontaneousApps = Array.isArray(spontaneousResponse) 
					? spontaneousResponse
					: (Array.isArray(spontaneousResponse.results) ? spontaneousResponse.results : []);
				
				const occs = Array.isArray(occupationsResponse) 
					? occupationsResponse
					: (Array.isArray(occupationsResponse.results) ? occupationsResponse.results : []);

				console.log('Dados recebidos:');
				console.log('Normal Apps:', normalApps);
				console.log('Spontaneous Apps:', spontaneousApps);
				console.log('Occupations:', occs);

				const unifiedData = await unifyApplicationData(normalApps, spontaneousApps);
				
				console.log('Dados unificados:', unifiedData);
				
				setApplications(unifiedData);
				setFilteredApplications(unifiedData);
				setOccupations(occs);

			} catch (err) {
				setError('Erro ao carregar candidaturas');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Aplicar filtros
	useEffect(() => {
		let filtered = applications;

		// Filtrar por tipo
		if (filterType !== 'all') {
			filtered = filtered.filter(app => app.type === filterType);
		}

		// Filtrar por termo de busca
		if (searchTerm.trim()) {
			const term = searchTerm.toLowerCase();
			filtered = filtered.filter(app =>
				app.name.toLowerCase().includes(term) ||
				app.email.toLowerCase().includes(term) ||
				app.phone.includes(term) ||
				app.cpf?.includes(term) ||
				app.city.toLowerCase().includes(term) ||
				app.state.toLowerCase().includes(term) ||
				app.neighborhood?.toLowerCase().includes(term) ||
				app.job_title?.toLowerCase().includes(term) ||
				app.company_name?.toLowerCase().includes(term)
			);
		}

		setFilteredApplications(filtered);
	}, [applications, filterType, searchTerm]);

	const getOccupationTitle = (id: number) => {
		const occ = occupations.find(o => o.id === id);
		return occ ? occ.title : `ID ${id}`;
	};

	// Função para formatar o gênero
	const formatGender = (gender?: 'M' | 'F' | 'O' | 'N') => {
		if (!gender) return '-';
		switch (gender) {
			case 'M': return 'Masculino';
			case 'F': return 'Feminino';
			case 'O': return 'Outros';
			case 'N': return 'Não informado';
			default: return '-';
		}
	};

	// Função para exportar dados para Excel
	const exportToExcel = () => {
		if (filteredApplications.length === 0) {
			alert('Não há dados para exportar!');
			return;
		}

		// Preparar dados para o Excel
		const excelData = filteredApplications.map((app, index) => {
			const baseData = {
				'#': index + 1,
				'Nome': app.name,
				'Email': app.email,
				'Telefone': app.phone,
				'CPF': app.cpf || '-',
				'Gênero': formatGender(app.gender),
				'Cidade': app.city,
				'Estado': app.state,
				'Bairro': app.neighborhood || '-',
				'Número': app.number || '-',
				'Complemento': app.complement || '-',
				'Tipo de Candidatura': app.type === 'spontaneous' ? 'Candidatura Espontânea' : 'Candidatura para Vaga',
				'Data de Cadastro': new Date(app.created_at).toLocaleString('pt-BR'),
				'Tem Currículo': app.resume ? 'Sim' : 'Não'
			};

			// Adicionar campos específicos por tipo
			if (app.type === 'normal') {
				return {
					...baseData,
					'Vaga': app.job_title || '-',
					'Empresa': app.company_name || '-',
					'Status': app.status || '-',
					'Área 1': '-',
					'Área 2': '-',
					'Área 3': '-'
				};
			} else {
				return {
					...baseData,
					'Vaga': '-',
					'Empresa': '-',
					'Status': '-',
					'Área 1': app.area_1 ? getOccupationTitle(app.area_1) : '-',
					'Área 2': app.area_2 ? getOccupationTitle(app.area_2) : '-',
					'Área 3': app.area_3 ? getOccupationTitle(app.area_3) : '-'
				};
			}
		});

		// Criar workbook e worksheet
		const workbook = XLSX.utils.book_new();
		const worksheet = XLSX.utils.json_to_sheet(excelData);

		// Configurar largura das colunas
		const columnWidths = [
			{ wch: 5 },   // #
			{ wch: 25 },  // Nome
			{ wch: 30 },  // Email
			{ wch: 15 },  // Telefone
			{ wch: 15 },  // CPF
			{ wch: 15 },  // Gênero
			{ wch: 20 },  // Cidade
			{ wch: 10 },  // Estado
			{ wch: 20 },  // Bairro
			{ wch: 10 },  // Número
			{ wch: 15 },  // Complemento
			{ wch: 25 },  // Tipo de Candidatura
			{ wch: 20 },  // Data de Cadastro
			{ wch: 15 },  // Tem Currículo
			{ wch: 30 },  // Vaga
			{ wch: 25 },  // Empresa
			{ wch: 15 },  // Status
			{ wch: 25 },  // Área 1
			{ wch: 25 },  // Área 2
			{ wch: 25 }   // Área 3
		];
		worksheet['!cols'] = columnWidths;

		// Adicionar worksheet ao workbook
		XLSX.utils.book_append_sheet(workbook, worksheet, 'Candidaturas');

		// Gerar nome do arquivo com data atual
		const now = new Date();
		const dateStr = now.toISOString().split('T')[0];
		const timeStr = now.toLocaleTimeString('pt-BR', { 
			hour: '2-digit', 
			minute: '2-digit' 
		}).replace(':', 'h');
		
		const fileName = `candidaturas_${dateStr}_${timeStr}.xlsx`;

		// Fazer download do arquivo
		XLSX.writeFile(workbook, fileName);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
				<div className="text-zinc-300 text-lg">Carregando candidaturas...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center">
				<div className="text-red-400 text-lg">{error}</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen py-6">
			<div className="w-full mx-auto space-y-8">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
						Todas as Candidaturas
					</h1>
					<p className="text-zinc-400 text-lg">
						Gerencie todas as candidaturas recebidas pela plataforma
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="bg-gradient-to-r from-indigo-600 to-indigo-700 p-6 rounded-lg shadow-lg">
						<h3 className="text-white text-sm font-medium">Total</h3>
						<p className="text-white text-3xl font-bold mt-2">{applications.length}</p>
					</div>
					<div className="bg-gradient-to-r from-green-600 to-green-700 p-6 rounded-lg shadow-lg">
						<h3 className="text-white text-sm font-medium">Candidaturas para Vagas</h3>
						<p className="text-white text-3xl font-bold mt-2">
							{applications.filter(app => app.type === 'normal').length}
						</p>
					</div>
					<div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-lg shadow-lg">
						<h3 className="text-white text-sm font-medium">Candidaturas Espontâneas</h3>
						<p className="text-white text-3xl font-bold mt-2">
							{applications.filter(app => app.type === 'spontaneous').length}
						</p>
					</div>
					<div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-6 rounded-lg shadow-lg">
						<h3 className="text-white text-sm font-medium">Filtrados</h3>
						<p className="text-white text-3xl font-bold mt-2">{filteredApplications.length}</p>
					</div>
				</div>

				{/* Filtros */}
				<div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-lg p-6">
					<div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
						{/* Select de Filtro */}
						<div className="flex items-center space-x-4">
							<label className="text-zinc-300 font-medium">Filtrar por:</label>
							<select
								value={filterType}
								onChange={(e) => setFilterType(e.target.value as 'all' | 'normal' | 'spontaneous')}
								className="bg-zinc-700 border border-zinc-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
							>
								<option value="all">Todas as Candidaturas</option>
								<option value="normal">Candidaturas para Vagas</option>
								<option value="spontaneous">Candidaturas Espontâneas</option>
							</select>
						</div>

						{/* Campo de Busca */}
						<div className="flex-1 w-full lg:max-w-md">
							<div className="relative">
								<svg 
									className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-5 h-5"
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
								</svg>
								<input
									type="text"
									placeholder="Buscar por nome, email, telefone, cidade..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="w-full pl-10 pr-4 py-3 bg-zinc-700/50 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
								/>
								{searchTerm && (
									<button
										onClick={() => setSearchTerm('')}
										className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-white transition-colors"
									>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
									</button>
								)}
							</div>
						</div>

						{/* Botão de Exportar */}
						<div className="flex items-center">
							<button
								onClick={exportToExcel}
								disabled={filteredApplications.length === 0}
								className="flex items-center space-x-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-zinc-600 disabled:to-zinc-700 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-green-500/25 cursor-pointer"
								title={filteredApplications.length === 0 ? "Não há dados para exportar" : "Exportar dados para Excel"}
							>
								<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
								</svg>
								<span>Exportar Excel</span>
							</button>
						</div>
					</div>
				</div>

				{/* Tabela */}
				<div className="w-full bg-zinc-800/30 backdrop-blur-sm border border-zinc-700 rounded-lg shadow-lg overflow-hidden">
					<div className="overflow-x-auto overflow-y-auto max-h-[600px]">
						<table className="w-full">
							<thead className="bg-zinc-700/50">
								<tr>
									<th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
										Candidato
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
										Tipo
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
										Contato
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
										Localização
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
										Info Adicional
									</th>
									<th className="px-6 py-4 text-left text-xs font-medium text-zinc-300 uppercase tracking-wider">
										Data
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-zinc-700">
								{filteredApplications.length > 0 ? (
									filteredApplications.map((app, index) => (
										<tr 
											key={`${app.type}-${app.id}`}
											onClick={()=> app.type !== 'spontaneous' ? window.location.href = '/admin-panel/candidaturas/'+app.id : setSelectedApp(app)}
											className={`hover:bg-zinc-700/50 cursor-pointer transition-colors ${
												index % 2 === 0 ? 'bg-zinc-800/20' : 'bg-transparent'
											}`}
										>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="flex items-center space-x-3">
													<div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
														{app.name.charAt(0).toUpperCase()}
													</div>
													<div>
														<div className="text-sm font-medium text-white">{app.name}</div>
														{app.cpf && (
															<div className="text-xs text-zinc-400">CPF: {app.cpf}</div>
														)}
													</div>
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													app.type === 'spontaneous' 
														? 'bg-indigo-500/20 text-indigo-300' 
														: 'bg-green-500/20 text-green-300'
												}`}>
													{app.type === 'spontaneous' ? 'Espontânea' : 'Para Vaga'}
												</span>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm">
													<div className="text-white">{app.email}</div>
													<div className="text-zinc-400">{app.phone}</div>
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm text-white">
													{app.city}, {app.state}
													{app.neighborhood && (
														<div className="text-xs text-zinc-400">{app.neighborhood}</div>
													)}
												</div>
											</td>
											<td className="px-6 py-4">
												<div className="text-sm">
													{app.type === 'normal' ? (
														<div>
															<div className="text-white">{app.job_title || 'Vaga não informada'}</div>
															<div className="text-xs text-zinc-400">{app.company_name || 'Empresa não informada'}</div>
															{app.status && (
																<div className="text-xs text-zinc-400 mt-1">Status: {app.status}</div>
															)}
														</div>
													) : (
														<div className="space-y-1">
															{app.area_1 && (
																<div className="text-xs text-zinc-300">• {getOccupationTitle(app.area_1)}</div>
															)}
															{app.area_2 && (
																<div className="text-xs text-zinc-300">• {getOccupationTitle(app.area_2)}</div>
															)}
															{app.area_3 && (
																<div className="text-xs text-zinc-300">• {getOccupationTitle(app.area_3)}</div>
															)}
														</div>
													)}
												</div>
											</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<div className="text-sm text-white">
													{new Date(app.created_at).toLocaleDateString('pt-BR')}
												</div>
												<div className="text-xs text-zinc-400">
													{new Date(app.created_at).toLocaleTimeString('pt-BR', { 
														hour: '2-digit', 
														minute: '2-digit' 
													})}
												</div>
											</td>
										</tr>
									))
								) : (
									<tr>
										<td colSpan={7} className="px-6 py-12 text-center">
											<div className="w-16 h-16 mx-auto mb-4 bg-zinc-700 rounded-full flex items-center justify-center">
												<svg className="w-8 h-8 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
												</svg>
											</div>
											<h3 className="text-lg font-medium text-zinc-300 mb-2">
												Nenhuma candidatura encontrada
											</h3>
											<p className="text-zinc-400">
												{searchTerm || filterType !== 'all' 
													? 'Tente ajustar os filtros de busca' 
													: 'Ainda não há candidaturas registradas no sistema'
												}
											</p>
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>

				{/* Modal */}
				{selectedApp && (
					<DetailsModal 
						application={selectedApp} 
						onClose={() => setSelectedApp(null)} 
						occupations={occupations} 
					/>
				)}
			</div>
		</div>
	);
}
