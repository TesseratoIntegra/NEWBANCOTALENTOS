'use client';

import dynamic from 'next/dynamic';
import React, { useState } from 'react';
import { X, Loader, Send, AlertTriangle } from 'lucide-react';
import applicationService from '@/services/applicationService';
import { toast } from 'react-hot-toast';
const SplitText = dynamic(() => import('./SliptText'), { ssr: false });

interface JobApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: number;
  jobTitle: string;
  companyName: string;
  hasApplied?: boolean;
  onApplicationSuccess?: () => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
  hasApplied = false,
  onApplicationSuccess
}) => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      await applicationService.createApplication({ job: jobId });
      toast.success('Candidatura enviada com sucesso!');
      onApplicationSuccess?.();
      setTimeout(() => onClose(), 500);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as {
          response?: { data?: unknown; status?: number };
          code?: string;
        };
        const errorData = axiosError.response?.data;
        const errorStatus = axiosError.response?.status;

        if (errorStatus === 401) {
          toast.error('Sua sessao expirou. Redirecionando para login...');
          setTimeout(() => { window.location.href = '/login'; }, 2000);
          return;
        }

        if (errorStatus && errorStatus >= 500) {
          toast.error('Erro no servidor. Tente novamente em alguns minutos.');
          return;
        }

        if (axiosError.code === 'ECONNABORTED') {
          toast.error('Tempo esgotado. Tente novamente.');
          return;
        }

        if (errorStatus === 400 && errorData && typeof errorData === 'object') {
          const errors = errorData as Record<string, unknown>;
          Object.keys(errors).forEach(field => {
            const fieldErrors = errors[field];
            const msg = Array.isArray(fieldErrors) ? fieldErrors[0] : fieldErrors;
            toast.error(`${msg}`, { duration: 5000 });
          });
          return;
        }
      }

      toast.error('Nao foi possivel enviar sua candidatura. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-lg max-w-lg w-full border border-gray-200 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-t-lg">
          <div>
            <SplitText
              text="Confirmar Candidatura"
              className="text-2xl text-white quicksand"
              delay={30}
              duration={1}
            />
            <p className="text-blue-100 mt-1 text-sm">{jobTitle} - {companyName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-blue-100 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Aviso sobre perfil incompleto */}
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-amber-800 font-medium">
                Perfis incompletos reduzem suas chances de seleção.
              </p>
              <p className="text-sm text-amber-700 mt-1">
                Certifique-se de que seu perfil está atualizado com suas experiências, formações e habilidades antes de se candidatar.
              </p>
            </div>
          </div>

          <p className="text-gray-600 text-sm">
            Ao confirmar, seus dados de perfil serão enviados junto com sua candidatura para a vaga <strong>{jobTitle}</strong> na empresa <strong>{companyName}</strong>.
          </p>
        </div>

        {/* Botões */}
        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 p-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 text-gray-600 hover:text-gray-800 transition-colors cursor-pointer font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-3 sm:py-2 bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-md hover:from-blue-800 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg cursor-pointer font-medium touch-manipulation"
          >
            {submitting ? (
              <>
                <Loader className="w-5 h-5 sm:w-4 sm:h-4 mr-2 animate-spin" />
                <span>Enviando...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5 sm:w-4 sm:h-4 mr-2" />
                <span>Candidatar-se</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationModal;
