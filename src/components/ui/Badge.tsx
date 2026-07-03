'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-[#C8E6C9] text-[#1B5E20]',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
  danger: 'bg-[#FEE2E2] text-[#991B1B]',
  info: 'bg-[#DBEAFE] text-[#1E40AF]',
  default: 'bg-gray-100 text-gray-700',
};

const dotColors: Record<BadgeVariant, string> = {
  success: 'bg-[#4CAF50]',
  warning: 'bg-[#F59E0B]',
  danger: 'bg-[#EF4444]',
  info: 'bg-[#3B82F6]',
  default: 'bg-gray-400',
};

export default function Badge({
  variant = 'default',
  children,
  className,
  dot = false,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', dotColors[variant])} />
      )}
      {children}
    </span>
  );
}
