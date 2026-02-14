'use client'
import Image from "next/image";

export default function LoadTesserato() {
    return (
        <div className="relative w-[5rem] h-[5rem] m-auto animate-logo-tesserato">
            <Image
                className="w-full h-full object-contain"
                src="/img/tesserato-dark.png"
                width={300}
                height={300}
                alt="Carregando..."
            />
            <style jsx>{`
                .animate-logo-tesserato {
                    animation: logo-tesserato 1.5s ease-in-out infinite;
                }
                @keyframes logo-tesserato {
                    0% {
                        transform: scale(1);
                        opacity: 0.7;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 1;
                    }
                    100% {
                        transform: scale(1);
                        opacity: 0.7;
                    }
                }
            `}</style>
        </div>
    );
}
