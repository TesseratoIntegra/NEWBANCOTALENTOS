'use client'
import { useAuth } from '@/contexts/AuthContext';
import * as Icon from 'react-bootstrap-icons'

export default function LogoutBtn(){
    const { logout } = useAuth();

    const handleLogout = async () => {
        if (!confirm('Tem certeza que deseja sair?')) {
            return;
        }else{
            await logout();
            window.location.href = '/login';
        }
    }

    return(
        <button 
            onClick={handleLogout}
            className='text-sm text-center justify-center bg-red-500 text-white lg:bg-zinc-200 hover:bg-red-600/90 hover:text-white lg:text-zinc-800 px-4 py-2 rounded-md flex items-center gap-2 transition duration-300 cursor-pointer'
        >
            <Icon.ArrowLeft className="w-4 h-4" /> 
            Sair
        </button>
    )
}