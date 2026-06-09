'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { buttonTap, buttonHover } from '@/lib/animations';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<Variant, string> = {
  primary:   'bg-[#1A1A1A] text-[#FAFAF8] hover:bg-[#2D2D2D]',
  secondary: 'bg-[#F0F0EE] text-[#1A1A1A] hover:bg-[#E8E8E6]',
  ghost:     'bg-transparent text-[#1A1A1A] hover:bg-[#F0F0EE]',
  outline:   'bg-transparent text-[#1A1A1A] border border-[#EAEAEA] hover:bg-[#F0F0EE]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8  px-4  text-xs  gap-1.5',
  md: 'h-11 px-6  text-sm  gap-2',
  lg: 'h-13 px-8  text-base gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, className = '', disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-medium rounded-[999px] transition-colors duration-200 cursor-pointer select-none disabled:opacity-40 disabled:cursor-not-allowed';

    return (
      <motion.button
        ref={ref}
        whileHover={!disabled && !isLoading ? buttonHover : undefined}
        whileTap={!disabled && !isLoading ? buttonTap : undefined}
        className={`${base} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={disabled || isLoading}
        {...(props as React.ComponentProps<typeof motion.button>)}
      >
        {isLoading ? (
          <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
