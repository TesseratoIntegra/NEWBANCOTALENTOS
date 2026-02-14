'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import {
  User,
  Shield,
  Save,
  Lock,
} from 'lucide-react'
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardContent,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Separator,
  useToast,
} from '@/components/ui'
import { api } from '@/lib/api'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuracoes</h1>
        <p className="text-muted-foreground">Gerencie suas preferencias e configuracoes do sistema</p>
      </div>

      {/* Content */}
      <Tabs defaultValue="profile">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Perfil
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Seguranca
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileSettings />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Profile Settings
function ProfileSettings() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '')
      setEmail(user.email || '')
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (!fullName.trim()) {
      toast.error('Nome e obrigatorio')
      return
    }

    if (!email.trim()) {
      toast.error('Email e obrigatorio')
      return
    }

    setIsLoading(true)

    try {
      await api.updateUser(user.id, {
        full_name: fullName.trim(),
        email: email.trim(),
      })
      await refreshUser()
      toast.success('Perfil atualizado com sucesso')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao atualizar perfil')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title="Informacoes do Perfil"
        description="Atualize suas informacoes pessoais"
      />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Nome Completo"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Seu nome completo"
            required
          />

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />

          <Separator />

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              <p>ID do usuario: {user?.id}</p>
              <p>Status: {user?.is_active ? 'Ativo' : 'Inativo'}</p>
            </div>
            <Button type="submit" isLoading={isLoading} leftIcon={<Save className="w-4 h-4" />}>
              Salvar Alteracoes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

// Security Settings
function SecuritySettings() {
  const { user } = useAuth()
  const toast = useToast()

  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) return

    if (!currentPassword) {
      toast.error('Senha atual e obrigatoria')
      return
    }

    if (!newPassword) {
      toast.error('Nova senha e obrigatoria')
      return
    }

    if (newPassword.length < 8) {
      toast.error('Nova senha deve ter no minimo 8 caracteres')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('As senhas nao conferem')
      return
    }

    setIsLoading(true)

    try {
      // Try to update password via user endpoint
      await api.updateUser(user.id, {
        password: newPassword,
      })
      toast.success('Senha alterada com sucesso')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao alterar senha')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader
        title="Alterar Senha"
        description="Atualize sua senha de acesso"
      />
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Senha Atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Digite sua senha atual"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Separator />

          <Input
            label="Nova Senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Digite a nova senha"
            hint="Minimo 8 caracteres"
            leftIcon={<Lock className="w-4 h-4" />}
            required
          />

          <Input
            label="Confirmar Nova Senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            leftIcon={<Lock className="w-4 h-4" />}
            error={confirmPassword && newPassword !== confirmPassword ? 'As senhas nao conferem' : undefined}
            required
          />

          <Separator />

          <div className="flex justify-end">
            <Button type="submit" isLoading={isLoading} leftIcon={<Shield className="w-4 h-4" />}>
              Alterar Senha
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
