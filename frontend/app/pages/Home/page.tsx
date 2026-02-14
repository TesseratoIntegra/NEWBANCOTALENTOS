'use client'

import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  Smartphone,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import ScrollReveal from '@/components/ScrollReveal'
import Banner from '@/app/pages/Home/components/Banner'
import FeaturedProjects from '@/app/pages/Home/components/Videos'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { Button, Card } from '@/components/ui'

// Solutions data
const solutions = [
  {
    icon: BarChart3,
    title: 'Dashboards e paineis interativos',
    description:
      'Para decisoes mais rapidas com visualizacoes em tempo real dos seus dados mais importantes.',
    color: 'indigo' as const,
  },
  {
    icon: Smartphone,
    title: 'Apps de campo',
    description:
      'Para captura de dados em tempo real, permitindo que sua equipe trabalhe de qualquer lugar.',
    color: 'blue' as const,
  },
  {
    icon: Target,
    title: 'Interfaces personalizadas',
    description:
      'Para areas como vendas e logistica, otimizando processos especificos do seu negocio.',
    color: 'indigo' as const,
  },
  {
    icon: TrendingUp,
    title: 'Relatorios e insights',
    description:
      'Conectados direto ao ERP, fornecendo analises profundas para tomada de decisao estrategica.',
    color: 'blue' as const,
  },
]

// Features data
const features = [
  {
    icon: Shield,
    title: 'Seguro',
    description: 'Protecao total dos dados',
    color: 'indigo' as const,
  },
  {
    icon: Zap,
    title: 'Rapido',
    description: 'Implementacao agil',
    color: 'blue' as const,
  },
  {
    icon: Users,
    title: 'Personalizado',
    description: 'Sob medida para voce',
    color: 'indigo' as const,
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Navbar />

      <Banner />

      {/* Hero Section */}
      <section className="relative overflow-hidden animate-fade animate-delay-[1500ms]">
        <div className="absolute inset-0 bg-gradient-to-br from-neutral-50 via-white to-indigo-50/30 dark:from-neutral-900 dark:via-neutral-900 dark:to-indigo-950/20" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-3xl lg:text-5xl font-bold leading-tight mb-6 text-neutral-900 dark:text-white animate-fade-up animate-delay-[1600ms]">
                Alem do{' '}
                <span className="text-indigo-600 dark:text-indigo-400">ERP</span>: ferramentas que{' '}
                <span className="text-indigo-600 dark:text-indigo-400">impulsionam</span> sua operacao
              </h1>
              <p className="text-lg lg:text-xl text-neutral-600 dark:text-neutral-300 mb-8 leading-relaxed animate-fade-up animate-delay-[1900ms]">
                Um ERP isolado nao supre todas as demandas operacionais. Por isso, criamos solucoes
                inteligentes que se integram ao seu sistema principal, ampliando sua eficiencia e
                capacidade de automacao.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-up animate-delay-[2200ms]">
                <Link href="/contact">
                  <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                    Fale Conosco
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline" size="lg">
                    Nossas Solucoes
                  </Button>
                </Link>
              </div>
            </div>

            <div className="animate-fade-up animate-delay-[1700ms]">
              <FeaturedProjects />
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solucoes" className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fadeInUp">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
                Nossas{' '}
                <span className="text-indigo-600 dark:text-indigo-400">Solucoes</span>
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
                Ferramentas inteligentes desenvolvidas para potencializar sua operacao
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {solutions.map((solution, index) => (
              <ScrollReveal key={solution.title} animation="fadeInUp" delay={100 + index * 100}>
                <SolutionCard {...solution} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section id="integracao" className="py-16 lg:py-24 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <ScrollReveal animation="fadeInUp">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
                  Integracao{' '}
                  <span className="text-indigo-600 dark:text-indigo-400">Simples e Segura</span>
                </h2>
              </ScrollReveal>

              <ScrollReveal animation="fadeInUp" delay={100}>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
                  Todas as nossas solucoes sao desenvolvidas com integracao simples, segura e sob
                  medida para o seu negocio.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="fadeInUp" delay={200}>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                  Nossa equipe especializada trabalha para entender suas necessidades especificas e
                  criar ferramentas que realmente fazem a diferenca no dia a dia da sua empresa.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="fadeInUp" delay={300}>
                <p className="text-neutral-600 dark:text-neutral-400 mb-8 leading-relaxed">
                  Com anos de experiencia em desenvolvimento de microservicos e integracao com
                  sistemas ERP, garantimos solucoes robustas e confiaveis.
                </p>
              </ScrollReveal>

              <div className="grid grid-cols-3 gap-4">
                {features.map((feature, index) => (
                  <ScrollReveal key={feature.title} animation="fadeInUp" delay={400 + index * 100}>
                    <FeatureCard {...feature} />
                  </ScrollReveal>
                ))}
              </div>
            </div>

            <ScrollReveal animation="fadeInRight" delay={200}>
              <IntegrationDiagram />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fadeInUp">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
              Pronto para potencializar sua{' '}
              <span className="text-indigo-600 dark:text-indigo-400">operacao?</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fadeInUp" delay={100}>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
              Entre em contato conosco e descubra como nossas solucoes podem transformar seu
              negocio.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fadeInUp" delay={200}>
            <Link href="/contact">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Fale Conosco Agora
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Solution Card Component
function SolutionCard({
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
        'group bg-white dark:bg-neutral-800',
        'border-neutral-200 dark:border-neutral-700',
        'transition-all duration-300',
        colors.hoverBorder
      )}
    >
      <div className="flex items-start gap-4 px-6">
        <div
          className={cn(
            'p-3 rounded-lg flex-shrink-0 transition-colors duration-300',
            colors.iconBg
          )}
        >
          <Icon className={cn('w-7 h-7 transition-colors duration-300', colors.iconColor)} />
        </div>
        <div>
          <h3
            className={cn(
              'text-xl font-semibold mb-2 text-neutral-900 dark:text-white',
              'transition-colors duration-300',
              colors.titleHover
            )}
          >
            {title}
          </h3>
          <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</p>
        </div>
      </div>
    </Card>
  )
}

// Feature Card Component
function FeatureCard({
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
  const bgColor = color === 'indigo' ? 'bg-indigo-600' : 'bg-blue-600'
  const textColor = color === 'indigo' ? 'text-indigo-600 dark:text-indigo-400' : 'text-blue-600 dark:text-blue-400'

  return (
    <div className="text-center">
      <div className={cn('p-4 inline-flex rounded-full mb-2', bgColor)}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h4 className={cn('font-semibold', textColor)}>{title}</h4>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{description}</p>
    </div>
  )
}

// Integration Diagram Component
function IntegrationDiagram() {
  const items = [
    { icon: BarChart3, color: 'bg-blue-500' },
    { icon: Smartphone, color: 'bg-indigo-500' },
    { icon: Target, color: 'bg-blue-500' },
    { icon: TrendingUp, color: 'bg-indigo-500' },
  ]

  return (
    <Card className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
      <div className="space-y-6 px-6">
        {/* ERP Box */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">ERP</span>
          </div>
          <div className="flex-1 space-y-2">
            <div className="h-2 bg-neutral-200 dark:bg-neutral-600 rounded-full" />
            <div className="h-2 bg-neutral-200 dark:bg-neutral-600 rounded-full w-3/4" />
          </div>
        </div>

        {/* Connection line */}
        <div className="border-l-2 border-dashed border-neutral-300 dark:border-neutral-600 ml-8 h-8" />

        {/* Integration Items */}
        <div className="space-y-4 ml-8">
          {items.map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  item.color
                )}
              >
                <item.icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 space-y-1">
                <div
                  className={cn(
                    'h-1.5 rounded-full',
                    index % 2 === 0 ? 'bg-blue-500' : 'bg-indigo-500'
                  )}
                />
                <div
                  className={cn(
                    'h-1.5 rounded-full',
                    index % 2 === 0 ? 'bg-blue-500 w-2/3' : 'bg-indigo-500 w-3/4'
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
