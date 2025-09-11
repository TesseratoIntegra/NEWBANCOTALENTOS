import React, { useState, useEffect } from 'react';
import Select, { SingleValue } from 'react-select';
import { X, Loader } from 'lucide-react';
import AuthService from '@/services/auth';
import { toast } from 'react-hot-toast';
import * as Icon from 'react-bootstrap-icons'
import SplitText from './SliptText';

interface JobApplicationModalStartProps {
	show: boolean;
	onClose: () => void;
}

interface OccupationOption {
	value: number;
	label: string;
}

export default function JobApplicationModalStart({ show, onClose }: JobApplicationModalStartProps) {
	const [form, setForm] = useState<{
		is_active: boolean;
		name: string;
		email: string;
		phone: string;
		city: string;
		state: string;
		neighborhood: string;
		number: string;
		complement: string;
		resume: File | null;
		area_1: number | '';
		area_2: number | '';
		area_3: number | '';
	}>({
		is_active: false,
		name: '',
		email: '',
		phone: '',
		city: '',
		state: '',
		neighborhood: '',
		number: '',
		complement: '',
		resume: null,
		area_1: '',
		area_2: '',
		area_3: '',
	});

	const [existingId, setExistingId] = useState<number | null>(null);
	const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(null);
	const estadosBrasil = [
		'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
		'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
		'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
	];
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState(false);
	const [occupations, setOccupations] = useState<{ id: number; title: string }[]>([]);
	const occupationOptions: OccupationOption[] = occupations.map(o => ({ value: o.id, label: o.title }));

	useEffect(() => {
		async function fetchOccupations() {
			try {
				const res = await fetch('http://192.168.0.77:8001/api/v1/occupations/');
				if (!res.ok) throw new Error('Erro ao buscar ocupações');
				const data = await res.json();
				setOccupations(data);
			} catch {
				setError('Erro ao carregar áreas');
			}
		}
		fetchOccupations();
	}, []);

	// Buscar candidatura existente ao abrir o modal
	useEffect(() => {
		async function fetchExistingApplication() {
			if (!show) return;
			setLoading(true);
			setError('');
			try {
				const accessToken = AuthService.getAccessToken();
				if (!accessToken) return;
				// Busca candidatura do usuário logado
				const res = await fetch('http://192.168.0.77:8001/api/v1/spontaneous-applications/', {
					method: 'GET',
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (res.ok) {
					const data = await res.json();
					if (Array.isArray(data) && data.length > 0) {
						const app = data[0];
						setExistingId(app.id);
						setExistingResumeUrl(app.resume ?? null);
						setForm({
							is_active: app.is_active ?? false,
							name: app.name ?? '',
							email: app.email ?? '',
							phone: app.phone ?? '',
							city: app.city ?? '',
							state: app.state ?? '',
							neighborhood: app.neighborhood ?? '',
							number: app.number ?? '',
							complement: app.complement ?? '',
							resume: null, // Não é possível preencher File, só mostra nome
							area_1: app.area_1 ?? '',
							area_2: app.area_2 ?? '',
							area_3: app.area_3 ?? '',
						});
					} else {
						setExistingId(null);
						setExistingResumeUrl(null);
					}
				}
			} catch (err) {
				setError('Erro ao buscar candidatura existente');
				console.error(err);
			} finally {
				setLoading(false);
			}
		}
		fetchExistingApplication();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [show]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target;
		if (name === 'resume') {
			const fileInput = e.target as HTMLInputElement;
			setForm({ ...form, resume: fileInput.files ? fileInput.files[0] : null });
		} else {
			setForm({ ...form, [name]: value });
		}
	};

	const handleAreaChange = (
		selected: SingleValue<OccupationOption>,
		field: 'area_1' | 'area_2' | 'area_3'
	) => {
		setForm({ ...form, [field]: selected ? selected.value : '' });
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		setSuccess(false);
		const data = new FormData();
		Object.entries(form).forEach(([key, value]) => {
			if (value !== null) {
				if (key === 'is_active') {
					data.append(key, value ? 'true' : 'false');
				} else if (key === 'resume' && value && typeof value === 'object' && 'name' in value) {
					data.append(key, value as File);
				} else {
					data.append(key, String(value));
				}
			}
		});
		try {
			const accessToken = AuthService.getAccessToken();
			if (!accessToken) {
				console.log("❌ Token de acesso não encontrado nos cookies");
				toast.error("Faça login primeiro");
				window.location.href = '/';
				throw new Error("Token de acesso ausente");
			}
			let res;
			if (existingId) {
				// PATCH se já existe
				res = await fetch(`http://192.168.0.77:8001/api/v1/spontaneous-applications/${existingId}/`, {
					method: 'PATCH',
					body: data,
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
			} else {
				// POST se não existe
				res = await fetch('http://192.168.0.77:8001/api/v1/spontaneous-applications/', {
					method: 'POST',
					body: data,
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				});
			}
			if (!res.ok) throw new Error('Erro ao Salvar candidatura');
			setSuccess(true);
			toast.success(existingId ? 'Candidatura atualizada' : 'Candidatura registrada');
			setForm({
				is_active: false,
				name: '',
				email: '',
				phone: '',
				city: '',
				state: '',
				neighborhood: '',
				number: '',
				complement: '',
				resume: null,
				area_1: '',
				area_2: '',
				area_3: '',
			});
			setExistingId(null);
			if (onClose) onClose();
		} catch (err) {
			if (err instanceof Error) {
				setError(err.message);
			} else {
				setError('Erro desconhecido');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
        <>
				<div >
					<div className={`bg-white rounded-lg max-w-2xl w-[90%] mx-auto lg:w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl fixed -translate-1/2 top-1/2 left-1/2 z-[61] ${show ? 'animate-fade-up' : 'opacity-0 pointer-events-none'}`}>
						{/* Header */}
						<div className="sticky top-0 flex items-center justify-between px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg z-[61]">
							<div>
								<SplitText
									text="Candidatura Espontânea"
									className="text-3xl lg:text-3xl text-white quicksand"
									delay={30}
									duration={1}
								/>
							</div>
							<button
								onClick={onClose}
								className="text-blue-100 hover:text-white transition-colors cursor-pointer"
								aria-label="Fechar"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Loading */}
						{loading && (
							<div className="flex items-center justify-center py-8">
								<Loader className="w-8 h-8 text-blue-600 animate-spin" />
								<span className="ml-2 text-gray-600">Enviando candidatura...</span>
							</div>
						)}

						{/* Form */}
						{!loading && (
							<form onSubmit={handleSubmit} className="p-6 space-y-6">
								{/* Dados Pessoais */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-blue-900">Dados Pessoais</h3>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Nome Completo *</label>
											<input name="name" value={form.name} onChange={handleChange} required placeholder="Nome" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
											<input name="email" value={form.email} onChange={handleChange} required type="email" placeholder="Email" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Telefone *</label>
											<input name="phone" value={form.phone} onChange={handleChange} required placeholder="Telefone" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Cidade *</label>
											<input name="city" value={form.city} onChange={handleChange} required placeholder="Cidade" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
										</div>
										<div>
										 <label className="block text-sm font-medium text-gray-700 mb-2">Estado *</label>
										 <select
											 name="state"
											 value={form.state}
											 onChange={handleChange}
											 required
											 className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
										 >
											 <option value="">Selecione um estado</option>
											 {estadosBrasil.map((uf) => (
												 <option key={uf} value={uf}>{uf}</option>
											 ))}
										 </select>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Bairro *</label>
											<input name="neighborhood" value={form.neighborhood} onChange={handleChange} required placeholder="Bairro" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Número *</label>
											<input name="number" value={form.number} onChange={handleChange} required placeholder="Número" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Complemento</label>
											<input name="complement" value={form.complement} onChange={handleChange} placeholder="Complemento" className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
										</div>
									</div>
								</div>

								{/* Áreas de Interesse */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-blue-900">Áreas de Interesse</h3>
									<div className="grid grid-cols-1 md:grid-cols-1 gap-4">
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Área 1 *</label>
											<Select
												options={occupationOptions}
												value={occupationOptions.find(o => o.value === form.area_1) || null}
												onChange={selected => handleAreaChange(selected, 'area_1')}
												placeholder="Selecione ou busque uma área"
												isClearable
												required
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Área 2</label>
											<Select
												options={occupationOptions}
												value={occupationOptions.find(o => o.value === form.area_2) || null}
												onChange={selected => handleAreaChange(selected, 'area_2')}
												placeholder="Selecione ou busque uma área"
												isClearable
											/>
										</div>
										<div>
											<label className="block text-sm font-medium text-gray-700 mb-2">Área 3</label>
											<Select
												options={occupationOptions}
												value={occupationOptions.find(o => o.value === form.area_3) || null}
												onChange={selected => handleAreaChange(selected, 'area_3')}
												placeholder="Selecione ou busque uma área"
												isClearable
											/>
										</div>
									</div>
								</div>

								{/* Currículo */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold text-blue-900">Currículo *</h3>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">Anexar Currículo (PDF, DOC ou DOCX - máx. 5MB)</label>
										<div className="relative">
											<input name="resume" type="file" accept=".pdf,.doc,.docx" onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-sm file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer hover:file:cursor-pointer" />
											{form.resume && (
												<p className="text-sm text-green-600 mt-1">✓ {form.resume.name}</p>
											)}
											{existingResumeUrl && (
												<a
												href={existingResumeUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="text-blue-600 underline mt-2 flex place-items-center gap-2 cursor-pointer"
												>
												<Icon.Download/> Baixar currículo enviado
												</a>
											)}
										</div>
									</div>
								</div>

								{/* Buttons & Feedback */}
								<div className="grid grid-cols-1 gap-y-2 justify-center text-center lg:flex lg:justify-end space-x-4 pt-6 border-t border-gray-200">
									<button
										type="button"
										onClick={onClose}
										className="flex justify-center px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer w-full lg:w-auto"
										disabled={loading}
									>
										Pular por enquanto
									</button>
									<button
										type="submit"
										disabled={loading}
										className="justify-center px-6 py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-md hover:from-blue-800 hover:to-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-lg cursor-pointer"
									>
										{loading ? (
											<>
												<Loader className="w-4 h-4 mr-2 animate-spin" />
												Salvando...
											</>
										) : (
											<>Salvar Candidatura</>
										)}
									</button>
								</div>
								{error && <div className="text-red-600 mt-2">{error}</div>}
								{success && <div className="text-green-600 mt-2">Candidatura enviada com sucesso!</div>}
							</form>
						)}
					</div>
          

				</div>
        
        <div className={`w-full h-screen fixed top-0 left-0 bg-black/40 z-[60] ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'} duration-300`} onClick={onClose}></div>
        </>
			);
		}
