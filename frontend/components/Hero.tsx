'use client'
import Link from "next/link";
import { ArrowRight, UserPlus } from "lucide-react";
import React from "react";
import SplitTextOrig from "./SliptText";
import { useAuth } from "@/contexts/AuthContext";

// Memoize SplitText para evitar rerenderizações desnecessárias
const SplitText = React.memo(SplitTextOrig);

export default function Hero() {
    const { isAuthenticated } = useAuth();

    return (
        <section className="pt-18 lg:pt-28 pb-20 px-4 bg-gradient-to-r from-blue-800 to-blue-950">
            <div className="max-w-7xl mx-auto text-center">
                <div className="mb-6">
                    <h1 className="text-5xl 2xl:text-6xl font-bold text-slate-100 mb-3 leading-tight quicksand gap-x-6 flex flex-wrap w-[95%] lg:w-[70%] justify-center mx-auto">
                        <SplitText
                            text="Conectamos"
                            className="text-4xl lg:text-6xl text-yellow-400 mb-2"
                            delay={30}
                            duration={1}
                        />
                        <SplitText
                            text="Talentos"
                            className="text-4xl lg:text-6xl text-slate-200 mb-2"
                            delay={30}
                            duration={1}
                        />
                        <SplitText
                            text="às Melhores"
                            className="text-4xl lg:text-6xl text-slate-200 mb-2"
                            delay={30}
                            duration={1}
                        />
                        <SplitText
                            text="Oportunidades"
                            className="text-4xl lg:text-6xl text-yellow-400 mb-2"
                            delay={30}
                            duration={1}
                        />
                    </h1>
                    <div className="w-[85%] m-auto">
                        <p className="animate-fade-up animate-delay-[300ms] text-base lg:text-lg text-slate-200 max-w-4xl mx-auto leading-relaxed">
                            Uma plataforma inovadora que revoluciona a forma como empresas e profissionais se conectam,
                        </p>
                        <p className="animate-fade-up animate-delay-[600ms] text-base lg:text-lg text-slate-200 max-w-4xl mx-auto leading-relaxed">
                            criando oportunidades de crescimento mútuo e construindo o futuro do trabalho.
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-6">
                    <Link href="#avaliable" className="w-full lg:w-auto mx-auto lg:m-0 justify-center animate-fade animate-delay-[500ms] group bg-gradient-to-r from-yellow-400 to-yellow-300 hover:opacity-70 duration-300 text-slate-900 px-8 py-4 rounded-md text-lg transition-all flex items-center gap-2 shadow-lg hover:shadow-xl quicksand font-bold">
                        Explorar Vagas
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    {!isAuthenticated && (
                        <Link href="/login" className="w-full lg:w-auto mx-auto lg:m-0 justify-center animate-fade animate-delay-[800ms] group border-2 border-yellow-500/60 hover:border-white/70 text-slate-100 px-8 py-4 rounded-md font-semibold text-lg transition-all duration-300 flex items-center gap-2 quicksand">
                            Crie seu Perfil
                            <UserPlus className="w-5 h-5" />
                        </Link>
                    )}
                </div>
            </div>
        </section>
    );
}
