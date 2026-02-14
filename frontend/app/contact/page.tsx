'use client'

import { useState } from 'react'
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  User,
  Building2,
  Send,
  CheckCircle,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useForm, validationPatterns } from '@/hooks/useForm'
import { api, ApiError } from '@/lib/api'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ScrollReveal from '@/components/ScrollReveal'
import { Button, Input, Select, Textarea, Card } from '@/components/ui'

// Form values type
interface ContactFormValues {
  name: string
  email: string
  company: string
  phone: string
  subject: string
  message: string
}

// Subject options
const subjectOptions = [
  { value: 'dashboards', label: 'Dashboards e Paineis' },
  { value: 'apps-campo', label: 'Apps de Campo' },
  { value: 'interfaces', label: 'Interfaces Personalizadas' },
  { value: 'relatorios', label: 'Relatorios e Insights' },
  { value: 'integracao', label: 'Integracao com ERP' },
  { value: 'consultoria', label: 'Consultoria' },
  { value: 'outro', label: 'Outro' },
]

// Contact info data
const contactInfo = [
  {
    icon: Mail,
    title: 'Email',
    value: 'tesseratointegra@gmail.com',
    href: 'mailto:tesseratointegra@gmail.com',
    color: 'indigo' as const,
  },
  {
    icon: Phone,
    title: 'Telefone',
    value: '(16) 99241-6689',
    href: 'tel:+5516992416689',
    color: 'blue' as const,
  },
  {
    icon: MapPin,
    title: 'Localizacao',
    value: 'Rua Jose Garcia Duarte, 182 (AP 104)\nSanta Rosa de Viterbo - SP',
    href: null,
    color: 'indigo' as const,
  },
  {
    icon: Clock,
    title: 'Horario',
    value: 'Segunda a Sexta: 8h as 18h',
    href: null,
    color: 'blue' as const,
  },
]

// Stats data
const stats = [
  { icon: Clock, title: '24 Horas', description: 'Tempo de resposta', color: 'indigo' as const },
  { icon: MessageSquare, title: 'Consultoria', description: 'Inicial gratuita', color: 'blue' as const },
  { icon: Users, title: 'Especialistas', description: 'Equipe dedicada', color: 'indigo' as const },
]

export default function ContactPage() {
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const {
    values,
    handleChange,
    handleBlur,
    errors,
    touched,
    validate,
    reset,
    isSubmitting,
    setIsSubmitting,
  } = useForm<ContactFormValues>(
    {
      name: '',
      email: '',
      company: '',
      phone: '',
      subject: '',
      message: '',
    },
    {
      name: {
        required: 'Nome e obrigatorio',
        minLength: { value: 2, message: 'Nome deve ter pelo menos 2 caracteres' },
      },
      email: {
        required: 'Email e obrigatorio',
        pattern: { value: validationPatterns.email, message: 'Email invalido' },
      },
      subject: {
        required: 'Selecione um assunto',
      },
      message: {
        required: 'Mensagem e obrigatoria',
        minLength: { value: 10, message: 'Mensagem deve ter pelo menos 10 caracteres' },
      },
    }
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitStatus('idle')
    setErrorMessage('')

    if (!validate()) {
      return
    }

    setIsSubmitting(true)

    try {
      await api.sendContactMessage({
        name: values.name,
        email: values.email,
        company: values.company || undefined,
        phone: values.phone || undefined,
        subject: subjectOptions.find((o) => o.value === values.subject)?.label || values.subject,
        message: values.message,
      })

      setSubmitStatus('success')
      reset()

      setTimeout(() => setSubmitStatus('idle'), 5000)
    } catch (err) {
      setSubmitStatus('error')
      if (ApiError.isApiError(err)) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage('Erro ao enviar mensagem. Tente novamente.')
      }
      setTimeout(() => setSubmitStatus('idle'), 5000)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldError = (field: keyof ContactFormValues) => {
    return touched[field] ? errors[field] : undefined
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Navbar />

      <Hero
        title="Entre em Contato"
        description="Estamos prontos para ouvir suas necessidades e criar solucoes inovadoras para seu negocio"
      />

      {/* Contact Info & Form Section */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Contact Information */}
            <div>
              <ScrollReveal animation="fadeInLeft">
                <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
                  Fale{' '}
                  <span className="text-indigo-600 dark:text-indigo-400">Conosco</span>
                </h2>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">
                  Nossa equipe esta pronta para entender suas necessidades e criar solucoes sob
                  medida para seu negocio.
                </p>
              </ScrollReveal>

              <div className="space-y-4">
                {contactInfo.map((item, index) => (
                  <ScrollReveal key={item.title} animation="fadeInLeft" delay={100 + index * 100}>
                    <ContactInfoCard {...item} />
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* Contact Form */}
            <ScrollReveal animation="fadeInRight" delay={200}>
              <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <div className="px-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-600 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-neutral-900 dark:text-white">
                      Envie sua Mensagem
                    </h3>
                  </div>

                  {/* Status Messages */}
                {submitStatus === 'success' && (
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <p className="text-emerald-700 dark:text-emerald-300">
                      Mensagem enviada com sucesso! Entraremos em contato em breve.
                    </p>
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                    <Mail className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <p className="text-red-700 dark:text-red-300">{errorMessage}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Nome Completo *"
                      placeholder="Seu nome completo"
                      value={values.name}
                      onChange={handleChange('name')}
                      onBlur={handleBlur('name')}
                      error={getFieldError('name')}
                      leftIcon={<User className="w-5 h-5" />}
                      disabled={isSubmitting}
                    />

                    <Input
                      label="Email *"
                      type="email"
                      placeholder="seu@email.com"
                      value={values.email}
                      onChange={handleChange('email')}
                      onBlur={handleBlur('email')}
                      error={getFieldError('email')}
                      leftIcon={<Mail className="w-5 h-5" />}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Input
                      label="Empresa"
                      placeholder="Nome da sua empresa"
                      value={values.company}
                      onChange={handleChange('company')}
                      onBlur={handleBlur('company')}
                      error={getFieldError('company')}
                      leftIcon={<Building2 className="w-5 h-5" />}
                      disabled={isSubmitting}
                    />

                    <Input
                      label="Telefone"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={values.phone}
                      onChange={handleChange('phone')}
                      onBlur={handleBlur('phone')}
                      error={getFieldError('phone')}
                      leftIcon={<Phone className="w-5 h-5" />}
                      disabled={isSubmitting}
                    />
                  </div>

                  <Select
                    label="Assunto *"
                    placeholder="Selecione um assunto"
                    options={subjectOptions}
                    value={values.subject}
                    onChange={handleChange('subject')}
                    onBlur={handleBlur('subject')}
                    error={getFieldError('subject')}
                    disabled={isSubmitting}
                  />

                  <Textarea
                    label="Mensagem *"
                    placeholder="Conte-nos sobre seu projeto, necessidades especificas e como podemos ajudar..."
                    rows={5}
                    value={values.message}
                    onChange={handleChange('message')}
                    onBlur={handleBlur('message')}
                    error={getFieldError('message')}
                    disabled={isSubmitting}
                    showCount
                    maxLength={1000}
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    leftIcon={!isSubmitting ? <Send className="w-5 h-5" /> : undefined}
                  >
                    {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                  </Button>
                </form>
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-neutral-100 to-indigo-50 dark:from-neutral-900 dark:to-indigo-950/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fadeInUp">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
              Resposta Rapida{' '}
              <span className="text-indigo-600 dark:text-indigo-400">Garantida</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fadeInUp" delay={100}>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-12">
              Nossa equipe responde todas as mensagens em ate 24 horas. Estamos ansiosos para
              conhecer seu projeto!
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <ScrollReveal key={stat.title} animation="fadeInUp" delay={200 + index * 100}>
                <StatCard {...stat} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Contact Info Card Component
function ContactInfoCard({
  icon: Icon,
  title,
  value,
  href,
  color,
}: {
  icon: React.ElementType
  title: string
  value: string
  href: string | null
  color: 'indigo' | 'blue'
}) {
  const colorClasses = {
    indigo: {
      icon: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30',
      hoverBg: 'group-hover:bg-indigo-600',
      hoverIcon: 'group-hover:text-white',
    },
    blue: {
      icon: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      hoverBg: 'group-hover:bg-blue-600',
      hoverIcon: 'group-hover:text-white',
    },
  }

  const colors = colorClasses[color]

  const content = (
    <div
      className={cn(
        'flex items-start gap-4 p-4 rounded-lg',
        'bg-white dark:bg-neutral-800/50',
        'border border-neutral-200 dark:border-neutral-700',
        'transition-all duration-300',
        href && 'group cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-600'
      )}
    >
      <div
        className={cn(
          'p-3 rounded-lg transition-colors duration-300',
          colors.bg,
          href && colors.hoverBg
        )}
      >
        <Icon
          className={cn('w-5 h-5 transition-colors duration-300', colors.icon, href && colors.hoverIcon)}
        />
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900 dark:text-white">{title}</h4>
        <p className="text-neutral-600 dark:text-neutral-300 whitespace-pre-line">{value}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    )
  }

  return content
}

// Stat Card Component
function StatCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  color: 'indigo' | 'blue'
}) {
  const colorClasses = {
    indigo: 'bg-indigo-600',
    blue: 'bg-blue-600',
  }

  return (
    <div className="text-center">
      <div className={cn('p-4 inline-block rounded-lg mb-3', colorClasses[color])}>
        <Icon className="w-7 h-7 text-white" />
      </div>
      <h4 className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{title}</h4>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  )
}
