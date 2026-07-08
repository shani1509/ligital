'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ChartDataPoint } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Activity } from 'lucide-react';

export default function RevenueChart({
  data,
  loading = false,
}: {
  data: ChartDataPoint[];
  loading?: boolean;
}) {
  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/30 border border-gray-100 h-full relative overflow-hidden flex flex-col">
      {loading && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin" />
        </div>
      )}

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-inner">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">Revenue Analytics</h3>
          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">30-Day Trajectory</p>
        </div>
      </div>

      <div className="h-[300px] w-full mt-auto">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
              tickFormatter={(val) => {
                const d = new Date(val);
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              }}
              dy={10}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 600 }}
              tickFormatter={(val) => `₹${val / 100}`}
              width={60}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                borderRadius: '1rem',
                border: '1px solid #F3F4F6',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                padding: '12px 16px',
              }}
              itemStyle={{ color: '#059669', fontWeight: 'bold' }}
              labelStyle={{ color: '#6B7280', marginBottom: '4px', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '0.05em' }}
              formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Revenue']}
              labelFormatter={(label) => {
                const d = new Date(label);
                return d.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                });
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#059669"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
