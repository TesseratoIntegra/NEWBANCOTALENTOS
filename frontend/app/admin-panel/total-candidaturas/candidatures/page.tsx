'use client';

import { useEffect, useState } from 'react';
import DetailsModal from './DetailsModal';
import AuthService from '@/services/auth';
import candidateService from '@/services/candidateService';

export default function ApplicationsPage() {
	const [applications, setApplications] = useState<Application[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedApp, setSelectedApp] = useState<Application | null>(null);

	interface Application {
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
		candidate_name?: string;
		applied_at?: string;
		candidate_profile_id: number;
	}

		useEffect(() => {
			const fetchApplications = async () => {
				const accessToken = AuthService.getAccessToken();
				if (!accessToken) return;
				try {
					const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/applications/`, {
						headers: {
							'Authorization': `Bearer ${accessToken}`
						}
					});
					if (!res.ok) throw new Error('Erro ao buscar candidaturas');
					const data = await res.json();
					setApplications(Array.isArray(data) ? data : []);
				} catch (err) {
					setError('Erro ao carregar candidaturas');
					console.error(err);
				} finally {
					setLoading(false);
				}
			};
			fetchApplications();
		}, []);

	useEffect(() => {
		const fetchOccupations = async () => {
			try {
				const accessToken = AuthService.getAccessToken();
				if (!accessToken) return;
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/occupations/`, {
					headers: {
						'Authorization': `Bearer ${AuthService.getAccessToken()}`
					}
				});
				if (!res.ok) throw new Error('Erro ao buscar áreas');
			} catch (err) {
				console.error('Erro ao carregar áreas', err);
			}
		};
		fetchOccupations();
	}, []);

	useEffect(() => {
		const fetchCandidates = async () => {
			try {
				setLoading(true);
				const data = await candidateService.getAllCandidates();
				console.log(JSON.stringify(data));
			} catch (err) {
				setError('Erro ao carregar dados da candidatura');
				console.error(err);
			} finally {
				setLoading(false);
			}
		};
		fetchCandidates();
	}, []);


	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="text-zinc-300">Carregando...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="text-red-400">{error}</div>
			</div>
		);
	}

		return (
			<div className="space-y-8 mt-14">
				<div className="text-center">
					<h1 className="text-3xl font-bold text-zinc-100 mb-2">
						Todas as Candidaturas
					</h1>
					<p className="text-zinc-400">
						Veja todas as candidaturas recebidas pela plataforma
					</p>
				</div>

				{applications.length > 0 ? (
					<>
					<div className="rounded-md max-h-[40rem] overflow-y-auto">
						<div className="flex justify-between items-center mb-4">
							<h2 className="text-xl font-semibold text-zinc-100">
								Lista de Candidatos
							</h2>
						</div>
						<div className="space-y-3">
							{applications.map(app => (
								<div
									key={app.id}
									className="flex items-center justify-between p-4 rounded-md border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 transition-colors cursor-pointer"
									onClick={() => setSelectedApp(app)}
								>
									<div>
										<h3 className="text-lg font-medium text-white">
											  {app.candidate_name || app.name || 'Nome não informado'}
										</h3>
										<p className="text-sm text-zinc-400">
											{app.cpf ? `CPF: ${app.cpf} • ` : ''}{app.email} • {app.phone}
										</p>
										<p className="text-sm text-zinc-400">
											{app.city}, {app.state} • {app.neighborhood} {app.number} {app.complement && `• ${app.complement}`}
										</p>
										<p className="text-xs text-zinc-500 mt-1">
											  Cadastrado em: {app.applied_at ? new Date(app.applied_at).toLocaleDateString('pt-BR') : (app.created_at ? new Date(app.created_at).toLocaleDateString('pt-BR') : '-') }<br />
										</p>
									</div>
								</div>
							))}
											{selectedApp && (
												<DetailsModal candidate_profile_id={selectedApp.candidate_profile_id} onClose={() => setSelectedApp(null)} />
											)}
						</div>
					</div>

					</>

				) : (
					<div className="text-zinc-400 text-center">Nenhuma candidatura encontrada.</div>
				)}
			</div>
		);
}
