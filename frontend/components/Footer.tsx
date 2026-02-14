'use client';
import { ArrowUp, Mail, Phone, MapPin, ExternalLink, MessageCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-b from-slate-950 to-slate-900 overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/3 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-indigo-500/3 rounded-full blur-3xl" />

      {/* Top border accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 pt-14 pb-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-1">
            <Image
              src="/img/logo.png"
              alt="Tesserato Integra"
              width={160}
              height={50}
              className="brightness-110"
            />
            <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
              Plataforma completa de recrutamento white-label. Sua marca, nossa tecnologia — do anúncio da vaga até a admissão.
            </p>
            {/* Social */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://wa.me/5516992416689"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-green-400 hover:bg-green-500/10 hover:border-green-500/20 transition-all duration-300"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://instagram.com/tesseratointegra"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-slate-400 hover:text-pink-400 hover:bg-pink-500/10 hover:border-pink-500/20 transition-all duration-300"
                aria-label="Instagram"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
            </div>
          </div>

          {/* Plataforma */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider quicksand">Plataforma</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Pipeline de Seleção", href: "#" },
                { label: "WhatsApp Integrado", href: "#" },
                { label: "White-Label", href: "#" },
                { label: "Integrações ERP", href: "#" },
                { label: "Admissão Digital", href: "#" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-yellow-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider quicksand">Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Vagas Disponíveis", href: "#avaliable" },
                { label: "Fazer Login", href: "/login" },
                { label: "Cadastre-se", href: "/login" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group">
                    <span className="w-1 h-1 bg-slate-600 rounded-full group-hover:bg-yellow-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://tesseratointegra.com.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white text-sm transition-colors duration-200 flex items-center gap-1.5 group"
                >
                  <ExternalLink className="w-3 h-3 text-slate-600 group-hover:text-yellow-400 transition-colors" />
                  tesseratointegra.com.br
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider quicksand">Contato</h4>
            <ul className="space-y-3">
              <li>
                <a href="mailto:tesseratointegra@gmail.com" className="flex items-start gap-2.5 text-slate-400 hover:text-white transition-colors group">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500 group-hover:text-blue-400 transition-colors" />
                  <span className="text-sm">tesseratointegra@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:+5516992416689" className="flex items-start gap-2.5 text-slate-400 hover:text-white transition-colors group">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500 group-hover:text-green-400 transition-colors" />
                  <span className="text-sm">(16) 99241-6689</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-2.5 text-slate-400">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-500" />
                  <span className="text-sm leading-relaxed">
                    Rua José Garcia Duarte, 182 (AP 104)<br />
                    Santa Rosa de Viterbo - SP
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <span className="text-slate-500 text-xs">
              &copy; {new Date().getFullYear()} Banco de Talentos - Tesserato Integra. Todos os direitos reservados.
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-slate-500 hover:text-yellow-400 transition-colors group cursor-pointer"
            >
              <span className="text-xs">Voltar ao topo</span>
              <div className="w-7 h-7 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center group-hover:bg-yellow-400/10 group-hover:border-yellow-400/20 transition-all">
                <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
