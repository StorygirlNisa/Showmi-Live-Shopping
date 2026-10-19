import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'live' | 'electric' | 'violet' | 'neutral' | 'success';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 rounded-md font-semibold',
    md: 'text-xs px-2.5 py-1 rounded-lg font-medium'
  };

  const variantClasses = {
    live: 'bg-rose-500 text-white font-bold tracking-wider uppercase shadow-sm shadow-rose-500/30',
    electric: 'bg-[#19BFFF]/15 text-[#19BFFF] border border-[#19BFFF]/30 font-semibold',
    violet: 'bg-[#7A3CFF]/15 text-[#7A3CFF] border border-[#7A3CFF]/30 font-semibold',
    neutral: 'bg-[#20242E] text-slate-300 border border-[#242936]',
    success: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 tabular-nums ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
