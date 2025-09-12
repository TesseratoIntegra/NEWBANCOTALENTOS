'use client'
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import Swal from 'sweetalert2'
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import * as Icon from 'react-bootstrap-icons'
import Link from 'next/link';

type PasswordField = 'new_password1' | 'new_password2';

export default function ResetPass() {
    const searchParams = useSearchParams();
    const uid = searchParams.get('uid')?.padEnd(4, '=');
    const token = searchParams.get('token');
    const router = useRouter();

    useEffect(() => {
        if (!uid || !token) {
            router.push('/login');
        }
    }, [uid, token]);
    
    const [passwords, setPasswords] = useState({
        new_password1: '',
        new_password2: ''
    });
    
    const [showPassword, setShowPassword] = useState({
        new_password1: false,
        new_password2: false
    });
    
    const [loading, setLoading] = useState(false);
    
    const handleInputChange = (field: PasswordField, value: string) => {
        setPasswords(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    const togglePasswordVisibility = (field: PasswordField) => {
        setShowPassword(prev => ({
            ...prev,
            [field]: !prev[field]
        }));
    };
    
    const validatePasswords = () => {
        if (!passwords.new_password1 || !passwords.new_password2) {
            Swal.fire({
                icon: "error",
                title: "Está faltando algo?",
                text: "Por favor, preencha ambos os campos de senha.",
                theme: 'light',
            });
            return false;
        }
        if (passwords.new_password1 !== passwords.new_password2) {
            Swal.fire({
                icon: "error",
                title: "Senhas não coincidem",
                text: "As senhas não coincidem.",
                theme: 'light',
            });
            return false;
        }
        if (passwords.new_password1.length < 8) {
            Swal.fire({
                icon: "error",
                title: "Senha muito curta",
                text: "A senha deve ter pelo menos 8 caracteres.",
                theme: 'light',
            });
            return false;
        }
        return true;
    };
    
    const handleSubmit = async () => {
        if (!validatePasswords()) return;

        setLoading(true);

        const payload = {
            uid: uid,
            token: token,
            new_password1: passwords.new_password1,
            new_password2: passwords.new_password2
        };

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/accounts/password/reset/confirm/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: "success",
                    title: "Senha redefinida com sucesso!",
                    text: "Você pode fazer login com sua nova senha.",
                    theme: 'light',
                });
                router.push('/login')
                setPasswords({ new_password1: '', new_password2: '' });
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Erro ao redefinir senha",
                    text: data.detail || "Erro ao redefinir senha. Tente novamente, ou solicite um novo link.",
                    theme: 'light',
                });
            }
        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: "error",
                title: "Erro de conexão",
                text: "Erro de conexão. Verifique sua internet e tente novamente.",
                theme: 'light',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen w-full bg-zinc-100 flex justify-center items-center duration-300`}>
            <a href="https://www.chiaperini.com.br/" target="_blank" className='hover:opacity-60 fixed top-4 left-5 flex gap-x-2 duration-300'>
                <Image width={300} height={100} src="https://raw.githubusercontent.com/Chiaperini-TI/Chiaperini-TI/main/chiaperini.png" alt="Logo Chiaperini" className="w-32 m-auto mb-4 animate-fade-down animate-delay-[100ms] inline"/>
            </a>
            <div className="inline" id="all">
                <div className='rounded-md border-zinc-400 w-80 2xl:w-96 pt-16 pb-20 mb-7 z-10 relative mt-[-1rem] animate-fade-down px-4 overflow-hidden duration-300'>
                    <div className="mb-7 bg-transparent absolute top-0 left-0 w-full pt-5 text-2xl text-zinc-200 text-center flex justify-center place-items-center">
                        <div className="w-[27rem] h-44 rounded-[100%] top-[-4.5rem] -translate-x-1/2 left-1/2 absolute"></div>
                        <label className="text-2xl animate-fade-down font-bold text-blue-950 quicksand">Banco de Talentos </label>
                    </div>
                    <div className="flex justify-center place-items-center">
                        <Icon.PersonFillLock className={`text-center w-14 h-14 text-blue-950 duration-300`}/>
                    </div>
                    <div className="flex justify-center">
                        <h1 className={`text-zinc-600 font-bold text-center text-lg mb-2 mt-1 animate-fade-down animate-duration-[400ms] ml-[-1.7rem] duration-300`}>
                            Redefina sua
                        </h1>
                        <h1 className={`text-blue-950 w-10 font-bold text-left pl-2 text-lg mb-2 mt-1 animate-fade-up animate-duration-[400ms]`}>
                            Senha
                        </h1>
                    </div>
                    <div className={`h-14 w-full relative animate-fade animate-delay-[300ms]`}>
                        <div className="absolute bottom-0 overflow-hidden pl-1 pr-2 w-full">
                            <div className="flex place-items-center border-b border-zinc-400">
                                <input
                                    id="new_password1"
                                    type={showPassword.new_password1 ? 'text' : 'password'}
                                    value={passwords.new_password1}
                                    onChange={(e) => handleInputChange('new_password1', e.target.value)}
                                    className="focus:outline-0 focus:ring-0 w-full h-9 pl-2 pr-2 text-zinc-900 bg-transparent"
                                    placeholder="Digite sua nova senha"
                                    required
                                    disabled={loading}
                                />
                                <Eye className={`h-9 text-xl w-9 p-2 text-blue-400 absolute right-1 ${showPassword.new_password1?'opacity-100':'opacity-0 pointer-events-none'} duration-300 cursor-pointer`} onClick={() => togglePasswordVisibility('new_password1')}/>
                                <EyeOff className={`h-9 text-xl w-9 p-2 text-zinc-500 absolute right-1 ${showPassword.new_password1?'opacity-0 pointer-events-none':'opacity-100'} duration-300 cursor-pointer`} onClick={() => togglePasswordVisibility('new_password1')}/>
                            </div>
                            <div className={`w-full m-auto duration-300 h-[2px] bg-gradient-to-r from-blue-800 to-blue-400`}></div>
                        </div>
                    </div>
                    <div className={`h-14 w-full relative mt-3 animate-fade animate-delay-[500ms]`}>
                        <div className="absolute bottom-0 overflow-hidden pl-1 pr-2 w-full">
                            <div className="flex place-items-center border-b border-zinc-400">
                                <input
                                    id="new_password2"
                                    type={showPassword.new_password2 ? 'text' : 'password'}
                                    value={passwords.new_password2}
                                    onChange={(e) => handleInputChange('new_password2', e.target.value)}
                                    className="focus:outline-0 focus:ring-0 w-full h-9 pl-2 pr-2 text-zinc-900 bg-transparent"
                                    placeholder="Confirme sua nova senha"
                                    required
                                    disabled={loading}
                                />
                                <Eye className={`h-9 text-xl w-9 p-2 text-blue-400 absolute right-1 ${showPassword.new_password2?'opacity-100':'opacity-0 pointer-events-none'} duration-300 cursor-pointer`} onClick={() => togglePasswordVisibility('new_password2')}/>
                                <EyeOff className={`h-9 text-xl w-9 p-2 text-zinc-500 absolute right-1 ${showPassword.new_password2?'opacity-0 pointer-events-none':'opacity-100'} duration-300 cursor-pointer`} onClick={() => togglePasswordVisibility('new_password2')}/>
                            </div>
                            <div className={`w-full m-auto duration-300 h-[2px] bg-gradient-to-r from-blue-800 to-blue-400`}></div>
                        </div>
                    </div>
                    {passwords.new_password1 && (
                        <div className="space-y-2 mt-4">
                            <div className="text-sm text-zinc-800">Requisitos da senha:</div>
                            <div className="space-y-1">
                                <div className={`text-xs flex items-center space-x-2 ${passwords.new_password1.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}> 
                                    <div className={`w-2 h-2 rounded-full ${passwords.new_password1.length >= 8 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <span className='text-zinc-700'>Pelo menos 8 caracteres</span>
                                </div>
                                <div className={`text-xs flex items-center space-x-2 ${passwords.new_password1 === passwords.new_password2 && passwords.new_password2 ? 'text-green-600' : 'text-gray-400'}`}>
                                    <div className={`w-2 h-2 rounded-full ${passwords.new_password1 === passwords.new_password2 && passwords.new_password2 ? 'bg-green-500' : 'bg-gray-400'}`} />
                                    <span className='text-zinc-700'>Senhas coincidem</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className={`animate-fade-up animate-duration-[500ms] absolute w-[85%] -translate-x-1/2 left-1/2 duration-300`}>
                        <div 
                            className={`bg-gradient-to-r from-zinc-300 to-zinc-100 border border-zinc-400 text-zinc-800 w-full h-10 flex justify-center place-items-center mt-5 font-bold duration-300 rounded-md ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-60 cursor-pointer'}`}
                            onClick={!loading ? handleSubmit : undefined}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    <span>Redefinindo...</span>
                                </div>
                            ) : (
                                'Redefinir Senha'
                            )}
                        </div>
                    </div>
                    <div className="mt-6 text-center absolute w-full left-0 -bottom-10">
                        <p className="text-sm text-gray-600">
                            Lembrou sua senha?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                Fazer login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}