'use client'
import dynamic from 'next/dynamic';
import Link from "next/link";
import { ArrowRight, UserPlus, Users, Briefcase, TrendingUp, Award } from "lucide-react";
import React from "react";
const SplitTextOrig = dynamic(() => import('./SliptText'), { ssr: false });
import { useAuth } from "@/contexts/AuthContext";

const SplitText = React.memo(SplitTextOrig);

export default function Hero() {
    const { isAuthenticated } = useAuth();

    return (
        <section className="relative pt-24 lg:pt-32 pb-20 lg:pb-28 px-4 bg-gradient-to-br from-blue-900 via-blue-950 to-slate-950 overflow-hidden">
            {/* Decorative background blurs */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-800/20 rounded-full blur-3xl" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                    {/* Left column - Text */}
                    <div className="text-center lg:text-left">
                        <div className="mb-6">
                            <h1 className="text-4xl lg:text-5xl 2xl:text-6xl font-bold text-slate-100 mb-4 leading-tight quicksand flex flex-wrap gap-x-4 justify-center lg:justify-start">
                                <SplitText
                                    text="Conectamos"
                                    className="text-4xl lg:text-5xl 2xl:text-6xl text-yellow-400 mb-1"
                                    delay={30}
                                    duration={1}
                                />
                                <SplitText
                                    text="Talentos"
                                    className="text-4xl lg:text-5xl 2xl:text-6xl text-slate-100 mb-1"
                                    delay={30}
                                    duration={1}
                                />
                                <SplitText
                                    text="às Melhores"
                                    className="text-4xl lg:text-5xl 2xl:text-6xl text-slate-200 mb-1"
                                    delay={30}
                                    duration={1}
                                />
                                <SplitText
                                    text="Oportunidades"
                                    className="text-4xl lg:text-5xl 2xl:text-6xl text-yellow-400 mb-1"
                                    delay={30}
                                    duration={1}
                                />
                            </h1>
                            <p className="animate-fade-up animate-delay-[300ms] text-base lg:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                Uma plataforma inovadora que revoluciona a forma como empresas e profissionais se conectam, criando oportunidades de crescimento mútuo e construindo o futuro do trabalho.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mt-8">
                            <Link href="#avaliable" className="w-full sm:w-auto justify-center animate-fade animate-delay-[500ms] group bg-gradient-to-r from-yellow-400 to-yellow-300 hover:from-yellow-300 hover:to-yellow-200 text-slate-900 px-8 py-4 rounded-xl text-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 quicksand font-bold">
                                Explorar Vagas
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            {!isAuthenticated && (
                                <Link href="/login" className="w-full sm:w-auto justify-center animate-fade animate-delay-[800ms] group glass text-slate-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/15 quicksand">
                                    Crie seu Perfil
                                    <UserPlus className="w-5 h-5" />
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Right column - Glass illustration */}
                    <div className="hidden lg:flex justify-center items-center animate-fade animate-delay-[400ms]">
                        <div className="relative w-full max-w-lg">
                            <div className="glass rounded-3xl p-8 relative">
                                <div className="grid grid-cols-2 gap-5">
                                    <Link href="/login" className="bg-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
                                        <div className="w-12 h-12 bg-yellow-400/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Users className="w-6 h-6 text-yellow-400" />
                                        </div>
                                        <h3 className="text-white font-semibold text-sm mb-1">Talentos</h3>
                                        <p className="text-slate-400 text-xs">Conecte-se com os melhores profissionais</p>
                                    </Link>
                                    <Link href="#avaliable" className="bg-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300 group cursor-pointer mt-6">
                                        <div className="w-12 h-12 bg-blue-400/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Briefcase className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <h3 className="text-white font-semibold text-sm mb-1">Vagas</h3>
                                        <p className="text-slate-400 text-xs">Oportunidades em diversas áreas</p>
                                    </Link>
                                    <Link href="/login" className="bg-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300 group cursor-pointer">
                                        <div className="w-12 h-12 bg-green-400/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-6 h-6 text-green-400" />
                                        </div>
                                        <h3 className="text-white font-semibold text-sm mb-1">Crescimento</h3>
                                        <p className="text-slate-400 text-xs">Desenvolva sua carreira profissional</p>
                                    </Link>
                                    <Link href="/login" className="bg-white/10 rounded-2xl p-5 hover:bg-white/15 transition-all duration-300 group cursor-pointer mt-6">
                                        <div className="w-12 h-12 bg-purple-400/20 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                            <Award className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <h3 className="text-white font-semibold text-sm mb-1">Conquistas</h3>
                                        <p className="text-slate-400 text-xs">Alcance seus objetivos profissionais</p>
                                    </Link>
                                </div>
                            </div>
                            {/* Floating decorative elements */}
                            <div className="absolute -top-4 -right-4 w-20 h-20 bg-yellow-400/15 rounded-2xl blur-sm rotate-12" />
                            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400/15 rounded-2xl blur-sm -rotate-12" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
