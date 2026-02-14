import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ===== Media URL Helpers =====

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function getMediaUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  return `${API_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export function isExternalVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false
  return (
    url.includes('youtube.com') ||
    url.includes('youtu.be') ||
    url.includes('vimeo.com')
  )
}

export function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null

  let videoId: string | null = null

  // Handle youtu.be format
  if (url.includes('youtu.be/')) {
    videoId = url.split('youtu.be/')[1]?.split(/[?&#]/)[0] || null
  }
  // Handle youtube.com/watch?v= format
  else if (url.includes('youtube.com/watch')) {
    const urlParams = new URLSearchParams(url.split('?')[1])
    videoId = urlParams.get('v')
  }
  // Handle youtube.com/embed/ format
  else if (url.includes('youtube.com/embed/')) {
    videoId = url.split('youtube.com/embed/')[1]?.split(/[?&#]/)[0] || null
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`
  }
  return null
}

// ===== Date Formatting =====

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return 'agora mesmo'
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60)
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atras`
  }

  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) {
    return `${diffInHours}h atras`
  }

  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) {
    return `${diffInDays}d atras`
  }

  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7)
    return `${weeks} semana${weeks > 1 ? 's' : ''} atras`
  }

  return formatDate(dateString)
}
