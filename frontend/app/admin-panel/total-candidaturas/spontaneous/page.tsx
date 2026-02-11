'use client';

import { useEffect, useState } from 'react';
import spontaneousService from '@/services/spontaneousService';

interface ModalProps {
	application: SpontaneousApplication | null;
	onClose: () => void;
}

import type { Occupation } from '@/types';

interface SpontaneousApplication {
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

function DetailsModal({ application, onClose, occupations }: ModalProps & { occupations: Occupation[] }) {
	if (!application) return null;

	const getOccupationTitle = (id: number) => {
		const occ = occupations.find(o => o.id === id);
		return occ ? occ.title : `ID ${id}`;
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
			<div className="bg-white border border-slate-200 rounded-xl p-8 w-full max-w-2xl relative shadow-xl max-h-[90vh] overflow-y-auto">
				<button
					onClick={onClose}
					className="absolute top-4 right-4 text-slate-500 hover:text-slate-900 bg-slate-50 hover:bg-slate-200/50 rounded-full w-8 h-8 flex items-center justify-center transition-all duration-200"
					aria-label="Fechar"
				>
					<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
				
				<div className="mb-6">
					<div className="flex items-center space-x-4 mb-4">
						<div className="w-12 h-12 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
							{application.name?.charAt(0)?.toUpperCase() || '?'}
						</div>
						<div>
							<h2 className="text-2xl font-bold text-slate-900 mb-1">
								{application.name || 'Nome não informado'}
							</h2>
							<span className="text-sm bg-sky-50 text-sky-700 border border-sky-200 px-3 py-1 rounded-full">
								Candidatura Espontânea
							</span>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Informações Pessoais */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
							<svg className="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
							</svg>
							Informações Pessoais
						</h3>
						
						<div className="space-y-3">
							<div className="bg-slate-50 p-3 rounded-lg">
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">CPF</label>
								<p className="text-slate-900 mt-1">{application.cpf}</p>
							</div>
							
							<div className="bg-slate-50 p-3 rounded-lg">
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Email</label>
								<p className="text-slate-900 mt-1">{application.email}</p>
							</div>
							
							<div className="bg-slate-50 p-3 rounded-lg">
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Telefone</label>
								<p className="text-slate-900 mt-1">{application.phone}</p>
							</div>
						</div>
					</div>

					{/* Endereço */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
							<svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							Endereço
						</h3>
						
						<div className="space-y-3">
							<div className="bg-slate-50 p-3 rounded-lg">
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cidade / Estado</label>
								<p className="text-slate-900 mt-1">{application.city}, {application.state}</p>
							</div>
							
							<div className="bg-slate-50 p-3 rounded-lg">
								<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Bairro</label>
								<p className="text-slate-900 mt-1">{application.neighborhood}</p>
							</div>
							
							<div className="grid grid-cols-2 gap-3">
								<div className="bg-slate-50 p-3 rounded-lg">
									<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Número</label>
									<p className="text-slate-900 mt-1">{application.number}</p>
								</div>
								<div className="bg-slate-50 p-3 rounded-lg">
									<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Complemento</label>
									<p className="text-slate-900 mt-1">{application.complement || '-'}</p>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Áreas de Interesse */}
				<div className="mt-6">
					<h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
						<svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 112 0v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h8zm-8 0h8m-8 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
						</svg>
						Áreas de Interesse
					</h3>
					
					<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
						<div className="bg-slate-50 p-3 rounded-lg">
							<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Área 1</label>
							<p className="text-slate-900 mt-1">{getOccupationTitle(application.area_1)}</p>
						</div>
						<div className="bg-slate-50 p-3 rounded-lg">
							<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Área 2</label>
							<p className="text-slate-900 mt-1">{getOccupationTitle(application.area_2)}</p>
						</div>
						<div className="bg-slate-50 p-3 rounded-lg">
							<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Área 3</label>
							<p className="text-slate-900 mt-1">{getOccupationTitle(application.area_3)}</p>
						</div>
					</div>
				</div>

				{/* Datas e Currículo */}
				<div className="mt-6 pt-6 border-t border-slate-300/50">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
								<svg className="w-5 h-5 mr-2 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
								</svg>
								Informações do Sistema
							</h3>
							
							<div className="space-y-3">
								<div className="bg-slate-50 p-3 rounded-lg">
									<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Cadastrado em</label>
									<p className="text-slate-900 mt-1">{new Date(application.created_at).toLocaleString('pt-BR')}</p>
								</div>
								
								<div className="bg-slate-50 p-3 rounded-lg">
									<label className="text-xs font-medium text-slate-500 uppercase tracking-wide">Atualizado em</label>
									<p className="text-slate-900 mt-1">{new Date(application.updated_at).toLocaleString('pt-BR')}</p>
								</div>
							</div>
						</div>

						<div>
							<h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
								<svg className="w-5 h-5 mr-2 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
								</svg>
								Documentos
							</h3>
							
							<div className="bg-slate-50 p-4 rounded-lg">
								<a 
									href={application.resume} 
									target="_blank" 
									rel="noopener noreferrer" 
									className="flex items-center justify-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
								>
									<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
									</svg>
									<span>Baixar Currículo</span>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

export default function SpontaneousApplicationsPage() {
	const [applications, setApplications] = useState<SpontaneousApplication[]>([]);
	const [filteredApplications, setFilteredApplications] = useState<SpontaneousApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedApp, setSelectedApp] = useState<SpontaneousApplication | null>(null);
	const [occupations, setOccupations] = useState<Occupation[]>([]);
	const [searchTerm, setSearchTerm] = useState('');

	useEffect(() => {
		const fetchApplications = async () => {
			setLoading(true);
			try {
				const response = await spontaneousService.getSpontaneousApplications();
				// Se a resposta for paginada, use response.results, senão use response diretamente
				const apps = Array.isArray(response.results) ? (response.results as unknown as SpontaneousApplication[]) : (Array.isArray(response) ? (response as unknown as SpontaneousApplication[]) : []);
				setApplications(apps);
				setFilteredApplications(apps);
			} catch (err) {
				setError('Erro ao carregar candidaturas espontâneas');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchApplications();
	}, []);

	// Efeito para filtrar as aplicações baseado no termo de busca
	useEffect(() => {
		if (!searchTerm.trim()) {
			setFilteredApplications(applications);
		} else {
			const filtered = applications.filter(app =>
				app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				app.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				app.cpf?.includes(searchTerm) ||
				app.phone?.includes(searchTerm) ||
				app.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				app.state?.toLowerCase().includes(searchTerm.toLowerCase()) ||
				app.neighborhood?.toLowerCase().includes(searchTerm.toLowerCase())
			);
			setFilteredApplications(filtered);
		}
	}, [searchTerm, applications]);

	useEffect(() => {
		const fetchOccupations = async () => {
			try {
				// Se quiser buscar ocupações, pode usar spontaneousService.getOccupations()
				const response = await spontaneousService.getOccupations();
				setOccupations(Array.isArray(response.results) ? response.results : (Array.isArray(response) ? response : []));
			} catch (err) {
				console.error('Erro ao carregar áreas', err);
			}
		};
		fetchOccupations();
	}, []);

	// Removido: não é necessário buscar candidatos nesta página


	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="text-slate-600">Carregando...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="text-red-600">{error}</div>
			</div>
		);
	}

	return (
		<div className="space-y-8">
			<div className="max-w-7xl mx-auto space-y-8">
				{/* Header */}
				<div className="text-center">
					<h1 className="text-3xl font-bold mb-3 text-slate-900">
						Candidaturas Espontâneas
					</h1>
					<p className="text-slate-500 text-lg">
						Gerencie todas as candidaturas espontâneas recebidas pela plataforma
					</p>
				</div>

				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					<div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
						<h3 className="text-slate-500 text-sm font-medium">Total de Candidatos</h3>
						<p className="text-slate-800 text-3xl font-bold mt-2">{applications.length}</p>
					</div>
					<div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
						<h3 className="text-emerald-600 text-sm font-medium">Candidatos Filtrados</h3>
						<p className="text-emerald-600 text-3xl font-bold mt-2">{filteredApplications.length}</p>
					</div>
					<div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
						<h3 className="text-violet-600 text-sm font-medium">Áreas Disponíveis</h3>
						<p className="text-violet-600 text-3xl font-bold mt-2">{occupations.length}</p>
					</div>
				</div>

				{applications.length > 0 ? (
					<>
					{/* Search and Filter Bar */}
					<div className="bg-white/50 backdrop-blur-sm border border-slate-200 rounded-lg p-6">
						<div className="flex flex-col md:flex-row gap-4 items-center justify-between">
							<div className="flex-1 w-full md:max-w-md">
								<div className="relative">
									<svg 
										className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5"
										fill="none" 
										stroke="currentColor" 
										viewBox="0 0 24 24"
									>
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
									</svg>
									<input
										type="text"
										placeholder="Buscar por nome, email, CPF, telefone, cidade..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
									/>
									{searchTerm && (
										<button
											onClick={() => setSearchTerm('')}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-900 transition-colors"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
											</svg>
										</button>
									)}
								</div>
							</div>
							<div className="flex items-center space-x-3 text-slate-600">
								<span className="text-sm">
									{filteredApplications.length === applications.length 
										? `Mostrando todos os ${applications.length} candidatos`
										: `${filteredApplications.length} de ${applications.length} candidatos`
									}
								</span>
							</div>
						</div>
					</div>

					{/* Candidates List */}
					<div className="bg-white/30 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg">
						<div className="flex justify-between items-center p-6 border-b border-slate-200">
							<h2 className="text-xl font-semibold text-slate-900">
								Lista de Candidatos
							</h2>
						</div>
						<div className="max-h-[32rem] overflow-y-auto p-6">
							{filteredApplications.length > 0 ? (
								<div className="space-y-4">
									{filteredApplications.map(app => (
										<div
											key={app.id}
											className="group relative p-6 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 cursor-pointer hover:shadow-md"
											onClick={() => setSelectedApp(app)}
										>
											<div className="flex items-start justify-between">
												<div className="flex-1 space-y-3">
													<div className="flex items-center space-x-3">
														<div className="w-10 h-10 bg-sky-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
															{app.name?.charAt(0)?.toUpperCase() || '?'}
														</div>
														<div>
															<h3 className="text-lg font-semibold text-slate-900 group-hover:text-sky-500 transition-colors">
																{app.name || 'Nome não informado'}
															</h3>
															<div className="flex flex-wrap gap-2 mt-1">
																<span className="text-xs bg-sky-50 text-sky-700 border border-sky-200 px-2 py-1 rounded-full">
																	Candidato Espontâneo
																</span>
															</div>
														</div>
													</div>
													
													<div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
														<div className="space-y-1">
															<div className="flex items-center text-slate-600">
																<svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
																</svg>
																{app.email}
															</div>
															<div className="flex items-center text-slate-600">
																<svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
																</svg>
																{app.phone}
															</div>
															{app.cpf && (
																<div className="flex items-center text-slate-600">
																	<svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
																	</svg>
																	CPF: {app.cpf}
																</div>
															)}
														</div>
														
														<div className="space-y-1">
															<div className="flex items-center text-slate-600">
																<svg className="w-4 h-4 mr-2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
																</svg>
																{app.city}, {app.state}
															</div>
															<div className="flex items-center text-slate-500 text-xs">
																<svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
																</svg>
																Cadastrado: {new Date(app.created_at).toLocaleDateString('pt-BR')}
															</div>
														</div>
													</div>
												</div>
												
												<div className="flex flex-col items-end space-y-2">
													<a
														href={app.resume}
														target="_blank"
														rel="noopener noreferrer"
														className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
														onClick={e => e.stopPropagation()}
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
														</svg>
														<span>Currículo</span>
													</a>
													<button
														onClick={(e) => {
															e.stopPropagation();
															setSelectedApp(app);
														}}
														className="flex items-center space-x-2 text-slate-600 hover:text-slate-900 text-sm transition-colors"
													>
														<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
															<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
														</svg>
														<span>Detalhes</span>
													</button>
												</div>
											</div>
										</div>
									))}
								</div>
							) : (
								<div className="text-center py-12">
									<div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
										<svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
										</svg>
									</div>
									<h3 className="text-lg font-medium text-slate-600 mb-2">
										Nenhum candidato encontrado
									</h3>
									<p className="text-slate-500">
										{searchTerm ? 'Tente ajustar os termos de busca' : 'Nenhuma candidatura espontânea foi registrada ainda'}
									</p>
								</div>
							)}
						</div>
					</div>
					</>

				) : (
					<div className="text-center py-12">
						<div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
							<svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
							</svg>
						</div>
						<h3 className="text-xl font-medium text-slate-600 mb-2">
							Nenhuma candidatura espontânea encontrada
						</h3>
						<p className="text-slate-500">
							Ainda não há candidatos espontâneos registrados no sistema
						</p>
					</div>
				)}
				
				{selectedApp && (
					<DetailsModal application={selectedApp} onClose={() => setSelectedApp(null)} occupations={occupations} />
				)}
			</div>
		</div>
	);
}
