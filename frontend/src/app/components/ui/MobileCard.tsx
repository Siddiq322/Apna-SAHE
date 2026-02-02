import React from 'react';
import { cn } from './utils';

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

export const MobileCard = ({ children, className, padding = 'md' }: MobileCardProps) => {
  const paddingClasses = {
    sm: 'p-3 lg:p-4',
    md: 'p-4 lg:p-6',
    lg: 'p-6 lg:p-8'
  };

  return (
    <div className={cn(
      'bg-white rounded-xl shadow-sm border border-slate-200',
      paddingClasses[padding],
      className
    )}>
      {children}
    </div>
  );
};

interface MobileGridProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3;
  className?: string;
}

export const MobileGrid = ({ children, cols = 2, className }: MobileGridProps) => {
  const colClasses = {
    1: 'grid grid-cols-1 gap-4',
    2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
  };

  return (
    <div className={cn(colClasses[cols], className)}>
      {children}
    </div>
  );
};

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
}

export const MobileHeader = ({ title, subtitle, icon }: MobileHeaderProps) => {
  return (
    <div className="mb-4 lg:mb-6">
      <div className="flex items-center gap-3 mb-2">
        {icon && <div className="text-blue-600">{icon}</div>}
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900 truncate">{title}</h1>
      </div>
      {subtitle && (
        <p className="text-sm lg:text-base text-slate-600 leading-relaxed">{subtitle}</p>
      )}
    </div>
  );
};

interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  className?: string;
}

export const MobileButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  className 
}: MobileButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 touch-manipulation';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm',
    secondary: 'bg-slate-600 text-white hover:bg-slate-700 active:bg-slate-800 shadow-sm',
    outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50 active:bg-slate-100'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[36px]',
    md: 'px-4 py-2.5 text-sm lg:text-base min-h-[40px] lg:min-h-[44px]',
    lg: 'px-6 py-3 text-base lg:text-lg min-h-[44px] lg:min-h-[48px]'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
        className
      )}
    >
      {children}
    </button>
  );
};