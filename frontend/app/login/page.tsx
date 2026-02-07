'use client'
import { useState, useEffect, useRef, useCallback } from "react";
import { UserRound, ArrowRight, Plus, Lock, Eye, EyeOff } from 'lucide-react'
import Swal from 'sweetalert2'
import * as Icon from 'react-bootstrap-icons';
import Image from "next/image";
import ResetPassword from './components/ResetPassword';
import { useRouter } from "next/navigation";
import AuthService from '@/services/auth';
import candidateService from '@/services/candidateService';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
    const router = useRouter()
    const { login, register } = useAuth()
    const [startLogin, setStartLogin] = useState(false);
    const [sign, setSign] = useState(true);
    const [userActive, setUserActive] = useState(false);
    const [userValue, setUserValue] = useState('');
    const [passwordActive, setPasswordActive] = useState(false);
    const [passwordValue, setPasswordValue] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [nextStep, setNextStep] = useState(false);
    const [openResetModal, setOpenResetModal] = useState(false)
    
    // Estados para os campos de cadastro
    const [createEmail, setCreateEmail] = useState('');
    const [createName, setCreateName] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createPassword2, setCreatePassword2] = useState('');
    
    // Estados para controle de loading e erros
    const [isLoading, setIsLoading] = useState(false);
    
        // Handler para Enter no login
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (sign && e.key === 'Enter') {
                handleLogin();
            }
        };
    const inputWrapperRef = useRef<HTMLDivElement>(null);
    const inputWrapperRefPassword = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const accessToken = AuthService.getAccessToken();
      if (accessToken) {
        router.push('/')
      }
    }, [router]);

    useEffect(() => {
        setStartLogin(false);
        const timer = setTimeout(() => {
            setStartLogin(true);
        }, 600);

        return () => clearTimeout(timer);
    }, [sign]);

    useEffect(() => {
        const el = document.getElementById("all");
        if (el) el.click();
    }, []);

    // Detectar autofill do navegador via animação CSS
    const handleAutoFill = useCallback((field: 'user' | 'password') => {
        const input = document.getElementById(field === 'user' ? 'user' : 'password') as HTMLInputElement;
        if (field === 'user') {
            setUserActive(true);
            if (input?.value) setUserValue(input.value);
        } else {
            setPasswordActive(true);
            if (input?.value) setPasswordValue(input.value);
        }
    }, []);

    // Fallback: verificar autofill via DOM (para primeira entrada)
    useEffect(() => {
        const checkAutofill = () => {
            const userInput = document.getElementById('user') as HTMLInputElement;
            const passwordInput = document.getElementById('password') as HTMLInputElement;
            try {
                if (userInput?.matches(':-webkit-autofill')) {
                    setUserActive(true);
                    if (userInput.value) setUserValue(userInput.value);
                }
            } catch { /* matches pode falhar em alguns browsers */ }
            try {
                if (passwordInput?.matches(':-webkit-autofill')) {
                    setPasswordActive(true);
                    if (passwordInput.value) setPasswordValue(passwordInput.value);
                }
            } catch { /* matches pode falhar em alguns browsers */ }
        };
        const timers = [100, 500, 1000, 2000].map(ms => setTimeout(checkAutofill, ms));
        return () => timers.forEach(clearTimeout);
    }, []);

    // Função para fazer login
    const handleLogin = async () => {
        // Ler valores do DOM como fallback (autofill pode não atualizar o state)
        const userInput = document.getElementById('user') as HTMLInputElement;
        const passwordInput = document.getElementById('password') as HTMLInputElement;
        const email = userValue || userInput?.value || '';
        const pass = passwordValue || passwordInput?.value || '';

        if (!email || !pass) {
            Swal.fire({
                icon: "error",
                title: "Está faltando algo?",
                text: "Por favor, preencha todos os campos.",
                theme: 'light',
            });
            return;
        }

        setIsLoading(true);

        try {
            // Usar o hook useAuth para login
            const result = await login({ email: email, password: pass });

            Swal.fire({
                icon: "success",
                title: "Login bem sucedido!",
                text: "Seja bem-vindo.",
                theme: 'light',
            });

            // Verificar se é candidato e se tem perfil
            const storedUser = AuthService.getUser();
            if (storedUser?.user_type === 'candidate') {
                try {
                    // Tenta buscar o perfil do candidato
                    await candidateService.getCandidateProfile();
                    // Se tem perfil, vai para home
                    router.push('/');
                } catch {
                    // Se não tem perfil, vai para criar
                    router.push('/perfil/criar');
                }
            } else {
                // Não é candidato, vai para home
                router.push('/');
            }

        } catch (error) {
            Swal.fire({
                icon: "error",
                title: "Login Inválido!",
                text: "Usuário ou senha incorretos.",
                theme: 'light',
            });
            console.error('Erro no login:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Função para fazer registro
    const handleRegister = async () => {

        if (!createEmail || !createName || !createPassword || !createPassword2) {
            Swal.fire({
                icon: "error",
                title: "Dados inválidos!",
                text: "Preencha todos os campos corretamente.",
                theme: 'light',
            });
            return;
        }

        if (createPassword !== createPassword2) {
            Swal.fire({
                icon: "error",
                title: "Senha inválida!",
                text: "As senhas não são as mesmas.",
                theme: 'light',
            });
            return;
        }

        // Validação de senha forte (mínimo 8 caracteres para compatibilidade com Django)
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
        if (!passwordRegex.test(createPassword)) {
            Swal.fire({
                icon: "error",
                title: "Senha inválida!",
                text: "A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula e um caractere especial.",
                theme: 'light',
            });
            return;
        }

        setIsLoading(true);

        try {
            // Usar o hook useAuth para registro
            await register({
                email: createEmail,
                name: createName,
                password: createPassword,
                password2: createPassword2
            });

            // Fazer login automático após registro
            await login({ email: createEmail, password: createPassword });

            Swal.fire({
                icon: "success",
                title: "Conta criada com sucesso!",
                text: "Vamos completar seu perfil.",
                theme: 'light',
            });

            // Redirecionar direto para o wizard de criação de perfil
            router.push('/perfil/criar');
        } catch (error: unknown) {
            const apiError = error as { response?: { data?: { email?: string[] } } };
            
            // Verifica se o erro é do tipo de e-mail já existente
            if (apiError?.response?.data?.email && Array.isArray(apiError.response.data.email)) {
                if (apiError.response.data.email.includes("user profile com este E-mail já existe.")) {
                    Swal.fire({
                        icon: "error",
                        title: "E-mail já cadastrado!",
                        text: "Já existe um usuário com este e-mail.",
                        theme: 'light',
                    });
                    setIsLoading(false);
                    return;
                }
            }
            
            Swal.fire({
                icon: "error",
                title: "Algo deu errado!",
                text: "Tente novamente mais tarde.",
                theme: 'light',
            });
            console.error('Erro no registro:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Usar useCallback para estabilizar as funções de event handler
    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (inputWrapperRef.current && !inputWrapperRef.current.contains(event.target as Node)) {
            setUserActive(false);                
        }
        if (inputWrapperRefPassword.current && !inputWrapperRefPassword.current.contains(event.target as Node)) {
            setPasswordActive(false);                
        }
    }, []);

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [handleClickOutside]);

    // Estabilizar os handlers de input
    const handleUserInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setUserValue(e.target.value);
    }, []);

    const handlePasswordInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setPasswordValue(e.target.value);
    }, []);

    const handleUserInputClick = useCallback(() => {
        setUserActive(true);
    }, []);

    const handlePasswordInputClick = useCallback(() => {
        setPasswordActive(true);
    }, []);

    const togglePasswordVisibility = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);

    const toggleSign = useCallback(() => {
        setSign(prev => !prev);
        setNextStep(false);
        // Limpar os campos e mensagens
        setCreateEmail('');
        setCreateName('');
        setCreatePassword('');
        setCreatePassword2('');
        setUserValue('');
        setPasswordValue('');
    }, []);

    // Handlers para os campos de cadastro
    const handleCreateEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateEmail(e.target.value);
    }, []);

    const handleCreateNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateName(e.target.value);
    }, []);

    const handleCreatePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCreatePassword(e.target.value);
    }, []);

    const handleCreatePassword2Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCreatePassword2(e.target.value);
    }, []);

    // Função para validar e avançar para o próximo passo
    const handleNextStep = useCallback(() => {
        if (createEmail.trim() !== '' && createName.trim() !== '') {
            setNextStep(true);
        }
    }, [createEmail, createName]);

    // Verificar se os campos estão preenchidos
    const canProceed = createEmail.trim() !== '' && createName.trim() !== '';

    return(
            <div className={`min-h-screen w-full bg-zinc-100 flex justify-center items-center duration-300`}>

                <ResetPassword isOpen={openResetModal} ></ResetPassword>

                <a href="https://www.chiaperini.com.br/" target="_blank" className='hover:opacity-60 fixed top-4 left-5 flex gap-x-2 duration-300'>
                    <Image width={300} height={100} src="https://raw.githubusercontent.com/Chiaperini-TI/Chiaperini-TI/main/chiaperini.png" alt="Logo Chiaperini" className="w-32 m-auto mb-4 animate-fade-down animate-delay-[100ms] inline"/>
                </a>

                <div className="inline" id="all">
                    <div className=' rounded-md border-zinc-400 w-80 2xl:w-96 pt-16 pb-20 mb-7 z-10 relative mt-[-1rem] animate-fade-down px-4 overflow-hidden duration-300'>
                        <div className="mb-7 bg-transparent absolute top-0 left-0 w-full pt-5 text-2xl text-zinc-200 text-center flex justify-center place-items-center">
                            <div className="borde r border-zinc-400 w-[27rem] h-44 rounded-[100%] top-[-4.5rem] -translate-x-1/2 left-1/2 absolute"></div>
                            <label className="text-2xl animate-fade-down font-bold text-blue-950 quicksand">Banco de Talentos </label>
                        </div>
                        <div className="flex justify-center place-items-center">
                            <Icon.PersonFill className={`text-center w-14 h-14 ${startLogin ? 'ml-[-2rem]' : 'ml-0'} text-blue-950 duration-300`}/>
                            <ArrowRight className={`${sign && startLogin ? 'opacity-100' : 'opacity-0'} absolute text-center w-8 h-8 ml-[3rem] duration-300 text-zinc-600`}/>
                            <Plus className={`${sign ? 'opacity-0' : 'opacity-100 delay-700'} absolute text-center w-10 h-10 ml-[3rem] duration-300 text-zinc-600`}/>
                        </div>
                        <div className="flex justify-center">
                            <h1 className={`text-zinc-600 font-bold text-center text-lg mb-2 mt-1 animate-fade-down animate-duration-[400ms] ${sign ? 'ml-[-1.7rem]' : 'ml-[-3rem]'} duration-300`}>
                                Faça seu
                            </h1>
                            <h1 className={`text-blue-950 w-10 font-bold text-left pl-2 text-lg mb-2 mt-1 ${sign ? 'animate-fade-down':'animate-fade-up'} animate-duration-[400ms]`}>
                                {sign ? 'Login' : 'Cadastro'}
                            </h1>
                        </div>

                        <div className={`h-14 w-full relative ${sign ? 'opacity-100 animate-fade animate-delay-[300ms]' : 'opacity-0 pointer-events-none'}`}>
                            <label htmlFor="user" className={`ml-1 absolute z-20 ${userActive || userValue.length !== 0 ?'left-1 top-0 text-sm text-blue-950':'left-10 top-6 text-base text-zinc-700'} duration-300`}>E-mail</label>
                            <div className="absolute bottom-0 overflow-hidden pl-1 pr-2 w-full" ref={inputWrapperRef}>
                                <div className="flex place-items-center border-b border-zinc-400">
                                    <label htmlFor="user" className="absolute left-1 top-0">
                                        <UserRound className={`h-9 text-xl w-9 p-2 absolute top-0 text-zinc-500 ${userActive?'opacity-0':'opacity-100'} duration-300`}/>
                                        <UserRound className={`h-9 text-xl w-9 p-2 absolute top-0 ${userActive?'opacity-100':'opacity-0'} duration-300`} style={{color: '#173a70'}}/>
                                    </label>
                                    <input
                                        id="user"
                                        value={userValue}
                                        type="email"
                                        className="focus:outline-0 focus:ring-0 w-full h-9 pl-9 pr-2 text-zinc-900 bg-transparent"
                                        onChange={handleUserInputChange}
                                        onClick={handleUserInputClick}
                                        onAnimationStart={(e) => { if (e.animationName === 'onAutoFillStart') handleAutoFill('user'); }}
                                        disabled={isLoading}
                                        onKeyDown={handleKeyDown}
                                    />
                                </div>
                                <div className={`${userActive?'w-full':'w-0'} m-auto duration-300 h-[2px] bg-gradient-to-r from-blue-800 to-blue-400`}></div>
                            </div>
                        </div>

                        <div className={`h-14 w-full relative mt-3 ${sign ? 'opacity-100 animate-fade animate-delay-[500ms]' : 'opacity-0 pointer-events-none'}`}>
                            <label htmlFor="password" className={`ml-1 absolute z-20 ${passwordActive || passwordValue.length !== 0 ?'left-1 top-0 text-sm text-blue-950':'left-10 top-6 text-base text-zinc-700'} duration-300`}>Senha</label>
                            <div className="absolute bottom-0 overflow-hidden pl-1 pr-2 w-full" ref={inputWrapperRefPassword}>
                                <div className="flex place-items-center border-b border-zinc-400">
                                    <label htmlFor="password" className="absolute left-1 top-0">
                                        <Lock className={`h-9 text-xl w-9 p-2 absolute top-0 text-zinc-500 ${passwordActive?'opacity-0':'opacity-100'} duration-300`}/>
                                        <Lock className={`h-9 text-xl w-9 p-2 absolute top-0 ${passwordActive?'opacity-100':'opacity-0'} duration-300`} style={{color: '#173a70'}}/>
                                    </label>
                                    <input
                                        id="password"
                                        value={passwordValue}
                                        type={showPassword ? "text" : "password"}
                                        className="focus:outline-0 focus:ring-0 w-full h-9 px-9 text-zinc-900 bg-transparent"
                                        onChange={handlePasswordInputChange}
                                        onClick={handlePasswordInputClick}
                                        onAnimationStart={(e) => { if (e.animationName === 'onAutoFillStart') handleAutoFill('password'); }}
                                        disabled={isLoading}
                                        onKeyDown={handleKeyDown}
                                    />
                                    <Eye className={`h-9 text-xl w-9 p-2 text-blue-400 absolute right-1 ${showPassword?'opacity-100':'opacity-0 pointer-events-none'} duration-300 cursor-pointer`} onClick={togglePasswordVisibility}/>
                                    <EyeOff className={`h-9 text-xl w-9 p-2 text-zinc-500 absolute right-1 ${showPassword?'opacity-0 pointer-events-none':'opacity-100'} duration-300 cursor-pointer`} onClick={togglePasswordVisibility}/>
                                </div>
                                <div className={`${passwordActive?'w-full':'w-0'} m-auto duration-300 h-[2px] bg-gradient-to-r from-blue-800 to-blue-400`}></div>
                            </div>
                        </div>

                        <p className={`${sign ? 'opacity-100 animate-fade-up' : 'opacity-0 pointer-events-none'} mt-2 text-center text-base font-bold cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-950 to-blue-700 hover:from-blue-800 hover:to-blue-400`} onClick={()=>setOpenResetModal(true)}>Esqueci minha senha</p>

                        <div className={`w-full h-40 absolute left-0 top-48 px-6 ${sign ? 'opacity-0 pointer-events-none' : nextStep ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                            <div className={`${sign ? 'opacity-0 pointer-events-none' : 'animate-fade-up animate-delay-[100ms]'}`}>
                                <label htmlFor="create-email" className="text-zinc-700">E-mail</label>
                                <input 
                                    id="create-email" 
                                    type="email" 
                                    placeholder="Digite aqui e-mail..." 
                                    className="text-zinc-800 w-full h-10 bg-transparent -mt-2 mb-4 border-b border-zinc-700 focus:border-blue-400 focus:outline-none" 
                                    value={createEmail}
                                    onChange={handleCreateEmailChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={`${sign ? 'opacity-0 pointer-events-none' : 'animate-fade-up animate-delay-[200ms]'}`}>
                                <label htmlFor="create-name" className="text-zinc-700">Nome</label>
                                <input 
                                    id="create-name" 
                                    type="text" 
                                    placeholder="Digite aqui seu nome..." 
                                    className="text-zinc-800 w-full h-10 bg-transparent -mt-2 mb-4 border-b border-zinc-700 focus:border-blue-400 focus:outline-none"
                                    value={createName}
                                    onChange={handleCreateNameChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={`${sign ? 'opacity-0 pointer-events-none' : 'animate-fade-up animate-delay-[300ms]'} mt-3 group ${canProceed ? 'cursor-pointer' : 'cursor-not-allowed'}`} onClick={handleNextStep}>
                                <p className={`flex gap-1 justify-center m-auto text-center duration-300 ${canProceed ? 'text-zinc-900 opacity-60 hover:opacity-100' : 'text-zinc-500 opacity-40'}`}>
                                    Próximo <ArrowRight/>
                                </p>
                                <div className={`w-0 m-auto h-[1px] duration-300 ${canProceed ? 'group-hover:w-[42%] bg-zinc-700' : 'bg-zinc-500'}`}></div>
                            </div>
                        </div>

                        <div className={`w-full h-40 absolute left-0 top-48 px-6 ${sign ? 'opacity-0 pointer-events-none' : nextStep ? 'animate-fade-up' : 'opacity-0 pointer-events-none'}`}>
                            <div className={`${sign ? 'opacity-0 pointer-events-none' : 'animate-fade-up animate-delay-[100ms]'}`}>
                                <label htmlFor="create-password1" className="text-zinc-400">Senha</label>
                                <input 
                                    id="create-password1" 
                                    type="password" 
                                    placeholder="Digite sua senha..." 
                                    className="text-zinc-800 w-full h-10 bg-transparent -mt-2 mb-4 border-b border-zinc-700 focus:border-blue-400 focus:outline-none"
                                    value={createPassword}
                                    onChange={handleCreatePasswordChange}
                                    disabled={isLoading}
                                />
                            </div>

                            <div className={`${sign ? 'opacity-0 pointer-events-none' : 'animate-fade-up animate-delay-[200ms]'}`}>
                                <label htmlFor="create-password2" className="text-zinc-400">Confirmar Senha</label>
                                <input 
                                    id="create-password2" 
                                    type="password" 
                                    placeholder="Confirme sua senha..." 
                                    className="text-zinc-800 w-full h-10 bg-transparent -mt-2 mb-4 border-b border-zinc-700 focus:border-blue-400 focus:outline-none"
                                    value={createPassword2}
                                    onChange={handleCreatePassword2Change}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className={`${sign ? 'opacity-100 animate-fade-up' : 'opacity-0 pointer-events-none'} animate-duration-[500ms] absolute w-[85%] -translate-x-1/2 left-1/2 duration-300`}>
                            <div 
                                className={`bg-gradient-to-r from-blue-950 to-blue-900 border border-zinc-400 text-zinc-100 w-full h-10 flex justify-center place-items-center mt-5 font-bold duration-300 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-60 cursor-pointer'}`}
                                onClick={!isLoading ? handleLogin : undefined}
                            >
                                {isLoading ? 'Carregando...' : 'Login'}
                            </div>
                        </div>

                        <div className={`${sign ? 'opacity-0 pointer-events-none' : nextStep ? 'animate-fade-up' : 'opacity-0 pointer-events-none'} animate-duration-[500ms] absolute w-[85%] -translate-x-1/2 left-1/2 mt-4 duration-300`}>
                            <div 
                                className={`bg-gradient-to-r from-zinc-300 to-zinc-100 border border-zinc-400 text-zinc-800 w-full h-10 flex justify-center place-items-center mt-5 font-bold duration-300 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-60 cursor-pointer'}`}
                                onClick={!isLoading ? handleRegister : undefined}
                            >
                                {isLoading ? 'Carregando...' : 'Criar Usuário'}
                            </div>
                        </div>

                    </div>

                    <div className={`absolute cursor-pointer -translate-1/2 left-1/2 w-auto text-center h-10 m-auto text-zinc-800 text-sm ${sign ? 'mt-[1rem] animate-fade-up opacity-100' : 'mt-[-3rem] opacity-0'} duration-500`} onClick={toggleSign}>
                        Não tem uma conta?<br/> 
                        <label className="text-base font-bold cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-950 to-blue-700 hover:from-blue-800 hover:to-blue-400">Criar conta</label>
                    </div>

                    <div className={`absolute cursor-pointer -translate-1/2 left-1/2 w-auto text-center h-10 m-auto text-zinc-800 text-sm ${!sign ? 'mt-[1rem] animate-fade-up opacity-100' : 'mt-[-3rem] opacity-0'} duration-500`} onClick={toggleSign}>
                        Já possui um login?<br/> 
                        <label className="text-base font-bold cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-950 to-blue-700 hover:from-blue-800 hover:to-blue-400">Faça seu Login</label>
                    </div>
                </div>
                
            </div>
    )
}