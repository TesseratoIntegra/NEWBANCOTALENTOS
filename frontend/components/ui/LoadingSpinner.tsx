import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
  fullScreen?: boolean
}

const LoadingSpinner = ({
  size = 'md',
  className,
  text,
  fullScreen = false,
}: LoadingSpinnerProps) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-indigo-600', sizes[size])} />
      {text && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{text}</p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-neutral-950/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    )
  }

  return spinner
}

// Page Loading Component
const PageLoading = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <LoadingSpinner size="lg" text="Carregando..." />
  </div>
)

export { LoadingSpinner, PageLoading }
