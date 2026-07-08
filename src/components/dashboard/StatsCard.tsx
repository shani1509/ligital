'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

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
        'rounded-[2rem] p-8 shadow-xl relative overflow-hidden transition-all duration-300 group',
        isPrimary
          ? 'bg-gradient-to-br from-[#1B5E20] to-[#0A2E0C] text-white shadow-[#1B5E20]/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-[#1B5E20]/30'
          : 'bg-white text-gray-800 shadow-gray-200/30 border border-gray-100 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-emerald-100'
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="w-6 h-6 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      )}
      
      {/* Background decoration */}
      {isPrimary && (
        <>
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none transition-transform duration-500 group-hover:scale-125" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-[#4CAF50]/20 rounded-full blur-xl pointer-events-none" />
        </>
      )}

      <div className="flex flex-col relative z-10 h-full justify-between">
        <div className="flex items-start justify-between mb-8">
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 transition-transform duration-300 group-hover:scale-110',
              isPrimary ? 'bg-white/10 text-white backdrop-blur-md border border-white/10 shadow-inner' : 'bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm'
            )}
          >
            {icon}
          </div>
          
          {trend && (
            <div 
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm',
                isPrimary 
                  ? 'bg-white/10 text-emerald-100 border border-white/10 backdrop-blur-md'
                  : trendUp 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                    : 'bg-red-50 text-red-700 border border-red-100'
              )}
            >
              {trendUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-4xl font-black mb-1 tracking-tight">{value}</h3>
          <p
            className={cn(
              'text-sm font-bold tracking-wider uppercase',
              isPrimary ? 'text-emerald-100/80' : 'text-gray-400'
            )}
          >
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
