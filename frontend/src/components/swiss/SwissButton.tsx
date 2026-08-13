import React from 'react';
import clsx from 'clsx';

interface SwissButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent';
}

export function SwissButton({ variant = 'primary', className, children, ...props }: SwissButtonProps) {
  const baseClasses = "inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-black font-bold uppercase tracking-wide text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:scale-100";
  
  const variants = {
    primary: "bg-black text-white hover:bg-white hover:text-black hover:scale-105",
    accent: "bg-swiss-red text-white border-swiss-red hover:bg-black hover:border-black hover:scale-105",
    secondary: "bg-white text-black hover:bg-black hover:text-white hover:scale-105",
  };

  return (
    <button className={clsx(baseClasses, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
