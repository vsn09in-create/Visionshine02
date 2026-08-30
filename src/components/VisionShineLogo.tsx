import React from 'react';

interface VisionShineLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  as?: 'span' | 'h1' | 'h2' | 'div';
}

export const VisionShineLogo: React.FC<VisionShineLogoProps> = ({
  className = '',
  size = 'md',
  as: Component = 'span',
}) => {
  const sizeClasses = {
    sm: 'text-base sm:text-lg tracking-[0.26em]',
    md: 'text-lg sm:text-2xl tracking-[0.28em]',
    lg: 'text-2xl sm:text-3xl tracking-[0.32em]',
    xl: 'text-3xl sm:text-4xl lg:text-5xl tracking-[0.35em]',
  }[size];

  return (
    <Component
      className={`font-['Bodoni_Moda','Cormorant_Garamond',serif] uppercase font-normal text-[var(--text-primary)] transition-colors select-none whitespace-nowrap inline-block ${sizeClasses} ${className}`}
      style={{
        fontFamily: '"Bodoni Moda", "Cormorant Garamond", Georgia, serif',
      }}
    >
      VISIONSHINE
    </Component>
  );
};
