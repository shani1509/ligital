'use client';

import React from 'react';
import Card from '@/components/ui/Card';

interface SeatOccupancyProps {
  occupied: number;
  total: number;
  loading?: boolean;
}

export default function SeatOccupancy({ occupied, total, loading }: SeatOccupancyProps) {
  const available = total - occupied;
  const percentage = total > 0 ? Math.round((occupied / total) * 100) : 0;

  // SVG donut chart parameters
  const size = 160;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  if (loading) {
    return (
      <Card className="animate-fade-in">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Seat Occupancy</h3>
        <div className="h-[200px] flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-[#C8E6C9] border-t-[#4CAF50] rounded-full animate-spin" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Seat Occupancy</h3>

      <div className="flex flex-col items-center">
        {/* Donut Chart */}
        <div className="relative">
          <svg width={size} height={size} className="-rotate-90">
            {/* Background circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={strokeWidth}
            />
            {/* Occupied arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#4CAF50"
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">{percentage}%</span>
            <span className="text-xs text-gray-400">Occupied</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#4CAF50]" />
            <span className="text-xs text-gray-600">
              Occupied ({occupied})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-gray-200" />
            <span className="text-xs text-gray-600">
              Available ({available})
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
