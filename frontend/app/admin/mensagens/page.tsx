'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  MessageSquare,
  Mail,
  MailOpen,
  CheckCircle,
  Archive,
  Trash2,
  Search,
  RefreshCw,
  Phone,
  Building,
  Calendar,
  ExternalLink,
} from 'lucide-react'
import { cn, formatDate, formatRelativeTime } from '@/lib/utils'
import {
  Button,
  Input,
  Badge,
  Card,
  CardContent,
  EmptyState,
  Skeleton,
  Tabs,
  TabsList,
  TabsTrigger,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Separator,
  useToast,
} from '@/components/ui'
import { api, ContactResponse, ContactStats } from '@/lib/api'

type FilterStatus = 'all' | 'new' | 'read' | 'replied' | 'archived'

const statusConfig = {
  new: { label: 'Nova', variant: 'warning' as const, icon: Mail },
  read: { label: 'Lida', variant: 'info' as const, icon: MailOpen },
  replied: { label: 'Respondida', variant: 'success' as const, icon: CheckCircle },
  archived: { label: 'Arquivada', variant: 'secondary' as const, icon: Archive },
}

export default function AdminMessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toast = useToast()

  const [messages, setMessages] = useState<ContactResponse[]>([])
  const [stats, setStats] = useState<ContactStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<FilterStatus>(
    (searchParams.get('status') as FilterStatus) || 'all'
  )

  // Modals
  const [selectedMessage, setSelectedMessage] = useState<ContactResponse | null>(null)
  const [deleteMessage, setDeleteMessage] = useState<ContactResponse | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Load messages
  const loadMessages = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await api.getContacts({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
        limit: 100,
      })
      setMessages(data)
    } catch {
      toast.error('Erro ao carregar mensagens')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter, search, toast])

  // Load stats
  const loadStats = useCallback(async () => {
    try {
      const data = await api.getContactStats()
      setStats(data)
    } catch {
      console.error('Error loading stats')
    }
  }, [])

  useEffect(() => {
    loadMessages()
    loadStats()
  }, [loadMessages, loadStats])

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter !== 'all') {
      params.set('status', statusFilter)
    }
    const query = params.toString()
    router.replace(`/admin/mensagens${query ? `?${query}` : ''}`, { scroll: false })
  }, [statusFilter, router])

  // Mark as read
  const handleMarkRead = async (message: ContactResponse) => {
    try {
      await api.markContactRead(message.id)
      loadMessages()
      loadStats()
    } catch {
      toast.error('Erro ao marcar como lida')
    }
  }

  // Update status
  const handleUpdateStatus = async (message: ContactResponse, status: string) => {
    try {
      await api.updateContactStatus(message.id, status)
      toast.success(`Mensagem marcada como ${statusConfig[status as keyof typeof statusConfig]?.label?.toLowerCase() || status}`)
      loadMessages()
      loadStats()
      setSelectedMessage(null)
    } catch {
      toast.error('Erro ao atualizar status')
    }
  }

  // Delete message
  const handleDelete = async () => {
    if (!deleteMessage) return

    setIsDeleting(true)
    try {
      await api.deleteContact(deleteMessage.id)
      toast.success('Mensagem excluida')
      loadMessages()
      loadStats()
      setDeleteMessage(null)
    } catch {
      toast.error('Erro ao excluir mensagem')
    } finally {
      setIsDeleting(false)
    }
  }

  // Open message detail
  const handleOpenMessage = async (message: ContactResponse) => {
    setSelectedMessage(message)
    if (message.status === 'new') {
      await handleMarkRead(message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>
          <p className="text-muted-foreground">
            {stats ? `${stats.unread} nao lidas de ${stats.total} mensagens` : 'Carregando...'}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-4 h-4" />}
          onClick={() => {
            loadMessages()
            loadStats()
          }}
        >
          Atualizar
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total"
          value={stats?.total || 0}
          icon={MessageSquare}
          iconBg="bg-violet-500"
        />
        <StatCard
          label="Novas"
          value={stats?.new || 0}
          icon={Mail}
          iconBg="bg-amber-500"
        />
        <StatCard
          label="Respondidas"
          value={stats?.replied || 0}
          icon={CheckCircle}
          iconBg="bg-emerald-500"
        />
        <StatCard
          label="Arquivadas"
          value={stats?.archived || 0}
          icon={Archive}
          iconBg="bg-zinc-500"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome, email ou assunto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as FilterStatus)}
        >
          <TabsList>
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="new">Novas</TabsTrigger>
            <TabsTrigger value="read">Lidas</TabsTrigger>
            <TabsTrigger value="replied">Respondidas</TabsTrigger>
            <TabsTrigger value="archived">Arquivadas</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Messages List */}
      <Card padding="none" className="overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <EmptyState
            icon={MessageSquare}
            title="Nenhuma mensagem"
            description={
              statusFilter !== 'all'
                ? 'Nenhuma mensagem encontrada com esse filtro'
                : 'As mensagens de contato aparecerao aqui'
            }
            className="py-12"
          />
        ) : (
          <div className="divide-y divide-border">
            {messages.map((message) => (
              <MessageRow
                key={message.id}
                message={message}
                onView={() => handleOpenMessage(message)}
                onDelete={() => setDeleteMessage(message)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Message Detail Sheet */}
      <Sheet open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center justify-between">
              <span>Detalhes da Mensagem</span>
              {selectedMessage && (
                <Badge
                  variant={statusConfig[selectedMessage.status as keyof typeof statusConfig]?.variant || 'default'}
                >
                  {statusConfig[selectedMessage.status as keyof typeof statusConfig]?.label || selectedMessage.status}
                </Badge>
              )}
            </SheetTitle>
          </SheetHeader>

          {selectedMessage && (
            <div className="space-y-6 px-4 pb-6 pt-2">
              {/* Contact Info */}
              <div className="flex items-start gap-4 p-4 bg-muted rounded-lg">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-lg flex-shrink-0">
                  {selectedMessage.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{selectedMessage.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedMessage.email}</p>
                  {selectedMessage.company && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Building className="w-4 h-4" />
                      {selectedMessage.company}
                    </div>
                  )}
                  {selectedMessage.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Phone className="w-4 h-4" />
                      {selectedMessage.phone}
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Subject & Message */}
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">
                  {selectedMessage.subject}
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {selectedMessage.message}
                </p>
              </div>

              {/* Date */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                Recebida em {formatDate(selectedMessage.created_at)}
                <span className="text-xs">({formatRelativeTime(selectedMessage.created_at)})</span>
              </div>

              <Separator />

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  className="w-full"
                  leftIcon={<ExternalLink className="w-4 h-4" />}
                  onClick={() =>
                    window.open(
                      `mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`,
                      '_blank'
                    )
                  }
                >
                  Responder por Email
                </Button>

                <div className="grid grid-cols-2 gap-3">
                  {selectedMessage.status !== 'replied' && (
                    <Button
                      variant="secondary"
                      leftIcon={<CheckCircle className="w-4 h-4" />}
                      onClick={() => handleUpdateStatus(selectedMessage, 'replied')}
                    >
                      Respondida
                    </Button>
                  )}
                  {selectedMessage.status !== 'archived' && (
                    <Button
                      variant="outline"
                      leftIcon={<Archive className="w-4 h-4" />}
                      onClick={() => handleUpdateStatus(selectedMessage, 'archived')}
                    >
                      Arquivar
                    </Button>
                  )}
                </div>

                <Button
                  variant="ghost"
                  className="w-full text-destructive hover:text-destructive"
                  leftIcon={<Trash2 className="w-4 h-4" />}
                  onClick={() => {
                    setSelectedMessage(null)
                    setDeleteMessage(selectedMessage)
                  }}
                >
                  Excluir Mensagem
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteMessage}
        onOpenChange={(open) => !open && setDeleteMessage(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Mensagem</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a mensagem de &quot;{deleteMessage?.name}&quot;?
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

// Stat Card Component
function StatCard({
  label,
  value,
  icon: Icon,
  iconBg,
}: {
  label: string
  value: number
  icon: React.ElementType
  iconBg: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className={cn('h-12 w-12 rounded-lg flex items-center justify-center', iconBg)}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Message Row Component
function MessageRow({
  message,
  onView,
  onDelete,
}: {
  message: ContactResponse
  onView: () => void
  onDelete: () => void
}) {
  const config = statusConfig[message.status as keyof typeof statusConfig] || statusConfig.new
  const isNew = message.status === 'new'

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer',
        isNew && 'bg-primary/5'
      )}
      onClick={onView}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center font-semibold flex-shrink-0',
          isNew ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
        )}
      >
        {message.name.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className={cn('font-medium truncate', isNew ? 'text-foreground' : 'text-muted-foreground')}>
            {message.name}
          </p>
          <Badge variant={config.variant} size="sm">
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground truncate">{message.subject}</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          {formatRelativeTime(message.created_at)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
