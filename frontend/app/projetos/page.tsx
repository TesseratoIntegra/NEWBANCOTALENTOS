'use client'

import { useEffect, useState, useCallback } from 'react'
import { Search, X, FolderOpen, RefreshCw, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebounce } from '@/hooks/useDebounce'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProjectCard, { ProjectCardSkeleton } from '@/components/ProjectCard'
import ScrollReveal from '@/components/ScrollReveal'
import { Button } from '@/components/ui'
import { api, ProjectListItem, PROJECT_CATEGORIES } from '@/lib/api'

const CATEGORIES = [
  { key: 'all', label: 'Todos' },
  ...Object.entries(PROJECT_CATEGORIES).map(([key, label]) => ({ key, label }))
]

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const debouncedSearch = useDebounce(searchTerm, 300)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getProjects({ limit: 50 })
      setProjects(data)
    } catch (err) {
      setError('Nao foi possivel carregar os projetos.')
      console.error('Erro ao carregar projetos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const filteredProjects = projects.filter((project) => {
    const matchesCategory =
      selectedCategory === 'all' || project.category === selectedCategory
    const matchesSearch =
      debouncedSearch === '' ||
      project.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      project.short_description.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      project.tags.some((tag) =>
        tag.name.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    return matchesCategory && matchesSearch
  })

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
  }

  const hasActiveFilters = searchTerm !== '' || selectedCategory !== 'all'
  const selectedCategoryLabel = CATEGORIES.find(c => c.key === selectedCategory)?.label || 'Todos'

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Navbar />

      {/* Header with Search */}
      <section className="pt-20 pb-4 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-4">
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Projetos
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  'w-full pl-9 pr-8 py-2 text-sm',
                  'bg-white dark:bg-zinc-800',
                  'border border-zinc-200 dark:border-zinc-700 rounded-lg',
                  'text-zinc-900 dark:text-white',
                  'placeholder-zinc-400',
                  'focus:outline-none focus:ring-1 focus:ring-indigo-500'
                )}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Dropdown - Desktop */}
            <div className="hidden md:block relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg',
                  'border transition-colors',
                  selectedCategory !== 'all'
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-300'
                    : 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:border-zinc-300'
                )}
              >
                {selectedCategoryLabel}
                <ChevronDown className={cn('w-4 h-4 transition-transform', showFilters && 'rotate-180')} />
              </button>

              {showFilters && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowFilters(false)} />
                  <div className="absolute right-0 mt-2 w-48 py-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-20">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => {
                          setSelectedCategory(cat.key)
                          setShowFilters(false)
                        }}
                        className={cn(
                          'w-full px-4 py-2 text-left text-sm transition-colors',
                          selectedCategory === cat.key
                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'
                        )}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Category Dropdown - Mobile */}
            <div className="md:hidden">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={cn(
                  'px-3 py-2 text-sm rounded-lg appearance-none cursor-pointer',
                  'border transition-colors',
                  'bg-white dark:bg-zinc-800',
                  'border-zinc-200 dark:border-zinc-700',
                  'text-zinc-600 dark:text-zinc-300'
                )}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.key} value={cat.key}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              >
                <X className="w-4 h-4" />
                Limpar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <ProjectCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                Erro ao carregar
              </h3>
              <p className="text-sm text-zinc-500 mb-6">{error}</p>
              <Button
                variant="secondary"
                size="sm"
                leftIcon={<RefreshCw className="w-4 h-4" />}
                onClick={loadProjects}
              >
                Tentar novamente
              </Button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                <Search className="w-6 h-6 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-2">
                Nenhum projeto encontrado
              </h3>
              <p className="text-sm text-zinc-500 mb-6">
                {hasActiveFilters
                  ? 'Tente ajustar os filtros de busca'
                  : 'Ainda nao temos projetos cadastrados'}
              </p>
              {hasActiveFilters && (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProjects.map((project, index) => (
                  <ScrollReveal
                    key={project.id}
                    animation="fadeInUp"
                    delay={Math.min(index * 50, 300)}
                  >
                    <ProjectCard project={project} />
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}
