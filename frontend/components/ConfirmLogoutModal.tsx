import React from 'react';

interface ConfirmLogoutModalProps {
  show: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmLogoutModal({ show, onConfirm, onCancel }: ConfirmLogoutModalProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Confirmar Logout</h2>
        <p className="mb-6">Tem certeza que deseja sair?</p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded bg-zinc-300 hover:bg-zinc-400 text-zinc-800 cursor-pointer"
            onClick={onCancel}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-600 text-white font-semibold cursor-pointer"
            onClick={onConfirm}
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
