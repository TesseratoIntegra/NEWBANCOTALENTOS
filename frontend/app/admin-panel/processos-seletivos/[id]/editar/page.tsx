'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import jobService from '@/services/jobService';
import { Job, SelectionProcess, CreateSelectionProcess } from '@/types';
import DateInput from '@/components/ui/DateInput';

export default function EditarProcessoPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const processId = parseInt(resolvedParams.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [process, setProcess] = useState<SelectionProcess | null>(null);

  const [formData, setFormData] = useState<CreateSelectionProcess>({
    title: '',
    description: '',
    job: undefined,
    status: 'draft',
    start_date: '',
    end_date: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [processData, jobsResponse] = await Promise.all([
          selectionProcessService.getProcessById(processId),
          jobService.getJobs({ page: 1 })
        ]);

        setProcess(processData);
        setJobs(jobsResponse.results || []);
        setFormData({
          title: processData.title,
          description: processData.description || '',
          job: processData.job,
          status: processData.status as 'active' | 'draft' | undefined,
          start_date: processData.start_date || '',
          end_date: processData.end_date || '',
        });
      } catch (err) {
        console.error('Erro ao buscar dados:', err);
        setError('Erro ao carregar processo seletivo.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [processId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'job' ? (value ? parseInt(value) : undefined) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const dataToSend = {
        ...formData,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
      };

      await selectionProcessService.updateProcess(processId, dataToSend);
      router.push(`/admin-panel/processos-seletivos/${processId}`);
    } catch (err) {
      console.error('Erro ao atualizar processo:', err);
      setError('Erro ao atualizar processo seletivo. Verifique os dados e tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  if (!process) {
    return (
      <div className="bg-red-50 border border-red-500 rounded-lg p-4 text-red-600">
        Processo não encontrado.
      </div>
    );
  }

  const statusOptions = selectionProcessService.getStatusOptions();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={`/admin-panel/processos-seletivos/${processId}`}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Editar Processo Seletivo</h1>
          <p className="text-slate-500 mt-1">{process.title}</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-500 rounded-lg p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Título do Processo <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Descrição
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Vaga Vinculada */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-2">
            Vaga Vinculada (Opcional)
          </label>
          <select
            name="job"
            value={formData.job || ''}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="">Nenhuma vaga vinculada</option>
            {jobs.map(job => (
              <option key={job.id} value={job.id}>{job.title}</option>
            ))}
          </select>
        </div>

        {/* Datas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Data de Início
            </label>
            <DateInput
              name="start_date"
              value={formData.start_date}
              onChange={(iso) => setFormData(prev => ({ ...prev, start_date: iso }))}
              className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">
              Data de Término
            </label>
            <DateInput
              name="end_date"
              value={formData.end_date}
              onChange={(iso) => setFormData(prev => ({ ...prev, end_date: iso }))}
              className="w-full px-4 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-slate-200">
          <Link
            href={`/admin-panel/processos-seletivos/${processId}`}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition-colors"
          >
            Cancelar
          </Link>
          <button
            type="submit"
            disabled={saving || !formData.title}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-5 w-5" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}
