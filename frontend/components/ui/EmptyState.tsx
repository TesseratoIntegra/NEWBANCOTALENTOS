import { LucideIcon, FolderOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button, ButtonProps } from './Button'

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
    variant?: ButtonProps['variant']
  }
  className?: string
}

const EmptyState = ({
  icon: Icon = FolderOpen,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center mb-4',
          'bg-neutral-100 dark:bg-neutral-800'
        )}
      >
        <Icon className="w-8 h-8 text-neutral-400" />
      </div>
      <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-neutral-500 dark:text-neutral-400 max-w-sm mb-4">
          {description}
        </p>
      )}
      {action && (
        <Button variant={action.variant || 'primary'} onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }
