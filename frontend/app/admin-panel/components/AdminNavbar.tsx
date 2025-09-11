'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Plus, List, Home, FileText } from 'lucide-react';


import { useState } from 'react';
import { FileEarmarkPerson } from 'react-bootstrap-icons';

const AdminNavbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navItems = [
    {
      name: 'Dashboard',
      href: '/admin-panel',
      icon: Home,
    },
    {
      name: 'Listar Vagas',
      href: '/admin-panel/jobs',
      icon: List,
    },
    {
      name: 'Nova Vaga',
      href: '/admin-panel/jobs/create',
      icon: Plus,
    },
    {
      name: 'Candidaturas',
      href: '/admin-panel/candidaturas',
      icon: FileText,
    },
    {
      name: 'Candidaturas Espontâneas',
      href: '/admin-panel/espontaneas',
      icon: FileEarmarkPerson,
    },
  ];

  return (
    <nav className="bg-zinc-800 border-b border-zinc-700">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-16">
          <div className="flex items-center space-x-4 md:space-x-8">
            <Link href="/admin-panel" className="text-xl font-bold text-indigo-400">
              Admin Panel
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-zinc-300 hover:text-white focus:outline-none"
              aria-label="Abrir menu"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
            <Link
              href="/"
              className="text-zinc-300 hover:text-white text-sm font-medium"
            >
              Voltar ao Site
            </Link>
          </div>
        </div>

        {/* Mobile nav menu */}
        {menuOpen && (
          <div className="md:hidden mt-2">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-indigo-600 text-white'
                        : 'text-zinc-300 hover:bg-zinc-700 hover:text-white'
                    }`}
                    onClick={() => setMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              <Link
                href="/"
                className="text-zinc-300 hover:text-white text-sm font-medium px-3 py-2 rounded-md"
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
