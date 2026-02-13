'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import whatsappService from '@/services/whatsappService';
import { WhatsAppTemplate } from '@/types';
import { PencilSquare, Check2, X as XIcon, Whatsapp, Eye, ToggleOn, ToggleOff } from 'react-bootstrap-icons';
import toast from 'react-hot-toast';

const AVAILABLE_VARIABLES: Record<string, string[]> = {
  profile_approved: ['{nome}'],
  profile_rejected: ['{nome}', '{observacoes}'],
  profile_changes_requested: ['{nome}', '{observacoes}'],
  process_added: ['{nome}', '{processo}'],
  process_approved: ['{nome}', '{processo}'],
  process_rejected: ['{nome}', '{processo}'],
  document_approved: ['{nome}', '{documento}'],
  document_rejected: ['{nome}', '{documento}', '{observacoes}'],
  application_in_process: ['{nome}', '{vaga}'],
  application_interview: ['{nome}', '{vaga}'],
  application_approved: ['{nome}', '{vaga}'],
  application_rejected: ['{nome}', '{vaga}'],
  admission_started: ['{nome}'],
  admission_completed: ['{nome}', '{data_inicio}'],
  admission_confirmed: ['{nome}', '{data_inicio}'],
};

const CATEGORY_MAP: Record<string, string> = {
  profile_approved: 'Perfil',
  profile_rejected: 'Perfil',
  profile_changes_requested: 'Perfil',
  document_approved: 'Documentos',
  document_rejected: 'Documentos',
  process_added: 'Processo Seletivo',
  process_approved: 'Processo Seletivo',
  process_rejected: 'Processo Seletivo',
  application_in_process: 'Candidaturas',
  application_interview: 'Candidaturas',
  application_approved: 'Candidaturas',
  application_rejected: 'Candidaturas',
  admission_started: 'Admissao',
  admission_completed: 'Admissao',
  admission_confirmed: 'Admissao',
};

// Ordem das categorias seguindo o funil do pipeline
const CATEGORY_ORDER = [
  'Perfil',
  'Documentos',
  'Processo Seletivo',
  'Candidaturas',
  'Admissao',
];

const CATEGORY_COLORS: Record<string, string> = {
  'Perfil': 'bg-blue-100 text-blue-700',
  'Documentos': 'bg-amber-100 text-amber-700',
  'Processo Seletivo': 'bg-purple-100 text-purple-700',
  'Candidaturas': 'bg-cyan-100 text-cyan-700',
  'Admissao': 'bg-green-100 text-green-700',
};

export default function WhatsAppPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WhatsAppTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [messageText, setMessageText] = useState('');

  // Preview state
  const [showPreview, setShowPreview] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<WhatsAppTemplate | null>(null);

  useEffect(() => {
    if (user && user.user_type !== 'recruiter' && !user.is_staff && !user.is_superuser) {
      router.push('/admin-panel');
    }
  }, [user, router]);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const data = await whatsappService.getTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch {
      setError('Erro ao carregar templates WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: WhatsAppTemplate) => {
    setEditingTemplate(template);
    setMessageText(template.message_template);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingTemplate) return;
    setSaving(true);
    try {
      await whatsappService.updateTemplate(editingTemplate.id, {
        message_template: messageText,
      });
      toast.success('Template atualizado com sucesso!');
      setShowModal(false);
      setEditingTemplate(null);
      fetchTemplates();
    } catch {
      toast.error('Erro ao salvar template');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (template: WhatsAppTemplate) => {
    try {
      await whatsappService.updateTemplate(template.id, {
        is_active: !template.is_active,
      });
      toast.success(template.is_active ? 'Template desativado' : 'Template ativado');
      fetchTemplates();
    } catch {
      toast.error('Erro ao alterar status do template');
    }
  };

  const handlePreview = (template: WhatsAppTemplate) => {
    setPreviewTemplate(template);
    setShowPreview(true);
  };

  const getPreviewMessage = (template: WhatsAppTemplate) => {
    let msg = template.message_template;
    msg = msg.replace(/\{nome\}/g, 'Joao Silva');
    msg = msg.replace(/\{observacoes\}/g, 'Necessario atualizar foto e endereco.');
    msg = msg.replace(/\{vaga\}/g, 'Analista de TI');
    msg = msg.replace(/\{processo\}/g, 'Processo Seletivo 2026');
    msg = msg.replace(/\{documento\}/g, 'RG');
    msg = msg.replace(/\{data_inicio\}/g, '03/03/2026');
    return msg;
  };

  // Group templates by category
  const groupedTemplates: Record<string, WhatsAppTemplate[]> = {};
  templates.forEach((t) => {
    const cat = CATEGORY_MAP[t.status_event] || 'Outros';
    if (!groupedTemplates[cat]) groupedTemplates[cat] = [];
    groupedTemplates[cat].push(t);
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-green-100 rounded-lg">
            <Whatsapp className="w-6 h-6 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-800">Mensagens WhatsApp</h1>
        </div>
        <p className="text-zinc-500">
          Configure as mensagens enviadas automaticamente aos candidatos a cada mudanca de status no pipeline.
        </p>
        <div className="mt-3 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
          <strong>Variaveis disponiveis:</strong> {'{nome}'} = Nome do candidato | {'{observacoes}'} = Observacoes do recrutador | {'{vaga}'} = Nome da vaga | {'{processo}'} = Nome do processo seletivo | {'{documento}'} = Nome do documento | {'{data_inicio}'} = Data de inicio do trabalho
        </div>
      </div>

      {/* Templates by category - seguindo ordem do pipeline */}
      {CATEGORY_ORDER.filter(cat => groupedTemplates[cat]).map((category) => (
        <div key={category} className="mb-8">
          <h2 className="text-lg font-semibold text-zinc-700 mb-4 flex items-center gap-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'}`}>
              {category}
            </span>
          </h2>
          <div className="space-y-3">
            {groupedTemplates[category].map((template) => (
              <div
                key={template.id}
                className={`bg-white border rounded-lg p-4 transition-all ${
                  template.is_active ? 'border-zinc-200 hover:shadow-md' : 'border-zinc-100 opacity-60'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-zinc-800">{template.status_event_display}</h3>
                      {!template.is_active && (
                        <span className="px-2 py-0.5 text-xs bg-zinc-100 text-zinc-500 rounded">Inativo</span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-500 line-clamp-2 whitespace-pre-line">
                      {template.message_template}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {(AVAILABLE_VARIABLES[template.status_event] || []).map((v) => (
                        <span key={v} className="px-1.5 py-0.5 text-xs bg-zinc-100 text-zinc-600 rounded font-mono">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handlePreview(template)}
                      className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Visualizar"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(template)}
                      className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <PencilSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(template)}
                      className={`p-2 rounded-lg transition-colors ${
                        template.is_active
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-zinc-400 hover:bg-zinc-50'
                      }`}
                      title={template.is_active ? 'Desativar' : 'Ativar'}
                    >
                      {template.is_active ? (
                        <ToggleOn className="w-5 h-5" />
                      ) : (
                        <ToggleOff className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Edit Modal */}
      {showModal && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-800">
                  Editar: {editingTemplate.status_event_display}
                </h2>
                <button
                  onClick={() => { setShowModal(false); setEditingTemplate(null); }}
                  className="p-1 text-zinc-400 hover:text-zinc-600"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-3">
                <p className="text-sm text-zinc-500 mb-2">Variaveis disponiveis para este evento:</p>
                <div className="flex flex-wrap gap-1">
                  {(AVAILABLE_VARIABLES[editingTemplate.status_event] || []).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setMessageText((prev) => prev + v)}
                      className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 font-mono transition-colors"
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 border border-zinc-300 rounded-lg text-zinc-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-y font-mono text-sm"
                placeholder="Digite a mensagem do template..."
              />

              {/* Preview inline */}
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-xs font-medium text-green-700 mb-2">Preview da mensagem:</p>
                <div className="bg-white rounded-lg p-3 text-sm text-zinc-700 whitespace-pre-line shadow-sm">
                  {getPreviewMessage({ ...editingTemplate, message_template: messageText })}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => { setShowModal(false); setEditingTemplate(null); }}
                  className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !messageText.trim()}
                  className="px-4 py-2 text-sm text-white bg-green-600 hover:bg-green-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  {saving ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check2 className="w-4 h-4" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Whatsapp className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-zinc-800">Preview</h2>
                </div>
                <button
                  onClick={() => { setShowPreview(false); setPreviewTemplate(null); }}
                  className="p-1 text-zinc-400 hover:text-zinc-600"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-zinc-500 mb-3">{previewTemplate.status_event_display}</p>
              <div className="bg-[#e5ddd5] rounded-lg p-4">
                <div className="bg-white rounded-lg p-3 text-sm text-zinc-700 whitespace-pre-line shadow-sm max-w-[85%]">
                  {getPreviewMessage(previewTemplate)}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  onClick={() => { setShowPreview(false); setPreviewTemplate(null); }}
                  className="px-4 py-2 text-sm text-zinc-600 hover:text-zinc-800 border border-zinc-300 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
