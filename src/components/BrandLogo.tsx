import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ 
  size = 'md', 
  showTagline = false,
  className = '' 
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8 sm:w-9 sm:h-9',
    lg: 'w-10 h-10 sm:w-12 sm:h-12',
    xl: 'w-14 h-14'
  };

  const textSizes = {
    sm: 'text-base font-black',
    md: 'text-lg sm:text-xl font-black',
    lg: 'text-2xl sm:text-3xl font-black',
    xl: 'text-3xl sm:text-4xl font-black'
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Custom Designed Vector Logo Icon */}
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-950 flex items-center justify-center shadow-md shadow-emerald-900/20 text-white shrink-0 overflow-hidden border border-emerald-400/30 group`}>
        {/* Ambient glow highlight */}
        <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-300/40 rounded-full blur-xs pointer-events-none" />
        
        <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-[82%] h-[82%] drop-shadow-sm">
          {/* Marketplace Store Roof Canopy with Pakistani Crescent Touch */}
          <path d="M6 16L20 7L34 16V18H6V16Z" fill="#34D399" />
          <path d="M20 7L24 10H16L20 7Z" fill="#A7F3D0" />
          
          {/* Store Pillars / Entrance */}
          <rect x="9" y="18" width="4" height="15" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
          <rect x="27" y="18" width="4" height="15" rx="1" fill="#FFFFFF" fillOpacity="0.9" />
          <rect x="6" y="32" width="28" height="3" rx="1.5" fill="#10B981" />
          
          {/* Centered Map Pin & Elegancia Water Drop Motif */}
          <path 
            d="M20 16C16.8 16 14.5 18.5 14.5 21.5C14.5 25.5 20 30 20 30C20 30 25.5 25.5 25.5 21.5C25.5 18.5 23.2 16 20 16Z" 
            fill="#059669" 
            stroke="#FFFFFF" 
            strokeWidth="1.2"
          />
          {/* Glowing Pure Drop Core */}
          <circle cx="20" cy="21.5" r="2.2" fill="#E0F2FE" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col text-left leading-tight">
        <div className={`tracking-tight font-['Outfit'] text-slate-900 flex items-baseline ${textSizes[size]}`}>
          <span>asspas</span>
          <span className="text-emerald-600 font-extrabold">.store</span>
        </div>
        {showTagline && (
          <span className="text-[9px] sm:text-[10px] text-emerald-700 font-semibold uppercase tracking-wider -mt-0.5">
            Local Shops · Elegancia Water
          </span>
        )}
      </div>
    </div>
  );
};
