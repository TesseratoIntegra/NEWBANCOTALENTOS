'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import { Lock, MessageCircle } from 'lucide-react';
import AdminNavbar from './components/AdminNavbar';
import TrialBanner from './components/TrialBanner';
import { useAuth } from '@/contexts/AuthContext';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user } = useAuth();

  // Guard: trial expirado
  if (user?.is_trial_expired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <Lock className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2 quicksand">Acesso bloqueado</h2>
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              Seu período de teste de 3 dias expirou. Para continuar usando o Banco de Talentos, entre em contato com nossa equipe.
            </p>
            <a
              href="https://wa.me/5516992416689?text=Olá! Meu trial do Banco de Talentos expirou e gostaria de continuar usando a plataforma."
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors mb-3"
            >
              <MessageCircle className="w-5 h-5" />
              Falar no WhatsApp
            </a>
            <a
              href="/"
              className="text-slate-500 hover:text-white text-sm transition-colors"
            >
              Voltar ao site
            </a>
          </div>
          <div className="text-center mt-6">
            <Image src="/img/logo.png" width={120} height={40} alt="Tesserato" className="mx-auto opacity-30" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 admin-panel">
      <TrialBanner />
      <AdminNavbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
