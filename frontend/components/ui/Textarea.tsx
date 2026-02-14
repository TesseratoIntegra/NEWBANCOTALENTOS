import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps extends React.ComponentProps<"textarea"> {
  label?: string
  error?: string
  hint?: string
  showCount?: boolean
}

function Textarea({
  className,
  label,
  error,
  hint,
  showCount,
  id,
  value,
  maxLength,
  ...props
}: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-")
  const currentLength = typeof value === 'string' ? value.length : 0

  const textareaElement = (
    <textarea
      id={textareaId}
      data-slot="textarea"
      value={value}
      maxLength={maxLength}
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        error && "border-destructive focus-visible:border-destructive focus-visible:ring-destructive/20",
        className
      )}
      aria-invalid={!!error}
      {...props}
    />
  )

  if (!label && !error && !hint && !showCount) {
    return textareaElement
  }

  return (
    <div className="space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-foreground"
        >
          {label}
        </label>
      )}
      {textareaElement}
      <div className="flex justify-between items-center">
        <div>
          {hint && !error && (
            <p className="text-xs text-muted-foreground">{hint}</p>
          )}
          {error && (
            <p className="text-xs text-destructive">{error}</p>
          )}
        </div>
        {showCount && maxLength && (
          <p className="text-xs text-muted-foreground">
            {currentLength}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}

export { Textarea }
