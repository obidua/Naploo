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
    light: 'bg-white/10 border-white/20',
    dark: 'bg-naploo-dark-50/80 border-white/10',
    gradient: 'bg-gradient-to-br from-white/10 to-white/5 border-white/20',
  };

  return (
    <div
      className={cn(
        'backdrop-blur-xl rounded-2xl border animate-fade-in',
        variants[variant],
        glow && 'shadow-glow',
        hover && 'transition-all duration-300 hover:shadow-glow-lg hover:border-primary-400/30 hover:-translate-y-1',
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
    primary: 'bg-gradient-to-r from-primary-500 via-primary-600 to-violet-600 text-white hover:from-primary-600 hover:via-primary-700 hover:to-violet-700',
    secondary: 'bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white',
    ghost: 'text-white hover:bg-white/10',
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
        glow && 'shadow-glow hover:shadow-glow-lg',
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
        <label className="block text-sm font-medium text-white/70 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50">
            {icon}
          </span>
        )}
        <input
          className={cn(
            'w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-3',
            'text-white placeholder:text-white/40',
            'focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20',
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

