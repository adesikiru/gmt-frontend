'use client';

import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'light' | 'dark';
  href?: string;
  showSubtitle?: boolean;
}

export default function BrandLogo({
  size = 'md',
  variant = 'dark',
  href = '/',
  showSubtitle = true,
}: BrandLogoProps) {
  // Size classes
  const iconSizes = {
    sm: 'w-7 h-5',
    md: 'w-9 h-6',
    lg: 'w-12 h-8',
  };

  const titleSizes = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  };

  const textColor = variant === 'light' ? 'text-white' : 'text-gray-900';
  const subtitleColor = variant === 'light' ? 'text-emerald-200' : 'text-emerald-700';

  const content = (
    <div className="inline-flex items-center space-x-3 group cursor-pointer select-none">
      {/* Tinubu Infinity / Broken-Shackle Loop Logo */}
      <div className="relative flex items-center justify-center">
        <svg
          viewBox="0 0 100 56"
          className={`${iconSizes[size]} transition-transform duration-300 group-hover:scale-105 drop-shadow-sm`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="gmtLoopGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>
            <linearGradient id="gmtShackleAccent" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>

          {/* Smooth, continuous Tinubu Infinity / Broken Shackle loop */}
          <path
            d="M28 10 C16 10, 8 18, 8 28 C8 38, 16 46, 28 46 C40 46, 48 36, 50 28 C52 20, 60 10, 72 10 C84 10, 92 18, 92 28 C92 38, 84 46, 72 46 C60 46, 52 36, 50 28 C48 20, 40 10, 28 10 Z"
            stroke="url(#gmtLoopGrad)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Core inner accent curve */}
          <path
            d="M32 16 C22 16, 16 21, 16 28 C16 35, 22 40, 32 40 C41 40, 47 32, 50 28 C53 24, 59 16, 68 16"
            stroke="url(#gmtShackleAccent)"
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.85"
          />

          {/* Central interlock link accent */}
          <circle cx="50" cy="28" r="3" fill="#059669" />
        </svg>
      </div>

      {/* Brand Text: GMT + Grassroots Movement for Tinubu */}
      <div className="flex flex-col justify-center leading-none">
        <div className="flex items-center space-x-1.5">
          <span className={`${titleSizes[size]} font-black tracking-tight ${textColor} leading-none`}>
            GMT
          </span>
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>
        {showSubtitle && (
          <span className={`${subtitleSizes[size]} font-bold tracking-wide uppercase ${subtitleColor} mt-0.5 leading-tight`}>
            Grassroots Movement for Tinubu
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
