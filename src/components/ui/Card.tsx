'use client';

import React from 'react';
import { cn } from '@/lib/utils';

type CardPadding = 'none' | 'sm' | 'md' | 'lg';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: CardPadding;
  hover?: boolean;
  onClick?: () => void;
  id?: string;
}

const paddingClasses: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  className,
  padding = 'md',
  hover = false,
  onClick,
  id,
}: CardProps) {
  return (
    <div
      id={id}
      className={cn(
        'bg-white rounded-xl shadow-md',
        paddingClasses[padding],
        hover && 'hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}
