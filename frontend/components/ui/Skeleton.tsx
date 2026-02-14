import { cn } from "@/lib/utils"

export interface SkeletonProps extends React.ComponentProps<"div"> {
  className?: string
  width?: number | string
  height?: number | string
  variant?: 'rectangular' | 'circular' | 'text'
}

function Skeleton({
  className,
  width,
  height,
  variant = 'rectangular',
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-accent animate-pulse",
        variant === 'circular' && 'rounded-full',
        variant === 'rectangular' && 'rounded-md',
        variant === 'text' && 'rounded',
        className
      )}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        ...style,
      }}
      {...props}
    />
  )
}

// Project Card Skeleton
function ProjectCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border">
      <Skeleton className="aspect-[16/9] w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
    </div>
  )
}

// Table Row Skeleton
function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-border">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Stat Card Skeleton
function StatCardSkeleton() {
  return (
    <div className="bg-card rounded-lg p-4 border border-border">
      <Skeleton className="h-4 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  )
}

export { Skeleton, ProjectCardSkeleton, TableRowSkeleton, StatCardSkeleton }
