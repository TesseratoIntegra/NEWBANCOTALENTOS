'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { List, Home, ClipboardList, FolderOpen, Sun, Moon, Bell, Users, X, FileText } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect, useRef } from 'react';
import { FileEarmarkPerson } from 'react-bootstrap-icons';
import candidateService from '@/services/candidateService';
import admissionService from '@/services/admissionService';

const AdminNavbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [pendingDocsCount, setPendingDocsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  useEffect(() => setMounted(true), []);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    const now = Date.now();
    if (now - lastFetchRef.current < 30000) return; // Throttle: skip se < 30s
    lastFetchRef.current = now;

    const fetchCounts = async () => {
      try {
        const [profileResponse, docsResponse] = await Promise.all([
          candidateService.getAllCandidates({ profile_status: 'awaiting_review', page: 1 }),
          admissionService.getPendingReview(),
        ]);
        setPendingReviewCount(profileResponse.count || 0);
        setPendingDocsCount(docsResponse.length || 0);
      } catch {
        // silently fail
      }
    };
    fetchCounts();
  }, []);

  const totalNotifications = pendingReviewCount + pendingDocsCount;

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin-panel',
      icon: Home,
    },
    {
      name: 'Vagas',
      href: '/admin-panel/jobs',
      icon: List,
    },
    {
      name: 'Talentos Cadastrados',
      href: '/admin-panel/talentos',
      icon: FileEarmarkPerson,
    },
    {
      name: 'Processos Seletivos',
      href: '/admin-panel/processos-seletivos',
      icon: ClipboardList,
    },
    {
      name: 'Documentos',
      href: '/admin-panel/documentos',
      icon: FolderOpen,
    },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link href="/admin-panel" className="text-xl font-bold text-sky-600">
              Admin Panel
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none"
              aria-label="Abrir menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/admin-panel'
                  ? pathname === '/admin-panel'
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            {totalNotifications > 0 && (
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[20px] h-[20px] px-1 text-[11px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                    {totalNotifications}
                  </span>
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
                      <span className="text-sm font-semibold text-slate-900">Notificações</span>
                      <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {pendingReviewCount > 0 && (
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-sky-50 rounded-lg flex-shrink-0">
                              <Users className="h-5 w-5 text-sky-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">Perfis aguardando revisão</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {pendingReviewCount} candidato(s) alteraram o perfil e aguardam sua análise.
                              </p>
                              <Link
                                href="/admin-panel/talentos"
                                onClick={() => setShowNotifications(false)}
                                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-sky-600 hover:text-sky-700"
                              >
                                Ver talentos pendentes →
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                      {pendingDocsCount > 0 && (
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-50 rounded-lg flex-shrink-0">
                              <FileText className="h-5 w-5 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900">Documentos pendentes</p>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {pendingDocsCount} documento(s) aguardando revisão.
                              </p>
                              <Link
                                href="/admin-panel/documentos"
                                onClick={() => setShowNotifications(false)}
                                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-sky-600 hover:text-sky-700"
                              >
                                Ver documentos pendentes →
                              </Link>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
            )}
            <Link
              href="/"
              className="text-slate-500 hover:text-sky-600 text-sm font-medium"
            >
              Voltar ao Site
            </Link>
          </div>
        </div>

        {/* Mobile nav menu */}
        {menuOpen && (
          <div className="md:hidden mt-2 pb-3">
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.href === '/admin-panel'
                  ? pathname === '/admin-panel'
                  : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-sky-50 text-sky-700'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {pendingReviewCount > 0 && (
                <Link
                  href="/admin-panel/talentos?status=awaiting_review"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <Bell className="h-5 w-5" />
                  <span>{pendingReviewCount} perfil(is) aguardando revisão</span>
                </Link>
              )}
              {pendingDocsCount > 0 && (
                <Link
                  href="/admin-panel/documentos"
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-amber-600 hover:bg-amber-50 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  <FileText className="h-5 w-5" />
                  <span>{pendingDocsCount} documento(s) pendente(s)</span>
                </Link>
              )}
              {mounted && (
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                >
                  {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span>{theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}</span>
                </button>
              )}
              <Link
                href="/"
                className="text-slate-500 hover:text-sky-600 text-sm font-medium px-3 py-2 rounded-md"
                onClick={() => setMenuOpen(false)}
              >
                Voltar ao Site
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default AdminNavbar;
