'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  ShieldCheck,
  Mail,
  RefreshCw,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api, User as UserType } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import {
  Button,
  Input,
  Card,
  Badge,
  Skeleton,
  EmptyState,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Label,
  Switch,
  useToast,
} from '@/components/ui'

export default function UsersPage() {
  const { user: currentUser } = useAuth()
  const { error, success } = useToast()

  const [users, setUsers] = useState<UserType[]>([])
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    is_active: true,
    is_superuser: false,
  })

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.getUsers()
      setUsers(data)
    } catch {
      error('Erro ao carregar usuarios')
    } finally {
      setLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const resetForm = () => {
    setFormData({
      email: '',
      full_name: '',
      password: '',
      is_active: true,
      is_superuser: false,
    })
  }

  const openCreateDialog = () => {
    resetForm()
    setShowCreateDialog(true)
  }

  const openEditDialog = (user: UserType) => {
    setFormData({
      email: user.email,
      full_name: user.full_name,
      password: '',
      is_active: user.is_active,
      is_superuser: user.is_superuser,
    })
    setEditingUser(user)
  }

  const handleCreateUser = async () => {
    if (!formData.email || !formData.full_name || !formData.password) {
      error('Preencha todos os campos obrigatorios')
      return
    }

    if (formData.password.length < 8) {
      error('A senha deve ter no minimo 8 caracteres')
      return
    }

    setIsSubmitting(true)
    try {
      await api.createUser({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        is_active: formData.is_active,
        is_superuser: formData.is_superuser,
      })
      success('Usuario criado com sucesso')
      setShowCreateDialog(false)
      resetForm()
      loadUsers()
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erro ao criar usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateUser = async () => {
    if (!editingUser) return

    if (!formData.email || !formData.full_name) {
      error('Preencha todos os campos obrigatorios')
      return
    }

    setIsSubmitting(true)
    try {
      const updateData: {
        email?: string
        full_name?: string
        password?: string
        is_active?: boolean
        is_superuser?: boolean
      } = {
        email: formData.email,
        full_name: formData.full_name,
        is_active: formData.is_active,
        is_superuser: formData.is_superuser,
      }

      if (formData.password) {
        if (formData.password.length < 8) {
          error('A senha deve ter no minimo 8 caracteres')
          setIsSubmitting(false)
          return
        }
        updateData.password = formData.password
      }

      await api.updateUser(editingUser.id, updateData)
      success('Usuario atualizado com sucesso')
      setEditingUser(null)
      resetForm()
      loadUsers()
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erro ao atualizar usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!deletingUser) return

    setIsSubmitting(true)
    try {
      await api.deleteUser(deletingUser.id)
      success('Usuario excluido')
      setDeletingUser(null)
      loadUsers()
    } catch (err) {
      error(err instanceof Error ? err.message : 'Erro ao excluir usuario')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (user: UserType) => {
    try {
      await api.updateUser(user.id, { is_active: !user.is_active })
      success(user.is_active ? 'Usuario desativado' : 'Usuario ativado')
      loadUsers()
    } catch {
      error('Erro ao atualizar usuario')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">
            Gerencie os usuarios administradores do sistema
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={loadUsers}
          >
            Atualizar
          </Button>
          <Button
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={openCreateDialog}
          >
            Novo Usuario
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <Card padding="none" className="overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-5 w-16" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum usuario"
            description="Crie o primeiro usuario administrador"
            action={{
              label: 'Criar usuario',
              onClick: openCreateDialog,
            }}
            className="py-12"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Permissao</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'h-10 w-10 rounded-full flex items-center justify-center font-semibold',
                          user.is_active
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {user.full_name}
                          {user.id === currentUser?.id && (
                            <Badge variant="info" size="sm" className="ml-2">
                              Voce
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'success' : 'secondary'}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.is_superuser ? (
                        <>
                          <ShieldCheck className="w-4 h-4 text-amber-500" />
                          <span className="text-sm text-muted-foreground">Admin</span>
                        </>
                      ) : (
                        <>
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Usuario</span>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleActive(user)}>
                          <User className="w-4 h-4 mr-2" />
                          {user.is_active ? 'Desativar' : 'Ativar'}
                        </DropdownMenuItem>
                        {user.id !== currentUser?.id && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeletingUser(user)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Create User Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuario</DialogTitle>
            <DialogDescription>
              Crie um novo usuario administrador do sistema
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="Nome Completo"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Nome do usuario"
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Senha"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Minimo 8 caracteres"
              hint="A senha deve ter no minimo 8 caracteres"
              required
            />
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Usuario Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    O usuario podera fazer login no sistema
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Administrador</Label>
                  <p className="text-sm text-muted-foreground">
                    Acesso total ao sistema
                  </p>
                </div>
                <Switch
                  checked={formData.is_superuser}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_superuser: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} isLoading={isSubmitting}>
              Criar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Atualize as informacoes do usuario
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              label="Nome Completo"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Nome do usuario"
              required
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
              leftIcon={<Mail className="w-4 h-4" />}
              required
            />
            <Input
              label="Nova Senha (opcional)"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Deixe em branco para manter a senha atual"
              hint="Minimo 8 caracteres se preenchido"
            />
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Usuario Ativo</Label>
                  <p className="text-sm text-muted-foreground">
                    O usuario podera fazer login no sistema
                  </p>
                </div>
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Administrador</Label>
                  <p className="text-sm text-muted-foreground">
                    Acesso total ao sistema
                  </p>
                </div>
                <Switch
                  checked={formData.is_superuser}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_superuser: checked })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingUser(null)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} isLoading={isSubmitting}>
              Salvar Alteracoes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <AlertDialog
        open={!!deletingUser}
        onOpenChange={(open) => !open && setDeletingUser(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Usuario</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuario &quot;{deletingUser?.full_name}&quot;?
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isSubmitting ? 'Excluindo...' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
