'use client';

import { useEffect, useState } from 'react';
import { Clock, MessageCircle, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function TrialBanner() {
  const { user } = useAuth();
  const [timeLeft, setTimeLeft] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'warning' | 'critical'>('normal');

  useEffect(() => {
    if (!user?.trial_expires_at || user.account_type !== 'trial') return;

    const update = () => {
      const now = new Date().getTime();
      const expires = new Date(user.trial_expires_at!).getTime();
      const diff = expires - now;

      if (diff <= 0) {
        setTimeLeft('expirado');
        setUrgency('critical');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;

      if (hours <= 2) {
        setUrgency('critical');
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        setTimeLeft(`${hours > 0 ? `${hours}h ` : ''}${minutes}min`);
      } else if (hours <= 24) {
        setUrgency('warning');
        setTimeLeft(`${hours}h`);
      } else {
        setUrgency('normal');
        setTimeLeft(`${days} dia${days > 1 ? 's' : ''}${remainingHours > 0 ? ` e ${remainingHours}h` : ''}`);
      }
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [user?.trial_expires_at, user?.account_type]);

  if (!user || user.account_type !== 'trial' || user.is_superuser) return null;

  const whatsappUrl = 'https://wa.me/5516992416689?text=Olá! Gostaria de contratar o Banco de Talentos para minha empresa.';

  if (urgency === 'critical') {
    return (
      <div className="bg-red-600 text-white px-4 py-2.5 text-center text-sm animate-pulse">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">Seu trial expira em {timeLeft}!</span>
          <span className="text-red-200">·</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold underline underline-offset-2 hover:text-red-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Entre em contato AGORA
          </a>
        </div>
      </div>
    );
  }

  if (urgency === 'warning') {
    return (
      <div className="bg-amber-500 text-white px-4 py-2 text-center text-sm">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          <Clock className="w-4 h-4" />
          <span className="font-semibold">Seu trial expira em {timeLeft}!</span>
          <span className="text-amber-200">·</span>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 font-bold underline underline-offset-2 hover:text-amber-100 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Fale conosco para continuar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sky-600 text-white px-4 py-2 text-center text-sm">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <Clock className="w-4 h-4" />
        <span>Você está no período de teste gratuito</span>
        <span className="text-sky-200">·</span>
        <span className="font-semibold">Expira em {timeLeft}</span>
        <span className="text-sky-200">·</span>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-medium underline underline-offset-2 hover:text-sky-100 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Fale conosco para contratar
        </a>
      </div>
    </div>
  );
}
