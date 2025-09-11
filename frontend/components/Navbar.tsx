'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LogoutBtn from './LogoutBtn'
import { Briefcase } from 'react-bootstrap-icons'
import Image from 'next/image'
import * as Icon from 'react-bootstrap-icons'
import { useState, useEffect } from 'react'
import JobApplicationModalStart from './JobApplicationModalStart'

export default function Navbar() {
    const pathname = usePathname()
    const { user, isAuthenticated } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [jobStart, JobStart] = useState(false);
    const [canClickJobStart, setCanClickJobStart] = useState(false);

    // Delay de 4 segundos para habilitar o clique apenas na rota /vagas
    useEffect(() => {
        if (isAuthenticated && user?.user_type === 'candidate') {
            if (pathname === '/vagas') {
                const timer = setTimeout(() => setCanClickJobStart(true), 4000);
                setCanClickJobStart(false);
                return () => clearTimeout(timer);
            } else {
                setCanClickJobStart(true);
            }
        } else {
            setCanClickJobStart(false);
        }
    }, [isAuthenticated, user, pathname]);

    const links = [
        { href: '/vagas', label: 'Trabalhe Conosco', icon: Briefcase },
        ...(isAuthenticated && user?.user_type === 'candidate' ? [
            { href: '/candidaturas', label: 'Minhas Candidaturas', icon: Icon.Person },
        ] : []),
        ...(isAuthenticated && user?.user_type === 'recruiter' ? [
            { href: '/admin', label: 'Painel Colaboradores', icon: Icon.Person },
        ] : [])
    ]

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen)
    }

    return (
        <header className="bg-gradient-to-r from-blue-800 to-blue-950 fixed top-0 left-0 z-40 w-full">
            <div className="max-w-[92%] mx-auto px-4 sm:px-6 py-2">
                <div className="flex items-center justify-between">
                    <Link href='/' className="flex items-center space-x-3 cursor-pointer">
                        <Image src='https://raw.githubusercontent.com/Chiaperini-TI/Chiaperini-TI/main/chiaperini.png' width={300} height={300} alt='' className='animate-fade w-auto h-8 sm:h-10'></Image>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center space-x-6">
                        <nav className="flex space-x-6">
                            {links.map(({ href, label, icon: Icon }) => (
                                <Link key={href} href={href} className='group'>
                                <div                                    
                                    className={`animate-fade flex items-center space-x-1 transition group ${
                                        pathname === href ? 'text-yellow-300' : 'text-zinc-300/90 hover:text-zinc-100'
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{label}</span>
                                </div>
                                <div className={`h-[1px] animate-fade ${pathname === href ? 'bg-yellow-300 w-full' : 'bg-zinc-200 w-0 group-hover:w-full'} duration-300`}></div>
                                </Link>
                            ))}

                            {isAuthenticated && user?.user_type === 'candidate' && (
                                <>
                                    <div
                                        className={`group ${canClickJobStart ? 'cursor-pointer text-zinc-300/90 hover:text-yellow-300' : 'cursor-not-allowed text-zinc-400'} `}
                                        onClick={() => {
                                            if (canClickJobStart) JobStart(true);
                                        }}
                                        aria-disabled={!canClickJobStart}
                                    >
                                        <div className='animate-fade flex items-center space-x-1 transition group'>
                                            <Icon.FileEarmarkPerson className="w-4 h-4" />
                                            <span>Candidatura espontânea</span>
                                        </div>
                                    </div>
                                    <JobApplicationModalStart show={jobStart} onClose={() => JobStart(false)} />
                                </>
                            )}

                        </nav>
                        
                        {isAuthenticated ? (
                            user?.user_type === 'candidate' ? (
                                <div className="flex items-center space-x-2 ml-5">
                                    <Link href='/perfil' className="animate-fade text-zinc-200 hover:text-zinc-800 border border-zinc-100/40 px-4 py-2 rounded-md cursor-pointer text-sm duration-300 flex justify-center place-items-center gap-2 hover:bg-yellow-300">
                                        <Icon.Person className="w-4 h-4" /> Minha Conta
                                    </Link>
                                    <LogoutBtn />
                                </div>
                            ) : user?.user_type === 'admin' ? (
                                <div className="flex items-center space-x-2 ml-5">
                                    <Link href='/admin' className="animate-fade text-zinc-100 hover:text-zinc-800 border border-zinc-900/40 px-4 py-2 rounded-md cursor-pointer text-sm duration-300 flex justify-center place-items-center gap-2 hover:bg-zinc-100">
                                        <Icon.Person className="w-4 h-4" /> Admin Panel
                                    </Link>
                                    <LogoutBtn />
                                </div>
                            ) : <LogoutBtn />
                            ) : (
                            <Link
                                href="/login"
                                className="animate-fade bg-yellow-300 hover:bg-yellow-300/80 text-zinc-900 px-4 py-2 rounded-md transition font-semibold flex justify-center place-items-center gap-2"
                            >
                              <Icon.Person className='w-4 h-4'/>  Faça seu Login
                            </Link>
                            )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="lg:hidden mt-2">
                        <button
                            onClick={toggleMenu}
                            className="text-zinc-100 hover:text-blue-900 transition"
                            aria-label="Toggle menu"
                        >
                            <X className={`w-6 h-6 absolute z-[60] top-3 right-5 ${!isMenuOpen ? 'rotate-[-60deg] pointer-events-none opacity-0' : 'rotate-0 opacity-100'} duration-300`} />
                            <Menu className={`w-6 h-6 absolute z-[60] top-3 right-5 ${isMenuOpen ? 'rotate-[60deg] pointer-events-none opacity-0' : 'rotate-0 opacity-100'} duration-300`} />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`${isMenuOpen ? 'max-h-96 pb-4 mt-4' : 'max-h-0 pb-0'} lg:hidden border-t border-blue-900/20 duration-300 overflow-hidden`}>
                    <nav className="flex flex-col space-y-3 mt-4">
                        {links.map(({ href, label, icon: Icon }) => (
                            <Link
                                key={href}
                                href={href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`animate-fade flex items-center space-x-2 py-2 px-3 rounded-md transition ${
                                    pathname === href 
                                        ? 'text-blue-950 bg-yellow-300' 
                                        : 'text-zinc-100 hover:text-blue-900 hover:bg-blue-50'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{label}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-4 pt-4 border-t border-blue-900/20">
                        {isAuthenticated ? (
                            user?.user_type === 'candidate' ? (
                                <div className="animate-fade flex flex-col space-y-3">
                                    <Link 
                                        href='/perfil' 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="bg-blue-700 text-yellow-400 px-4 py-2 rounded-md cursor-pointer text-sm duration-300 flex justify-center place-items-center gap-2 hover:bg-blue-800"
                                    >
                                        <Icon.Person className="w-4 h-4" /> Minha Conta
                                    </Link>
                                    <LogoutBtn />
                                </div>
                            ) : user?.user_type === 'recruiter' ? (
                                <div className="animate-fade flex flex-col space-y-3">
                                    <Link 
                                        href='/admin' 
                                        onClick={() => setIsMenuOpen(false)}
                                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md cursor-pointer text-sm duration-300 flex justify-center place-items-center gap-2"
                                    >
                                        <Icon.Person className="w-4 h-4" /> Admin Panel
                                    </Link>
                                    <LogoutBtn />
                                </div>
                            ) : null
                            ) : (
                            <Link
                                href="/login"
                                onClick={() => setIsMenuOpen(false)}
                                className="animate-fade bg-gradient-to-r from-yellow-400 to-yellow-300 hover:opacity-70 text-zinc-900 px-4 py-2 rounded-md transition font-semibold flex justify-center place-items-center gap-2 w-full"
                            >
                              <Icon.Person className='w-4 h-4'/>  Faça seu Login
                            </Link>
                            )}
                    </div>
                </div>
            </div>
        </header>
    )
}
