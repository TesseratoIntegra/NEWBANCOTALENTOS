import Image from 'next/image';
import { Mail, Phone, MapPin, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-gradient-to-br from-blue-800 to-blue-950 text-zinc-100">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:flex gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <Image src='https://raw.githubusercontent.com/Chiaperini-TI/Chiaperini-TI/main/chiaperini.png' alt="Inovar" width={150} height={50} />
            <p className="text-zinc-100 text-sm leading-relaxed w-[40%]">
              Conectando futuros, criando oportunidades. Sua plataforma de confiança para encontrar os melhores talentos e serviços especializados.
            </p>
          </div>

          {/* Quick Links */}
          {/* <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-100 mb-4">Links Rápidos</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-zinc-100 hover:text-yellow-300 transition-colors text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/servicos" className="text-zinc-100 hover:text-yellow-300 transition-colors text-sm">
                  Serviços
                </Link>
              </li>
              <li>
                <Link href="/vagas" className="text-zinc-100 hover:text-yellow-300 transition-colors text-sm">
                  Trabalhe Conosco
                </Link>
              </li>
              <li>
                <Link href="/sobre" className="text-zinc-100 hover:text-yellow-300 transition-colors text-sm">
                  Sobre
                </Link>
              </li>
            </ul>
          </div> */}

          {/* Services */}
          {/* <div className="space-y-4">
            <h4 className="text-lg font-semibold text-blue-100 mb-4">Nossos Serviços</h4>
            <ul className="space-y-2">
              <li className="text-zinc-100 text-sm">Jardinagem e Paisagismo</li>
              <li className="text-zinc-100 text-sm">Vigilância e Segurança</li>
              <li className="text-zinc-100 text-sm">Limpeza e Conservação</li>
              <li className="text-zinc-100 text-sm">Consultoria Especializada</li>
            </ul>
          </div> */}

          {/* Contact Info */}
          <div className="space-y-4 float-end justify-end place-content-end">
            <h4 className="text-lg font-semibold text-yellow-300 mb-4">Contato</h4>
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
        </div>

        {/* Divider */}
        <div className="border-t border-zinc-500 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-zinc-100 text-sm text-center md:text-left">
              © 2025 Chiaperini Industrial.
            </p>
            
            {/* Back to Top Button */}
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
