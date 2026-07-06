'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  primary?: boolean;
  variant?: 'primary' | 'default';
  loading?: boolean;
  delay?: number;
}

export default function StatsCard({
  title,
  value,
  trend,
  trendUp = true,
  icon,
  primary = false,
  variant,
  loading = false,
  delay = 0,
}: StatsCardProps) {
  const isPrimary = primary || variant === 'primary';
  return (
    <div
      className={cn(
        'rounded-xl p-5 shadow-md animate-fade-in relative overflow-hidden',
        isPrimary
          ? 'bg-[#1B5E20] text-white'
          : 'bg-white text-gray-800'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-[#1B5E20] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/* Background decoration */}
      {isPrimary && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
      )}

      <div className="flex items-start justify-between relative z-10">
        <div className="flex-1">
          <p
            className={cn(
              'text-sm font-medium mb-1',
              isPrimary ? 'text-white/80' : 'text-gray-500'
            )}
          >
            {title}
          </p>
          <h3 className="text-2xl font-bold mb-2">{value}</h3>
          {trend && (
            <div className="flex items-center gap-1">
              <span
                className={cn(
                  'text-xs font-semibold',
                  isPrimary
                    ? 'text-[#C8E6C9]'
                    : trendUp
                    ? 'text-[#4CAF50]'
                    : 'text-red-500'
                )}
              >
                {trendUp ? '↗' : '↘'} {trend}
              </span>
            </div>
          )}
        </div>

        {/* Icon / Arrow */}
        <div
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center text-lg',
            isPrimary ? 'bg-white/20' : 'bg-[#E8F5E9]'
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
