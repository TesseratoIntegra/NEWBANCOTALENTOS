'use client';

import { useEffect } from 'react';
import AuthService from '@/services/auth';

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Configurar interceptors do axios na inicialização da aplicação
    AuthService.setupAxiosInterceptors();
  }, []);

  return <>{children}</>;
}
