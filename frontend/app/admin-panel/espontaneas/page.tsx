'use client';

import { useEffect, useState } from 'react';
import AuthService from '@/services/auth';

interface ModalProps {
	application: SpontaneousApplication | null;
	onClose: () => void;
}

interface Occupation {
	id: number;
	code: string;
	title: string;
}

function DetailsModal({ application, onClose, occupations }: ModalProps & { occupations: Occupation[] }) {
	if (!application) return null;

	const getOccupationTitle = (id: number) => {
		const occ = occupations.find(o => o.id === id);
		return occ ? occ.title : `ID ${id}`;
	};

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
			<div className="bg-zinc-900 rounded-lg p-6 w-full max-w-md relative">
				<button
					onClick={onClose}
					className="absolute top-2 right-4 text-zinc-400 hover:text-zinc-100 text-3xl cursor-pointer"
					aria-label="Fechar"
				>
					&times;
				</button>
				<h2 className="text-2xl font-bold text-zinc-100 mb-4">Detalhes da Candidatura</h2>
				<div className="space-y-2 text-zinc-300 text-sm">
					<div><strong>Nome:</strong> {application.name}</div>
					<div><strong>CPF:</strong> {application.cpf}</div>
					<div><strong>Email:</strong> {application.email}</div>
					<div><strong>Telefone:</strong> {application.phone}</div>
					<div><strong>Cidade:</strong> {application.city}</div>
					<div><strong>Estado:</strong> {application.state}</div>
					<div><strong>Bairro:</strong> {application.neighborhood}</div>
					<div><strong>Número:</strong> {application.number}</div>
					<div><strong>Complemento:</strong> {application.complement || '-'}</div>
					<div><strong>Currículo:</strong> <a href={application.resume} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Ver Currículo</a></div>
					<div><strong>Área 1:</strong> {getOccupationTitle(application.area_1)}</div>
					<div><strong>Área 2:</strong> {getOccupationTitle(application.area_2)}</div>
					<div><strong>Área 3:</strong> {getOccupationTitle(application.area_3)}</div>
					<div><strong>Cadastrado em:</strong> {new Date(application.created_at).toLocaleString('pt-BR')}</div>
					<div><strong>Atualizado em:</strong> {new Date(application.updated_at).toLocaleString('pt-BR')}</div>
				</div>
			</div>
		</div>
	);
}

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

export default function SpontaneousApplicationsPage() {
	const [applications, setApplications] = useState<SpontaneousApplication[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedApp, setSelectedApp] = useState<SpontaneousApplication | null>(null);
	const [occupations, setOccupations] = useState<Occupation[]>([]);

	useEffect(() => {
		const fetchApplications = async () => {
			const accessToken = AuthService.getAccessToken();
			if (!accessToken) return;
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/spontaneous-applications/`, {
					headers: {
						'Authorization': `Bearer ${accessToken}`
					}
				});
				if (!res.ok) throw new Error('Erro ao buscar candidaturas espontâneas');
				const data = await res.json();
				setApplications(Array.isArray(data) ? data : []);
			} catch (err) {
				setError('Erro ao carregar candidaturas espontâneas');
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
				const data = await res.json();
				setOccupations(Array.isArray(data) ? data : []);
			} catch (err) {
				console.error('Erro ao carregar áreas', err);
			}
		};
		fetchOccupations();
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
		<div className="space-y-8">
			<div className="text-center">
				<h1 className="text-3xl font-bold text-zinc-100 mb-2">
					Candidaturas Espontâneas
				</h1>
				<p className="text-zinc-400">
					Veja todas as candidaturas espontâneas recebidas pela plataforma
				</p>
			</div>

			{applications.length > 0 ? (
				<div className="rounded-md">
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
										{app.name || 'Nome não informado'}
									</h3>
									<p className="text-sm text-zinc-400">
										{app.cpf ? `CPF: ${app.cpf} • ` : ''}{app.email} • {app.phone}
									</p>
									<p className="text-sm text-zinc-400">
										{app.city}, {app.state} • {app.neighborhood} {app.number} {app.complement && `• ${app.complement}`}
									</p>
									<p className="text-xs text-zinc-500 mt-1">
										Cadastrado em: {new Date(app.created_at).toLocaleDateString('pt-BR')}<br />
										Atualizado em: {new Date(app.updated_at).toLocaleDateString('pt-BR')}
									</p>
								</div>
								<div className="flex flex-col items-end space-y-2">
									<a
										href={app.resume}
										target="_blank"
										rel="noopener noreferrer"
										className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-xs font-medium transition-colors"
										onClick={e => e.stopPropagation()}
									>
										Ver Currículo
									</a>
								</div>
							</div>
						))}
						{selectedApp && (
							<DetailsModal application={selectedApp} onClose={() => setSelectedApp(null)} occupations={occupations} />
						)}
					</div>
				</div>
			) : (
				<div className="text-zinc-400 text-center">Nenhuma candidatura espontânea encontrada.</div>
			)}
		</div>
	);
}
