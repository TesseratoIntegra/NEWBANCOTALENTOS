'use client'

import Link from 'next/link'
import {
  Target,
  Wrench,
  HandHeart,
  Rocket,
  Shield,
  Zap,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import Hero from '@/components/Hero'
import ScrollReveal from '@/components/ScrollReveal'
import { Button, Card } from '@/components/ui'

// Values data
const values = [
  {
    icon: Target,
    title: 'Foco no Cliente',
    description:
      'Cada solucao e desenvolvida pensando nas necessidades especificas e objetivos unicos de cada cliente.',
    color: 'indigo' as const,
  },
  {
    icon: Wrench,
    title: 'Excelencia Tecnica',
    description:
      'Utilizamos as melhores praticas e tecnologias mais modernas para garantir solucoes robustas e escalaveis.',
    color: 'blue' as const,
  },
  {
    icon: HandHeart,
    title: 'Parceria',
    description:
      'Nao somos apenas fornecedores, somos parceiros estrategicos no crescimento e sucesso do seu negocio.',
    color: 'indigo' as const,
  },
  {
    icon: Rocket,
    title: 'Inovacao',
    description:
      'Estamos sempre buscando novas formas de otimizar processos e criar solucoes que antecipem as necessidades futuras.',
    color: 'blue' as const,
  },
  {
    icon: Shield,
    title: 'Seguranca',
    description:
      'Todas as nossas solucoes sao desenvolvidas com os mais altos padroes de seguranca e protecao de dados.',
    color: 'indigo' as const,
  },
  {
    icon: Zap,
    title: 'Agilidade',
    description:
      'Entregamos solucoes rapidamente sem comprometer a qualidade, permitindo que voce veja resultados em pouco tempo.',
    color: 'blue' as const,
  },
]

// Mission highlights
const missionHighlights = [
  { icon: Target, title: 'Solucoes Integradas', color: 'indigo' },
  { icon: CheckCircle, title: 'Resultados Comprovados', color: 'blue' },
  { icon: Users, title: 'Equipe Especializada', color: 'indigo' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 transition-colors duration-300">
      <Navbar />

      <Hero
        title="Sobre Nos"
        description="Conheca nossa historia, missao e os valores que nos guiam na criacao de solucoes inovadoras"
      />

      {/* Mission Section */}
      <section className="py-16 lg:py-24 bg-neutral-50 dark:bg-neutral-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <ScrollReveal animation="fadeInUp">
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-neutral-900 dark:text-white">
                  Nossa{' '}
                  <span className="text-indigo-600 dark:text-indigo-400">Missao</span>
                </h2>
              </ScrollReveal>

              <ScrollReveal animation="fadeInUp" delay={100}>
                <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-6 leading-relaxed">
                  Acreditamos que um ERP sozinho nao basta para impulsionar verdadeiramente uma
                  operacao. Nossa missao e desenvolver ferramentas inteligentes e microservicos que
                  trabalham em perfeita harmonia com seu sistema principal, potencializando cada
                  aspecto do seu negocio.
                </p>
              </ScrollReveal>

              <ScrollReveal animation="fadeInUp" delay={200}>
                <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  Com anos de experiencia no desenvolvimento de solucoes corporativas, nossa equipe
                  especializada entende as complexidades e desafios unicos que cada empresa enfrenta.
                  Por isso, criamos solucoes sob medida que se adaptam perfeitamente as suas
                  necessidades especificas.
                </p>
              </ScrollReveal>
            </div>

            <ScrollReveal animation="fadeInRight" delay={200}>
              <Card className="bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                <div className="space-y-6 px-6">
                  {missionHighlights.map((item, index) => (
                    <MissionHighlightItem
                      key={item.title}
                      icon={item.icon}
                      title={item.title}
                      color={item.color as 'indigo' | 'blue'}
                      delay={index * 200}
                    />
                  ))}
                </div>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <ScrollReveal animation="fadeInUp">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
                Nossa{' '}
                <span className="text-indigo-600 dark:text-indigo-400">Abordagem</span>
              </h2>
            </ScrollReveal>
            <ScrollReveal animation="fadeInUp" delay={100}>
              <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-4xl mx-auto leading-relaxed">
                Trabalhamos com uma metodologia agil e colaborativa, sempre priorizando a integracao
                simples e segura com seus sistemas existentes. Cada projeto e tratado como unico,
                com solucoes personalizadas que realmente fazem a diferenca no dia a dia da sua
                empresa.
              </p>
            </ScrollReveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <ScrollReveal key={value.title} animation="fadeInUp" delay={100 + (index % 3) * 100}>
                <ValueCard {...value} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-neutral-800 dark:to-neutral-900">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <ScrollReveal animation="fadeInUp">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-neutral-900 dark:text-white">
              Vamos trabalhar{' '}
              <span className="text-indigo-600 dark:text-indigo-400">juntos?</span>
            </h2>
          </ScrollReveal>

          <ScrollReveal animation="fadeInUp" delay={100}>
            <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
              Entre em contato conosco e descubra como podemos impulsionar o crescimento do seu
              negocio com nossas solucoes personalizadas.
            </p>
          </ScrollReveal>

          <ScrollReveal animation="fadeInUp" delay={200}>
            <Link href="/contact">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                Fale Conosco
              </Button>
            </Link>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}

// Mission Highlight Item Component
function MissionHighlightItem({
  icon: Icon,
  title,
  color,
  delay,
}: {
  icon: React.ElementType
  title: string
  color: 'indigo' | 'blue'
  delay: number
}) {
  const bgColor = color === 'indigo' ? 'from-indigo-500 to-blue-500' : 'from-blue-500 to-indigo-500'
  const barColor = color === 'indigo' ? 'bg-indigo-500' : 'bg-blue-500'

  return (
    <div className="flex items-center gap-4">
      <div
        className={cn(
          'w-14 h-14 bg-gradient-to-br rounded-lg flex items-center justify-center flex-shrink-0',
          bgColor
        )}
        style={{ animationDelay: `${delay}ms` }}
      >
        <Icon className="w-7 h-7 text-white" />
      </div>
      <div className="flex-1">
        <h4 className="text-neutral-900 dark:text-white font-semibold mb-2">{title}</h4>
        <div className={cn('h-1.5 rounded-full mb-1', barColor)} />
        <div className={cn('h-1.5 rounded-full w-3/4', barColor)} />
      </div>
    </div>
  )
}

// Value Card Component
function ValueCard({
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
        'group h-full bg-neutral-50 dark:bg-neutral-800',
        'border-neutral-200 dark:border-neutral-700',
        'transition-all duration-300',
        colors.hoverBorder
      )}
    >
      <div className="flex flex-col items-center text-center px-6">
        <div
          className={cn(
            'p-4 rounded-lg mb-5 transition-colors duration-300',
            colors.iconBg
          )}
        >
          <Icon className={cn('w-8 h-8 transition-colors duration-300', colors.iconColor)} />
        </div>
        <h3
          className={cn(
            'text-xl font-semibold mb-3 text-neutral-900 dark:text-white',
            'transition-colors duration-300',
            colors.titleHover
          )}
        >
          {title}
        </h3>
        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{description}</p>
      </div>
    </Card>
  )
}
