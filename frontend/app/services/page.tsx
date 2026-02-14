'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Smartphone,
  Target,
  TrendingUp,
  Link as LinkIcon,
  Shield,
  CheckCircle,
  Clock,
  Users,
  Database,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ScrollReveal from '@/components/ScrollReveal'
import { Button, Card } from '@/components/ui'

// Services data
const services = [
  {
    id: 1,
    icon: BarChart3,
    title: 'Dashboards Interativos',
    description:
      'Paineis de controle personalizados que transformam dados complexos em insights visuais claros e acionaveis.',
    features: ['Visualizacoes em tempo real', 'Metricas personalizaveis', 'Exportacao de relatorios'],
    color: 'indigo' as const,
  },
  {
    id: 2,
    icon: Smartphone,
    title: 'Apps de Campo',
    description:
      'Aplicacoes moveis que permitem captura e sincronizacao de dados em tempo real.',
    features: ['Sincronizacao automatica', 'Interface intuitiva', 'Captura de fotos e assinaturas'],
    color: 'blue' as const,
  },
  {
    id: 3,
    icon: Target,
    title: 'Interfaces Personalizadas',
    description:
      'Desenvolvimento de interfaces especificas para diferentes departamentos, otimizando fluxos de trabalho unicos.',
    features: ['Integracao com ERP', 'Workflows automatizados', 'Controle de permissoes'],
    color: 'indigo' as const,
  },
  {
    id: 4,
    icon: TrendingUp,
    title: 'Relatorios e Insights',
    description:
      'Analises avancadas e relatorios inteligentes conectados diretamente aos dados do seu ERP.',
    features: ['Analise preditiva', 'Relatorios automatizados', 'Business Intelligence'],
    color: 'blue' as const,
  },
  {
    id: 5,
    icon: LinkIcon,
    title: 'Integracao de Sistemas',
    description:
      'Conectamos diferentes sistemas e plataformas para criar um ecossistema tecnologico unificado.',
    features: ['APIs robustas', 'Sincronizacao de dados', 'Monitoramento continuo'],
    color: 'indigo' as const,
  },
  {
    id: 6,
    icon: Shield,
    title: 'Consultoria Tecnica',
    description:
      'Orientacao especializada para otimizacao de processos e implementacao de melhores praticas.',
    features: ['Analise de processos', 'Treinamento de equipes', 'Suporte continuo'],
    color: 'blue' as const,
  },
]

// Benefits data
const benefits = [
  {
    icon: Clock,
    title: 'Implementacao Rapida',
    description: 'Solucoes prontas para uso em tempo record',
  },
  {
    icon: Users,
    title: 'Equipe Especializada',
    description: 'Profissionais com vasta experiencia em ERP',
  },
  {
    icon: Database,
    title: 'Integracao Segura',
    description: 'Conectividade robusta e protegida',
  },
  {
    icon: Settings,
    title: 'Personalizacao Total',
    description: 'Adaptado as suas necessidades especificas',
  },
]

// Process steps data
const processSteps = [
  {
    number: 1,
    title: 'Analise e Planejamento',
    description: 'Compreendemos suas necessidades e desafios especificos para criar a solucao ideal.',
  },
  {
    number: 2,
    title: 'Desenvolvimento',
    description: 'Criamos e desenvolvemos a solucao com as melhores praticas e tecnologias modernas.',
  },
  {
    number: 3,
    title: 'Implementacao e Suporte',
    description: 'Implementamos a solucao e oferecemos suporte continuo para garantir o sucesso.',
  },
]

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Navbar />

      <Hero
        title="Servicos"
        description="Solucoes completas para potencializar seu ERP e otimizar seu negocio."
      />

      {/* Services Grid */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {services.map((service, index) => (
              <ScrollReveal key={service.id} animation="fadeInUp" delay={index * 100}>
                <ServiceCard {...service} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <ScrollReveal animation="fadeInUp">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
                Por que escolher nossas{' '}
                <span className="text-indigo-600 dark:text-indigo-400">solucoes?</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal animation="fadeInUp" delay={100}>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                Unimos excelencia tecnica a um entendimento estrategico dos processos de negocio.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <ScrollReveal key={benefit.title} animation="fadeInUp" delay={150 * index}>
                <BenefitCard {...benefit} index={index} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <ScrollReveal animation="fadeInUp">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
                Como{' '}
                <span className="text-indigo-600 dark:text-indigo-400">Trabalhamos</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal animation="fadeInUp" delay={100}>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                Processo estruturado para garantir o sucesso do seu projeto
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {processSteps.map((step, index) => (
              <ScrollReveal key={step.number} animation="fadeInUp" delay={200 + index * 150}>
                <ProcessCard {...step} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-neutral-900 dark:to-indigo-950/30">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fadeInUp">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
              Pronto para transformar sua{' '}
              <span className="text-indigo-600 dark:text-indigo-400">operacao?</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fadeInUp" delay={100}>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed">
              Entre em contato conosco e descubra como nossas solucoes podem potencializar seu ERP e
              otimizar seus processos.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fadeInUp" delay={200}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="primary"
                size="lg"
                rightIcon={<ArrowRight className="w-5 h-5" />}
                onClick={() => window.open('https://wa.me/5516992416689', '_blank')}
              >
                Solicitar Orcamento
              </Button>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Agendar Demonstracao
                </Button>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Service Card Component
function ServiceCard({
  icon: Icon,
  title,
  description,
  features,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  features: string[]
  color: 'indigo' | 'blue'
}) {
  const colorClasses = {
    indigo: {
      iconBg: 'bg-indigo-100 dark:bg-indigo-900/30 group-hover:bg-indigo-600',
      iconColor: 'text-indigo-600 dark:text-indigo-400 group-hover:text-white',
      hoverBorder: 'group-hover:border-indigo-300 dark:group-hover:border-indigo-600',
      titleHover: 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400',
    },
    blue: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-600',
      iconColor: 'text-blue-600 dark:text-blue-400 group-hover:text-white',
      hoverBorder: 'group-hover:border-blue-300 dark:group-hover:border-blue-600',
      titleHover: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
    },
  }

  const colors = colorClasses[color]

  return (
    <Card
      className={cn(
        'group h-full bg-white dark:bg-neutral-800',
        'border-neutral-200 dark:border-neutral-700',
        'transition-all duration-300',
        colors.hoverBorder
      )}
    >
      <div className="flex items-start gap-5 px-6">
        <div
          className={cn(
            'p-4 rounded-lg flex-shrink-0 transition-colors duration-300',
            colors.iconBg
          )}
        >
          <Icon className={cn('w-8 h-8 transition-colors duration-300', colors.iconColor)} />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              'text-xl font-semibold mb-3 text-neutral-900 dark:text-white',
              'transition-colors duration-300',
              colors.titleHover
            )}
          >
            {title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-300 mb-4 leading-relaxed">
            {description}
          </p>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <span className="text-sm text-neutral-600 dark:text-neutral-400">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  )
}

// Benefit Card Component
function BenefitCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType
  title: string
  description: string
  index: number
}) {
  const bgColor = index % 2 === 0 ? 'bg-indigo-600' : 'bg-blue-600'

  return (
    <div className="text-center group">
      <div
        className={cn(
          'p-5 inline-flex items-center justify-center rounded-xl mb-4',
          'transform group-hover:scale-110 transition-transform duration-300',
          bgColor
        )}
      >
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h4 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {title}
      </h4>
      <p className="text-neutral-600 dark:text-neutral-400 text-sm">{description}</p>
    </div>
  )
}

// Process Card Component
function ProcessCard({
  number,
  title,
  description,
}: {
  number: number
  title: string
  description: string
}) {
  return (
    <Card className="text-center group bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
      <div className="px-6">
        <div className="w-14 h-14 rounded-full bg-indigo-600 group-hover:bg-indigo-500 flex items-center justify-center mx-auto mb-5 transition-colors">
        <span className="text-xl font-bold text-white">{number}</span>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
        {title}
      </h3>
      <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </Card>
  )
}
