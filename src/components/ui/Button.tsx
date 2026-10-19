import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-150 cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-[#19BFFF] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0D1018] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed';

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 min-h-[36px] gap-1.5',
    md: 'text-sm px-4 py-2.5 min-h-[42px] gap-2',
    lg: 'text-base px-5 py-3 min-h-[48px] gap-2.5'
  };

  const variantClasses = {
    primary: 'bg-[#19BFFF] text-[#0D1018] hover:bg-[#00AEEF] shadow-sm shadow-[#19BFFF]/20',
    secondary: 'bg-[#171A21] text-white border border-[#242936] hover:bg-[#20242E] hover:border-[#374151]',
    tertiary: 'bg-transparent text-slate-300 hover:text-white hover:bg-[#171A21]',
    gradient: 'bg-gradient-to-r from-[#19BFFF] to-[#7A3CFF] text-white hover:opacity-95 shadow-md shadow-[#19BFFF]/20'
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
