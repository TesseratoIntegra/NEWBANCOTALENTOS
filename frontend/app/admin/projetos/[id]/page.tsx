'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { api, Project } from '@/lib/api'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { useToast } from '@/components/ui'

export default function EditProjectPage() {
  const params = useParams()
  const toast = useToast()
  const projectId = params.id as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadProject = async () => {
      try {
        setLoading(true)
        const data = await api.getAdminProject(Number(projectId))
        setProject(data)
      } catch {
        toast.error('Erro ao carregar projeto')
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      loadProject()
    }
  }, [projectId, toast])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-muted-foreground">
        <p>Projeto nao encontrado</p>
      </div>
    )
  }

  return <ProjectForm project={project} isEditing />
}
