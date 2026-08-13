import React from 'react';
import clsx from 'clsx';

interface SwissCardProps extends React.HTMLAttributes<HTMLDivElement> {
  pattern?: 'none' | 'grid' | 'dots' | 'diagonal';
  padding?: 'none' | 'normal' | 'large';
  borderWidth?: 'normal' | 'thick';
}

export function SwissCard({ 
  className, 
  children, 
  pattern = 'none', 
  padding = 'normal',
  borderWidth = 'normal',
  ...props 
}: SwissCardProps) {
  
  const patternClasses = {
    none: 'bg-white',
    grid: 'bg-white swiss-grid-pattern',
    dots: 'bg-white swiss-dots',
    diagonal: 'bg-white swiss-diagonal',
  };

  const paddingClasses = {
    none: 'p-0',
    normal: 'p-6 md:p-8',
    large: 'p-8 md:p-12',
  };

  const borderClasses = {
    normal: 'border-2 border-black',
    thick: 'border-4 border-black',
  };

  return (
    <div 
      className={clsx(
        'relative w-full',
        borderClasses[borderWidth],
        patternClasses[pattern],
        paddingClasses[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
