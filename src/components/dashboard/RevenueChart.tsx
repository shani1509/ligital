'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Card from '@/components/ui/Card';
import type { ChartDataPoint } from '@/types';

interface RevenueChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

export default function RevenueChart({ data, loading }: RevenueChartProps) {
  if (loading) {
    return (
      <Card className="animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-800">Revenue Analytics</h3>
        </div>
        <div className="h-[280px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C8E6C9] border-t-[#4CAF50] rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  const formattedData = data.map((d) => ({
    ...d,
    displayValue: d.value / 100, // Convert paise to rupees
  }));

  return (
    <Card className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Revenue Analytics</h3>
          <p className="text-xs text-gray-400 mt-0.5">Last 7 days collection</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-[#4CAF50]" />
          <span className="text-xs text-gray-500">Revenue (₹)</span>
        </div>
      </div>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={formattedData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#9CA3AF', fontSize: 12 }}
              tickFormatter={(v) => `₹${v}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px 12px',
              }}
              formatter={(value: any) => [`₹${(Number(value) || 0).toFixed(2)}`, 'Revenue']}
              cursor={{ fill: '#E8F5E9' }}
            />
            <Bar
              dataKey="displayValue"
              fill="#4CAF50"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
