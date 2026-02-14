/**
 * Cliente de API para o backend Tesserato
 * Com suporte a timeout, retry e tratamento de erros
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const DEFAULT_TIMEOUT = 10000 // 10 seconds
const DEFAULT_RETRIES = 2

// ===== Types =====

export interface ProjectTag {
  id: number
  name: string
}

export interface ProjectTechnology {
  id: number
  name: string
  icon: string | null
}

export interface ProjectImage {
  id: number
  url: string
  caption: string | null
  order: number
}

export interface Project {
  id: number
  title: string
  slug: string
  short_description: string
  full_description: string | null
  category: string
  status: string
  demo_url: string | null
  video_url: string | null
  repository_url: string | null
  cover_image: string | null
  featured: boolean
  views_count: number
  created_at: string
  updated_at: string
  published_at: string | null
  tags: ProjectTag[]
  technologies: ProjectTechnology[]
  images: ProjectImage[]
}

export interface ProjectListItem {
  id: number
  title: string
  slug: string
  short_description: string
  category: string
  status: string
  cover_image: string | null
  demo_url: string | null
  video_url: string | null
  featured: boolean
  views_count: number
  created_at: string
  tags: ProjectTag[]
  technologies: ProjectTechnology[]
}

// Type for creating/updating projects (simplified tags/technologies)
export interface ProjectPayload {
  title?: string
  short_description?: string
  full_description?: string
  category?: string
  status?: string
  demo_url?: string
  video_url?: string
  repository_url?: string
  cover_image?: string
  featured?: boolean
  tags?: { name: string }[]
  technologies?: { name: string }[]
}

export interface ContactMessage {
  name: string
  email: string
  company?: string
  phone?: string
  subject: string
  message: string
}

export interface ContactResponse {
  id: number
  name: string
  email: string
  company: string | null
  phone: string | null
  subject: string
  message: string
  status: string
  is_read: boolean
  created_at: string
  replied_at: string | null
}

export interface ContactStats {
  total: number
  unread: number
  new: number
  read: number
  replied: number
  archived: number
}

export interface User {
  id: number
  email: string
  full_name: string
  is_active: boolean
  is_superuser: boolean
  created_at?: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

// ===== Error Classes =====

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }

  static isApiError(error: unknown): error is ApiError {
    return error instanceof ApiError
  }

  static isNetworkError(error: unknown): boolean {
    return ApiError.isApiError(error) && error.code === 'NETWORK_ERROR'
  }

  static isTimeout(error: unknown): boolean {
    return ApiError.isApiError(error) && error.code === 'TIMEOUT'
  }

  static isUnauthorized(error: unknown): boolean {
    return ApiError.isApiError(error) && error.status === 401
  }

  static isNotFound(error: unknown): boolean {
    return ApiError.isApiError(error) && error.status === 404
  }
}

// ===== Request Options =====

interface RequestOptions extends Omit<RequestInit, 'body'> {
  timeout?: number
  retries?: number
  body?: unknown
}

// ===== API Client =====

class ApiClient {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  setAuthToken(token: string | null) {
    this.authToken = token
  }

  getAuthToken(): string | null {
    return this.authToken
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = DEFAULT_TIMEOUT,
      retries = DEFAULT_RETRIES,
      body,
      ...fetchOptions
    } = options

    const url = `${this.baseUrl}${endpoint}`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(fetchOptions.headers as Record<string, string>),
    }

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`
    }

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new ApiError(
          error.detail || `Erro HTTP ${response.status}`,
          response.status,
          error.code
        )
      }

      // Handle empty responses (204 No Content)
      const text = await response.text()
      if (!text) return null as T

      return JSON.parse(text)
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) throw error

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError('Tempo limite excedido', 408, 'TIMEOUT')
      }

      // Retry on network errors
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        return this.request(endpoint, { ...options, retries: retries - 1 })
      }

      throw new ApiError(
        'Erro de conexao. Verifique sua internet.',
        0,
        'NETWORK_ERROR'
      )
    }
  }

  // ===== Auth =====

  async login(email: string, password: string): Promise<AuthResponse> {
    const formData = new URLSearchParams()
    formData.append('username', email)
    formData.append('password', password)

    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Email ou senha incorretos',
        response.status
      )
    }

    return response.json()
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/v1/auth/me')
  }

  async updateUser(id: number, data: {
    full_name?: string
    email?: string
    password?: string
    is_active?: boolean
    is_superuser?: boolean
  }): Promise<User> {
    return this.request<User>(`/api/v1/users/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    return this.request('/api/v1/auth/change-password', {
      method: 'POST',
      body: {
        current_password: currentPassword,
        new_password: newPassword,
      },
    })
  }

  // ===== Users (Admin) =====

  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/api/v1/users/')
  }

  async getUser(id: number): Promise<User> {
    return this.request<User>(`/api/v1/users/${id}`)
  }

  async createUser(data: {
    email: string
    full_name: string
    password: string
    is_active?: boolean
    is_superuser?: boolean
  }): Promise<User> {
    return this.request<User>('/api/v1/users/', {
      method: 'POST',
      body: data,
    })
  }

  async deleteUser(id: number): Promise<void> {
    return this.request(`/api/v1/users/${id}`, {
      method: 'DELETE',
    })
  }

  // ===== Projects (Public) =====

  async getProjects(params?: {
    skip?: number
    limit?: number
    category?: string
    search?: string
  }): Promise<ProjectListItem[]> {
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.set('skip', params.skip.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.category) searchParams.set('category', params.category)
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    return this.request<ProjectListItem[]>(
      `/api/v1/projects/${query ? `?${query}` : ''}`
    )
  }

  async getFeaturedProjects(limit = 6): Promise<ProjectListItem[]> {
    return this.request<ProjectListItem[]>(
      `/api/v1/projects/featured/?limit=${limit}`
    )
  }

  async getProjectBySlug(slug: string): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/slug/${slug}/`)
  }

  // ===== Projects (Admin) =====

  async getAdminProjects(params?: {
    skip?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<ProjectListItem[]> {
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.set('skip', params.skip.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    return this.request<ProjectListItem[]>(
      `/api/v1/projects/admin/all${query ? `?${query}` : ''}`
    )
  }

  async getAdminProject(id: number): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/admin/${id}`)
  }

  async createProject(data: ProjectPayload): Promise<Project> {
    return this.request<Project>('/api/v1/projects/', {
      method: 'POST',
      body: data,
    })
  }

  async updateProject(id: number, data: ProjectPayload): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/${id}`, {
      method: 'PATCH',
      body: data,
    })
  }

  async deleteProject(id: number): Promise<void> {
    return this.request(`/api/v1/projects/${id}`, {
      method: 'DELETE',
    })
  }

  async publishProject(id: number): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/${id}/publish`, {
      method: 'POST',
    })
  }

  async archiveProject(id: number): Promise<Project> {
    return this.request<Project>(`/api/v1/projects/${id}/archive`, {
      method: 'POST',
    })
  }

  // ===== Contacts (Public) =====

  async sendContactMessage(data: ContactMessage): Promise<ContactResponse> {
    return this.request<ContactResponse>('/api/v1/contacts/', {
      method: 'POST',
      body: data,
    })
  }

  // ===== Contacts (Admin) =====

  async getContacts(params?: {
    skip?: number
    limit?: number
    status?: string
    search?: string
  }): Promise<ContactResponse[]> {
    const searchParams = new URLSearchParams()
    if (params?.skip) searchParams.set('skip', params.skip.toString())
    if (params?.limit) searchParams.set('limit', params.limit.toString())
    if (params?.status) searchParams.set('status', params.status)
    if (params?.search) searchParams.set('search', params.search)

    const query = searchParams.toString()
    return this.request<ContactResponse[]>(
      `/api/v1/contacts/${query ? `?${query}` : ''}`
    )
  }

  async getContact(id: number): Promise<ContactResponse> {
    return this.request<ContactResponse>(`/api/v1/contacts/${id}`)
  }

  async markContactRead(id: number): Promise<ContactResponse> {
    return this.request<ContactResponse>(`/api/v1/contacts/${id}/mark-read`, {
      method: 'POST',
    })
  }

  async updateContactStatus(id: number, status: string): Promise<ContactResponse> {
    return this.request<ContactResponse>(`/api/v1/contacts/${id}`, {
      method: 'PATCH',
      body: { status },
    })
  }

  async deleteContact(id: number): Promise<void> {
    return this.request(`/api/v1/contacts/${id}`, {
      method: 'DELETE',
    })
  }

  async getContactStats(): Promise<ContactStats> {
    return this.request<ContactStats>('/api/v1/contacts/stats')
  }

  async getUnreadCount(): Promise<{ count: number }> {
    return this.request<{ count: number }>('/api/v1/contacts/unread-count')
  }

  // ===== Uploads =====

  async uploadImage(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/api/v1/uploads/image`, {
      method: 'POST',
      headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Erro ao fazer upload',
        response.status
      )
    }

    return response.json()
  }

  async uploadVideo(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${this.baseUrl}/api/v1/uploads/video`, {
      method: 'POST',
      headers: this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {},
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new ApiError(
        error.detail || 'Erro ao fazer upload do video',
        response.status
      )
    }

    return response.json()
  }
}

// ===== Export Singleton =====

export const api = new ApiClient(API_URL)

// ===== Constants =====

export const PROJECT_CATEGORIES = {
  dashboard: 'Dashboards',
  app_campo: 'Apps de Campo',
  interface: 'Interfaces',
  relatorio: 'Relatorios',
  integracao: 'Integracoes',
  consultoria: 'Consultoria',
  outro: 'Outros',
} as const

export const PROJECT_STATUS = {
  draft: 'Rascunho',
  published: 'Publicado',
  archived: 'Arquivado',
} as const

export const CONTACT_STATUS = {
  new: 'Nova',
  read: 'Lida',
  replied: 'Respondida',
  archived: 'Arquivada',
} as const

export type ProjectCategory = keyof typeof PROJECT_CATEGORIES
export type ProjectStatus = keyof typeof PROJECT_STATUS
export type ContactStatus = keyof typeof CONTACT_STATUS
