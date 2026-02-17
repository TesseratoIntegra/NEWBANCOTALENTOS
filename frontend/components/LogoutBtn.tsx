'use client'

import { useAuth } from '@/contexts/AuthContext';
import { ArrowLeft } from 'react-bootstrap-icons';
import { useState } from 'react';
import ConfirmLogoutModal from './ConfirmLogoutModal';

export default function LogoutBtn() {
    const { logout } = useAuth();
    const [showModal, setShowModal] = useState(false);

    const handleLogout = async () => {
        await logout();
        window.location.href = '/login';
    };

    return (
        <>
            <ConfirmLogoutModal
                show={showModal}
                onConfirm={() => { setShowModal(false); handleLogout(); }}
                onCancel={() => setShowModal(false)}
            />
            <button
                onClick={() => setShowModal(true)}
                className='text-sm text-center justify-center bg-white/5 border border-red-400/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 lg:ml-7 lg:bg-zinc-200 lg:border-transparent lg:text-zinc-800 lg:hover:bg-red-600/90 lg:hover:text-white px-4 py-2.5 rounded-lg lg:rounded-md flex items-center gap-2 transition duration-300 cursor-pointer w-full lg:w-auto'
            >
                <ArrowLeft className="w-4 h-4" />
                Sair
            </button>

        </>
    );
}