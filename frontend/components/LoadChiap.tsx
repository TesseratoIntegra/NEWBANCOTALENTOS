'use client'
import Image from "next/image";
 
export default function LoadChiap() {
    return (
        <div className={`relative w-[7rem] h-[7rem] m-auto overflow-hidden animate-logo rounded-full bg-white`}>
            <Image className="absolute w-full h-auto z-40" src='https://raw.githubusercontent.com/Chiaperini-TI/Chiaperini-TI/main/loading/chiaperini-outline.webp' width={300} height={300} alt="" />
            <div className="absolute w-6 h-full bg-white animate-chiap z-30"></div>
            <Image className="absolute w-full h-auto z-20" src='https://raw.githubusercontent.com/Chiaperini-TI/Chiaperini-TI/main/loading/chiaperini-inline.webp' width={300} height={300} alt="" />
            <style jsx>{`
                .animate-chiap {
                    animation: chiap 2s ease-in-out infinite;
                    rotate: -45deg;
                    left: -1rem;
                    top: 0.5rem;
                }
                .animate-logo {
                    animation: logo 3s ease-in-out infinite;
                }
                @keyframes logo {
                    0% {
                        transform: scale(1);
                    }
                    50% {
                        transform: scale(1.1);
                    }
                    100% {
                        transform: scale(1);
                    }
                }
                @keyframes chiap {
                    0% {
                        left: -3rem;
                    }
                    50% {
                        left: 10rem;
                    }
                    100% {
                        left: -3rem;
                    }
                }
            `}</style>
        </div>
    );
}