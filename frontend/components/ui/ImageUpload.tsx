'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, ImageIcon, Link as LinkIcon } from 'lucide-react'
import { cn, getMediaUrl } from '@/lib/utils'
import { api } from '@/lib/api'

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  className?: string
  disabled?: boolean
  label?: string
  hint?: string
}

export function ImageUpload({
  value,
  onChange,
  className,
  disabled = false,
  label = 'Imagem de Capa',
  hint = 'PNG, JPG ou WEBP. Max 5MB.',
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [mode, setMode] = useState<'upload' | 'url'>(value && !value.startsWith('blob:') ? 'url' : 'upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(
    async (file: File) => {
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
      if (!validTypes.includes(file.type)) {
        setError('Formato invalido. Use PNG, JPG ou WEBP.')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Max 5MB.')
        return
      }

      setError(null)
      setIsUploading(true)

      try {
        const result = await api.uploadImage(file)
        onChange(result.url)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao fazer upload')
      } finally {
        setIsUploading(false)
      }
    },
    [onChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      if (disabled || isUploading) return
      const file = e.dataTransfer.files[0]
      if (file) handleFileSelect(file)
    },
    [disabled, isUploading, handleFileSelect]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFileSelect(file)
    },
    [handleFileSelect]
  )

  const handleRemove = useCallback(() => {
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [onChange])

  const handleUrlChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-zinc-400">
          {label}
        </label>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={cn(
              'px-1.5 py-0.5 text-[10px] rounded transition-colors',
              mode === 'upload'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-700 text-zinc-400 hover:text-white'
            )}
          >
            <Upload className="w-2.5 h-2.5 inline mr-0.5" />
            Upload
          </button>
          <button
            type="button"
            onClick={() => setMode('url')}
            className={cn(
              'px-1.5 py-0.5 text-[10px] rounded transition-colors',
              mode === 'url'
                ? 'bg-indigo-600 text-white'
                : 'bg-zinc-700 text-zinc-400 hover:text-white'
            )}
          >
            <LinkIcon className="w-2.5 h-2.5 inline mr-0.5" />
            URL
          </button>
        </div>
      </div>

      {mode === 'url' ? (
        <input
          type="url"
          value={value}
          onChange={handleUrlChange}
          disabled={disabled}
          className="w-full px-3 py-2 text-sm bg-zinc-900/50 border border-zinc-700 rounded-md text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="https://..."
        />
      ) : value ? (
        <div className="relative rounded-md overflow-hidden bg-zinc-800 border border-zinc-700">
          <div className="relative h-32">
            <Image
              src={getMediaUrl(value)}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className={cn(
              'absolute top-1.5 right-1.5 p-1 rounded-full',
              'bg-red-500/80 hover:bg-red-500 text-white',
              'transition-colors duration-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            'relative border border-dashed rounded-md py-6 px-4',
            'flex flex-col items-center justify-center gap-2',
            'transition-all duration-200 cursor-pointer',
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-zinc-600 hover:border-zinc-500 bg-zinc-800/30',
            (disabled || isUploading) && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleInputChange}
            disabled={disabled || isUploading}
            className="hidden"
          />

          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
              <p className="text-xs text-zinc-400">Enviando...</p>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-zinc-700/50 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-zinc-400" />
              </div>
              <div className="text-center">
                <p className="text-xs text-zinc-300">
                  Arraste ou <span className="text-indigo-400">clique</span>
                </p>
                <p className="text-[10px] text-zinc-500 mt-0.5">{hint}</p>
              </div>
            </>
          )}
        </div>
      )}

      {error && (
        <p className="mt-1 text-xs text-red-400">{error}</p>
      )}
    </div>
  )
}
