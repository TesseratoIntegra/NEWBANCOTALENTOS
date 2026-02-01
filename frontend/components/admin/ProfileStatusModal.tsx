'use client';

import React, { useState } from 'react';
import { X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ProfileStatusModalProps {
  show: boolean;
  candidateName: string;
  currentStatus?: string;
  onConfirm: (status: 'approved' | 'rejected' | 'changes_requested', observations: string) => Promise<void>;
  onClose: () => void;
}

export default function ProfileStatusModal({
  show,
  candidateName,
  currentStatus,
  onConfirm,
  onClose,
}: ProfileStatusModalProps) {
  const [status, setStatus] = useState<'approved' | 'rejected' | 'changes_requested'>('approved');
  const [observations, setObservations] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validar observações obrigatórias para reprovar/pendências
    if (status !== 'approved' && !observations.trim()) {
      setError('Observações são obrigatórias quando o perfil não é aprovado.');
      return;
    }

    setLoading(true);
    try {
      await onConfirm(status, observations);
      // Reset form
      setStatus('approved');
      setObservations('');
    } catch (err) {
      setError('Erro ao atualizar status do perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus('approved');
    setObservations('');
    setError(null);
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 w-full h-screen z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl w-full max-w-md border border-zinc-700 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">Atualizar Status do Perfil</h2>
          <button
            onClick={handleClose}
            className="p-1 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto flex-1">
            <p className="text-zinc-300">
              Candidato: <span className="font-medium text-white">{candidateName}</span>
            </p>

            {currentStatus && (
              <p className="text-zinc-400 text-sm">
                Status atual: <span className="font-medium">{currentStatus}</span>
              </p>
            )}

            {/* Status Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">
                Novo Status
              </label>
              <div className="grid grid-cols-1 gap-2">
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    status === 'approved'
                      ? 'border-green-500 bg-green-900/20'
                      : 'border-zinc-600 hover:border-zinc-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="approved"
                    checked={status === 'approved'}
                    onChange={() => setStatus('approved')}
                    className="sr-only"
                  />
                  <CheckCircle className={`h-5 w-5 flex-shrink-0 ${status === 'approved' ? 'text-green-400' : 'text-zinc-500'}`} />
                  <div>
                    <p className={`font-medium ${status === 'approved' ? 'text-green-400' : 'text-zinc-300'}`}>
                      Aprovar
                    </p>
                    <p className="text-xs text-zinc-500">Perfil aprovado no processo seletivo</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    status === 'changes_requested'
                      ? 'border-orange-500 bg-orange-900/20'
                      : 'border-zinc-600 hover:border-zinc-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="changes_requested"
                    checked={status === 'changes_requested'}
                    onChange={() => setStatus('changes_requested')}
                    className="sr-only"
                  />
                  <AlertCircle className={`h-5 w-5 flex-shrink-0 ${status === 'changes_requested' ? 'text-orange-400' : 'text-zinc-500'}`} />
                  <div>
                    <p className={`font-medium ${status === 'changes_requested' ? 'text-orange-400' : 'text-zinc-300'}`}>
                      Solicitar Alterações
                    </p>
                    <p className="text-xs text-zinc-500">Enviar observações para o candidato</p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    status === 'rejected'
                      ? 'border-red-500 bg-red-900/20'
                      : 'border-zinc-600 hover:border-zinc-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="rejected"
                    checked={status === 'rejected'}
                    onChange={() => setStatus('rejected')}
                    className="sr-only"
                  />
                  <XCircle className={`h-5 w-5 flex-shrink-0 ${status === 'rejected' ? 'text-red-400' : 'text-zinc-500'}`} />
                  <div>
                    <p className={`font-medium ${status === 'rejected' ? 'text-red-400' : 'text-zinc-300'}`}>
                      Reprovar
                    </p>
                    <p className="text-xs text-zinc-500">Perfil reprovado no processo seletivo</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-zinc-300">
                Observações {status !== 'approved' && <span className="text-red-400">*</span>}
              </label>
              <textarea
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder={
                  status === 'approved'
                    ? 'Observações opcionais...'
                    : 'Descreva o motivo ou as alterações necessárias...'
                }
                rows={3}
                className="w-full px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              />
              {status !== 'approved' && (
                <p className="text-xs text-zinc-500">
                  O candidato verá estas observações na área de perfil.
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Actions - Fixed at bottom */}
          <div className="flex justify-end gap-3 p-4 border-t border-zinc-700 flex-shrink-0 bg-zinc-800">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                status === 'approved'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : status === 'changes_requested'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              {loading ? 'Salvando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
