
import React, { useEffect, useState } from 'react';
import AuthService from '@/services/auth';

interface ModalProps {
	candidate_profile_id: number | null;
	onClose: () => void;
}

interface CandidateProfile {
	accepts_remote_work: boolean;
	age: number;
	available_for_work: boolean;
	cpf: string;
	created_at: string;
	current_company: string;
	current_position: string;
	desired_salary_max: string;
	desired_salary_min: string;
	education_level: string;
	education_summary: string | null;
	experience_summary: string[];
	experience_years: number;
	id: number;
	user_email: string;
	user_name: string;
}

function DetailsModal({ candidate_profile_id, onClose }: ModalProps) {
	const [profile, setProfile] = useState<CandidateProfile | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!candidate_profile_id) return;
		const fetchProfile = async () => {
			setLoading(true);
			setError(null);
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/candidates/profiles/${candidate_profile_id}`, {
                    headers: {
                        Authorization: `Bearer ${AuthService.getAccessToken()}`
                    }
                });
				if (!res.ok) throw new Error('Erro ao buscar perfil do candidato');
				const data = await res.json();
				setProfile(data);
			} catch (err) {
				console.error(err);
				setError('Erro ao carregar perfil do candidato');
			} finally {
				setLoading(false);
			}
		};
		fetchProfile();
	}, [candidate_profile_id]);

	if (!candidate_profile_id) return null;

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
				{loading ? (
					<div className="text-zinc-300">Carregando...</div>
				) : error ? (
					<div className="text-red-400">{error}</div>
				) : profile ? (
					<div className="space-y-2 text-zinc-300 text-sm">
						<div><strong>Nome:</strong> {profile.user_name}</div>
						<div><strong>CPF:</strong> {profile.cpf}</div>
						<div><strong>Email:</strong> {profile.user_email}</div>
						<div><strong>Idade:</strong> {profile.age}</div>
						<div><strong>Disponível para trabalho:</strong> {profile.available_for_work ? 'Sim' : 'Não'}</div>
						<div><strong>Trabalho remoto:</strong> {profile.accepts_remote_work ? 'Sim' : 'Não'}</div>
						<div><strong>Empresa atual:</strong> {profile.current_company || '-'}</div>
						<div><strong>Cargo atual:</strong> {profile.current_position || '-'}</div>
						<div><strong>Nível de escolaridade:</strong> {profile.education_level || '-'}</div>
						<div><strong>Resumo da educação:</strong> {profile.education_summary || '-'}</div>
						<div><strong>Anos de experiência:</strong> {profile.experience_years}</div>
						<div><strong>Resumo de experiência:</strong> {profile.experience_summary && profile.experience_summary.length > 0 ? (
							<ul className="list-disc ml-4">
								{profile.experience_summary.map((exp, idx) => (
									<li key={idx}>{typeof exp === 'string' ? exp : JSON.stringify(exp)}</li>
								))}
							</ul>
						) : '-'}
						</div>
						<div><strong>Pretensão salarial mínima:</strong> {profile.desired_salary_min}</div>
						<div><strong>Pretensão salarial máxima:</strong> {profile.desired_salary_max}</div>
						<div><strong>Cadastrado em:</strong> {new Date(profile.created_at).toLocaleString('pt-BR')}</div>
					</div>
				) : null}
			</div>
		</div>
	);
}

export default DetailsModal;
