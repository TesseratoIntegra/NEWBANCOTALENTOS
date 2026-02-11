'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, Layers, Check } from 'lucide-react';
import selectionProcessService from '@/services/selectionProcessService';
import jobService from '@/services/jobService';
import { Job, CreateSelectionProcess, ProcessTemplate } from '@/types';
import DateInput from '@/components/ui/DateInput';

export default function NovoProcessoPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500" />
      </div>
    }>
      <NovoProcessoContent />
    </Suspense>
  );
}

function NovoProcessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const templateIdParam = searchParams.get('template');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);

  // Templates
  const [templates, setTemplates] = useState<ProcessTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [selectedTemplateDetail, setSelectedTemplateDetail] = useState<ProcessTemplate | null>(null);
  const [loadingTemplates, setLoadingTemplates] = useState(true);

  const [formData, setFormData] = useState<CreateSelectionProcess>({
    title: '',
    description: '',
    job: undefined,
    status: 'draft',
    start_date: '',
    end_date: '',
  });

  // Fetch jobs and templates
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await jobService.getJobs({ page: 1 });
        setJobs(response.results || []);
      } catch (err) {
        console.error('Erro ao buscar vagas:', err);
      }
    };

    const fetchTemplates = async () => {
      setLoadingTemplates(true);
      try {
        const data = await selectionProcessService.getTemplates();
        setTemplates(data);
        // If URL has template param, select it
        if (templateIdParam) {
          const tid = parseInt(templateIdParam);
          if (!isNaN(tid)) {
            setSelectedTemplateId(tid);
          }
        }
      } catch {
        console.error('Erro ao buscar modelos');
      } finally {
        setLoadingTemplates(false);
      }
    };

    fetchJobs();
    fetchTemplates();
  }, [templateIdParam]);

  // Load template detail when selection changes
  useEffect(() => {
    if (!selectedTemplateId) {
      setSelectedTemplateDetail(null);
      return;
    }
    const loadDetail = async () => {
      try {
        const detail = await selectionProcessService.getTemplateById(selectedTemplateId);
        setSelectedTemplateDetail(detail);
      } catch {
        setSelectedTemplateDetail(null);
      }
    };
    loadDetail();
  }, [selectedTemplateId]);

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
      const statusVal = asDraft ? 'draft' : 'active';

      if (selectedTemplateId) {
        // Create from template
        const process = await selectionProcessService.applyTemplate(selectedTemplateId, {
          title: formData.title,
          description: formData.description || '',
          job: formData.job,
          status: statusVal,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        });
        router.push(`/admin-panel/processos-seletivos/${process.id}`);
      } else {
        // Create from scratch
        const dataToSend = {
          ...formData,
          status: statusVal,
          start_date: formData.start_date || undefined,
          end_date: formData.end_date || undefined,
        };
        const process = await selectionProcessService.createProcess(dataToSend as CreateSelectionProcess);
        router.push(`/admin-panel/processos-seletivos/${process.id}`);
      }
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

      {/* Template Selection */}
      {!loadingTemplates && templates.length > 0 && (
        <div className="bg-zinc-800 rounded-lg p-5 border border-zinc-700">
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-medium text-zinc-300">Usar Modelo</h2>
          </div>
          <p className="text-xs text-zinc-500 mb-3">
            Selecione um modelo para criar o processo com etapas e perguntas pré-configuradas, ou crie do zero.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedTemplateId(null)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                !selectedTemplateId
                  ? 'bg-zinc-600 border-zinc-500 text-white'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-zinc-500'
              }`}
            >
              Criar do Zero
            </button>
            {templates.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedTemplateId(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selectedTemplateId === t.id
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-400 hover:border-indigo-500'
                }`}
              >
                {selectedTemplateId === t.id && <Check className="w-3 h-3" />}
                {t.name}
                <span className="text-zinc-500 ml-1">({t.stages_count || 0} etapas)</span>
              </button>
            ))}
          </div>

          {/* Template preview */}
          {selectedTemplateDetail?.stages && selectedTemplateDetail.stages.length > 0 && (
            <div className="mt-4 bg-zinc-900/50 rounded-lg p-3 border border-zinc-700">
              <h4 className="text-xs font-medium text-zinc-400 uppercase tracking-wider mb-2">
                Etapas incluídas no modelo
              </h4>
              <div className="space-y-1.5">
                {selectedTemplateDetail.stages.map((stage) => (
                  <div key={stage.id} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-300">
                      {stage.order}. {stage.name}
                    </span>
                    <span className="text-zinc-600">
                      {stage.questions_count || 0} perguntas
                      {stage.is_eliminatory && ' • Eliminatória'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

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
            <DateInput
              name="start_date"
              value={formData.start_date}
              onChange={(iso) => setFormData(prev => ({ ...prev, start_date: iso }))}
              className="w-full px-4 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Data de Término
            </label>
            <DateInput
              name="end_date"
              value={formData.end_date}
              onChange={(iso) => setFormData(prev => ({ ...prev, end_date: iso }))}
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

        {selectedTemplateId && (
          <p className="text-xs text-indigo-400 text-center">
            As etapas e perguntas do modelo serão automaticamente criadas no novo processo.
          </p>
        )}
      </form>

      {/* Info */}
      <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
        <h3 className="text-sm font-medium text-zinc-300 mb-2">Próximos passos:</h3>
        <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
          {selectedTemplateId ? (
            <>
              <li>O processo será criado com as etapas e perguntas do modelo</li>
              <li>Você pode editar as etapas e adicionar novas perguntas</li>
              <li>Adicione candidatos aprovados ao processo</li>
              <li>Avalie e acompanhe o progresso de cada candidato</li>
            </>
          ) : (
            <>
              <li>Após criar o processo, você poderá adicionar etapas</li>
              <li>Em cada etapa, crie perguntas para avaliar os candidatos</li>
              <li>Adicione candidatos aprovados ao processo</li>
              <li>Avalie e acompanhe o progresso de cada candidato</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}
