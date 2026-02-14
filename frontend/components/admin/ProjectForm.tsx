'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Plus,
  X,
  Trash2,
  Eye,
  Link as LinkIcon,
  Image as ImageIcon,
  Settings2,
} from 'lucide-react'
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardContent,
  CardHeader,
  Badge,
  Switch,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ImageUpload,
  VideoUpload,
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
import { api, PROJECT_CATEGORIES, Project } from '@/lib/api'

const CATEGORY_OPTIONS = Object.entries(PROJECT_CATEGORIES).map(([value, label]) => ({
  value,
  label,
}))

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Rascunho' },
  { value: 'published', label: 'Publicado' },
  { value: 'archived', label: 'Arquivado' },
]

interface ProjectFormProps {
  project?: Project
  isEditing?: boolean
}

export function ProjectForm({ project, isEditing = false }: ProjectFormProps) {
  const router = useRouter()
  const toast = useToast()

  const [saving, setSaving] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const [formData, setFormData] = useState({
    title: project?.title || '',
    short_description: project?.short_description || '',
    full_description: project?.full_description || '',
    category: project?.category || 'outro',
    status: project?.status || 'draft',
    demo_url: project?.demo_url || '',
    video_url: project?.video_url || '',
    repository_url: project?.repository_url || '',
    cover_image: project?.cover_image || '',
    featured: project?.featured || false,
  })

  const [tags, setTags] = useState<string[]>(
    project?.tags?.map((t) => t.name) || []
  )
  const [newTag, setNewTag] = useState('')

  const [technologies, setTechnologies] = useState<string[]>(
    project?.technologies?.map((t) => t.name) || []
  )
  const [newTech, setNewTech] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag('')
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const addTech = () => {
    if (newTech.trim() && !technologies.includes(newTech.trim())) {
      setTechnologies([...technologies, newTech.trim()])
      setNewTech('')
    }
  }

  const removeTech = (tech: string) => {
    setTechnologies(technologies.filter((t) => t !== tech))
  }

  const handleSubmit = async (e: React.FormEvent, publish: boolean = false) => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {
        ...formData,
        tags: tags.map((name) => ({ name })),
        technologies: technologies.map((name) => ({ name })),
      }

      if (isEditing && project) {
        await api.updateProject(project.id, payload)
        toast.success('Projeto atualizado com sucesso')
      } else {
        const newProject = await api.createProject(payload)
        if (publish) {
          await api.publishProject(newProject.id)
          toast.success('Projeto criado e publicado')
        } else {
          toast.success('Projeto criado como rascunho')
        }
      }

      router.push('/admin/projetos')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao salvar projeto')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!project) return

    setSaving(true)
    try {
      await api.deleteProject(project.id)
      toast.success('Projeto excluido')
      router.push('/admin/projetos')
    } catch {
      toast.error('Erro ao excluir projeto')
    } finally {
      setSaving(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/projetos"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Link>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? 'Editar Projeto' : 'Novo Projeto'}
          </h1>
          {isEditing && project && (
            <p className="text-sm text-muted-foreground">
              /{project.slug}
            </p>
          )}
        </div>
        {isEditing && (
          <Button
            variant="destructive"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setShowDeleteDialog(true)}
          >
            Excluir
          </Button>
        )}
      </div>

      {/* Form */}
      <form onSubmit={(e) => handleSubmit(e, false)}>
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info" className="gap-2">
              <Settings2 className="w-4 h-4" />
              <span className="hidden sm:inline">Informacoes</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Midia</span>
            </TabsTrigger>
            <TabsTrigger value="links" className="gap-2">
              <LinkIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Links</span>
            </TabsTrigger>
            <TabsTrigger value="meta" className="gap-2">
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Metadata</span>
            </TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="space-y-6">
            <Card>
              <CardHeader title="Informacoes Basicas" />
              <CardContent className="space-y-4">
                <Input
                  label="Titulo"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="Nome do projeto"
                />

                <Textarea
                  label="Descricao Curta"
                  name="short_description"
                  value={formData.short_description}
                  onChange={handleChange}
                  required
                  placeholder="Uma breve descricao do projeto"
                  hint="Sera exibida nos cards de listagem"
                  showCount
                  maxLength={200}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Categoria"
                    options={CATEGORY_OPTIONS}
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, category: e.target.value }))
                    }
                  />

                  {isEditing && (
                    <Select
                      label="Status"
                      options={STATUS_OPTIONS}
                      value={formData.status}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, status: e.target.value }))
                      }
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Descricao Completa" />
              <CardContent>
                <Textarea
                  name="full_description"
                  value={formData.full_description}
                  onChange={handleChange}
                  placeholder="Descreva o projeto em detalhes..."
                  hint="Suporta markdown para formatacao"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card>
              <CardHeader
                title="Imagem de Capa"
                description="Imagem principal do projeto exibida na listagem"
              />
              <CardContent>
                <ImageUpload
                  value={formData.cover_image}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, cover_image: url }))
                  }
                  disabled={saving}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader
                title="Video"
                description="Video de demonstracao do projeto (upload ou YouTube/Vimeo)"
              />
              <CardContent>
                <VideoUpload
                  value={formData.video_url}
                  onChange={(url) =>
                    setFormData((prev) => ({ ...prev, video_url: url }))
                  }
                  disabled={saving}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Links Tab */}
          <TabsContent value="links">
            <Card>
              <CardHeader title="Links do Projeto" />
              <CardContent className="space-y-4">
                <Input
                  type="url"
                  label="URL de Demonstracao"
                  name="demo_url"
                  value={formData.demo_url}
                  onChange={handleChange}
                  placeholder="https://demo.exemplo.com"
                  hint="Link para demonstracao ao vivo do projeto"
                />

                <Input
                  type="url"
                  label="Repositorio"
                  name="repository_url"
                  value={formData.repository_url}
                  onChange={handleChange}
                  placeholder="https://github.com/..."
                  hint="Link para o repositorio do codigo fonte"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Metadata Tab */}
          <TabsContent value="meta" className="space-y-6">
            <Card>
              <CardHeader title="Destaque" />
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Projeto em destaque</Label>
                    <p className="text-sm text-muted-foreground">
                      Projetos em destaque aparecem na pagina inicial
                    </p>
                  </div>
                  <Switch
                    checked={formData.featured}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, featured: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card>
              <CardHeader
                title="Tags"
                description="Palavras-chave para categorizar o projeto"
              />
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder="Nova tag"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={addTag}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {tags.length === 0 && (
                    <p className="text-sm text-muted-foreground">Nenhuma tag</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card>
              <CardHeader
                title="Tecnologias"
                description="Tecnologias utilizadas no projeto"
              />
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTech()
                      }
                    }}
                    placeholder="Nova tecnologia"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="icon"
                    onClick={addTech}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <Badge key={tech} variant="info" className="gap-1 pr-1">
                      {tech}
                      <button
                        type="button"
                        onClick={() => removeTech(tech)}
                        className="ml-1 hover:bg-blue-500/20 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  {technologies.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      Nenhuma tecnologia
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end pt-6 border-t">
          <Link href="/admin/projetos">
            <Button variant="outline" type="button">
              Cancelar
            </Button>
          </Link>
          {!isEditing && (
            <Button
              type="submit"
              variant="secondary"
              isLoading={saving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Salvar Rascunho
            </Button>
          )}
          <Button
            type={isEditing ? 'submit' : 'button'}
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
            onClick={isEditing ? undefined : (e) => handleSubmit(e, true)}
          >
            {isEditing ? 'Salvar Alteracoes' : 'Salvar e Publicar'}
          </Button>
        </div>
      </form>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o projeto &quot;{formData.title}&quot;?
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={saving}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {saving ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
