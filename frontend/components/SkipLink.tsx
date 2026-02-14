'use client'

interface SkipLinkProps {
  href?: string
  children?: React.ReactNode
}

export default function SkipLink({
  href = '#main-content',
  children = 'Pular para o conteudo principal',
}: SkipLinkProps) {
  return (
    <a href={href} className="skip-link">
      {children}
    </a>
  )
}
