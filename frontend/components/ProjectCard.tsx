'use client'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Star } from 'lucide-react'
import { cn, getMediaUrl } from '@/lib/utils'
import { ProjectListItem, PROJECT_CATEGORIES, ProjectCategory } from '@/lib/api'

interface ProjectCardProps {
  project: ProjectListItem
  className?: string
}

export default function ProjectCard({ project, className }: ProjectCardProps) {
  const categoryLabel =
    PROJECT_CATEGORIES[project.category as ProjectCategory] || project.category

  return (
    <Link
      href={`/projetos/${project.slug}`}
      className={cn(
        'group block bg-white dark:bg-zinc-800/50',
        'rounded-xl overflow-hidden',
        'border border-zinc-200 dark:border-zinc-700/50',
        'hover:border-zinc-300 dark:hover:border-zinc-600',
        'transition-all duration-300',
        'hover:shadow-lg hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50',
        className
      )}
    >
      {/* Cover */}
      <div className="relative aspect-[16/9] bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
        {project.cover_image ? (
          <Image
            src={getMediaUrl(project.cover_image)}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-500/10 to-blue-500/10 dark:from-indigo-500/20 dark:to-blue-500/20">
            <span className="text-4xl font-light text-indigo-300 dark:text-indigo-500">
              {project.title.charAt(0)}
            </span>
          </div>
        )}

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute top-2 left-2 flex items-center gap-0.5 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-medium rounded">
            <Star className="w-2.5 h-2.5 fill-current" />
            Destaque
          </div>
        )}

        {/* Category badge */}
        <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm text-zinc-600 dark:text-zinc-300 text-[10px] font-medium rounded">
          {categoryLabel}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-1 line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {project.title}
        </h3>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2">
          {project.short_description}
        </p>

        {/* Technologies */}
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {project.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech.id}
                className="px-1.5 py-0.5 text-[10px] bg-zinc-100 dark:bg-zinc-700/50 text-zinc-500 dark:text-zinc-400 rounded"
              >
                {tech.name}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-zinc-400">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-700/50">
          <span className="text-[10px] text-zinc-400">
            {project.views_count} views
          </span>
          <span className="flex items-center gap-0.5 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-1.5 transition-all">
            Ver projeto
            <ArrowUpRight className="w-3 h-3" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// Skeleton for loading state
export function ProjectCardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700/50">
      <div className="aspect-[16/9] bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-zinc-100 dark:bg-zinc-700 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded animate-pulse" />
        <div className="h-3 bg-zinc-100 dark:bg-zinc-700 rounded w-2/3 animate-pulse" />
        <div className="flex gap-1 pt-1">
          <div className="h-4 bg-zinc-100 dark:bg-zinc-700 rounded w-12 animate-pulse" />
          <div className="h-4 bg-zinc-100 dark:bg-zinc-700 rounded w-12 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
