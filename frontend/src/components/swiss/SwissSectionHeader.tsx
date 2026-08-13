import React from 'react';
import clsx from 'clsx';

interface SwissSectionHeaderProps extends React.HTMLAttributes<HTMLHeadingElement> {
  prefix?: string;
  title: string;
  size?: 'normal' | 'large' | 'xl';
}

export function SwissSectionHeader({ 
  prefix, 
  title, 
  size = 'normal',
  className, 
  ...props 
}: SwissSectionHeaderProps) {

  const sizeClasses = {
    normal: 'text-xl md:text-2xl',
    large: 'text-3xl md:text-4xl tracking-tighter',
    xl: 'text-4xl md:text-6xl lg:text-7xl tracking-tighter',
  };

  return (
    <div className={clsx("flex flex-col mb-6 md:mb-8", className)} {...props}>
      {prefix && (
        <span className="text-swiss-red font-bold tracking-widest text-sm uppercase mb-1">
          {prefix}
        </span>
      )}
      <h2 className={clsx("font-black uppercase text-black leading-none", sizeClasses[size])}>
        {title}
      </h2>
    </div>
  );
}
