'use client'

import React, { useEffect, useRef, useState, ReactNode } from 'react'
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery'

// Tipos para o componente ScrollReveal
interface ScrollRevealProps {
  children: ReactNode
  animation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'fadeIn'
  delay?: number
  duration?: string
  threshold?: number
  className?: string
}

// Componente reutilizavel para animacoes de scroll
const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  animation = 'fadeInUp',
  delay = 0,
  duration = '0.6s',
  threshold = 0.2,
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef<HTMLDivElement>(null)
  const prefersReducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    // Se o usuario prefere reducao de movimento, mostrar imediatamente
    if (prefersReducedMotion) {
      setIsVisible(true)
      return
    }

    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay)
        }
      },
      { threshold }
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
    }
  }, [delay, threshold, prefersReducedMotion])

  const getAnimationClass = () => {
    // Se prefere reducao de movimento, nao aplicar classes de animacao
    if (prefersReducedMotion) {
      return 'opacity-100'
    }

    const baseClass = 'transition-all ease-out'

    if (!isVisible) {
      switch (animation) {
        case 'fadeInUp':
          return `${baseClass} opacity-0 translate-y-8`
        case 'fadeInDown':
          return `${baseClass} opacity-0 -translate-y-8`
        case 'fadeInLeft':
          return `${baseClass} opacity-0 -translate-x-8`
        case 'fadeInRight':
          return `${baseClass} opacity-0 translate-x-8`
        case 'scaleIn':
          return `${baseClass} opacity-0 scale-95`
        case 'fadeIn':
          return `${baseClass} opacity-0`
        default:
          return `${baseClass} opacity-0 translate-y-8`
      }
    }

    return `${baseClass} opacity-100 translate-y-0 translate-x-0 scale-100`
  }

  return (
    <div
      ref={elementRef}
      className={`${getAnimationClass()} ${className}`}
      style={{ transitionDuration: prefersReducedMotion ? '0ms' : duration }}
    >
      {children}
    </div>
  )
}

export default ScrollReveal