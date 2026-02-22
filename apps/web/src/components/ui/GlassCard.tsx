'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'light' | 'dark' | 'gradient';
  glow?: boolean;
  hover?: boolean;
}

export function GlassCard({
  children,
  className,
  variant = 'light',
  glow = false,
  hover = true,
  ...props
}: GlassCardProps) {
  const variants = {
    light: 'bg-white border-gray-200 shadow-sm',
    dark: 'bg-slate-900 border-white/10 text-white',
    gradient: 'bg-gradient-to-br from-white to-primary-50/30 border-primary-100',
  };

  return (
    <div
      className={cn(
        'rounded-2xl border animate-fade-in',
        variants[variant],
        glow && 'shadow-lg shadow-primary-500/10',
        hover && 'transition-all duration-300 hover:shadow-xl hover:shadow-primary-500/10 hover:border-primary-200 hover:-translate-y-1',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
}

export function GlassButton({
  children,
  className,
  variant = 'primary',
  size = 'md',
  glow = false,
  ...props
}: GlassButtonProps) {
  const variantStyles = {
    primary: 'bg-gradient-to-r from-primary-500 via-primary-600 to-violet-600 text-white hover:from-primary-600 hover:via-primary-700 hover:to-violet-700 shadow-md hover:shadow-lg',
    secondary: 'bg-primary-50 text-primary-700 border border-primary-200 hover:bg-primary-100',
    outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-500 hover:text-white',
    ghost: 'text-slate-700 hover:bg-gray-100',
  };

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      className={cn(
        'font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95',
        variantStyles[variant],
        sizeStyles[size],
        glow && 'shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  label?: string;
}

export function GlassInput({
  className,
  icon,
  label,
  ...props
}: GlassInputProps) {
  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          className={cn(
            'w-full bg-white border border-gray-200 rounded-xl px-4 py-3',
            'text-slate-800 placeholder:text-slate-400',
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            'transition-all duration-300',
            icon && 'pl-12',
            className
          )}
          {...props}
        />
      </div>
    </div>
  );
}

