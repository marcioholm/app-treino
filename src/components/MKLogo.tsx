'use client';

import { useState } from 'react';

interface MKLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
};

const iconSizes = {
  sm: 'w-6 h-6',
  md: 'w-8 h-8',
  lg: 'w-10 h-10',
  xl: 'w-14 h-14',
};

export default function MKLogo({ size = 'md', variant = 'full', className = '' }: MKLogoProps) {
  const [imageError, setImageError] = useState(false);

  if (variant === 'icon') {
    return (
      <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-[#D4537E] to-[#993556] flex items-center justify-center shadow-lg ${className}`}>
        <span className="text-white font-bold">M&K</span>
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <span className="text-2xl font-extrabold tracking-tight">
          <span className="text-[#1a1a1a]">M</span>
          <span className="text-[#D4537E]">&</span>
          <span className="text-[#1a1a1a]">K</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-[#D4537E] to-[#993556] flex items-center justify-center shadow-lg ${className}`}>
      <span className="text-white font-bold">M&K</span>
    </div>
  );
}