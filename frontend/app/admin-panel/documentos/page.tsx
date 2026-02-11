'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus, Trash2, Edit, FileText, Clock, CheckCircle, XCircle,
  Users, Download, Eye, Settings, X
} from 'lucide-react';
import admissionService from '@/services/admissionService';
import {
  DocumentType, CreateDocumentType, CandidateDocument,
  ApprovedAwaitingCandidate, DocumentsCompletedCandidate
} from '@/types';
import toast from 'react-hot-toast';
import { confirmDialog } from '@/lib/confirmDialog';

type TabKey = 'aguardando' | 'pendencias' | 'aprovados';

export default function DocumentosDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('aguardando');
  const [showTypesModal, setShowTypesModal] = useState(false);

  // === TIPOS DE DOCUMENTO (existing) ===
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newType, setNewType] = useState<CreateDocumentType>({
    name: '',
    description: '',
    is_required: true,
    accepted_formats: 'pdf,jpg,png',
    max_file_size_mb: 5,
    order: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<CreateDocumentType>>({});
  const [saving, setSaving] = useState(false);

  // === PERFIS AGUARDANDO ===
  const [awaitingCandidates, setAwaitingCandidates] = useState<ApprovedAwaitingCandidate[]>([]);
  const [loadingAwaiting, setLoadingAwaiting] = useState(false);

  // === DOCUMENTAÇÃO APROVADA ===
  const [completedCandidates, setCompletedCandidates] = useState<DocumentsCompletedCandidate[]>([]);
  const [loadingCompleted, setLoadingCompleted] = useState(false);

  // === PENDÊNCIAS ===
  const [pendingDocs, setPendingDocs] = useState<CandidateDocument[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [reviewingId, setReviewingId] = useState<number | null>(null);
  const [reviewObs, setReviewObs] = useState('');
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected' | null>(null);

  // Fetch types and default tab data on mount
  useEffect(() => {
    fetchTypes();
    fetchAwaiting();
  }, []);

  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'pendencias' && pendingDocs.length === 0) {
      fetchPending();
    }
    if (activeTab === 'aprovados' && completedCandidates.length === 0) {
      fetchCompleted();
    }
  }, [activeTab]);

  // === FETCH FUNCTIONS ===
  const fetchTypes = async () => {
    setLoadingTypes(true);
    try {
      const data = await admissionService.getDocumentTypes({ page: 1 });
      setDocumentTypes(data.results || []);
    } catch (err) {
      console.error('Erro ao buscar tipos de documento:', err);
      setError('Erro ao carregar tipos de documento.');
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchAwaiting = async () => {
    setLoadingAwaiting(true);
    try {
      const data = await admissionService.getApprovedAwaitingDocuments();
      setAwaitingCandidates(data);
    } catch (err) {
      console.error('Erro ao buscar perfis aguardando:', err);
    } finally {
      setLoadingAwaiting(false);
    }
  };

  const fetchPending = async () => {
    setLoadingPending(true);
    try {
      const data = await admissionService.getPendingReview();
      setPendingDocs(data);
    } catch (err) {
      console.error('Erro ao buscar pendências:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchCompleted = async () => {
    setLoadingCompleted(true);
    try {
      const data = await admissionService.getDocumentsCompleted();
      setCompletedCandidates(data);
    } catch (err) {
      console.error('Erro ao buscar candidatos com documentação completa:', err);
    } finally {
      setLoadingCompleted(false);
    }
  };

  // === CRUD HANDLERS (existing) ===
  const handleCreate = async () => {
    if (!newType.name?.trim()) return;
    setSaving(true);
    try {
      const order = documentTypes.length + 1;
      await admissionService.createDocumentType({ ...newType, order });
      setNewType({
        name: '', description: '', is_required: true,
        accepted_formats: 'pdf,jpg,png', max_file_size_mb: 5, order: 0,
      });
      setShowNewForm(false);
      fetchTypes();
    } catch (err: any) {
      const detail = err?.response?.data?.non_field_errors?.[0]
        || err?.response?.data?.detail
        || 'Erro ao criar tipo de documento. Verifique se o limite de 10 não foi atingido.';
      toast.error(detail);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: number) => {
    setSaving(true);
    try {
      await admissionService.updateDocumentType(id, editData);
      setEditingId(null);
      setEditData({});
      fetchTypes();
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      toast.error('Erro ao atualizar tipo de documento.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirmDialog('Tem certeza que deseja excluir este tipo de documento?'))) return;
    try {
      await admissionService.deleteDocumentType(id);
      fetchTypes();
    } catch (err) {
      console.error('Erro ao excluir:', err);
      toast.error('Erro ao excluir tipo de documento.');
    }
  };

  const startEdit = (type: DocumentType) => {
    setEditingId(type.id);
    setEditData({
      name: type.name,
      description: type.description || '',
      is_required: type.is_required,
      accepted_formats: type.accepted_formats,
      max_file_size_mb: type.max_file_size_mb,
    });
  };

  // === REVIEW HANDLERS ===
  const handleReview = async (docId: number, status: 'approved' | 'rejected') => {
    if (status === 'rejected' && !reviewObs.trim()) {
      toast.error('Informe o motivo da rejeição.');
      return;
    }
    try {
      await admissionService.reviewDocument(docId, {
        status,
        observations: reviewObs,
      });
      setReviewingId(null);
      setReviewObs('');
      setReviewAction(null);
      fetchPending();
      // Also refresh awaiting and completed since approval may change the lists
      setAwaitingCandidates([]);
      setCompletedCandidates([]);
    } catch (err) {
      console.error('Erro ao revisar documento:', err);
      toast.error('Erro ao revisar documento.');
    }
  };

  const startReview = (docId: number, action: 'approved' | 'rejected') => {
    setReviewingId(docId);
    setReviewAction(action);
    setReviewObs('');
  };

  // === TABS CONFIG ===
  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'aguardando', label: 'Perfis Aguardando', count: awaitingCandidates.length || undefined },
    { key: 'pendencias', label: 'Pendências de Aprovação', count: pendingDocs.length || undefined },
    { key: 'aprovados', label: 'Doc. Aprovada', count: completedCandidates.length || undefined },
  ];

  // Group pending docs by candidate
  const pendingByCandidate = pendingDocs.reduce<Record<string, CandidateDocument[]>>((acc, doc) => {
    const name = doc.candidate_name || `Candidato #${doc.candidate}`;
    if (!acc[name]) acc[name] = [];
    acc[name].push(doc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Documentos</h1>
          <p className="text-slate-500 text-sm mt-1">
            Acompanhe pendências e perfis aguardando envio de documentos.
          </p>
        </div>
        <button
          onClick={() => setShowTypesModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          <Settings className="h-4 w-4" />
          Tipos de Documento
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-lg p-1">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${
              activeTab === tab.key
                ? 'bg-sky-600 text-white'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                activeTab === tab.key
                  ? 'bg-sky-500 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-500 rounded-lg p-4 text-red-600">
          {error}
        </div>
      )}

      {/* ===================== MODAL: TIPOS DE DOCUMENTO ===================== */}
      {showTypesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowTypesModal(false)}
          />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-hidden mx-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Tipos de Documento</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  <span className="text-sky-600 font-medium">{documentTypes.length}/10</span> tipos criados
                </p>
              </div>
              <div className="flex items-center gap-2">
                {documentTypes.length < 10 && !showNewForm && (
                  <button
                    onClick={() => setShowNewForm(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Novo Tipo
                  </button>
                )}
                <button
                  onClick={() => setShowTypesModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-6 space-y-4">
              {loadingTypes ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
                </div>
              ) : (
                <>
                  {/* New Type Form */}
                  {showNewForm && (
                    <div className="bg-slate-50 rounded-lg p-4 border border-sky-400">
                      <h3 className="text-lg font-medium text-slate-900 mb-4">Novo Tipo de Documento</h3>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Nome *</label>
                            <input
                              type="text"
                              value={newType.name || ''}
                              onChange={(e) => setNewType(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Ex: RG, Comprovante de Residência..."
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-600 mb-1">Formatos Aceitos</label>
                            <input
                              type="text"
                              value={newType.accepted_formats || ''}
                              onChange={(e) => setNewType(prev => ({ ...prev, accepted_formats: e.target.value }))}
                              placeholder="pdf,jpg,png"
                              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-600 mb-1">Descrição / Instruções</label>
                          <textarea
                            value={newType.description || ''}
                            onChange={(e) => setNewType(prev => ({ ...prev, description: e.target.value }))}
                            rows={2}
                            placeholder="Instruções para o candidato sobre este documento..."
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                          />
                        </div>
                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              id="is_required"
                              checked={newType.is_required ?? true}
                              onChange={(e) => setNewType(prev => ({ ...prev, is_required: e.target.checked }))}
                              className="rounded border-slate-300 bg-white text-sky-600 focus:ring-sky-500"
                            />
                            <label htmlFor="is_required" className="text-sm text-slate-600">Obrigatório</label>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm text-slate-600">Tamanho máx.:</label>
                            <select
                              value={newType.max_file_size_mb || 5}
                              onChange={(e) => setNewType(prev => ({ ...prev, max_file_size_mb: parseInt(e.target.value) }))}
                              className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                            >
                              <option value={1}>1 MB</option>
                              <option value={2}>2 MB</option>
                              <option value={5}>5 MB</option>
                              <option value={10}>10 MB</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleCreate}
                            disabled={!newType.name?.trim() || saving}
                            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors disabled:opacity-50"
                          >
                            {saving ? 'Criando...' : 'Criar Tipo'}
                          </button>
                          <button
                            onClick={() => setShowNewForm(false)}
                            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Types List */}
                  {documentTypes.length === 0 ? (
                    <div className="py-12 text-center">
                      <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-500 mb-4">Nenhum tipo de documento criado ainda.</p>
                      <button
                        onClick={() => setShowNewForm(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                        Criar Primeiro Tipo
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documentTypes.map((type, index) => (
                        <div key={type.id} className="bg-slate-50 rounded-lg p-4">
                          {editingId === type.id ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm text-slate-500 mb-1">Nome</label>
                                  <input
                                    type="text"
                                    value={editData.name || ''}
                                    onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm text-slate-500 mb-1">Formatos</label>
                                  <input
                                    type="text"
                                    value={editData.accepted_formats || ''}
                                    onChange={(e) => setEditData(prev => ({ ...prev, accepted_formats: e.target.value }))}
                                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm text-slate-500 mb-1">Descrição</label>
                                <textarea
                                  value={editData.description || ''}
                                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                                  rows={2}
                                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                                />
                              </div>
                              <div className="flex flex-wrap gap-6">
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={editData.is_required ?? true}
                                    onChange={(e) => setEditData(prev => ({ ...prev, is_required: e.target.checked }))}
                                    className="rounded border-slate-300 bg-white text-sky-600"
                                  />
                                  <label className="text-sm text-slate-600">Obrigatório</label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <label className="text-sm text-slate-600">Tamanho máx.:</label>
                                  <select
                                    value={editData.max_file_size_mb || 5}
                                    onChange={(e) => setEditData(prev => ({ ...prev, max_file_size_mb: parseInt(e.target.value) }))}
                                    className="px-2 py-1 bg-white border border-slate-300 rounded text-slate-900 text-sm"
                                  >
                                    <option value={1}>1 MB</option>
                                    <option value={2}>2 MB</option>
                                    <option value={5}>5 MB</option>
                                    <option value={10}>10 MB</option>
                                  </select>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleUpdate(type.id)}
                                  disabled={saving}
                                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm disabled:opacity-50"
                                >
                                  {saving ? 'Salvando...' : 'Salvar'}
                                </button>
                                <button
                                  onClick={() => { setEditingId(null); setEditData({}); }}
                                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-sm"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 flex-1">
                                <span className="flex items-center justify-center w-8 h-8 bg-sky-600 text-white text-sm font-bold rounded-full">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className="text-slate-900 font-medium">{type.name}</h3>
                                    {type.is_required ? (
                                      <span className="px-2 py-0.5 bg-red-50 text-red-700 text-xs rounded">
                                        Obrigatório
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">
                                        Opcional
                                      </span>
                                    )}
                                  </div>
                                  {type.description && (
                                    <p className="text-slate-500 text-sm mt-1">{type.description}</p>
                                  )}
                                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                                    <span>Formatos: {type.accepted_formats}</span>
                                    <span>Máx: {type.max_file_size_mb}MB</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => startEdit(type)}
                                  className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(type.id)}
                                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-100 rounded-lg"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB: PERFIS AGUARDANDO DOCUMENTOS ===================== */}
      {activeTab === 'aguardando' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-sm">
              Candidatos com perfil aprovado que ainda não completaram os documentos obrigatórios.
            </p>
            <button
              onClick={fetchAwaiting}
              className="text-sm text-sky-600 hover:text-sky-500 transition-colors"
            >
              Atualizar
            </button>
          </div>

          {loadingAwaiting ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
            </div>
          ) : awaitingCandidates.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-500">Todos os candidatos aprovados já completaram seus documentos obrigatórios.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {awaitingCandidates.map(candidate => {
                const progress = candidate.total_required > 0
                  ? Math.round((candidate.approved_count / candidate.total_required) * 100)
                  : 0;

                return (
                  <div key={candidate.candidate_id} className="bg-white rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-slate-900 font-medium">{candidate.candidate_name}</h3>
                        <p className="text-slate-400 text-sm">{candidate.candidate_email}</p>
                      </div>
                      <Link
                        href={`/admin-panel/talentos/${candidate.candidate_id}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalhes
                      </Link>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-slate-500 mb-1">
                        <span>{candidate.approved_count} de {candidate.total_required} obrigatórios aprovados</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div
                          className="bg-sky-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {candidate.not_sent_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-full">
                          <FileText className="h-3 w-3" />
                          {candidate.not_sent_count} não enviado{candidate.not_sent_count > 1 ? 's' : ''}
                        </span>
                      )}
                      {candidate.pending_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-full">
                          <Clock className="h-3 w-3" />
                          {candidate.pending_count} pendente{candidate.pending_count > 1 ? 's' : ''}
                        </span>
                      )}
                      {candidate.rejected_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-full">
                          <XCircle className="h-3 w-3" />
                          {candidate.rejected_count} rejeitado{candidate.rejected_count > 1 ? 's' : ''}
                        </span>
                      )}
                      {candidate.approved_count > 0 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-xs rounded-full">
                          <CheckCircle className="h-3 w-3" />
                          {candidate.approved_count} aprovado{candidate.approved_count > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB: PENDÊNCIAS DE REVISÃO ===================== */}
      {activeTab === 'pendencias' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-sm">
              Documentos enviados pelos candidatos aguardando sua revisão.
            </p>
            <button
              onClick={fetchPending}
              className="text-sm text-sky-600 hover:text-sky-500 transition-colors"
            >
              Atualizar
            </button>
          </div>

          {loadingPending ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
            </div>
          ) : pendingDocs.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum documento pendente de revisão.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {Object.entries(pendingByCandidate).map(([candidateName, docs]) => (
                <div key={candidateName} className="bg-white rounded-lg overflow-hidden">
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                    <Users className="h-4 w-4 text-sky-600" />
                    <h3 className="text-slate-900 font-medium">{candidateName}</h3>
                    <span className="text-slate-400 text-xs">({docs.length} documento{docs.length > 1 ? 's' : ''})</span>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {docs.map(doc => (
                      <div key={doc.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-slate-500" />
                              <span className="text-slate-900 font-medium">
                                {doc.document_type_name}
                              </span>
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs rounded-full">
                                <Clock className="h-3 w-3" />
                                Pendente
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                              <span>{doc.original_filename}</span>
                              <span>Enviado em {new Date(doc.created_at).toLocaleDateString('pt-BR')}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 ml-4">
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                title="Baixar arquivo"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                            {reviewingId !== doc.id && (
                              <>
                                <button
                                  onClick={() => startReview(doc.id, 'approved')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                  Aprovar
                                </button>
                                <button
                                  onClick={() => startReview(doc.id, 'rejected')}
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Rejeitar
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Review form */}
                        {reviewingId === doc.id && (
                          <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                            <p className="text-sm text-slate-600 mb-2">
                              {reviewAction === 'approved'
                                ? 'Observação (opcional):'
                                : 'Motivo da rejeição (obrigatório):'
                              }
                            </p>
                            <textarea
                              value={reviewObs}
                              onChange={(e) => setReviewObs(e.target.value)}
                              rows={2}
                              placeholder={reviewAction === 'rejected'
                                ? 'Informe o motivo da rejeição...'
                                : 'Observação opcional...'
                              }
                              className="w-full px-3 py-2 bg-slate-100 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none text-sm"
                            />
                            <div className="flex gap-2 mt-2">
                              <button
                                onClick={() => handleReview(doc.id, reviewAction!)}
                                className={`px-4 py-1.5 text-white rounded-lg text-sm transition-colors ${
                                  reviewAction === 'approved'
                                    ? 'bg-emerald-600 hover:bg-emerald-700'
                                    : 'bg-red-500 hover:bg-red-600'
                                }`}
                              >
                                {reviewAction === 'approved' ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
                              </button>
                              <button
                                onClick={() => { setReviewingId(null); setReviewObs(''); setReviewAction(null); }}
                                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-900 rounded-lg text-sm transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ===================== TAB: DOCUMENTAÇÃO APROVADA ===================== */}
      {activeTab === 'aprovados' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-slate-500 text-sm">
              Candidatos com todos os documentos obrigatórios aprovados — prontos para a próxima fase.
            </p>
            <button
              onClick={fetchCompleted}
              className="text-sm text-sky-600 hover:text-sky-500 transition-colors"
            >
              Atualizar
            </button>
          </div>

          {loadingCompleted ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-400"></div>
            </div>
          ) : completedCandidates.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center">
              <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum candidato com documentação completa ainda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedCandidates.map(candidate => (
                <div key={candidate.candidate_id} className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-slate-900 font-medium">{candidate.candidate_name}</h3>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs rounded-full font-medium">
                          <CheckCircle className="h-3 w-3" />
                          100% Aprovado
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mt-1">{candidate.candidate_email}</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-slate-500 mb-1">
                          <span>{candidate.approved_count} de {candidate.total_required} obrigatórios aprovados</span>
                          <span>100%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full w-full" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/admin-panel/talentos/${candidate.candidate_id}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                        Ver Detalhes
                      </Link>
                      <Link
                        href={`/admin-panel/admissao/${candidate.candidate_id}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-700 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Iniciar Admissao
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
