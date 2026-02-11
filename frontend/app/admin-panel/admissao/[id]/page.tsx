'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle, Send, Loader2 } from 'lucide-react';
import admissionService from '@/services/admissionService';
import { AdmissionData, AdmissionPrefill } from '@/types';
import DateInput from '@/components/ui/DateInput';

type TabKey =
  | 'cadastrais'
  | 'funcionais'
  | 'documentos'
  | 'endereco'
  | 'beneficios'
  | 'relogio'
  | 'outras'
  | 'cargos'
  | 'adicionais'
  | 'finalizacao';

interface FieldDef {
  key: string;
  label: string;
  type?: 'text' | 'date' | 'number' | 'select';
  options?: { value: string; label: string }[];
  prefilled?: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-amber-50 text-amber-700 border border-amber-200' },
  completed: { label: 'Preenchido', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
  sent: { label: 'Enviado ao Protheus', color: 'bg-sky-50 text-sky-700 border border-sky-200' },
  error: { label: 'Erro no Envio', color: 'bg-red-50 text-red-700 border border-red-200' },
  confirmed: { label: 'Confirmado', color: 'bg-emerald-50 text-emerald-700 border border-emerald-200' },
};

// ============================================
// FIELD DEFINITIONS PER TAB
// ============================================

const CADASTRAIS_FIELDS: FieldDef[] = [
  { key: 'matricula', label: 'Matricula' },
  { key: 'nome', label: 'Nome', prefilled: true },
  { key: 'nome_completo', label: 'Nome Completo', prefilled: true },
  { key: 'nome_mae', label: 'Nome da Mae' },
  { key: 'nome_pai', label: 'Nome do Pai' },
  { key: 'cod_pais_origem', label: 'Cod. Pais Origem' },
  { key: 'sexo', label: 'Sexo', type: 'select', prefilled: true, options: [
    { value: '', label: 'Selecione' },
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Feminino' },
  ]},
  { key: 'raca_cor', label: 'Raca/Cor' },
  { key: 'data_nascimento', label: 'Data Nascimento', type: 'date', prefilled: true },
  { key: 'estado_civil', label: 'Estado Civil', type: 'select', options: [
    { value: '', label: 'Selecione' },
    { value: 'S', label: 'Solteiro(a)' },
    { value: 'C', label: 'Casado(a)' },
    { value: 'D', label: 'Divorciado(a)' },
    { value: 'V', label: 'Viuvo(a)' },
    { value: 'O', label: 'Outros' },
  ]},
  { key: 'nacionalidade', label: 'Nacionalidade' },
  { key: 'pais_origem', label: 'Pais Origem' },
  { key: 'cod_nacion_rfb', label: 'C. Nacion. RFB' },
  { key: 'bra_nasc_ext', label: 'Bra. Nasc. Ext.' },
  { key: 'municipio_nascimento', label: 'Municipio Nascimento' },
  { key: 'naturalidade_uf', label: 'Naturalidade UF' },
  { key: 'cod_mun_nasc', label: 'Cod. Mun. Nasc.' },
  { key: 'nivel_escolaridade', label: 'Nivel Escolaridade', prefilled: true },
  { key: 'email', label: 'Email Principal', prefilled: true },
  { key: 'defic_fisico', label: 'Defic. Fisico', type: 'select', options: [
    { value: '', label: 'Selecione' },
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Nao' },
  ]},
  { key: 'tp_deficiencia', label: 'Tipo Deficiencia' },
  { key: 'cota_def', label: 'Cota Def.', type: 'select', options: [
    { value: '', label: 'Selecione' },
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Nao' },
  ]},
  { key: 'beneficiario_reabilitado', label: 'Benef. Reabilitado', type: 'select', options: [
    { value: '', label: 'Selecione' },
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Nao' },
  ]},
];

const FUNCIONAIS_FIELDS: FieldDef[] = [
  { key: 'centro_custo', label: 'Centro de Custo' },
  { key: 'data_admissao', label: 'Data Admissao', type: 'date' },
  { key: 'tipo_admissao', label: 'Tipo de Admissao' },
  { key: 'alt_admissao', label: 'Alt. Admissao' },
  { key: 'dt_op_fgts', label: 'Dt. Op. FGTS', type: 'date' },
  { key: 'perc_fgts', label: '% FGTS', type: 'number' },
  { key: 'tipo_conta_salario', label: 'Tipo Conta Salario' },
  { key: 'horas_mensais', label: 'Horas Mensais', type: 'number' },
  { key: 'tp_previdencia', label: 'Tp. Previdencia' },
  { key: 'codigo_funcao', label: 'Codigo da Funcao' },
  { key: 'tp_contrato_trab', label: 'Tp. Cont. Trab.' },
  { key: 'salario', label: 'Salario', type: 'number' },
  { key: 'salario_base', label: 'Salario Base', type: 'number' },
  { key: 'ct_tempo_parcial', label: 'Ct. T. Parcial' },
  { key: 'perc_adiantamento', label: '% Adiantamento', type: 'number' },
  { key: 'cod_sindicato', label: 'C. Sindicato' },
  { key: 'clau_assec', label: 'Clau. Assec.' },
  { key: 'alt_cbo', label: 'Alt. CBO' },
  { key: 'tipo_pagamento', label: 'Tipo Pgt.' },
  { key: 'categoria_funcional', label: 'Categoria Funcional' },
  { key: 'vinc_empregado', label: 'Vinc. Empregado' },
  { key: 'cate_esocial', label: 'Cate. eSocial' },
  { key: 'venc_exper_1', label: 'Venc. Exper. 1', type: 'date' },
  { key: 'venc_exper_2', label: 'Venc. Exper. 2', type: 'date' },
  { key: 'venc_exame_med', label: 'Ven. Exa. Med.', type: 'date' },
  { key: 'contr_assistencial', label: 'Contr. Assistencial' },
  { key: 'mens_sindical', label: 'Mens. Sindical' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'comp_sabado', label: 'Comp. Sabado' },
  { key: 'cod_departamento', label: 'Cod. Dpto' },
  { key: 'contr_sindical', label: 'Con. Sindical' },
  { key: 'aposentado', label: 'Aposentado', type: 'select', options: [
    { value: '', label: 'Selecione' },
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Nao' },
  ]},
  { key: 'cod_processo', label: 'Cod. Processo' },
];

const DOCUMENTOS_FIELDS: FieldDef[] = [
  { key: 'pis', label: 'PIS' },
  { key: 'rg', label: 'RG' },
  { key: 'nr_reservista', label: 'Nr. Reservista' },
  { key: 'titulo_eleitor', label: 'Tit. Eleitor' },
  { key: 'zona_eleitoral', label: 'Zona Eleitoral' },
  { key: 'secao_eleitoral', label: 'Secao Eleitoral' },
  { key: 'cpf', label: 'CPF', prefilled: true },
];

const ENDERECO_FIELDS: FieldDef[] = [
  { key: 'res_exterior', label: 'Res. Exterior', type: 'select', options: [
    { value: '', label: 'Selecione' },
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Nao' },
  ]},
  { key: 'tipo_endereco', label: 'Tipo Endereco' },
  { key: 'tipo_logradouro', label: 'Tipo Logradouro' },
  { key: 'endereco', label: 'Endereco', prefilled: true },
  { key: 'num_endereco', label: 'Num. Endereco', prefilled: true },
  { key: 'desc_logradouro', label: 'Desc. Logradouro', prefilled: true },
  { key: 'municipio', label: 'Municipio', prefilled: true },
  { key: 'nr_logradouro', label: 'Nr. Logradouro' },
  { key: 'bairro', label: 'Bairro', prefilled: true },
  { key: 'estado', label: 'Estado', prefilled: true },
  { key: 'cod_municipio', label: 'Cod. Municipio' },
  { key: 'cep', label: 'CEP', prefilled: true },
  { key: 'telefone', label: 'Telefone' },
  { key: 'ddd_telefone', label: 'DDD Telefone' },
  { key: 'ddd_celular', label: 'DDD Celular' },
  { key: 'numero_celular', label: 'Numero Celular' },
];

const BENEFICIOS_FIELDS: FieldDef[] = [
  { key: 'plano_saude', label: 'Plano de Saude' },
];

const RELOGIO_FIELDS: FieldDef[] = [
  { key: 'turno', label: 'Turno' },
  { key: 'nr_cracha', label: 'Nr. Cracha' },
  { key: 'regra_apontamento', label: 'Regra Apontamento' },
  { key: 'seq_ini_turno', label: 'Seq. Ini. Turno' },
  { key: 'bh_folha', label: 'B.H.P/Folha' },
  { key: 'acum_b_horas', label: 'Acum. B. Horas' },
];

const OUTRAS_FIELDS: FieldDef[] = [
  { key: 'cod_retencao', label: 'Cod. Retencao' },
];

const CARGOS_FIELDS: FieldDef[] = [
  { key: 'tabela_salarial', label: 'Tabela Salarial' },
  { key: 'nivel_tabela', label: 'Nivel Tabela' },
  { key: 'faixa_tabela', label: 'Faixa Tabela' },
];

const ADICIONAIS_FIELDS: FieldDef[] = [
  { key: 'calc_inss', label: 'Calc. INSS' },
  { key: 'adc_tempo_servico', label: 'Adc. Tempo Servico' },
  { key: 'possui_periculosidade', label: 'Periculosidade', type: 'select', options: [
    { value: '', label: 'Selecione' },
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Nao' },
  ]},
  { key: 'possui_insalubridade', label: 'Insalubridade', type: 'select', options: [
    { value: '', label: 'Selecione' },
    { value: 'S', label: 'Sim' },
    { value: 'N', label: 'Nao' },
  ]},
];

const TABS: { key: TabKey; label: string; fields: FieldDef[] }[] = [
  { key: 'cadastrais', label: 'Cadastrais', fields: CADASTRAIS_FIELDS },
  { key: 'funcionais', label: 'Funcionais', fields: FUNCIONAIS_FIELDS },
  { key: 'documentos', label: 'Documentos', fields: DOCUMENTOS_FIELDS },
  { key: 'endereco', label: 'Endereco', fields: ENDERECO_FIELDS },
  { key: 'beneficios', label: 'Beneficios', fields: BENEFICIOS_FIELDS },
  { key: 'relogio', label: 'Relogio', fields: RELOGIO_FIELDS },
  { key: 'outras', label: 'Outras Info', fields: OUTRAS_FIELDS },
  { key: 'cargos', label: 'Cargos/Salarios', fields: CARGOS_FIELDS },
  { key: 'adicionais', label: 'Adicionais', fields: ADICIONAIS_FIELDS },
  { key: 'finalizacao', label: 'Finalizacao', fields: [] },
];

// Prefill keys that come from candidate profile
const PREFILL_KEYS = new Set([
  'nome', 'nome_completo', 'sexo', 'data_nascimento', 'nivel_escolaridade',
  'email', 'cpf', 'endereco', 'num_endereco', 'desc_logradouro',
  'municipio', 'bairro', 'estado', 'cep',
]);

// Fields that expect null instead of empty string (date and decimal types)
const DATE_FIELDS = new Set([
  'data_nascimento', 'data_admissao', 'dt_op_fgts', 'venc_exper_1',
  'venc_exper_2', 'venc_exame_med', 'data_inicio_trabalho',
]);
const DECIMAL_FIELDS = new Set([
  'perc_fgts', 'horas_mensais', 'salario', 'salario_base',
  'perc_adiantamento',
]);

function cleanFormData(data: Record<string, string>): Record<string, string | null> {
  const cleaned: Record<string, string | null> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value === '' && (DATE_FIELDS.has(key) || DECIMAL_FIELDS.has(key))) {
      cleaned[key] = null;
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
}

export default function AdmissaoPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = Number(params.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('cadastrais');

  const [admissionId, setAdmissionId] = useState<number | null>(null);
  const [admissionStatus, setAdmissionStatus] = useState<string>('draft');
  const [candidateName, setCandidateName] = useState<string>('');
  const [prefilledKeys, setPrefilledKeys] = useState<Set<string>>(new Set());

  // Form data - all fields as strings
  const [formData, setFormData] = useState<Record<string, string>>({});

  // Lookups do Protheus (selects dinâmicos)
  const [lookups, setLookups] = useState<Record<string, { valor: string; descricao: string }[]>>({});

  // Load data on mount
  useEffect(() => {
    if (!candidateId) return;
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Buscar admissao existente e lookups em paralelo
      const [existing, lookupsData] = await Promise.all([
        admissionService.getAdmissionByCandidate(candidateId),
        admissionService.getAdmissionLookups(),
      ]);
      setLookups(lookupsData);

      if (existing) {
        // Load existing admission data
        setAdmissionId(existing.id);
        setAdmissionStatus(existing.status);
        setCandidateName(existing.candidate_name || '');

        // Populate form with existing data
        const data: Record<string, string> = {};
        const allFields = TABS.flatMap(t => t.fields);
        for (const field of allFields) {
          const val = (existing as Record<string, unknown>)[field.key];
          data[field.key] = val != null ? String(val) : '';
        }
        data['data_inicio_trabalho'] = existing.data_inicio_trabalho || '';
        setFormData(data);
      } else {
        // New admission - get prefill from candidate profile
        const prefill: AdmissionPrefill = await admissionService.getAdmissionPrefill(candidateId);

        const data: Record<string, string> = {};
        const filled = new Set<string>();

        // Initialize all fields empty
        const allFields = TABS.flatMap(t => t.fields);
        for (const field of allFields) {
          data[field.key] = '';
        }
        data['data_inicio_trabalho'] = '';

        // Apply prefill
        for (const [key, value] of Object.entries(prefill)) {
          if (value != null && value !== '') {
            data[key] = String(value);
            if (PREFILL_KEYS.has(key)) {
              filled.add(key);
            }
          }
        }

        setPrefilledKeys(filled);
        setFormData(data);

        // Create the admission record as draft
        const created = await admissionService.createAdmissionData({
          candidate: candidateId,
          status: 'draft',
          ...cleanFormData(data),
        });

        setAdmissionId(created.id);
        setAdmissionStatus(created.status);
        setCandidateName(created.candidate_name || '');
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: Record<string, unknown> } };
      const data = errObj?.response?.data;
      let msg = 'Erro ao carregar dados';
      if (data && typeof data === 'object') {
        msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
      console.error('Erro admissao:', data || err);
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = useCallback((key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleSaveDraft = async () => {
    if (!admissionId) return;
    setSaving(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await admissionService.updateAdmissionData(admissionId, cleanFormData(formData));
      setAdmissionStatus(updated.status);
      setSuccessMsg('Rascunho salvo com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: Record<string, unknown> } };
      const data = errObj?.response?.data;
      let msg = 'Erro ao salvar';
      if (data && typeof data === 'object') {
        msg = Object.entries(data)
          .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
          .join(' | ');
      } else if (err instanceof Error) {
        msg = err.message;
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleFinalize = async () => {
    if (!admissionId) return;
    if (!formData.data_inicio_trabalho) {
      setError('Preencha a Data de Inicio do Trabalho antes de finalizar.');
      return;
    }

    setFinalizing(true);
    setError(null);
    setSuccessMsg(null);
    try {
      // Save current data first
      await admissionService.updateAdmissionData(admissionId, cleanFormData(formData));
      // Then finalize
      const result = await admissionService.finalizeAdmission(admissionId);
      setAdmissionStatus(result.status);
      setSuccessMsg('Admissao finalizada com sucesso!');
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { detail?: string } } };
      const msg = errObj?.response?.data?.detail || 'Erro ao finalizar admissao.';
      setError(msg);
    } finally {
      setFinalizing(false);
    }
  };

  const handleTabChange = async (newTab: TabKey) => {
    // Auto-save on tab change if there's an admission
    if (admissionId && admissionStatus === 'draft') {
      try {
        await admissionService.updateAdmissionData(admissionId, cleanFormData(formData));
      } catch {
        // silent fail on auto-save
      }
    }
    setActiveTab(newTab);
  };

  // ============================================
  // RENDER HELPERS
  // ============================================

  const renderField = (field: FieldDef) => {
    const value = formData[field.key] || '';
    const isPrefilled = prefilledKeys.has(field.key);
    const isReadonly = admissionStatus !== 'draft';

    // Determinar se deve renderizar como select:
    // 1. Se tem lookup do Protheus para este campo → select dinâmico
    // 2. Se tem options hardcoded no field → select estático (fallback)
    const lookupData = lookups[field.key];
    const hasLookup = lookupData && lookupData.length > 0;
    const isSelect = hasLookup || (field.type === 'select' && field.options);

    // Montar options: lookup do Protheus tem prioridade sobre hardcoded
    let selectOptions: { value: string; label: string }[];
    if (hasLookup) {
      const seen = new Set<string>();
      const uniqueOpts: { value: string; label: string }[] = [];
      for (const opt of lookupData) {
        if (!seen.has(opt.valor)) {
          seen.add(opt.valor);
          uniqueOpts.push({ value: opt.valor, label: `${opt.valor} - ${opt.descricao}` });
        }
      }
      selectOptions = [{ value: '', label: 'Selecione' }, ...uniqueOpts];
    } else {
      selectOptions = field.options || [];
    }

    return (
      <div key={field.key} className="space-y-1">
        <label className="block text-sm font-medium text-slate-600">
          {field.label}
          {isPrefilled && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded bg-sky-50 text-sky-700 border border-sky-200">
              Perfil
            </span>
          )}
          {hasLookup && (
            <span className="ml-2 px-2 py-0.5 text-xs rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
              Protheus
            </span>
          )}
        </label>

        {isSelect ? (
          <select
            value={value}
            onChange={e => handleFieldChange(field.key, e.target.value)}
            disabled={isReadonly}
            className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectOptions.map((opt, idx) => (
              <option key={`${opt.value}-${idx}`} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : field.type === 'date' ? (
          <DateInput
            name={field.key}
            value={value}
            onChange={(iso) => handleFieldChange(field.key, iso)}
            disabled={isReadonly}
            className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
        ) : (
          <input
            type={field.type === 'number' ? 'number' : 'text'}
            value={value}
            onChange={e => handleFieldChange(field.key, e.target.value)}
            disabled={isReadonly}
            step={field.type === 'number' ? '0.01' : undefined}
            className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md text-slate-800
                       focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                       disabled:opacity-50 disabled:cursor-not-allowed"
          />
        )}
      </div>
    );
  };

  const renderFinalizacao = () => {
    const isReadonly = admissionStatus !== 'draft';
    return (
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">
            Finalizar Admissao
          </h3>
          <p className="text-slate-500 mb-6">
            Preencha a data de inicio do trabalho e finalize o cadastro. Apos finalizado,
            os dados ficam prontos para envio ao Protheus.
          </p>

          <div className="max-w-sm space-y-1 mb-6">
            <label className="block text-sm font-medium text-slate-600">
              Data de Inicio do Trabalho *
            </label>
            <DateInput
              name="data_inicio_trabalho"
              value={formData.data_inicio_trabalho || ''}
              onChange={(iso) => handleFieldChange('data_inicio_trabalho', iso)}
              disabled={isReadonly}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-md text-slate-800
                         focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent
                         disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>

          {admissionStatus === 'draft' && (
            <button
              onClick={handleFinalize}
              disabled={finalizing || !formData.data_inicio_trabalho}
              className="flex items-center space-x-2 px-6 py-3 bg-green-700 hover:bg-emerald-600
                         text-white rounded-md font-medium transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {finalizing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <CheckCircle className="h-5 w-5" />
              )}
              <span>{finalizing ? 'Finalizando...' : 'Finalizar Admissao'}</span>
            </button>
          )}

          {admissionStatus === 'completed' && (
            <div className="mt-4 p-4 bg-emerald-50/30 border border-green-800 rounded-md">
              <p className="text-emerald-700 font-medium">
                Admissao finalizada com sucesso! Dados prontos para envio ao Protheus.
              </p>
            </div>
          )}

          {admissionStatus === 'sent' && (
            <div className="mt-4 p-4 bg-sky-50 border border-sky-200 rounded-md">
              <p className="text-sky-700 font-medium">
                Dados enviados ao Protheus.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // MAIN RENDER
  // ============================================

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-600" />
        <span className="ml-3 text-slate-600">Carregando dados de admissao...</span>
      </div>
    );
  }

  const statusInfo = STATUS_LABELS[admissionStatus] || STATUS_LABELS.draft;
  const currentTab = TABS.find(t => t.key === activeTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin-panel/documentos"
            className="text-slate-500 hover:text-slate-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Admissao - {candidateName || `Candidato #${candidateId}`}
            </h1>
            <p className="text-slate-500 text-sm">
              Preencha os campos para cadastro no Protheus ERP
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
            {statusInfo.label}
          </span>
          {admissionStatus === 'draft' && (
            <button
              onClick={handleSaveDraft}
              disabled={saving}
              className="flex items-center space-x-2 px-4 py-2 bg-sky-600 hover:bg-sky-700
                         text-white rounded-md text-sm font-medium transition-colors
                         disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{saving ? 'Salvando...' : 'Salvar Rascunho'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="p-4 bg-red-50/30 border border-red-800 rounded-md text-red-700">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50/30 border border-green-800 rounded-md text-emerald-700">
          {successMsg}
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <nav className="flex space-x-1 min-w-max">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-slate-100 text-sky-600 border-b-2 border-sky-500'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white'
              }`}
            >
              {tab.label}
              {tab.key !== 'finalizacao' && (
                <span className="ml-1 text-xs text-slate-400">
                  ({tab.fields.length})
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white/50 border border-slate-200 rounded-lg p-6">
        {activeTab === 'finalizacao' ? (
          renderFinalizacao()
        ) : currentTab ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentTab.fields.map(field => renderField(field))}
          </div>
        ) : null}
      </div>

      {/* Bottom navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => {
            const idx = TABS.findIndex(t => t.key === activeTab);
            if (idx > 0) handleTabChange(TABS[idx - 1].key);
          }}
          disabled={activeTab === TABS[0].key}
          className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Anterior
        </button>
        <span className="text-sm text-slate-400">
          Aba {TABS.findIndex(t => t.key === activeTab) + 1} de {TABS.length}
        </span>
        <button
          onClick={() => {
            const idx = TABS.findIndex(t => t.key === activeTab);
            if (idx < TABS.length - 1) handleTabChange(TABS[idx + 1].key);
          }}
          disabled={activeTab === TABS[TABS.length - 1].key}
          className="px-4 py-2 text-sm text-sky-600 hover:text-sky-500 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Proximo
        </button>
      </div>
    </div>
  );
}
