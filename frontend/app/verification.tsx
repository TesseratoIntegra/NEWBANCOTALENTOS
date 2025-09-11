'use client';
import { useEffect } from 'react';
import AuthService from '@/services/auth';

export default function Verification() {
  useEffect(() => {
    const accessToken = AuthService.getAccessToken();

    if (!accessToken) {
      AuthService.logout();
    }
  }, []);

  return null;
}