'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import admissionService from '@/services/admissionService';
import candidateService from '@/services/candidateService';
import { CandidateDocumentWithType, DocumentsSummary, CandidateProfile } from '@/types';
import Navbar from '@/components/Navbar';
import LoadTesserato from '@/components/LoadTesserato';
import {
  FileText, Upload, CheckCircle, XCircle, Clock, AlertCircle,
  ArrowLeft, Download, RefreshCw
} from 'lucide-react';
import Link from 'next/link';

export default function CandidateDocumentsPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<CandidateProfile | null>(null);
  const [documents, setDocuments] = useState<CandidateDocumentWithType[]>([]);
  const [summary, setSummary] = useState<DocumentsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  useEffect(() => {
    if (user && user.user_type === 'candidate') {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileData, docsData] = await Promise.all([
        candidateService.getCandidateProfile(),
        admissionService.getMyDocuments(),
      ]);
      setProfile(profileData);
      setDocuments(docsData.documents);
      setSummary(docsData.summary);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Erro ao carregar documentos.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (documentTypeId: number, file: File) => {
    setUploading(documentTypeId);
    setError(null);
    try {
      await admissionService.uploadDocument(documentTypeId, file);
      await fetchData();
    } catch (err: any) {
      const detail = err?.response?.data?.file?.[0]
        || err?.response?.data?.non_field_errors?.[0]
        || err?.response?.data?.detail
        || 'Erro ao enviar documento.';
      setError(detail);
    } finally {
      setUploading(null);
    }
  };

  const triggerFileInput = (documentTypeId: number) => {
    fileInputRefs.current[documentTypeId]?.click();
  };

  const onFileChange = (documentTypeId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(documentTypeId, file);
    }
    // Reset input value so same file can be selected again
    e.target.value = '';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
            <CheckCircle className="h-3 w-3" /> Aprovado
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-medium">
            <XCircle className="h-3 w-3" /> Rejeitado
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-medium">
            <Clock className="h-3 w-3" /> Pendente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-xs rounded-full font-medium">
            <Upload className="h-3 w-3" /> Não enviado
          </span>
        );
    }
  };

  if (!user || user.user_type !== 'candidate') {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-slate-600">Acesso restrito a candidatos.</p>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex justify-center items-center py-12">
          <LoadTesserato />
        </div>
      </>
    );
  }

  if (profile && profile.profile_status !== 'approved') {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">Perfil não aprovado</h2>
            <p className="text-yellow-600">
              Seu perfil precisa estar aprovado para enviar documentos. Status atual:{' '}
              <span className="font-medium">
                {profile.profile_status === 'pending' ? 'Em análise' :
                 profile.profile_status === 'awaiting_review' ? 'Aguardando Revisão' :
                 profile.profile_status === 'rejected' ? 'Reprovado' :
                 profile.profile_status === 'changes_requested' ? 'Aguardando Correções' :
                 profile.profile_status}
              </span>
            </p>
            <Link href="/perfil" className="inline-block mt-4 text-blue-600 hover:underline">
              Voltar ao perfil
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/perfil" className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-blue-900">Meus Documentos</h1>
            <p className="text-slate-500 text-sm">
              Envie os documentos solicitados para continuar o processo de admissão.
            </p>
          </div>
        </div>

        {/* Summary */}
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">{summary.sent}</p>
              <p className="text-xs text-slate-500">Enviados</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-600">{summary.approved}</p>
              <p className="text-xs text-slate-500">Aprovados</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">{summary.pending}</p>
              <p className="text-xs text-slate-500">Pendentes</p>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-4 text-center">
              <p className="text-2xl font-bold text-red-600">{summary.rejected}</p>
              <p className="text-xs text-slate-500">Rejeitados</p>
            </div>
          </div>
        )}

        {/* Progress Bar */}
        {summary && summary.total_types > 0 && (
          <div className="bg-white rounded-lg border border-slate-200 p-4 mb-6">
            <div className="flex justify-between text-sm text-slate-600 mb-2">
              <span>Progresso</span>
              <span>{summary.approved} de {summary.required_types} obrigatórios aprovados</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-green-500 h-2.5 rounded-full transition-all"
                style={{ width: `${summary.required_types > 0 ? (summary.approved / summary.required_types) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Nenhum tipo de documento foi cadastrado ainda.</p>
            <p className="text-slate-400 text-sm mt-1">Aguarde o recrutador definir os documentos necessários.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((item) => {
              const docType = item.document_type;
              const doc = item.document;
              const status = item.status;

              return (
                <div
                  key={docType.id}
                  className={`bg-white rounded-lg border p-4 ${
                    status === 'rejected' ? 'border-red-200' :
                    status === 'approved' ? 'border-green-200' :
                    status === 'pending' ? 'border-yellow-200' :
                    'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-slate-800">{docType.name}</h3>
                        {docType.is_required && (
                          <span className="text-red-500 text-xs">* obrigatório</span>
                        )}
                        {getStatusBadge(status)}
                      </div>
                      {docType.description && (
                        <p className="text-sm text-slate-500 mb-2">{docType.description}</p>
                      )}
                      <div className="text-xs text-slate-400">
                        Formatos: {docType.accepted_formats} | Máx: {docType.max_file_size_mb}MB
                      </div>

                      {/* Document info */}
                      {doc && (
                        <div className="mt-2 p-2 bg-slate-50 rounded text-sm">
                          <div className="flex items-center gap-2 text-slate-600">
                            <FileText className="h-4 w-4" />
                            <span>{doc.original_filename}</span>
                            {doc.file_url && (
                              <a
                                href={doc.file_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline ml-2"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                          {doc.observations && status === 'rejected' && (
                            <div className="mt-2 p-2 bg-red-50 rounded text-red-600 text-sm">
                              <strong>Motivo da rejeição:</strong> {doc.observations}
                            </div>
                          )}
                          {doc.reviewed_by_name && (
                            <p className="text-xs text-slate-400 mt-1">
                              Revisado por {doc.reviewed_by_name}
                              {doc.reviewed_at && ` em ${new Date(doc.reviewed_at).toLocaleDateString('pt-BR')}`}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Upload Button */}
                    <div className="ml-4 flex-shrink-0">
                      {(status === 'not_sent' || status === 'rejected') && (
                        <>
                          <input
                            type="file"
                            ref={(el) => { fileInputRefs.current[docType.id] = el; }}
                            onChange={(e) => onFileChange(docType.id, e)}
                            accept={docType.accepted_formats.split(',').map(f => `.${f.trim()}`).join(',')}
                            className="hidden"
                          />
                          <button
                            onClick={() => triggerFileInput(docType.id)}
                            disabled={uploading === docType.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              status === 'rejected'
                                ? 'bg-orange-600 hover:bg-orange-700 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            } disabled:opacity-50`}
                          >
                            {uploading === docType.id ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Enviando...
                              </>
                            ) : status === 'rejected' ? (
                              <>
                                <RefreshCw className="h-4 w-4" />
                                Reenviar
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4" />
                                Enviar
                              </>
                            )}
                          </button>
                        </>
                      )}
                      {status === 'pending' && (
                        <span className="text-xs text-yellow-600 text-center block">
                          Em análise
                        </span>
                      )}
                      {status === 'approved' && (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
