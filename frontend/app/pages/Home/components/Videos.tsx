'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, FolderOpen, Play, Layers } from 'lucide-react'
import { cn, getMediaUrl, isExternalVideoUrl } from '@/lib/utils'
import { api, ProjectListItem } from '@/lib/api'
import { Card, LoadingSpinner, Button } from '@/components/ui'

interface ProjectCardProps {
  project: {
    id: number
    slug: string
    title: string
    video_url: string | null
    cover_image: string | null
  }
  index: number
}

function ProjectPreviewCard({ project, index }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const hasVideo = project.video_url && !isExternalVideoUrl(project.video_url)

  useEffect(() => {
    if (videoRef.current) {
      if (isHovered && hasVideo) {
        videoRef.current.play().catch(() => {})
      } else {
        videoRef.current.pause()
        videoRef.current.currentTime = 0
      }
    }
  }, [isHovered, hasVideo])

  const delayClasses = [
    'animate-delay-[1700ms]',
    'animate-delay-[2100ms]',
    'animate-delay-[2500ms]',
  ]
  const titleDelayClasses = [
    'animate-delay-[1900ms]',
    'animate-delay-[2300ms]',
    'animate-delay-[2700ms]',
  ]

  return (
    <Link
      href={`/projetos/${project.slug}`}
      className={cn(
        'bg-white dark:bg-neutral-800 p-3 rounded-lg',
        'border border-neutral-200 dark:border-neutral-700',
        'transition-all duration-300',
        'hover:border-indigo-300 dark:hover:border-indigo-600',
        'hover:shadow-md',
        'group'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={cn(
          'relative w-full aspect-video rounded-lg overflow-hidden animate-fade-up',
          delayClasses[index] || ''
        )}
      >
        {/* Cover Image (always rendered as base) */}
        {project.cover_image ? (
          <Image
            src={getMediaUrl(project.cover_image)}
            alt={project.title}
            fill
            className={cn(
              'object-cover transition-opacity duration-300',
              isHovered && hasVideo ? 'opacity-0' : 'opacity-100'
            )}
            unoptimized
          />
        ) : (
          <div className={cn(
            'w-full h-full bg-gradient-to-br from-indigo-600 via-indigo-500 to-blue-500 flex flex-col items-center justify-center transition-opacity duration-300 p-3',
            isHovered && hasVideo ? 'opacity-0' : 'opacity-100'
          )}>
            <Layers className="w-6 h-6 text-white/60 mb-1" />
            <span className="text-white/90 text-xs font-medium text-center line-clamp-2 leading-tight">
              {project.title}
            </span>
          </div>
        )}

        {/* Video Preview (rendered on top, plays on hover) */}
        {hasVideo && (
          <video
            ref={videoRef}
            src={getMediaUrl(project.video_url!)}
            muted
            loop
            playsInline
            preload="metadata"
            className={cn(
              'absolute inset-0 w-full h-full object-cover transition-opacity duration-300',
              isHovered ? 'opacity-100' : 'opacity-0'
            )}
          />
        )}

        {/* Play indicator */}
        {hasVideo && !isHovered && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
          </div>
        )}
      </div>

      <div className={cn('mt-2 animate-fade-up', titleDelayClasses[index] || '')}>
        <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-1">
          {project.title}
        </p>
      </div>
    </Link>
  )
}

export default function FeaturedProjects() {
  const [projects, setProjects] = useState<ProjectListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    async function loadProjects() {
      try {
        setLoading(true)
        setError(false)
        const data = await api.getFeaturedProjects(4)
        setProjects(data)
      } catch {
        console.error('Erro ao carregar projetos')
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    loadProjects()
  }, [])

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-indigo-100/80 to-blue-100/80 dark:from-indigo-900/20 dark:to-blue-900/20 border-neutral-200 dark:border-neutral-700">
        <div className="flex items-center justify-center h-48">
          <LoadingSpinner size="lg" />
        </div>
      </Card>
    )
  }

  if (error || projects.length === 0) {
    return (
      <Card className="bg-gradient-to-br from-indigo-100/80 to-blue-100/80 dark:from-indigo-900/20 dark:to-blue-900/20 border-neutral-200 dark:border-neutral-700">
        <div className="flex flex-col items-center justify-center h-48 text-center">
          <div className="w-12 h-12 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center mb-3">
            <FolderOpen className="w-6 h-6 text-neutral-400" />
          </div>
          <p className="text-neutral-600 dark:text-neutral-400 mb-4">
            {error ? 'Nao foi possivel carregar os projetos.' : 'Nenhum projeto cadastrado ainda.'}
          </p>
          <Link href="/projetos">
            <Button variant="primary" size="sm">
              Ver pagina de projetos
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  const displayItems = projects.slice(0, 3).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    video_url: p.video_url || null,
    cover_image: p.cover_image,
  }))

  return (
    <Card className="bg-gradient-to-br from-indigo-100/80 to-blue-100/80 dark:from-indigo-900/20 dark:to-blue-900/20 border-neutral-200 dark:border-neutral-700 p-4">
      <div className="grid grid-cols-2 gap-3">
        {displayItems.map((item, index) => (
          <ProjectPreviewCard key={item.id} project={item} index={index} />
        ))}

        {/* Ver todos */}
        <Link
          href="/projetos"
          className={cn(
            'bg-white dark:bg-neutral-800 p-3 rounded-lg',
            'border border-neutral-200 dark:border-neutral-700',
            'transition-all duration-300',
            'hover:border-indigo-300 dark:hover:border-indigo-600',
            'hover:shadow-md',
            'group flex flex-col'
          )}
        >
          <div className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-lg text-white text-sm font-medium animate-fade-up animate-delay-[2900ms] group-hover:from-indigo-600 group-hover:to-blue-600 transition-all aspect-video">
            Ver todos
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
          <div className="mt-2">
            <p className="text-sm font-medium text-neutral-400 dark:text-neutral-500">
              {projects.length} projetos
            </p>
          </div>
        </Link>
      </div>
    </Card>
  )
}
