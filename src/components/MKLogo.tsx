'use client';

interface MKLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

const sizes = {
  sm: 'w-10 h-10',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
  xl: 'w-48 h-48',
};

export default function MKLogo({ size = 'md', variant = 'full', className = '' }: MKLogoProps) {
  
  // Icon represents just the pink circle with the M&K lettering or figure
  if (variant === 'icon') {
    return (
      <div className={`${sizes[size]} rounded-2xl overflow-hidden bg-black flex items-center justify-center shadow-lg ${className}`}>
        <img src="/logo-app.png" alt="M&K Logo" className="w-full h-full object-cover" />
      </div>
    );
  }

  // Text only variant
  if (variant === 'text') {
    return (
      <div className={`flex flex-col items-center justify-center ${className}`}>
        <span className="text-white font-black tracking-widest uppercase text-xl leading-none">M&K Fitness</span>
        <span className="text-white font-black tracking-widest uppercase text-xl leading-none">Center</span>
      </div>
    );
  }

  // Full Logo matching the identity
  return (
    <div className={`${sizes[size]} rounded-full border-2 border-[#E11383] bg-black flex flex-col items-center justify-center p-2 shadow-2xl ${className}`}>
        <div className="flex-1 flex items-end justify-center pb-1">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-1/3 h-1/3">
                {/* Simplified Dumbbell icon for the silhouette effect */}
                <path d="M6 4v16M18 4v16M4 8h4M16 8h4M4 16h4M16 16h4M9 12h6" />
            </svg>
        </div>
        <div className="flex flex-col items-center justify-start flex-1 leading-none">
            <span className="text-white font-black text-center" style={{ fontSize: size === 'xl' ? '1.8rem' : size === 'lg' ? '1rem' : '0.6rem', letterSpacing: '0.05em' }}>M&K FITNESS</span>
            <span className="text-white font-black text-center mt-1" style={{ fontSize: size === 'xl' ? '1.8rem' : size === 'lg' ? '1rem' : '0.6rem', letterSpacing: '0.05em' }}>CENTER</span>
        </div>
    </div>
  );
}