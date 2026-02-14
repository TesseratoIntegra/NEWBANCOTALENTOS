'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FolderKanban,
  MessageSquare,
  Eye,
  FileEdit,
  Archive,
  Plus,
  ArrowRight,
  Mail,
  MailOpen,
  Reply,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { api, ContactStats, ProjectListItem } from '@/lib/api'
import { Card, CardContent, CardHeader, Badge, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ProjectStats {
  total: number
  published: number
  draft: number
  archived: number
  totalViews: number
}

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null)
  const [contactStats, setContactStats] = useState<ContactStats | null>(null)
  const [recentProjects, setRecentProjects] = useState<ProjectListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Load all data in parallel
        const [projects, contacts] = await Promise.all([
          api.getAdminProjects({ limit: 100 }),
          api.getContactStats(),
        ])

        // Calculate project stats
        const stats: ProjectStats = {
          total: projects.length,
          published: projects.filter((p) => p.status === 'published').length,
          draft: projects.filter((p) => p.status === 'draft').length,
          archived: projects.filter((p) => p.status === 'archived').length,
          totalViews: projects.reduce((acc, p) => acc + (p.views_count || 0), 0),
        }
        setProjectStats(stats)
        setContactStats(contacts)

        // Get recent 5 projects
        setRecentProjects(projects.slice(0, 5))
      } catch (error) {
        console.error('Erro ao carregar dados:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const statCards = [
    {
      label: 'Total de Projetos',
      value: projectStats?.total ?? 0,
      icon: FolderKanban,
      iconBg: 'bg-primary',
      href: '/admin/projetos',
    },
    {
      label: 'Publicados',
      value: projectStats?.published ?? 0,
      icon: Eye,
      iconBg: 'bg-emerald-500',
      href: '/admin/projetos?status=published',
    },
    {
      label: 'Rascunhos',
      value: projectStats?.draft ?? 0,
      icon: FileEdit,
      iconBg: 'bg-amber-500',
      href: '/admin/projetos?status=draft',
    },
    {
      label: 'Arquivados',
      value: projectStats?.archived ?? 0,
      icon: Archive,
      iconBg: 'bg-zinc-500',
      href: '/admin/projetos?status=archived',
    },
  ]

  const messageCards = [
    {
      label: 'Total Mensagens',
      value: contactStats?.total ?? 0,
      icon: MessageSquare,
      iconBg: 'bg-violet-500',
      href: '/admin/mensagens',
    },
    {
      label: 'Nao Lidas',
      value: contactStats?.unread ?? 0,
      icon: Mail,
      iconBg: 'bg-blue-500',
      href: '/admin/mensagens?status=new',
    },
    {
      label: 'Lidas',
      value: contactStats?.read ?? 0,
      icon: MailOpen,
      iconBg: 'bg-zinc-500',
      href: '/admin/mensagens?status=read',
    },
    {
      label: 'Respondidas',
      value: contactStats?.replied ?? 0,
      icon: Reply,
      iconBg: 'bg-emerald-500',
      href: '/admin/mensagens?status=replied',
    },
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="success">Publicado</Badge>
      case 'draft':
        return <Badge variant="warning">Rascunho</Badge>
      case 'archived':
        return <Badge variant="secondary">Arquivado</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Bem-vindo, {user?.full_name || 'Admin'}!
        </h1>
        <p className="text-muted-foreground">
          Gerencie seus projetos e conteudo do site.
        </p>
      </div>

      {/* Project Stats */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-4">
          Projetos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-12" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : statCards.map((stat) => (
                <Link key={stat.label} href={stat.href}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'h-12 w-12 rounded-lg flex items-center justify-center',
                            stat.iconBg
                          )}
                        >
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {stat.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </div>

      {/* Message Stats */}
      <div>
        <h2 className="text-sm font-medium text-muted-foreground mb-4">
          Mensagens
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-lg" />
                      <div className="space-y-2">
                        <Skeleton className="h-7 w-12" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            : messageCards.map((stat) => (
                <Link key={stat.label} href={stat.href}>
                  <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            'h-12 w-12 rounded-lg flex items-center justify-center',
                            stat.iconBg
                          )}
                        >
                          <stat.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-foreground">
                            {stat.value}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
        </div>
      </div>

      {/* Quick Actions and Recent Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader title="Acoes Rapidas" />
          <CardContent className="space-y-3">
            <Link
              href="/admin/projetos/novo"
              className="flex items-center justify-between p-4 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Plus className="h-5 w-5" />
                <span className="font-medium">Novo Projeto</span>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/admin/projetos"
              className="flex items-center justify-between p-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="h-5 w-5" />
                <span className="font-medium">Ver Projetos</span>
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/admin/mensagens"
              className="flex items-center justify-between p-4 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="h-5 w-5" />
                <span className="font-medium">Ver Mensagens</span>
                {contactStats && contactStats.unread > 0 && (
                  <Badge variant="info" size="sm">
                    {contactStats.unread} novas
                  </Badge>
                )}
              </div>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </CardContent>
        </Card>

        {/* Recent Projects */}
        <Card>
          <CardHeader
            title="Projetos Recentes"
            description={
              <Link
                href="/admin/projetos"
                className="text-primary hover:underline text-sm"
              >
                Ver todos
              </Link>
            }
          />
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : recentProjects.length > 0 ? (
              <ul className="space-y-2">
                {recentProjects.map((project) => (
                  <li key={project.id}>
                    <Link
                      href={`/admin/projetos/${project.id}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {project.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {project.category}
                        </p>
                      </div>
                      {getStatusBadge(project.status)}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FolderKanban className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhum projeto cadastrado ainda.</p>
                <Link
                  href="/admin/projetos/novo"
                  className="text-primary hover:underline text-sm mt-2 inline-block"
                >
                  Criar primeiro projeto
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Views Summary */}
      {!isLoading && projectStats && projectStats.totalViews > 0 && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span className="text-sm">
                Total de{' '}
                <span className="font-semibold text-foreground">
                  {projectStats.totalViews.toLocaleString('pt-BR')}
                </span>{' '}
                visualizacoes em seus projetos
              </span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
