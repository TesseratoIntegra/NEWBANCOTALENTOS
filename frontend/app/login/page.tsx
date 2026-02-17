'use client'
import { useState, useEffect, useRef, useCallback } from "react";
import { UserRound, ArrowRight, Plus, Lock, Eye, EyeOff, Briefcase, User, Clock, MessageCircle, ArrowLeft, Building2, Phone, MapPin } from 'lucide-react'
import Swal from 'sweetalert2'
import { PersonFill } from 'react-bootstrap-icons';
import Image from "next/image";
import ResetPassword from './components/ResetPassword';
import { useRouter } from "next/navigation";
import AuthService from '@/services/auth';
import candidateService from '@/services/candidateService';
import { useAuth } from '@/contexts/AuthContext';

const BRAZILIAN_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS',
    'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC',
    'SP', 'SE', 'TO'
];

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
    const [createLastName, setCreateLastName] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createPassword2, setCreatePassword2] = useState('');
    
    // Estado para tipo de conta no registro
    const [selectedUserType, setSelectedUserType] = useState<'candidate' | 'recruiter' | null>(null);
    // Estado para trial expirado
    const [trialExpired, setTrialExpired] = useState(false);
    // Estado para step de dados da empresa (recrutador)
    const [showCompanyStep, setShowCompanyStep] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [companyPhone, setCompanyPhone] = useState('');
    const [companyCity, setCompanyCity] = useState('');
    const [companyState, setCompanyState] = useState('');

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

            // Verificar se o trial expirou
            const storedUser = AuthService.getUser();
            if (storedUser?.is_trial_expired) {
                setTrialExpired(true);
                setIsLoading(false);
                return;
            }

            Swal.fire({
                icon: "success",
                title: "Login bem sucedido!",
                text: "Seja bem-vindo.",
                theme: 'light',
            });

            // Verificar se é candidato e se tem perfil
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
            } else if (storedUser?.user_type === 'recruiter') {
                // Recrutador vai para admin-panel
                router.push('/admin-panel');
            } else {
                // Outro tipo, vai para home
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
            const userType = selectedUserType || 'candidate';

            // Usar o hook useAuth para registro
            const registerData: Record<string, string> = {
                email: createEmail,
                name: createName,
                last_name: createLastName,
                password: createPassword,
                password2: createPassword2,
                user_type: userType,
            };

            if (userType === 'recruiter') {
                registerData.company_name = companyName;
                registerData.phone = companyPhone;
                registerData.city = companyCity;
                registerData.state = companyState;
            }

            await register(registerData as any);

            // Fazer login automático após registro
            await login({ email: createEmail, password: createPassword });

            if (userType === 'recruiter') {
                Swal.fire({
                    icon: "success",
                    title: "Conta trial criada!",
                    text: "Bem-vindo ao painel de recrutamento. Você tem 3 dias para testar.",
                    theme: 'light',
                });
                router.push('/admin-panel');
            } else {
                Swal.fire({
                    icon: "success",
                    title: "Conta criada com sucesso!",
                    text: "Vamos completar seu perfil.",
                    theme: 'light',
                });
                router.push('/perfil/criar');
            }
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
        setSelectedUserType(null);
        setTrialExpired(false);
        setShowCompanyStep(false);
        // Limpar os campos e mensagens
        setCreateEmail('');
        setCreateName('');
        setCreateLastName('');
        setCreatePassword('');
        setCreatePassword2('');
        setCompanyName('');
        setCompanyPhone('');
        setCompanyCity('');
        setCompanyState('');
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

    const handleCreateLastNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCreateLastName(e.target.value);
    }, []);

    const handleCreatePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCreatePassword(e.target.value);
    }, []);

    const handleCreatePassword2Change = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setCreatePassword2(e.target.value);
    }, []);

    // Máscara de telefone brasileiro
    const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length > 11) value = value.slice(0, 11);
        if (value.length > 7) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        setCompanyPhone(value);
    }, []);

    // Função para validar e avançar para o próximo passo
    const handleNextStep = useCallback(() => {
        if (createEmail.trim() !== '' && createName.trim() !== '') {
            if (selectedUserType === 'recruiter') {
                setShowCompanyStep(true);
            } else {
                setNextStep(true);
            }
        }
    }, [createEmail, createName, selectedUserType]);

    // Avançar do step de empresa para senha
    const handleCompanyNext = useCallback(() => {
        if (companyName.trim() && companyPhone.trim() && companyCity.trim() && companyState) {
            setNextStep(true);
        }
    }, [companyName, companyPhone, companyCity, companyState]);

    // Verificar se os campos estão preenchidos
    const canProceed = createEmail.trim() !== '' && createName.trim() !== '';

    // Tela de trial expirado
    if (trialExpired) {
        return (
            <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 to-slate-900 flex justify-center items-center px-4">
                <div className="max-w-md w-full">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 text-center">
                        <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
                            <Clock className="w-8 h-8 text-amber-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2 quicksand">Período de teste expirado</h2>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Seu acesso gratuito de 3 dias chegou ao fim. Para continuar usando a plataforma completa de recrutamento, entre em contato com nossa equipe.
                        </p>
                        <a
                            href="https://wa.me/5516992416689?text=Olá! Meu trial do Banco de Talentos expirou e gostaria de continuar usando a plataforma."
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-center gap-2 w-full py-3 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors mb-3"
                        >
                            <MessageCircle className="w-5 h-5" />
                            Falar no WhatsApp
                        </a>
                        <button
                            onClick={() => { setTrialExpired(false); AuthService.logout(); router.push('/'); }}
                            className="text-slate-500 hover:text-white text-sm transition-colors"
                        >
                            Voltar ao site
                        </button>
                    </div>
                    <div className="text-center mt-6">
                        <Image src="/img/logo.png" width={120} height={40} alt="Tesserato" className="mx-auto opacity-30" />
                    </div>
                </div>
            </div>
        );
    }

    return(
            <div className="min-h-screen w-full bg-zinc-100 flex justify-center items-center duration-300">

                <ResetPassword isOpen={openResetModal} ></ResetPassword>

                <a href="https://tesseratointegra.com.br/" target="_blank" className='hover:opacity-60 fixed top-4 left-5 flex gap-x-2 duration-300'>
                    <Image width={300} height={100} src="/img/logo-dark.png" alt="Tesserato Integra" className="w-32 m-auto mb-4 animate-fade-down animate-delay-[100ms] inline"/>
                </a>

                <div id="all">
                    <div className='rounded-md w-80 2xl:w-96 pt-16 pb-6 z-10 relative animate-fade-down px-4 duration-300'>
                        {/* Header decorativo */}
                        <div className="mb-7 bg-transparent absolute top-0 left-0 w-full pt-5 text-2xl text-zinc-200 text-center flex justify-center place-items-center">
                            <div className="w-[27rem] h-44 rounded-[100%] top-[-4.5rem] -translate-x-1/2 left-1/2 absolute"></div>
                            <label className="text-2xl animate-fade-down font-bold text-blue-950 quicksand">Banco de Talentos</label>
                        </div>

                        {/* Icone e titulo */}
                        <div className="flex justify-center place-items-center">
                            <PersonFill className={`text-center w-14 h-14 ${startLogin ? 'ml-[-2rem]' : 'ml-0'} text-blue-950 duration-300`}/>
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

                        {/* Container dos modos - apenas o ativo ocupa espaco */}
                        <div className="relative">

                            {/* === MODO LOGIN === */}
                            <div className={`${sign ? 'duration-300' : 'absolute inset-x-0 top-0 opacity-0 pointer-events-none duration-300'}`}>
                                <div className={`h-14 w-full relative ${sign ? 'animate-fade animate-delay-[300ms]' : ''}`}>
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

                                <div className={`h-14 w-full relative mt-3 ${sign ? 'animate-fade animate-delay-[500ms]' : ''}`}>
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

                                <p className={`${sign ? 'animate-fade-up' : ''} mt-2 text-center text-base font-bold cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-950 to-blue-700 hover:from-blue-800 hover:to-blue-400`} onClick={()=>setOpenResetModal(true)}>Esqueci minha senha</p>

                                <div className="mt-5">
                                    <div
                                        className={`bg-gradient-to-r from-blue-950 to-blue-900 border border-zinc-400 text-zinc-100 w-full h-10 flex justify-center place-items-center font-bold duration-300 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-60 cursor-pointer'}`}
                                        onClick={!isLoading ? handleLogin : undefined}
                                    >
                                        {isLoading ? 'Carregando...' : 'Login'}
                                    </div>
                                </div>
                            </div>

                            {/* === MODO CADASTRO === */}
                            <div className={`${!sign ? 'duration-300' : 'absolute inset-x-0 top-0 opacity-0 pointer-events-none duration-300'}`}>
                                {!selectedUserType ? (
                                    /* Step 0: Escolha do tipo de conta */
                                    <div className="px-2 animate-fade-up">
                                        <p className="text-zinc-500 text-sm text-center mb-4">Escolha o tipo de conta</p>
                                        <div className="flex flex-col gap-3">
                                            <div
                                                className="border-2 border-zinc-300 hover:border-blue-500 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-blue-50/50 group"
                                                onClick={() => setSelectedUserType('candidate')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                                                        <User className="w-5 h-5 text-blue-700" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-zinc-800 text-sm">Candidato</span>
                                                            <span className="text-[10px] font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Gratuito</span>
                                                        </div>
                                                        <p className="text-zinc-500 text-xs mt-0.5">Cadastre-se para se candidatar a vagas</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div
                                                className="border-2 border-zinc-300 hover:border-amber-500 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:bg-amber-50/50 group"
                                                onClick={() => setSelectedUserType('recruiter')}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center group-hover:bg-amber-200 transition-colors">
                                                        <Briefcase className="w-5 h-5 text-amber-700" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <span className="font-bold text-zinc-800 text-sm">Recrutador</span>
                                                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">Trial 3 dias</span>
                                                        </div>
                                                        <p className="text-zinc-500 text-xs mt-0.5">Teste a plataforma completa de recrutamento</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : !showCompanyStep && !nextStep ? (
                                    /* Step 1: Email, Nome, Sobrenome */
                                    <div className="px-2">
                                        <div className="flex items-center justify-between mb-3 animate-fade-up">
                                            <button
                                                onClick={() => setSelectedUserType(null)}
                                                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-700 transition-colors"
                                            >
                                                <ArrowLeft className="w-3.5 h-3.5" />
                                                Voltar
                                            </button>
                                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                                                selectedUserType === 'recruiter'
                                                    ? 'text-amber-700 bg-amber-100'
                                                    : 'text-blue-700 bg-blue-100'
                                            }`}>
                                                {selectedUserType === 'recruiter' ? 'Recrutador Trial' : 'Candidato'}
                                            </span>
                                        </div>
                                        <div className="animate-fade-up animate-delay-[100ms]">
                                            <label htmlFor="create-email" className="text-zinc-700 text-sm font-medium">E-mail</label>
                                            <input
                                                id="create-email"
                                                type="email"
                                                placeholder="Digite aqui e-mail..."
                                                className="text-zinc-800 w-full h-10 bg-transparent mb-4 border-b border-zinc-400 focus:border-blue-500 focus:outline-none"
                                                value={createEmail}
                                                onChange={handleCreateEmailChange}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="animate-fade-up animate-delay-[200ms]">
                                            <label htmlFor="create-name" className="text-zinc-700 text-sm font-medium">Nome</label>
                                            <input
                                                id="create-name"
                                                type="text"
                                                placeholder="Digite aqui seu nome..."
                                                className="text-zinc-800 w-full h-10 bg-transparent mb-4 border-b border-zinc-400 focus:border-blue-500 focus:outline-none"
                                                value={createName}
                                                onChange={handleCreateNameChange}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="animate-fade-up animate-delay-[250ms]">
                                            <label htmlFor="create-last-name" className="text-zinc-700 text-sm font-medium">Sobrenome</label>
                                            <input
                                                id="create-last-name"
                                                type="text"
                                                placeholder="Digite aqui seu sobrenome..."
                                                className="text-zinc-800 w-full h-10 bg-transparent mb-4 border-b border-zinc-400 focus:border-blue-500 focus:outline-none"
                                                value={createLastName}
                                                onChange={handleCreateLastNameChange}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="animate-fade-up animate-delay-[300ms] mt-3">
                                            <div
                                                className={`bg-gradient-to-r from-blue-950 to-blue-900 text-zinc-100 w-full h-10 flex justify-center place-items-center font-bold duration-300 rounded-md gap-1 ${canProceed ? 'hover:opacity-70 cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                                                onClick={handleNextStep}
                                            >
                                                Próximo <ArrowRight className="w-4 h-4"/>
                                            </div>
                                        </div>
                                    </div>
                                ) : showCompanyStep && !nextStep ? (
                                    /* Step 1.5: Dados da Empresa (Recrutador) */
                                    <div className="px-2 animate-fade-up">
                                        <div className="flex items-center justify-between mb-3">
                                            <button
                                                onClick={() => setShowCompanyStep(false)}
                                                className="flex items-center gap-1 text-xs text-zinc-500 hover:text-blue-700 transition-colors"
                                            >
                                                <ArrowLeft className="w-3.5 h-3.5" />
                                                Voltar
                                            </button>
                                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                                                Dados da Empresa
                                            </span>
                                        </div>

                                        <div className="animate-fade-up animate-delay-[100ms]">
                                            <label htmlFor="company-name" className="text-zinc-700 text-sm font-medium flex items-center gap-1.5">
                                                <Building2 className="w-3.5 h-3.5" />
                                                Nome da Empresa
                                            </label>
                                            <input
                                                id="company-name"
                                                type="text"
                                                placeholder="Ex: Empresa ABC Ltda"
                                                className="text-zinc-800 w-full h-10 bg-transparent mb-4 border-b border-zinc-400 focus:border-blue-500 focus:outline-none"
                                                value={companyName}
                                                onChange={(e) => setCompanyName(e.target.value)}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="animate-fade-up animate-delay-[150ms]">
                                            <label htmlFor="company-phone" className="text-zinc-700 text-sm font-medium flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5" />
                                                Telefone de Contato
                                            </label>
                                            <input
                                                id="company-phone"
                                                type="tel"
                                                placeholder="(00) 00000-0000"
                                                className="text-zinc-800 w-full h-10 bg-transparent mb-4 border-b border-zinc-400 focus:border-blue-500 focus:outline-none"
                                                value={companyPhone}
                                                onChange={handlePhoneChange}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="flex gap-3 animate-fade-up animate-delay-[200ms]">
                                            <div className="flex-1">
                                                <label htmlFor="company-city" className="text-zinc-700 text-sm font-medium flex items-center gap-1.5">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    Cidade
                                                </label>
                                                <input
                                                    id="company-city"
                                                    type="text"
                                                    placeholder="Ex: São Paulo"
                                                    className="text-zinc-800 w-full h-10 bg-transparent mb-4 border-b border-zinc-400 focus:border-blue-500 focus:outline-none"
                                                    value={companyCity}
                                                    onChange={(e) => setCompanyCity(e.target.value)}
                                                    disabled={isLoading}
                                                />
                                            </div>
                                            <div className="w-20">
                                                <label htmlFor="company-state" className="text-zinc-700 text-sm font-medium">UF</label>
                                                <select
                                                    id="company-state"
                                                    className="text-zinc-800 w-full h-10 bg-transparent mb-4 border-b border-zinc-400 focus:border-blue-500 focus:outline-none cursor-pointer"
                                                    value={companyState}
                                                    onChange={(e) => setCompanyState(e.target.value)}
                                                    disabled={isLoading}
                                                >
                                                    <option value="">--</option>
                                                    {BRAZILIAN_STATES.map(uf => (
                                                        <option key={uf} value={uf}>{uf}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="animate-fade-up animate-delay-[250ms] mt-1">
                                            <div
                                                className={`bg-gradient-to-r from-blue-950 to-blue-900 text-zinc-100 w-full h-10 flex justify-center place-items-center font-bold duration-300 rounded-md gap-1 ${
                                                    companyName.trim() && companyPhone.trim() && companyCity.trim() && companyState
                                                        ? 'hover:opacity-70 cursor-pointer'
                                                        : 'opacity-40 cursor-not-allowed'
                                                }`}
                                                onClick={handleCompanyNext}
                                            >
                                                Próximo <ArrowRight className="w-4 h-4"/>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* Step 2: Senhas */
                                    <div className="px-2 animate-fade-up">
                                        <div className="animate-fade-up animate-delay-[100ms]">
                                            <label htmlFor="create-password1" className="text-zinc-700 text-sm font-medium">Senha</label>
                                            <input
                                                id="create-password1"
                                                type="password"
                                                placeholder="Digite sua senha..."
                                                className="text-zinc-800 w-full h-10 bg-transparent mb-4 border-b border-zinc-400 focus:border-blue-500 focus:outline-none"
                                                value={createPassword}
                                                onChange={handleCreatePasswordChange}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="animate-fade-up animate-delay-[200ms]">
                                            <label htmlFor="create-password2" className="text-zinc-700 text-sm font-medium">Confirmar Senha</label>
                                            <input
                                                id="create-password2"
                                                type="password"
                                                placeholder="Confirme sua senha..."
                                                className="text-zinc-800 w-full h-10 bg-transparent mb-4 border-b border-zinc-400 focus:border-blue-500 focus:outline-none"
                                                value={createPassword2}
                                                onChange={handleCreatePassword2Change}
                                                disabled={isLoading}
                                            />
                                        </div>

                                        <div className="animate-fade-up animate-delay-[300ms] mt-3">
                                            <div
                                                className={`bg-gradient-to-r from-blue-950 to-blue-900 text-zinc-100 w-full h-10 flex justify-center place-items-center font-bold duration-300 rounded-md ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-70 cursor-pointer'}`}
                                                onClick={!isLoading ? handleRegister : undefined}
                                            >
                                                {isLoading ? 'Carregando...' : 'Criar Usuário'}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>

                    {/* Links de alternancia - flow normal */}
                    <div className={`text-center cursor-pointer text-zinc-800 text-sm mt-2 duration-500 ${sign ? 'animate-fade-up' : 'animate-fade-up'}`} onClick={toggleSign}>
                        {sign ? (
                            <>
                                Não tem uma conta?<br/>
                                <span className="text-base font-bold cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-950 to-blue-700 hover:from-blue-800 hover:to-blue-400">Criar conta</span>
                            </>
                        ) : (
                            <>
                                Já possui um login?<br/>
                                <span className="text-base font-bold cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-950 to-blue-700 hover:from-blue-800 hover:to-blue-400">Faça seu Login</span>
                            </>
                        )}
                    </div>
                </div>

            </div>
    )
}