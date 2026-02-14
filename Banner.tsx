'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

const phrases = [
  'de conectividade entre sistemas.',
  'de decisoes baseadas em dados.',
  'inovar, automatizar e escalar.',
  'integrar seu ERP com Tesserato.',
]

export default function Banner() {
  const [index, setIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % phrases.length)
        setFade(true)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-700 dark:to-blue-600 text-white py-4 md:py-5 lg:py-6 animate-fade animate-delay-[1300ms]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="text-lg md:text-xl lg:text-2xl font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2">
          <span className="whitespace-nowrap">Sua empresa precisa</span>
          <span
            className={cn(
              'transition-all duration-300 whitespace-nowrap text-white/90',
              fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'
            )}
          >
            {phrases[index]}
          </span>
        </div>
      </div>
    </header>
  )
}
