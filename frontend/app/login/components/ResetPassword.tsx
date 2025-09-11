import React, { useState } from 'react';
import { Mail, Loader2, AlertCircle } from 'lucide-react';

interface PasswordResetModalProps {
  isOpen: boolean;
}

export default function PasswordResetModal({isOpen} : PasswordResetModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'success' | 'error' | ''>('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Por favor, insira seu email.');
      return;
    }

    setIsLoading(true);
    setStatus('');
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/accounts/password/reset/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Um link de redefinição de senha foi enviado para seu email "'+email+'". Verifique sua caixa de entrada e seu Spam.');
        setEmail('');
      } else {
        setStatus('error');
        setMessage('Erro ao enviar email. Tente novamente.');
      }
    } catch (error) {
        console.log(error)
      setStatus('error');
      setMessage('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setStatus('');
    setMessage('');
    window.location.reload();
  };

  const closeModal = () => {
    resetForm();
  };

  return (
    <>
        <div className={`fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'} duration-300`}>
          <div className="bg-zinc-100 rounded-md max-w-md transform transition-all">
            {/* Header */}
            <div className="flex items-center justify-between p-4">
              <h2 className="text-xl font-semibold text-blue-900 pt-4 text-center m-auto quicksand">
                Redefinir Senha
              </h2>
            </div>
            <div className="w-[85%] h-[1px] m-auto bg-zinc-400"></div>

            {/* Conteúdo */}
            <div className="p-6">
              <p className="text-zinc-600 mb-6 text-center">
                Digite o e-mail vinculado à sua conta para receber um link de redefinição de senha.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-zinc-700 ">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-600" size={16} />
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu@email.com"
                      className="w-full pl-10 pr-4 py-2 outline-none text-zinc-800 border-gray-300 border-b focus:ring-0 transition-colors"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Mensagem de Status */}
                {message && (
                  <div className={`flex items-center gap-2 p-3 rounded-lg ${
                    status === 'success' 
                      ? 'border bg-green-100 text-green-500' 
                      : 'border bg-red-100 text-red-500'
                  }`}>
                    {status === 'success' ? (
                      <></>
                    ) : (
                      <AlertCircle size={16} className="text-red-500" />
                    )}
                    <span className="text-sm">{message}</span>
                  </div>
                )}

                {/* Botões */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className={`flex-1 px-4 py-3 text-gray-700 ${status === 'success' ? 'bg-green-300 hover:bg-green-200 font-bold' : 'bg-gray-300 hover:bg-gray-400'} rounded-full transition-colors cursor-pointer`}
                  >
                  {status === 'success' ? 'Ok' : 'Cancelar'} 
                  </button>
                  {status !== 'success' &&
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 px-4 py-3 bg-blue-900 text-white rounded-full hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        'Enviar Link'
                      )}
                    </button>
                  } 
                </div>
              </form>
            </div>
          </div>
        </div>
    </>
  );
}