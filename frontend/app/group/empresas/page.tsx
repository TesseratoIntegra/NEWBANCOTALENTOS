'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Building2, MapPin, Loader2 } from 'lucide-react';
import companyService from '@/services/companyService';
import { Company } from '@/types';
import Navbar from '@/components/Navbar';

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros
  const [searchTerm, setSearchTerm] = useState('');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);

  // Função para carregar empresas
  const loadCompanies = React.useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params: { page: number; search?: string } = { page };
      if (searchTerm) params.search = searchTerm;

      const response = await companyService.getCompanies(params);
      setCompanies(response.results);
      setTotalCompanies(response.count);
      setTotalPages(Math.ceil(response.count / 20)); // Assumindo 20 items por página
      setCurrentPage(page);
    } catch (err) {
      setError('Erro ao carregar empresas. Tente novamente.');
      console.error('Erro:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  // Carregar dados ao montar o componente
  useEffect(() => {
    loadCompanies();
  }, [loadCompanies]);

  // Recarregar empresas quando filtros mudarem
  useEffect(() => {
    if (currentPage === 1) {
      loadCompanies(1);
    } else {
      setCurrentPage(1);
    }
  }, [searchTerm, currentPage, loadCompanies]);

  // Recarregar quando página mudar
  useEffect(() => {
    if (currentPage > 1) {
      loadCompanies(currentPage);
    }
  }, [currentPage, loadCompanies]);

  // Componente de paginação
  const Pagination = () => (
    <div className="flex justify-center items-center space-x-4 mt-8">
      <button
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-zinc-800 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition"
      >
        Anterior
      </button>
      <span className="text-zinc-300">
        Página {currentPage} de {totalPages}
      </span>
      <button
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-zinc-800 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-700 transition"
      >
        Próxima
      </button>
    </div>
  );

  // Componente de card de empresa
  const CompanyCard = ({ company }: { company: Company }) => {
    return (
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-6 hover:border-cyan-500/50 transition-all duration-300">
        <div className="flex items-start space-x-4">
          {/* Logo da empresa */}
          <div className="flex-shrink-0">
            {company.logo ? (
              <Image 
                src={company.logo} 
                alt={`Logo ${company.name}`}
                width={64}
                height={64}
                className="rounded-lg object-cover bg-zinc-700"
              />
            ) : (
              <div className="w-16 h-16 bg-zinc-700 rounded-lg flex items-center justify-center">
                <Building2 className="w-8 h-8 text-zinc-400" />
              </div>
            )}
          </div>

          {/* Informações da empresa */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1 truncate">
                  {company.name}
                </h3>
                <p className="text-sm text-zinc-400">
                  CNPJ: {company.cnpj}
                </p>
              </div>
              
              <div className="flex items-center space-x-1 text-xs">
                {company.is_active ? (
                  <span className="px-2 py-1 bg-green-600 text-white rounded-full">
                    Ativa
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-600 text-white rounded-full">
                    Inativa
                  </span>
                )}
              </div>
            </div>

            {/* Informações adicionais */}
            <div className="flex items-center space-x-4 text-sm text-zinc-400 mb-4">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>CNPJ: {company.cnpj}</span>
              </div>
            </div>

            {/* Grupo da empresa */}
            {company.group && (
              <div className="mb-4">
                <p className="text-sm text-zinc-400">
                  Grupo: <span className="text-zinc-300">{company.group.name}</span>
                </p>
              </div>
            )}

            {/* Botões de ação */}
            <div className="flex justify-between items-center">
              <Link
                href={`/empresas/${company.id}`}
                className="text-cyan-400 hover:text-cyan-700 text-sm font-medium transition"
              >
                Ver detalhes
              </Link>
              <Link
                href={`/vagas?company=${company.id}`}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md text-sm transition"
              >
                Ver vagas
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900">
      <Navbar />
      
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">
              Empresas Parceiras
            </h1>
            <p className="text-xl text-zinc-300">
              {totalCompanies} {totalCompanies === 1 ? 'empresa cadastrada' : 'empresas cadastradas'}
            </p>
          </div>

          {/* Filtros */}
          <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 rounded-lg p-6 mb-8">
            <div className="max-w-md">
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Buscar empresas
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome da empresa..."
                  className="w-full pl-10 pr-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md text-white placeholder-zinc-400 focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <span className="ml-2 text-zinc-300">Carregando empresas...</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="text-center py-12">
              <p className="text-red-400 mb-4">{error}</p>
              <button
                onClick={() => loadCompanies(currentPage)}
                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-md transition"
              >
                Tentar novamente
              </button>
            </div>
          )}

          {/* Companies Grid */}
          {!loading && !error && (
            <>
              {companies.length > 0 ? (
                <>
                  <div className="grid gap-6 mb-8">
                    {companies.map(company => (
                      <CompanyCard key={company.id} company={company} />
                    ))}
                  </div>
                  <Pagination />
                </>
              ) : (
                <div className="text-center py-12">
                  <Building2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Nenhuma empresa encontrada
                  </h3>
                  <p className="text-zinc-400">
                    {searchTerm 
                      ? 'Tente ajustar os filtros para ver mais resultados.'
                      : 'Não há empresas cadastradas no momento.'
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default CompaniesPage;
