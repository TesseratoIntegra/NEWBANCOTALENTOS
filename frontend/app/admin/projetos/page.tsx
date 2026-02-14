'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FolderOpen,
  RefreshCw,
  Star,
  Archive,
  ExternalLink,
} from 'lucide-react'
import { api, ProjectListItem, PROJECT_CATEGORIES } from '@/lib/api'
import {
  Button,
  Input,
  Select,
  Badge,
  Card,
  EmptyState,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  useToast,
} from '@/components/ui'

const statusOptions = [
  { value: 'all', label: 'Todos os status' },
  { value: 'published', label: 'Publicados' },
  { value: 'draft', label: 'Rascunhos' },
  { value: 'archived', label: 'Arquivados' },
]

const statusConfig = {
  published: { label: 'Publicado', variant: 'success' as const },
  draft: { label: 'Rascunho', variant: 'warning' as const },
  archived: { label: 'Arquivado', variant: 'secondary' as const },
}

export default function AdminProjectsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState(
    searchParams.get('status') || 'all'
  )

  // Delete modal state
  const [deleteProject, setDeleteProject] = useState<ProjectListItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      const data = await api.getAdminProjects()
      setProjects(data)
    } catch {
      toast.error('Erro ao carregar projetos')
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') {
      params.set('status', statusFilter)
    }
    const query = params.toString()
    router.replace(`/admin/projetos${query ? `?${query}` : ''}`, { scroll: false })
  }, [statusFilter, router])

  const handlePublish = async (project: ProjectListItem) => {
    try {
      await api.publishProject(project.id)
      toast.success(`"${project.title}" publicado com sucesso`)
      loadProjects()
    } catch {
      toast.error('Erro ao publicar projeto')
    }
  }

  const handleArchive = async (project: ProjectListItem) => {
    try {
      await api.archiveProject(project.id)
      toast.success(`"${project.title}" arquivado`)
      loadProjects()
    } catch {
      toast.error('Erro ao arquivar projeto')
    }
  }

  const handleDelete = async () => {
    if (!deleteProject) return

    setIsDeleting(true)
    try {
      await api.deleteProject(deleteProject.id)
      toast.success(`"${deleteProject.title}" excluido`)
      loadProjects()
      setDeleteProject(null)
    } catch {
      toast.error('Erro ao excluir projeto')
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getCategoryLabel = (category: string) => {
    return PROJECT_CATEGORIES[category as keyof typeof PROJECT_CATEGORIES] || category
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projetos</h1>
          <p className="text-muted-foreground">
            {projects.length} projetos no total
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadProjects}
          >
            Atualizar
          </Button>
          <Link href="/admin/projetos/novo">
            <Button size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Novo Projeto
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar projetos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-48">
          <Select
            options={statusOptions}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </div>

      {/* Projects Table */}
      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <ProjectsLoading />
        ) : filteredProjects.length === 0 ? (
          <EmptyState
            icon={FolderOpen}
            title="Nenhum projeto encontrado"
            description={
              searchTerm || statusFilter !== 'all'
                ? 'Nenhum projeto corresponde aos filtros'
                : 'Crie seu primeiro projeto para comecar'
            }
            action={
              !searchTerm && statusFilter === 'all'
                ? {
                    label: 'Criar primeiro projeto',
                    onClick: () => router.push('/admin/projetos/novo'),
                  }
                : undefined
            }
            className="py-12"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Projeto</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Views</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <ProjectRow
                  key={project.id}
                  project={project}
                  getCategoryLabel={getCategoryLabel}
                  onPublish={() => handlePublish(project)}
                  onArchive={() => handleArchive(project)}
                  onDelete={() => setDeleteProject(project)}
                />
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteProject}
        onOpenChange={(open) => !open && setDeleteProject(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o projeto &quot;{deleteProject?.title}&quot;?
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Project Row Component
function ProjectRow({
  project,
  getCategoryLabel,
  onPublish,
  onArchive,
  onDelete,
}: {
  project: ProjectListItem
  getCategoryLabel: (category: string) => string
  onPublish: () => void
  onArchive: () => void
  onDelete: () => void
}) {
  const config = statusConfig[project.status as keyof typeof statusConfig] || statusConfig.draft

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          {project.featured && (
            <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-medium text-foreground truncate">{project.title}</p>
            <p className="text-sm text-muted-foreground truncate">/{project.slug}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-muted-foreground">{getCategoryLabel(project.category)}</span>
      </TableCell>
      <TableCell>
        <Badge variant={config.variant} size="sm">
          {config.label}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-muted-foreground tabular-nums">
          {project.views_count.toLocaleString('pt-BR')}
        </span>
      </TableCell>
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-sm">
              <MoreHorizontal className="w-4 h-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/admin/projetos/${project.id}`}>
                <Edit className="w-4 h-4 mr-2" />
                Editar
              </Link>
            </DropdownMenuItem>
            {project.status === 'published' && (
              <DropdownMenuItem asChild>
                <Link href={`/projetos/${project.slug}`} target="_blank">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Ver no site
                </Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            {project.status === 'draft' && (
              <DropdownMenuItem onClick={onPublish}>
                <Eye className="w-4 h-4 mr-2" />
                Publicar
              </DropdownMenuItem>
            )}
            {project.status === 'published' && (
              <DropdownMenuItem onClick={onArchive}>
                <Archive className="w-4 h-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
            )}
            {project.status === 'archived' && (
              <DropdownMenuItem onClick={onPublish}>
                <Eye className="w-4 h-4 mr-2" />
                Republicar
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

// Loading State
function ProjectsLoading() {
  return (
    <div className="p-6 space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-8 w-8" />
        </div>
      ))}
    </div>
  )
}
