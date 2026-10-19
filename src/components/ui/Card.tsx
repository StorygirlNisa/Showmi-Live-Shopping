import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  interactive = false,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-[#171A21] border border-[#242936] rounded-2xl overflow-hidden ${
        interactive
          ? 'transition-all duration-200 hover:border-[#19BFFF]/30 hover:bg-[#1C212B] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
