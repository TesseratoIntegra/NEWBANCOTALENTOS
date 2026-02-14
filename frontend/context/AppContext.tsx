// context/AppContext.tsx
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type AppContextType = {
  page: 'home' | 'services' | 'about' | 'contact' | 'videos'
  setPage: (page: 'home' | 'services' | 'about' | 'contact' | 'videos') => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [page, setPage] = useState<'home' | 'services' | 'about' | 'contact' | 'videos'>('home')

  return (
    <AppContext.Provider value={{ page, setPage }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within AppProvider')
  return context
}
