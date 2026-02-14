'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, ExternalLink, Eye, Calendar, Loader2, Github } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { api, Project, PROJECT_CATEGORIES, ProjectCategory } from '@/lib/api'
import { getMediaUrl, isExternalVideoUrl, getYouTubeEmbedUrl } from '@/lib/utils'

export default function ProjectDetailPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    if (slug) {
      const fetchProject = async () => {
        try {
          setLoading(true)
          setError(null)
          const data = await api.getProjectBySlug(slug)
          setProject(data)
        } catch (err) {
          setError('Projeto nao encontrado.')
          console.error('Erro ao carregar projeto:', err)
        } finally {
          setLoading(false)
        }
      }
      fetchProject()
    }
  }, [slug])

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      </main>
    )
  }

  if (error || !project) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-white mb-2">
            Projeto nao encontrado
          </h1>
          <p className="text-sm text-zinc-500 mb-4">
            O projeto que voce esta procurando nao existe.
          </p>
          <Link
            href="/projetos"
            className="text-sm text-indigo-600 hover:text-indigo-700"
          >
            Voltar para projetos
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const categoryLabel = PROJECT_CATEGORIES[project.category as ProjectCategory] || project.category
  const formattedDate = new Date(project.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <Navbar />

      {/* Header */}
      <section className="pt-20 pb-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          {/* Back */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded">
              {categoryLabel}
            </span>
            {project.featured && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded">
                Destaque
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white mb-2">
            {project.title}
          </h1>

          {/* Description */}
          <p className="text-zinc-600 dark:text-zinc-400 mb-4 max-w-2xl">
            {project.short_description}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {formattedDate}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {project.views_count} views
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-8">
              {/* Video */}
              {project.video_url && (
                <div>
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                    {isExternalVideoUrl(project.video_url) ? (
                      <iframe
                        src={getYouTubeEmbedUrl(project.video_url) || project.video_url}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`Video do projeto ${project.title}`}
                      />
                    ) : (
                      <video
                        src={getMediaUrl(project.video_url)}
                        controls
                        className="w-full h-full object-contain"
                        poster={getMediaUrl(project.cover_image) || undefined}
                      >
                        Seu navegador nao suporta videos.
                      </video>
                    )}
                  </div>
                </div>
              )}

              {/* Cover Image (if no video) */}
              {!project.video_url && project.cover_image && (
                <div className="relative rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-800 aspect-video">
                  <Image
                    src={getMediaUrl(project.cover_image)}
                    alt={project.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              )}

              {/* Description */}
              {project.full_description && (
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 uppercase tracking-wide">
                    Sobre o Projeto
                  </h2>
                  <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
                    {project.full_description}
                  </div>
                </div>
              )}

              {/* Gallery */}
              {project.images.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold text-zinc-900 dark:text-white mb-3 uppercase tracking-wide">
                    Galeria
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {project.images.map((image) => (
                      <button
                        key={image.id}
                        onClick={() => setSelectedImage(getMediaUrl(image.url))}
                        className="relative aspect-video rounded-lg overflow-hidden bg-zinc-200 dark:bg-zinc-800 hover:opacity-90 transition-opacity"
                      >
                        <Image
                          src={getMediaUrl(image.url)}
                          alt={image.caption || project.title}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-4">
                {/* Links */}
                {(project.demo_url || project.repository_url) && (
                  <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-white mb-3 uppercase tracking-wide">
                      Links
                    </h3>
                    <div className="space-y-2">
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Ver Demo
                        </a>
                      )}
                      {project.repository_url && (
                        <a
                          href={project.repository_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 w-full px-3 py-2 text-sm bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-600 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                          Codigo
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Technologies */}
                {project.technologies.length > 0 && (
                  <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-white mb-3 uppercase tracking-wide">
                      Tecnologias
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech.id}
                          className="px-2 py-1 text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {project.tags.length > 0 && (
                  <div className="bg-white dark:bg-zinc-800 rounded-xl p-4 border border-zinc-200 dark:border-zinc-700">
                    <h3 className="text-xs font-semibold text-zinc-900 dark:text-white mb-3 uppercase tracking-wide">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {project.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 rounded"
                        >
                          #{tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl p-4 text-white">
                  <p className="text-sm font-medium mb-1">Gostou do projeto?</p>
                  <p className="text-xs text-white/70 mb-3">
                    Vamos criar algo para voce.
                  </p>
                  <Link
                    href="/contact"
                    className="block text-center px-3 py-2 text-sm bg-white text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                  >
                    Entrar em contato
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Image
            src={selectedImage}
            alt="Imagem ampliada"
            width={1200}
            height={800}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            unoptimized
          />
        </div>
      )}

      <Footer />
    </main>
  )
}
