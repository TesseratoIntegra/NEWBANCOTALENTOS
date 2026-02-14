'use client'
import dynamic from 'next/dynamic';
import Link from "next/link";
import Image from "next/image";
import {
    ArrowRight, ChevronDown, Check, ChevronRight,
    Globe, FileText, GitBranch, MessageCircle, BadgeCheck,
    Smartphone, BarChart3, Palette, Users, Briefcase,
    Building2, UserCheck, ClipboardList, Bell, Star, Sparkles
} from "lucide-react";
import React from "react";
const SplitTextOrig = dynamic(() => import('./SliptText'), { ssr: false });
import ScrollReveal from "@/components/ScrollReveal";

const SplitText = React.memo(SplitTextOrig);

/* ========================================
   DATA
   ======================================== */

const stepsData = [
    {
        step: 1,
        icon: Globe,
        title: "Integração White-Label",
        description: "Instalamos a plataforma no site da sua empresa com sua marca e identidade visual.",
        color: "from-blue-500 to-blue-600"
    },
    {
        step: 2,
        icon: FileText,
        title: "Cadastro de Vagas",
        description: "Cadastre vagas com requisitos, modelo de trabalho, faixa salarial e etapas personalizadas.",
        color: "from-indigo-500 to-indigo-600"
    },
    {
        step: 3,
        icon: GitBranch,
        title: "Pipeline de Seleção",
        description: "Acompanhe candidatos em cada etapa: triagem, entrevista, teste e aprovação.",
        color: "from-purple-500 to-purple-600"
    },
    {
        step: 4,
        icon: MessageCircle,
        title: "Comunicação Direta",
        description: "Envie feedback, observações e notificações via WhatsApp automaticamente.",
        color: "from-green-500 to-green-600"
    },
    {
        step: 5,
        icon: BadgeCheck,
        title: "Admissão Digital",
        description: "Do processo seletivo à contratação: documentos, validação e onboarding pela plataforma.",
        color: "from-amber-500 to-amber-600"
    }
];

const pipelineColumns = [
    { name: "Triagem", count: 5, color: "bg-blue-500", candidates: ["Ana S.", "Pedro L.", "Julia M."] },
    { name: "Entrevista RH", count: 3, color: "bg-indigo-500", candidates: ["Carlos R.", "Maria C."] },
    { name: "Teste Técnico", count: 2, color: "bg-purple-500", candidates: ["Lucas F."] },
    { name: "Entrevista Final", count: 1, color: "bg-amber-500", candidates: ["Rafael O."] },
    { name: "Aprovado", count: 1, color: "bg-green-500", candidates: ["Beatriz N."] },
];

const whatsappTemplates = [
    { label: "Aprovação", color: "bg-green-100 text-green-700" },
    { label: "Agendamento", color: "bg-blue-100 text-blue-700" },
    { label: "Documentos", color: "bg-amber-100 text-amber-700" },
    { label: "Rejeição", color: "bg-red-100 text-red-700" },
];

export default function Hero() {
    return (
        <>
            {/* ========== SECTION A: Hero Principal B2B ========== */}
            <section className="relative min-h-screen flex items-center pt-20 lg:pt-24 pb-20 lg:pb-28 px-4 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 overflow-hidden">
                {/* Background effects */}
                <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/15 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-96 h-96 bg-yellow-400/8 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/3 w-[500px] h-[500px] bg-indigo-800/15 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-green-500/8 rounded-full blur-3xl" />

                <div className="max-w-7xl mx-auto relative z-10 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
                        {/* ===== Left: B2B Copy ===== */}
                        <div className="text-center lg:text-left">
                            {/* Badge */}
                            <div className="flex justify-center lg:justify-start mb-6">
                                <div className="animate-fade inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-5 py-2 animate-pulse-glow">
                                    <Image src="/img/tesserato.png" width={20} height={20} alt="Tesserato" className="w-5 h-5" />
                                    <span className="text-xs text-slate-200 font-medium tracking-wide">Plataforma de Recrutamento</span>
                                </div>
                            </div>

                            {/* Title */}
                            <div className="mb-8">
                                <h1 className="text-4xl lg:text-5xl 2xl:text-6xl font-bold text-slate-100 mb-6 leading-tight quicksand flex flex-wrap gap-x-4 justify-center lg:justify-start">
                                    <SplitText text="Recrutamento" className="text-4xl lg:text-5xl 2xl:text-6xl text-yellow-400 mb-1" delay={30} duration={1} />
                                    <SplitText text="Inteligente" className="text-4xl lg:text-5xl 2xl:text-6xl text-slate-100 mb-1" delay={30} duration={1} />
                                    <SplitText text="para Sua" className="text-4xl lg:text-5xl 2xl:text-6xl text-slate-200 mb-1" delay={30} duration={1} />
                                    <SplitText text="Empresa" className="text-4xl lg:text-5xl 2xl:text-6xl text-yellow-400 mb-1" delay={30} duration={1} />
                                </h1>
                                <p className="animate-fade-up animate-delay-[300ms] text-base lg:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                                    Tenha um banco de talentos completo no site da sua empresa. Com sua marca, seu logo e seu processo seletivo — nós cuidamos de toda a tecnologia.
                                </p>
                            </div>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center">
                                <a href="https://wa.me/5511999999999?text=Olá! Gostaria de saber mais sobre o Banco de Talentos." target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto justify-center animate-fade animate-delay-[500ms] group bg-gradient-to-r from-green-500 to-green-400 hover:from-green-400 hover:to-green-300 text-white px-8 py-4 rounded-xl text-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-green-500/20 hover:shadow-green-500/40 quicksand font-bold">
                                    <Smartphone className="w-5 h-5" />
                                    Fale Conosco
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                                <Link href="#avaliable" className="w-full sm:w-auto justify-center animate-fade animate-delay-[700ms] group glass text-slate-100 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center gap-2 hover:bg-white/15 quicksand">
                                    Ver Vagas
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {/* Trust Stats */}
                            <div className="animate-fade animate-delay-[1000ms] mt-10 flex flex-wrap gap-8 justify-center lg:justify-start">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-400 quicksand">10+</div>
                                    <div className="text-xs text-slate-400 mt-1">Empresas Ativas</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-400 quicksand">500+</div>
                                    <div className="text-xs text-slate-400 mt-1">Candidatos Cadastrados</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-400 quicksand">50+</div>
                                    <div className="text-xs text-slate-400 mt-1">Vagas Publicadas</div>
                                </div>
                            </div>
                        </div>

                        {/* ===== Right: Recruiter Dashboard Mockup ===== */}
                        <div className="hidden lg:block">
                            <div className="relative">
                                {/* Main Dashboard Card */}
                                <div className="animate-fade animate-delay-[400ms] bg-white/8 backdrop-blur-md border border-white/12 rounded-2xl p-5 shadow-2xl shadow-black/20">
                                    {/* Header */}
                                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                                                <Building2 className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <div className="text-white font-semibold text-sm">Sua Empresa</div>
                                                <div className="text-slate-400 text-[10px]">Painel do Recrutador</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                            <span className="text-green-400 text-[10px]">Online</span>
                                        </div>
                                    </div>

                                    {/* Mini Pipeline */}
                                    <div className="mb-4">
                                        <div className="text-slate-300 text-xs font-medium mb-2">Pipeline de Seleção</div>
                                        <div className="flex gap-2">
                                            {[
                                                { name: "Triagem", count: 5, color: "bg-blue-500" },
                                                { name: "Entrevista", count: 3, color: "bg-indigo-500" },
                                                { name: "Teste", count: 2, color: "bg-purple-500" },
                                                { name: "Aprovado", count: 1, color: "bg-green-500" },
                                            ].map((col, i) => (
                                                <div key={i} className="flex-1 bg-white/5 rounded-lg p-2 text-center">
                                                    <div className={`${col.color} text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1`}>
                                                        {col.count}
                                                    </div>
                                                    <div className="text-slate-400 text-[9px]">{col.name}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Candidate Card */}
                                    <div className="bg-white/5 rounded-xl p-3 mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-bold text-xs">MC</div>
                                            <div className="flex-1">
                                                <div className="text-white text-sm font-medium">Maria Costa</div>
                                                <div className="text-slate-400 text-[10px]">Desenvolvedora Full Stack</div>
                                            </div>
                                            <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] rounded-full">Entrevista</span>
                                        </div>
                                    </div>

                                    {/* WhatsApp notification */}
                                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-2.5 flex items-center gap-2">
                                        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Smartphone className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-green-300 text-[10px] font-medium">WhatsApp Enviado</div>
                                            <div className="text-slate-400 text-[9px]">Lembrete de entrevista para Maria Costa</div>
                                        </div>
                                    </div>

                                    {/* Mini chart */}
                                    <div className="mt-4 pt-3 border-t border-white/10">
                                        <div className="text-slate-300 text-xs font-medium mb-2">Candidaturas esta semana</div>
                                        <div className="flex items-end gap-1 h-10">
                                            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                                                <div key={i} className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-sm opacity-80" style={{ height: `${h}%` }} />
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map((d, i) => (
                                                <span key={i} className="text-[8px] text-slate-500 flex-1 text-center">{d}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Floating WhatsApp toast */}
                                <div className="absolute -top-3 -right-3 opacity-0 animate-slide-in-right" style={{ animationDelay: '1s' }}>
                                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xl flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                            <Smartphone className="w-4 h-4 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white text-[10px] font-semibold">Candidato notificado</div>
                                            <div className="text-green-400 text-[9px]">via WhatsApp</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Floating brand badge */}
                                <div className="absolute -bottom-3 -left-3 animate-float" style={{ animationDelay: '0.5s' }}>
                                    <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-xl p-3 shadow-xl flex items-center gap-2">
                                        <Palette className="w-5 h-5 text-yellow-400" />
                                        <span className="text-white text-[10px] font-semibold">Seu logo aqui</span>
                                    </div>
                                </div>

                                {/* Floating AI insight badge */}
                                <div className="absolute -bottom-3 right-8 opacity-0 animate-slide-in-right" style={{ animationDelay: '1.8s' }}>
                                    <div className="bg-white/10 backdrop-blur-md border border-emerald-500/20 rounded-xl p-2.5 shadow-xl flex items-center gap-2">
                                        <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <Sparkles className="w-3.5 h-3.5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-emerald-400 text-[9px] font-semibold">Insight IA</div>
                                            <div className="text-slate-400 text-[8px]">Powered by OpenAI</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile feature badges */}
                        <div className="lg:hidden animate-fade animate-delay-[900ms] flex flex-wrap gap-2 justify-center">
                            {[
                                { icon: Globe, label: "White-Label" },
                                { icon: GitBranch, label: "Pipeline" },
                                { icon: Smartphone, label: "WhatsApp" },
                                { icon: Sparkles, label: "IA Insights" },
                                { icon: BadgeCheck, label: "Admissão" },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 bg-white/8 border border-white/10 rounded-full px-4 py-2">
                                    <item.icon className="w-4 h-4 text-yellow-400" />
                                    <span className="text-xs text-slate-300">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <ChevronDown className="w-6 h-6 text-slate-400" />
                </div>
            </section>

            {/* ========== SECTION B: Como Funciona para Empresas ========== */}
            <section className="py-20 px-4 bg-gradient-to-b from-white via-slate-50 to-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-14">
                        <SplitText text="Como funciona" className="text-2xl lg:text-4xl font-bold text-blue-900 mb-2 quicksand" delay={30} duration={0.6} />
                        <ScrollReveal>
                            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                                Em 5 passos, sua empresa tem um sistema completo de recrutamento.
                            </p>
                        </ScrollReveal>
                    </div>

                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {stepsData.map((item, index) => (
                            <ScrollReveal delay={200 * index} key={index} animation="fadeInUp">
                                <div className="relative group text-center">
                                    <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <item.icon className="w-8 h-8 text-white" />
                                    </div>
                                    <div className="text-xs text-slate-400 font-bold mb-1">PASSO {item.step}</div>
                                    <h3 className="text-base font-bold text-blue-900 mb-2 quicksand">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.description}</p>
                                    {/* Connector arrow (not on last) */}
                                    {index < stepsData.length - 1 && (
                                        <div className="hidden lg:block absolute top-8 -right-3 text-slate-300">
                                            <ChevronRight className="w-6 h-6" />
                                        </div>
                                    )}
                                </div>
                            </ScrollReveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ========== SECTION C: Features Deep Dive ========== */}
            <section className="py-20 px-4 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden">
                <div className="max-w-7xl mx-auto">

                    {/* --- Feature 1: Pipeline Visual --- */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                        {/* Mockup */}
                        <ScrollReveal animation="fadeInLeft">
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl">
                                <div className="text-slate-300 text-sm font-medium mb-4 flex items-center gap-2">
                                    <ClipboardList className="w-4 h-4 text-blue-400" />
                                    Pipeline — Desenvolvedor React Senior
                                </div>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {pipelineColumns.map((col, i) => (
                                        <div key={i} className="min-w-[120px] flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className={`w-2 h-2 ${col.color} rounded-full`} />
                                                <span className="text-white text-xs font-medium">{col.name}</span>
                                                <span className="text-slate-500 text-[10px]">({col.count})</span>
                                            </div>
                                            <div className="space-y-2">
                                                {col.candidates.map((name, j) => (
                                                    <div key={j} className="bg-white/5 rounded-lg p-2 border border-white/5">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-6 h-6 ${col.color}/30 rounded-full flex items-center justify-center`}>
                                                                <span className="text-[8px] text-white font-bold">{name.split(' ').map(n=>n[0]).join('')}</span>
                                                            </div>
                                                            <span className="text-slate-300 text-[10px]">{name}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* Text */}
                        <ScrollReveal animation="fadeInRight">
                            <div>
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                                        <GitBranch className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-bold text-white quicksand">Pipeline Visual</h3>
                                </div>
                                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                                    Acompanhe cada candidato em tempo real. Visualize todo o processo seletivo como um quadro Kanban intuitivo.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Etapas totalmente personalizáveis por vaga",
                                        "Mova candidatos entre etapas com facilidade",
                                        "Visão macro de todos os processos ativos",
                                        "Feedback e observações em cada etapa",
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-300">
                                            <div className="w-5 h-5 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-purple-400" />
                                            </div>
                                            <span className="text-sm">{text}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* --- Feature 2: WhatsApp Integrado --- */}
                    <div className="grid lg:grid-cols-2 gap-12 items-center mb-24">
                        {/* Text */}
                        <ScrollReveal animation="fadeInLeft">
                            <div className="order-2 lg:order-1">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center">
                                        <Smartphone className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-2xl lg:text-3xl font-bold text-white quicksand">WhatsApp Integrado</h3>
                                </div>
                                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                                    Comunicação automática com candidatos via WhatsApp. Templates prontos para cada etapa do processo.
                                </p>
                                <ul className="space-y-3 mb-6">
                                    {[
                                        "Templates personalizáveis por etapa",
                                        "Envio automático em cada mudança de status",
                                        "Variáveis dinâmicas: {nome}, {vaga}, {data}",
                                        "Notificações de aprovação, rejeição e agendamento",
                                    ].map((text, i) => (
                                        <li key={i} className="flex items-center gap-3 text-slate-300">
                                            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                                <Check className="w-3 h-3 text-green-400" />
                                            </div>
                                            <span className="text-sm">{text}</span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="flex flex-wrap gap-2">
                                    {whatsappTemplates.map((t, i) => (
                                        <span key={i} className={`px-3 py-1 ${t.color} text-xs rounded-full font-medium`}>{t.label}</span>
                                    ))}
                                </div>
                            </div>
                        </ScrollReveal>

                        {/* WhatsApp Mockup */}
                        <ScrollReveal animation="fadeInRight">
                            <div className="order-1 lg:order-2">
                                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl max-w-sm mx-auto lg:mx-0 lg:ml-auto">
                                    {/* WhatsApp Header */}
                                    <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/10">
                                        <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                            <Smartphone className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-semibold text-sm">Banco de Talentos</div>
                                            <div className="text-green-400 text-[10px]">online</div>
                                        </div>
                                    </div>

                                    {/* Chat bubbles */}
                                    <div className="space-y-3">
                                        <div className="whatsapp-bubble px-3 py-2 max-w-[85%]">
                                            <p className="text-slate-800 text-xs leading-relaxed">
                                                Olá <strong>Maria</strong>! 🎉 Você foi <strong>aprovada</strong> na etapa de <strong>Triagem</strong> para a vaga de <strong>Desenvolvedor React</strong>. Parabéns!
                                            </p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[9px] text-slate-500">10:32</span>
                                                <span className="text-blue-500 text-[9px]">✓✓</span>
                                            </div>
                                        </div>
                                        <div className="whatsapp-bubble px-3 py-2 max-w-[85%]">
                                            <p className="text-slate-800 text-xs leading-relaxed">
                                                Sua entrevista está agendada para <strong>15/02/2026 às 14:00</strong>. Boa sorte! 💼
                                            </p>
                                            <div className="flex items-center justify-end gap-1 mt-1">
                                                <span className="text-[9px] text-slate-500">10:33</span>
                                                <span className="text-blue-500 text-[9px]">✓✓</span>
                                            </div>
                                        </div>
                                        {/* Reply from user */}
                                        <div className="flex justify-end">
                                            <div className="bg-blue-500/20 border border-blue-500/20 rounded-lg rounded-tr-none px-3 py-2 max-w-[75%]">
                                                <p className="text-blue-100 text-xs">Muito obrigada! Estarei lá! 😊</p>
                                                <div className="flex items-center justify-end gap-1 mt-1">
                                                    <span className="text-[9px] text-slate-500">10:35</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Input bar */}
                                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                                        <div className="flex-1 bg-white/5 rounded-full px-3 py-1.5">
                                            <span className="text-slate-500 text-[10px]">Mensagem automática...</span>
                                        </div>
                                        <div className="w-7 h-7 bg-green-500 rounded-full flex items-center justify-center">
                                            <ArrowRight className="w-3 h-3 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </ScrollReveal>
                    </div>

                    {/* --- Feature 3: White-Label --- */}
                    <ScrollReveal animation="fadeInUp">
                        <div className="text-center mb-10">
                            <div className="flex items-center justify-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl flex items-center justify-center">
                                    <Palette className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-bold text-white quicksand">Sua Marca, Nossa Tecnologia</h3>
                            </div>
                            <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                                Cada empresa cliente recebe a plataforma com sua identidade visual própria. Seus candidatos veem SUA marca.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { name: "TechCorp", color: "from-blue-500 to-blue-600", accent: "bg-blue-500", letter: "T" },
                                { name: "GreenInova", color: "from-emerald-500 to-emerald-600", accent: "bg-emerald-500", letter: "G" },
                                { name: "PurpleLab", color: "from-purple-500 to-purple-600", accent: "bg-purple-500", letter: "P" },
                            ].map((company, i) => (
                                <div key={i} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 shadow-xl hover:bg-white/8 transition-all duration-300 group">
                                    {/* Mini navbar */}
                                    <div className={`bg-gradient-to-r ${company.color} rounded-xl p-3 mb-3 flex items-center gap-2`}>
                                        <div className="w-7 h-7 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-xs">{company.letter}</div>
                                        <span className="text-white text-xs font-semibold">{company.name}</span>
                                        <span className="ml-auto text-white/60 text-[9px]">Banco de Talentos</span>
                                    </div>
                                    {/* Mini content */}
                                    <div className="space-y-2">
                                        <div className="h-2 bg-white/10 rounded-full w-3/4" />
                                        <div className="h-2 bg-white/10 rounded-full w-1/2" />
                                        <div className="flex gap-2 mt-3">
                                            <div className={`${company.accent} h-6 rounded-md flex-1 opacity-40`} />
                                            <div className="bg-white/10 h-6 rounded-md flex-1" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollReveal>
                </div>
            </section>
        </>
    );
}
