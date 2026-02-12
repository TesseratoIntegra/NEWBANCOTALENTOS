'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Bell, FileText, CheckCircle, XCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import LogoutBtn from './LogoutBtn'
import Image from 'next/image'
import { FileEarmarkPerson, House, Person as BsPerson } from 'react-bootstrap-icons'
import { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react'
import JobApplicationModalStart from './JobApplicationModalStart'
import candidateService from '@/services/candidateService'
import { CandidateNotification } from '@/types'

// Hook customizado para gerenciar a lógica do timer
const useJobStartTimer = (isAuthenticated: boolean, userType: string | undefined, pathname: string) => {
    const [canClickJobStart, setCanClickJobStart] = useState(false);
    
    useEffect(() => {
        if (isAuthenticated && userType === 'candidate') {
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
    }, [isAuthenticated, userType, pathname]);

    return canClickJobStart;
};

// Componente memoizado para os links de navegação
const NavigationLink = memo(({ href, label, icon: Icon, pathname, onClick }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className: string }>;
    pathname: string;
    onClick?: () => void;
}) => {
    const isActive = pathname === href && href !== '#';
    
    if (href === '#' && onClick) {
        return (
            <div className='group cursor-pointer' onClick={onClick}>
                <div className='animate-fade flex items-center space-x-1 transition group text-zinc-300/90 hover:text-yellow-300'>
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                </div>
            </div>
        );
    }
    
    return (
        <Link key={href} href={href} className='group' onClick={onClick}>
            <div className={`animate-fade flex items-center space-x-1 transition group ${
                isActive ? 'text-yellow-300' : 'text-zinc-300/90 hover:text-zinc-100'
            }`}>
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
            <div className={`h-[1px] animate-fade ${isActive ? 'bg-yellow-300 w-full' : 'bg-zinc-200 w-0 group-hover:w-full'} duration-300`}></div>
        </Link>
    );
});

NavigationLink.displayName = 'NavigationLink';

// Componente memoizado para links móveis
const MobileNavigationLink = memo(({ href, label, icon: Icon, pathname, onClick, isPdf = false }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className: string }>;
    pathname: string;
    onClick: () => void;
    isPdf?: boolean;
}) => {
    const isActive = pathname === href && href !== '#';
    
    if (isPdf) {
        return (
            <div
                onClick={onClick}
                className="animate-fade flex items-center space-x-2 py-2 px-3 rounded-md transition text-zinc-100 hover:text-blue-900 hover:bg-blue-50 cursor-pointer"
            >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
            </div>
        );
    }
    
    return (
        <Link
            key={href}
            href={href}
            onClick={onClick}
            className={`animate-fade flex items-center space-x-2 py-2 px-3 rounded-md transition ${
                isActive 
                    ? 'text-blue-950 bg-yellow-300' 
                    : 'text-zinc-100 hover:text-blue-900 hover:bg-blue-50'
            }`}
        >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </Link>
    );
});

MobileNavigationLink.displayName = 'MobileNavigationLink';

// Componente memoizado para candidatura espontânea
const SpontaneousApplicationButton = memo(({ canClickJobStart, onClick }: {
    canClickJobStart: boolean;
    onClick: () => void;
}) => (
    <div
        className={`group ${canClickJobStart ? 'cursor-pointer text-zinc-300/90 hover:text-yellow-300' : 'cursor-not-allowed text-zinc-400'} `}
        onClick={onClick}
        aria-disabled={!canClickJobStart}
    >
        <div className='animate-fade flex items-center space-x-1 transition group'>
            <FileEarmarkPerson className="w-4 h-4" />
            <span>Candidatura Espontânea</span>
        </div>
    </div>
));

SpontaneousApplicationButton.displayName = 'SpontaneousApplicationButton';

function Navbar() {
    const pathname = usePathname()
    const { user, isAuthenticated } = useAuth()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [jobStart, setJobStart] = useState(false);
    const [notifications, setNotifications] = useState<CandidateNotification[]>([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Usar o hook customizado para gerenciar o timer
    const canClickJobStart = useJobStartTimer(isAuthenticated, user?.user_type, pathname);

    // Buscar notificações do candidato
    useEffect(() => {
        if (isAuthenticated && user?.user_type === 'candidate') {
            candidateService.getMyNotifications()
                .then(data => {
                    setNotifications(data.notifications || []);
                })
                .catch(() => {});
        }
    }, [isAuthenticated, user?.user_type]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Memoizar os links para evitar recriação desnecessária
    const links = useMemo(() => [
        { href: '/vagas', target: '', label: 'Início', icon: House },
        ...(isAuthenticated && user?.user_type === 'recruiter' ? [
            { href: '/admin-panel', target: '', label: 'Painel Colaboradores', icon: BsPerson },
        ] : []),
    ], [isAuthenticated, user?.user_type]);

    const toggleMenu = useCallback(() => {
        setIsMenuOpen(prev => !prev)
    }, []);

    const handleJobStartClick = useCallback(() => {
        if (canClickJobStart) {
            setJobStart(true);
        }
    }, [canClickJobStart]);

    const handleCloseJobStart = useCallback(() => {
        setJobStart(false);
    }, []);

    const handleMobileMenuClose = useCallback(() => {
        setIsMenuOpen(false);
    }, []);


    return (
        <header className="bg-blue-950/80 backdrop-blur-xl border-b border-white/10 fixed top-0 left-0 z-50 w-full">
            <div className="xl:max-w-[92%] mx-auto px-4 sm:px-6 py-3">
                <div className="flex items-center justify-between">
                    <Link href='/' className="flex items-center space-x-3 cursor-pointer">
                        <Image src='https://raw.githubusercontent.com/Chiaperini-TI/Chiaperini-TI/main/chiaperini.png' width={300} height={300} alt='Chiaperini' className='animate-fade w-auto h-12 sm:h-10 -ml-4'></Image>
                    </Link>
                    
                    {/* Desktop Navigation */}
                    <div className="hidden xl:flex place-items-center items-center">
                        <nav className="flex gap-x-7 text-sm place-items-center">
                            {links.map(({ href, label, icon }) => (
                                <NavigationLink
                                    key={href}
                                    href={href}
                                    label={label}
                                    icon={icon}
                                    pathname={pathname}
                                />
                            ))}

                            {/* Candidatura Espontânea - DESATIVADA TEMPORARIAMENTE
                            {isAuthenticated && user?.user_type === 'candidate' && (
                                <SpontaneousApplicationButton
                                    canClickJobStart={canClickJobStart}
                                    onClick={handleJobStartClick}
                                />
                            )}
                            */}

                        </nav>

                        {/* Modal Candidatura Espontânea - DESATIVADO TEMPORARIAMENTE
                        {isAuthenticated && user?.user_type === 'candidate' && (
                            <JobApplicationModalStart show={jobStart} onClose={handleCloseJobStart} />
                        )}
                        */}
                        
                        {isAuthenticated ? (
                            user?.user_type === 'candidate' ? (
                                <div className="flex items-center space-x-2 ml-5">
                                    {notifications.length > 0 && (
                                        <div className="relative" ref={notifRef}>
                                            <button
                                                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                                                className="relative animate-fade p-2 text-yellow-300 hover:text-yellow-400 transition-colors"
                                            >
                                                <Bell className="w-5 h-5" />
                                                <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full animate-pulse">
                                                    {notifications.length}
                                                </span>
                                            </button>
                                            {showNotifDropdown && (
                                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-zinc-200 z-50 overflow-hidden">
                                                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50">
                                                        <span className="text-sm font-semibold text-zinc-900">Notificações</span>
                                                        <button onClick={() => setShowNotifDropdown(false)} className="text-zinc-400 hover:text-zinc-600">
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                    <div className="divide-y divide-zinc-100 max-h-80 overflow-y-auto">
                                                        {notifications.map((notif, idx) => {
                                                            const iconMap: Record<string, { icon: React.ReactNode; bg: string }> = {
                                                                profile: { icon: <Bell className="h-4 w-4 text-amber-600" />, bg: 'bg-amber-50' },
                                                                profile_approved: { icon: <CheckCircle className="h-4 w-4 text-emerald-600" />, bg: 'bg-emerald-50' },
                                                                document: { icon: <FileText className="h-4 w-4 text-red-600" />, bg: 'bg-red-50' },
                                                                process_approved: { icon: <CheckCircle className="h-4 w-4 text-green-600" />, bg: 'bg-green-50' },
                                                                process_rejected: { icon: <XCircle className="h-4 w-4 text-red-600" />, bg: 'bg-red-50' },
                                                            };
                                                            const style = iconMap[notif.icon] || iconMap.profile;
                                                            return (
                                                                <div key={idx} className="p-3">
                                                                    <div className="flex items-start gap-3">
                                                                        <div className={`p-1.5 ${style.bg} rounded-lg flex-shrink-0`}>
                                                                            {style.icon}
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="text-sm font-medium text-zinc-900">{notif.title}</p>
                                                                            <p className="text-xs text-zinc-500 mt-0.5">{notif.message}</p>
                                                                            <Link
                                                                                href={notif.link}
                                                                                onClick={() => setShowNotifDropdown(false)}
                                                                                className="inline-flex items-center gap-1 mt-1.5 text-xs font-medium text-sky-600 hover:text-sky-700"
                                                                            >
                                                                                Ver detalhes →
                                                                            </Link>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <Link href='/perfil' className="animate-fade text-zinc-200 hover:text-zinc-800 border border-zinc-100/40 px-4 py-2 rounded-md cursor-pointer text-sm duration-300 flex justify-center place-items-center gap-2 hover:bg-yellow-300">
                                        <BsPerson className="w-4 h-4" /> Meu Perfil
                                    </Link>
                                    <LogoutBtn />
                                </div>
                            ) : user?.user_type === 'admin' ? (
                                <div className="flex items-center space-x-2 ml-5">
                                    <Link href='/admin-panel' className="animate-fade text-zinc-100 hover:text-zinc-800 border border-zinc-900/40 px-4 py-2 rounded-md cursor-pointer text-sm duration-300 flex justify-center place-items-center gap-2 hover:bg-zinc-100">
                                        <BsPerson className="w-4 h-4" /> Admin Panel
                                    </Link>
                                    <LogoutBtn />
                                </div>
                            ) : <LogoutBtn />
                            ) : (
                            <Link
                                href="/login"
                                className="ml-10 animate-fade bg-yellow-300 hover:bg-yellow-300/80 text-zinc-900 px-4 py-2 rounded-md transition font-semibold flex justify-center place-items-center gap-2"
                            >
                              <BsPerson className='w-4 h-4'/>  Faça seu Login
                            </Link>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="xl:hidden mt-2">
                        <button
                            onClick={toggleMenu}
                            className="text-zinc-100 hover:text-blue-200 transition cursor-pointer"
                            aria-label="Toggle menu"
                        >
                            <X className={`w-6 h-6 absolute z-[60] top-5 right-5 ${!isMenuOpen ? 'rotate-[-60deg] pointer-events-none opacity-0' : 'rotate-0 opacity-100'} duration-300`} />
                            <Menu className={`w-6 h-6 absolute z-[60] top-5 right-5 ${isMenuOpen ? 'rotate-[60deg] pointer-events-none opacity-0' : 'rotate-0 opacity-100'} duration-300`} />
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className={`${isMenuOpen ? 'max-h-96 pb-4 mt-4' : 'max-h-0 pb-0'} xl:hidden border-t border-blue-900/20 duration-300 overflow-hidden`}>
                    <nav className="flex flex-col space-y-3 mt-4">
                        {links.map(({ href, label, icon }) => (
                            <MobileNavigationLink
                                key={href}
                                href={href}
                                label={label}
                                icon={icon}
                                pathname={pathname}
                                onClick={handleMobileMenuClose}
                            />
                        ))}

                        {/* Candidatura Espontânea Mobile - DESATIVADA TEMPORARIAMENTE
                        {isAuthenticated && user?.user_type === 'candidate' && (
                            <div className="ml-3">
                                <SpontaneousApplicationButton
                                    canClickJobStart={canClickJobStart}
                                    onClick={handleJobStartClick}
                                />
                            </div>
                        )}
                        */}

                    </nav>

                    {/* Modal Candidatura Espontânea Mobile - DESATIVADO TEMPORARIAMENTE
                    {isAuthenticated && user?.user_type === 'candidate' && (
                        <JobApplicationModalStart show={jobStart} onClose={handleCloseJobStart} />
                    )}
                    */}
                    <div className="mt-4 pt-4 border-t border-blue-900/20">
                        {isAuthenticated ? (
                            user?.user_type === 'candidate' ? (
                                <div className="animate-fade flex flex-col space-y-3">
                                    {notifications.length > 0 && (
                                        <Link
                                            href={notifications[0].link}
                                            onClick={handleMobileMenuClose}
                                            className="bg-red-500/10 text-red-400 px-4 py-2 rounded-md cursor-pointer text-sm duration-300 flex justify-center place-items-center gap-2 border border-red-500/30"
                                        >
                                            <Bell className="w-4 h-4" /> {notifications.length} notificação(ões) pendente(s)
                                        </Link>
                                    )}
                                    <Link
                                        href='/perfil'
                                        onClick={handleMobileMenuClose}
                                        className="bg-blue-700 text-yellow-400 px-4 py-2 rounded-md cursor-pointer text-sm duration-300 flex justify-center place-items-center gap-2 hover:bg-blue-800"
                                    >
                                        <BsPerson className="w-4 h-4" /> Meu Perfil
                                    </Link>
                                    <LogoutBtn />
                                </div>
                            ) : user?.user_type === 'recruiter' ? (
                                <div className="animate-fade flex flex-col space-y-3">
                                    <Link
                                        href='/admin-panel'
                                        onClick={handleMobileMenuClose}
                                        className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-md cursor-pointer text-sm duration-300 flex justify-center place-items-center gap-2"
                                    >
                                        <BsPerson className="w-4 h-4" /> Admin Panel
                                    </Link>
                                    <LogoutBtn />
                                </div>
                            ) : null
                            ) : (
                            <Link
                                href="/login"
                                onClick={handleMobileMenuClose}
                                className="animate-fade bg-gradient-to-r from-yellow-400 to-yellow-300 hover:opacity-70 text-zinc-900 px-4 py-2 rounded-md transition font-semibold flex justify-center place-items-center gap-2 w-full -mt-5"
                            >
                              <BsPerson className='w-4 h-4'/>  Faça seu Login
                            </Link>
                            )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default memo(Navbar)
