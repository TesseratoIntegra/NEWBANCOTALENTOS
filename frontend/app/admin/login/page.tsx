'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Lock, Mail, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button, Input, Card, CardContent } from '@/components/ui'

export default function AdminLoginPage() {
  const router = useRouter()
  const { login, isAuthenticated, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    )
  }

  if (isAuthenticated) {
    router.push('/admin')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)
      router.push('/admin')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao site
        </Link>

        {/* Login Card */}
        <Card className="border-border/50 shadow-xl">
          <CardContent className="pt-8 pb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-7 h-7 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                Area Administrativa
              </h1>
              <p className="text-muted-foreground text-sm">
                Faca login para gerenciar o conteudo
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-destructive/10 border border-destructive/50 text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                type="email"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                leftIcon={<Mail className="w-4 h-4" />}
                disabled={isLoading}
              />

              <Input
                type="password"
                label="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                leftIcon={<Lock className="w-4 h-4" />}
                disabled={isLoading}
              />

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={isLoading}
                className="mt-6"
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-muted-foreground text-xs mt-6">
          Tesserato Integra &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
