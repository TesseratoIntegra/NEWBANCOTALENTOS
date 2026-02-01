'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import jobService from '@/services/jobService';
import { Job, CreateSelectionProcess } from '@/types';

export default function NovoProcessoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [formData, setFormData] = useState<CreateSelectionProcess>({
    title: '',
    description: '',
    job: undefined,
    status: 'draft',
    start_date: '',
    end_date: '',
  });

  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobService.getJobs({ page: 1 });
        setJobs(response.results || []);
      } catch (err) {
        console.error('Erro ao buscar vagas:', err);
      }
    };
    fetchJobs();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'job' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent, asDraft = true) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        status: asDraft ? 'draft' : 'active',
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
      };

      const process = await selectionProcessService.createProcess(dataToSend as CreateSelectionProcess);
      router.push(`/admin-panel/processos-seletivos/${process.id}`);
    } catch (err: unknown) {
      console.error('Erro ao criar processo:', err);
      setError('Erro ao criar processo seletivo. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin-panel/processos-seletivos"
          className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Novo Processo Seletivo</h1>
          <p className="text-zinc-400 mt-1">
            Crie um novo processo seletivo para avaliar candidatos
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, true)} className="bg-zinc-800 rounded-lg p-6 space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Título do Processo <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Ex: Processo Seletivo Desenvolvedor Python 2024"
            className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="Descreva os objetivos e requisitos do processo seletivo..."
            className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>

        {/* Vaga Vinculada */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Vaga Vinculada (Opcional)
          </label>
          <select
            name="job"
            value={formData.job || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Nenhuma vaga vinculada</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
          <p className="text-zinc-500 text-sm mt-1">
            Você pode vincular este processo a uma vaga existente ou deixar independente.
          </p>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Data de Início
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Data de Término
            </label>
            <input
              type="date"
              name="end_date"
              value={formData.end_date}
              onChange={handleChange}
              min={formData.start_date || undefined}
              className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-700">
          <button
            type="submit"
            disabled={loading || !formData.title}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-zinc-600 hover:bg-zinc-500 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Salvando...' : 'Salvar como Rascunho'}
          </button>
          <button
            type="button"
            onClick={(e) => handleSubmit(e, false)}
            disabled={loading || !formData.title}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {loading ? 'Salvando...' : 'Criar e Ativar'}
          </button>
        </div>
      </form>

      {/* Info */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
        <h3 className="text-sm font-medium text-zinc-300 mb-2">Próximos passos:</h3>
        <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
          <li>Após criar o processo, você poderá adicionar etapas</li>
          <li>Em cada etapa, crie perguntas para avaliar os candidatos</li>
          <li>Adicione candidatos aprovados ao processo</li>
          <li>Avalie e acompanhe o progresso de cada candidato</li>
        </ul>
      </div>
    </div>
  );
}
