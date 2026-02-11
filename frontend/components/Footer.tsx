'use client';
import { ArrowUp, FileText, Mail, MapPin, Phone } from 'lucide-react';
import Image from 'next/image';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-blue-800 to-blue-950 text-zinc-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Company Info */}
          <div className="space-y-4">
            <Image
              src="https://raw.githubusercontent.com/Chiaperini-TI/Chiaperini-TI/main/chiaperini.png"
              alt="Chiaperini Logo"
              width={150}
              height={50}
            />
            <p className="text-zinc-100 text-sm leading-relaxed max-w-xs">
              Conectando futuros, criando oportunidades. 
            </p>
            <button
              onClick={() =>
                window.open('/pdf/relatorio de transparencia.pdf', '_blank')
              }
              className="flex items-center space-x-2 text-zinc-100 hover:text-yellow-300 transition-colors cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm">Relatório de Transparência</span>
            </button>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-yellow-300">Contato</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-blue-100" />
                <span className="text-zinc-100 text-sm">recrutamento@chiaperini.com.br</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-blue-100" />
                <span className="text-zinc-100 text-sm">+55 (16) 3954-9400</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-blue-100 mt-0.5" />
                <span className="text-zinc-100 text-sm">
                  Santa Rosa de Viterbo, SP<br />
                  Brasil
                </span>
              </div>
            </div>
          </div>

          {/* Powered By */}
          <div className="space-y-4 md:text-right">
            <h4 className="text-lg font-semibold text-yellow-300">Desenvolvimento</h4>
            <a
              className="inline-flex items-center text-purple-300 hover:text-purple-400 transition-colors"
              href="https://tesseratointegra.com.br/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image
                className="w-auto h-10"
                width={300}
                height={300}
                src="/img/logo.png"
                alt="Logo Tesserato"
              />
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-500 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <span className="text-zinc-100 text-sm">
              © 2025 Banco de Talentos - Chiaperini Industrial.
            </span>
            <button
              onClick={scrollToTop}
              className="flex items-center space-x-2 text-zinc-100 hover:text-yellow-300 transition-colors group cursor-pointer"
            >
              <span className="text-sm">Voltar ao topo</span>
              <ArrowUp className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
