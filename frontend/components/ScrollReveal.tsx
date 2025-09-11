import React, { useEffect, useRef, useState, ReactNode } from 'react';

// Tipos para o componente ScrollReveal
interface ScrollRevealProps {
  children: ReactNode;
  animation?: 'fadeInUp' | 'fadeInDown' | 'fadeInLeft' | 'fadeInRight' | 'scaleIn' | 'fadeIn';
  delay?: number;
  duration?: string;
  threshold?: number;
  className?: string;
}

// Componente reutilizável para animações de scroll
const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
  children, 
  animation = 'fadeInUp',
  delay = 0,
  duration = '0.6s',
  threshold = 0.2,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [delay, threshold]);

  const getAnimationClass = () => {
    const baseClass = 'transition-all duration-700 ease-out';
    
    if (!isVisible) {
      switch (animation) {
        case 'fadeInUp':
          return `${baseClass} opacity-0 translate-y-8`;
        case 'fadeInDown':
          return `${baseClass} opacity-0 -translate-y-8`;
        case 'fadeInLeft':
          return `${baseClass} opacity-0 -translate-x-8`;
        case 'fadeInRight':
          return `${baseClass} opacity-0 translate-x-8`;
        case 'scaleIn':
          return `${baseClass} opacity-0 scale-95`;
        case 'fadeIn':
          return `${baseClass} opacity-0`;
        default:
          return `${baseClass} opacity-0 translate-y-8`;
      }
    }
    
    return `${baseClass} opacity-100 translate-y-0 translate-x-0 scale-100`;
  };

  return (
    <div 
      ref={elementRef}
      className={`${getAnimationClass()} ${className}`}
      style={{ transitionDuration: duration }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;