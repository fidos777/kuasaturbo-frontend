'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses =
    'inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantClasses: Record<ButtonVariant, string> = {
    primary:
      'bg-[#FE4800] text-white hover:bg-[#e34000] focus:ring-[#FE4800]',
    secondary:
      'bg-slate-100 text-slate-900 hover:bg-slate-200 focus:ring-slate-400',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 focus:ring-slate-300',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;

